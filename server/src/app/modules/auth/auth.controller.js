const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");

const AuthService = require("./auth.service");

const register = catchAsync(async (req, res) => {
    const result = await AuthService.registerUser(req.body);

    sendResponse(res, {
        statusCode: 201,
        message: "User registered successfully",
        data: result,
    });
});

module.exports = {
    register,
};