// src/libs/datamanager.ts

import { error } from "console";
import mongoose from "mongoose";

enum SCHEMAS_ENUM {
    User = "userSchema",
    RefreshToken = "refreshTokenSchema"
}

enum MODELS_ENUM {
    User = "usersModel",
    RefreshToken = "refreshTokenModel"
}

enum QUERY_RESULT {
    UNDEFINED
}

const SCHEMAS = {
    [SCHEMAS_ENUM.User]: new mongoose.Schema({
        user: { type: String, required: true }
    }),

    [SCHEMAS_ENUM.RefreshToken]: new mongoose.Schema({
        token: { type: String, required: true, unique: true },
        lastAccessToken: { type: String, required: true },
        user: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true, expires: 0 },
        createdAt: { type: Date, required: true }
    })
}

const MODELS = {
    [MODELS_ENUM.User]: mongoose.model("users", SCHEMAS[SCHEMAS_ENUM.User]),
    [MODELS_ENUM.RefreshToken]: mongoose.model("refreshTokens", SCHEMAS[SCHEMAS_ENUM.RefreshToken])
}

async function GetAllDataInModel(model: MODELS_ENUM) {

    const selectedModel = MODELS[model];

    if (selectedModel === undefined) {
        throw new Error(`Unknown Model ${model}`);
    }

    // I don't know how to fix error to stop TS from complaining here without adding more boiler-plate to code :(
    // Let's hope nothing broke lol.
    // @ts-expect-error
    return selectedModel.find({}).exec();
};

function WillTokenExpire(currentDate: Date) {

    const now = new Date();
    //Consider expired if token will expire in 12 hours when logging in again
    return currentDate.getTime() - now.getTime() <= 60 * 60 * 12 * 1000
}

//Check if there is valid token in database for specific user
async function HasValidTokenInDatabase(user: string): Promise<[isValid: boolean, refreshToken?: string, lastAccessToken?: string, user?: string, createdAt?: Date]> {
    const refreshTokenModel = MODELS[MODELS_ENUM.RefreshToken];

    try {
        const data = await refreshTokenModel.findOne({ user: user });

        if (data == null) return [false];

        const expireDate = data.expiresAt;
        const now = new Date();

        if (WillTokenExpire(expireDate)) {
            await refreshTokenModel.deleteOne({ user: user })
            return [false];
        }

        return [true, data.token, data.lastAccessToken, data.user, data.createdAt];
    } catch (err) {
        throw err;
    }
}

//Similar to "HasValidTokenInDatabase" but use refresh token instead
async function HasValidTokenInDatabaseUsingToken(token: string): Promise<[isValid: boolean, refreshToken?: string, lastAccessToken?: string, user?: string, createdAt?: Date]> {
    const refreshTokenModel = MODELS[MODELS_ENUM.RefreshToken];

    try {
        const data = await refreshTokenModel.findOne({ token: token });

        if (data == null) return [false];

        const expireDate = data.expiresAt;


        if (WillTokenExpire(expireDate)) {

            await refreshTokenModel.deleteOne({ token: token })
            return [false];
        }

        return [true, data.token, data.lastAccessToken, data.user, data.createdAt];
    } catch (err) {
        throw err;
    }
}

async function CreateRefreshToken(user: string, token: string, accessToken: string) {
    const refreshTokenModel = MODELS[MODELS_ENUM.RefreshToken];

    try {
        const expiresDate = new Date();
        const createdDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 2);
        await refreshTokenModel.create({ token: token, user: user, lastAccessToken: accessToken, createdAt: createdDate, expiresAt: expiresDate })
    } catch (err) {
        if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
            throw new Error("Duplicate Refresh Token")
        }

        throw err;
    }
}

async function DeleteTokenFromDatabase(refresh_token: string) {
    const refreshTokenModel = MODELS[MODELS_ENUM.RefreshToken];

    try {
        await refreshTokenModel.deleteOne({ token: refresh_token });
    } catch (err) {
        throw err;
    }
}

async function RecordTokenRefresh(refreshToken: string, newAccessToken: string): Promise<[success: boolean, refreshToken?: string, lastAccessToken?: string]> {
    const refreshTokenModel = MODELS[MODELS_ENUM.RefreshToken];

    try {
        const data = await refreshTokenModel.findOne({ token: refreshToken });

        if (data == null) return [false];

        data.set({ lastAccessToken: newAccessToken });

        await data.save();
        return [true, data.token, data.lastAccessToken];
    } catch (err) {
        throw err;
    }
}

export {
    GetAllDataInModel,
    HasValidTokenInDatabase,
    HasValidTokenInDatabaseUsingToken,
    CreateRefreshToken,
    RecordTokenRefresh,
    DeleteTokenFromDatabase,
    MODELS_ENUM
}