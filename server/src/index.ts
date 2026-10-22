import { StartApp } from "./app.js";
import mongoose from "mongoose";
import InitializeAPIs from "./api_handler.js";
import "dotenv/config"

const MONGODB_URL = process.env.MONGO_URL || "";

mongoose.connect(MONGODB_URL).then(() => {
    console.log("Database " + MONGODB_URL + " has successfully connected");

    StartApp();


}).catch(err => console.log(err));