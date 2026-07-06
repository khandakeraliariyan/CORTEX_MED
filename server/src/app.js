const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Qura Server Running",
    });
});

module.exports = app;