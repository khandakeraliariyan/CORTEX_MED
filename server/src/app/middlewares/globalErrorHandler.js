const sendResponse = require("../utils/sendResponse");

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    const message = err.message || "Something went wrong";

    sendResponse(res, {
        success: false,
        statusCode,
        message,
        data: null,
    });
};

module.exports = globalErrorHandler;