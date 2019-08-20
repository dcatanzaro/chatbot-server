import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "passport";
import flash from "express-flash";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

import ServiceLogicChat from "./service/logic";
import routes from "./routes";
import passportConfig from "./config/passport";

mongoose.connect(
    "mongodb://localhost/chatbot",
    { useNewUrlParser: true }
);

const app = express();
const io = require("socket.io")(3030);

ServiceLogicChat.initiate(io);

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(
    cookieSession({
        name: "session",
        keys: ["keykeykey"],
        maxAge: 24 * 60 * 60 * 1000
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

routes(app);

app.listen(3001);
console.log("app running on port ", 3001);
