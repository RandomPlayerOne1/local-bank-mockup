import app from "../app.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config"
import { Request, Response, NextFunction } from "express";
import { CreateRefreshToken, DeleteTokenFromDatabase, HasValidTokenInDatabase, HasValidTokenInDatabaseUsingToken, RecordTokenRefresh } from "../libs/datamanager.js";

const BASE_PATH = "/public_api/user_identity";

interface UserIdentityRequest extends Request {
    user?: JwtPayload,
    bearer_token?: string,
    refresh_token?: string
}

interface UserIdentity {
    user: string
}

function Setup() {
    app.get(BASE_PATH + "/dummy", AuthenticateUserToken, (req: UserIdentityRequest, res) => {
        res.status(200).send("Logging in as " + req.user!.user);
        console.log(req.user!);
    })



    app.delete(BASE_PATH + "/logout", AuthenticateUserToken, async (req: UserIdentityRequest, res) => {
        const userRefreshToken = req.refresh_token;

        if (userRefreshToken == null) return res.sendStatus(401);

        //Removing token from database when logging out
        try {
            await DeleteTokenFromDatabase(userRefreshToken);
            res.sendStatus(200);
        } catch (err) {
            throw err;
        }
    })

    app.post(BASE_PATH + "/login", async (req, res) => {
        //TODO: Properly Authenticate user

        const username = req.body?.username;

        if (username === undefined) return res.sendStatus(400);

        const user: UserIdentity = { user: username };

        try {
            //User might still have usable token in database
            const [isValid, refreshToken, lastAccessesToken] = await HasValidTokenInDatabase(user.user);

            if (isValid) {

                const newToken = GenerateUserAccessToken(user);

                await RecordTokenRefresh(refreshToken!, newToken);

                res.status(200);
                return res.json({ userAccessToken: newToken, userRefreshToken: refreshToken })
            }

            //If not valid user has no usable token so proceed to generate new one normally

        } catch (err) {
            res.status(400).send("Failed to validate token");
            return
        }

        //Generate access/refresh token on login
        const userAccessToken = GenerateUserAccessToken(user);
        const userRefreshToken = jwt.sign(user, process.env.JWT_REFRESH_TOKEN!)

        try {
            await CreateRefreshToken(user.user, userRefreshToken, userAccessToken);
        } catch (err) {
            res.status(400).send("Failed to create refresh token");
            return
        }

        res.json({ userAccessToken: userAccessToken, userRefreshToken: userRefreshToken, user: user.user });
    });
}

//Verify if requesting user has valid token
function AuthenticateUserToken(req: UserIdentityRequest, res: Response, next: NextFunction): void {

    const authHeader = req.headers['authorization'];
    const splitted_header = authHeader?.split(' ');

    if (splitted_header == null) {
        res.sendStatus(401);
        return;
    };

    const token = splitted_header[1];
    const refresh_token = splitted_header[3];

    if (token === undefined) {
        //No token provided, sad :(
        res.sendStatus(401);
        return;
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN!, async (err, user) => {
        //Has to be JWT payload

        if (err) {
            if (err.name == "TokenExpiredError") {
                await RefreshToken(refresh_token, res)
                console.log("Refreshed Token")
            }
        }

        if (!user || typeof user === "string") {
            return res.status(403).send(user);
        }

        req.user = user;
        req.bearer_token = token;
        req.refresh_token = refresh_token;
        next();
    });
}

//Create new access token for user
function GenerateUserAccessToken(user: UserIdentity) {
    return jwt.sign(user, process.env.JWT_ACCESS_TOKEN!, { expiresIn: "20m" })
}

//User requesting to refresh token
async function RefreshToken(refreshToken: string, res: Response) {

    try {
        const [isValid, _refreshTokenResult, _lastAccessesToken, username, createdAt] = await HasValidTokenInDatabaseUsingToken(refreshToken);

        if (isValid) {
            //Validate and record new token

            const now = new Date();

            if (now.getTime() - createdAt!.getTime() <= 5 * 60 * 1000) {
                //Rejecting: token was recently created
                res.status(429).send("Token was recently created, please wait and try again later");
                return;
            }

            const user: UserIdentity = { user: username! };
            const newToken = GenerateUserAccessToken(user);

            await RecordTokenRefresh(refreshToken, newToken);

            res.status(200);
            return res.json({ userAccessToken: newToken, userRefreshToken: refreshToken });
        } else {
            res.sendStatus(403);
            return;
        }

    } catch (err) {
        res.status(500).send("Failed to validate token");
        return
    }
}

//Validate token before even starting auth server
function SanityCheckServerTokens(): boolean {
    const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN;
    const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

    if (JWT_ACCESS_TOKEN === undefined || JWT_REFRESH_TOKEN === undefined) return false;

    return true;
}

if (!SanityCheckServerTokens()) {
    console.error("[FATAL ERROR]: Server sanity check failed!");

    process.exit(1);
} else {
    Setup();
}

export {
    AuthenticateUserToken
}