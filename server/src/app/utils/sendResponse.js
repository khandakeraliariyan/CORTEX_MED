const sendResponse = (
    res,
    {
        success = true,
        statusCode = 200,
        message = "Success",
        data = null,
        meta = null,
    }
) => {
    res.status(statusCode).json({
        success,
        message,
        meta,
        data,
    });
};

module.exports = sendResponse;