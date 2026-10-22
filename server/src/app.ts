import express from "express"
import cors from "cors"
import InitializeAPIs from "./api_handler.js";

const app = express();
const CLIENT_DEFAULT_URL = "http://localhost";
const CLIENT_DEFAULT_PORT = 5173;
const SERVER_DEFAULT_URL = process.env.SERVER_URL ?? "http://localhost";
const SERVER_DEFAULT_PORT = 3000;


app.use(
    cors({
        origin: process.env.CLIENT_URL ?? CLIENT_DEFAULT_URL + ":" + CLIENT_DEFAULT_PORT,
    }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.status(200).send("Server is healthy");
});

function StartApp() {
    app.listen(SERVER_DEFAULT_PORT, () => {
        InitializeAPIs();
        console.log("Backend currently running at: " + SERVER_DEFAULT_URL + ":" + SERVER_DEFAULT_PORT);
    });
}

export default app;
export { StartApp }