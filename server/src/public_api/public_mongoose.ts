import app from "../app.js";
import { GetAllDataInModel, MODELS_ENUM } from "../libs/datamanager.js";

const BASE_PATH = "/public_api/pub_mongoose"

console.log("Initializing Public Mongoose");


app.get(BASE_PATH + "/get_all_data_in_model", async (req, res) => {
    res.status(200).send((await GetAllDataInModel(MODELS_ENUM.User)));
});

