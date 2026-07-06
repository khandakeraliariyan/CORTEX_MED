const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const config = require("./app/config");

const routes = require("./app/routes");

const globalErrorHandler = require("./app/middlewares/globalErrorHandler");

const notFound = require("./app/middlewares/notFound");

const app = express();

app.use(
    cors({
        origin: config.client_url,
        credentials: true,
    })
);

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.use("/api/v1", routes);

app.use(notFound);

app.use(globalErrorHandler);

module.exports = app;