const sendResponse = require("../utils/sendResponse");

const notFound = (req, res) => {
    sendResponse(res, {
        success: false,
        statusCode: 404,
        message: "API Not Found",
    });
};

module.exports = notFound;