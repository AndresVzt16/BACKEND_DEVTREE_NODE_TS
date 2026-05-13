import express from "express";
import 'dotenv/config'
import router from "./routes/router";
import cors from 'cors'
import { corsConfig } from "./config/cors";

const app = express();

app.use(express.json());

//Configuracion de CORS
app.use(cors(corsConfig))


app.use("/", router);


export default app;
