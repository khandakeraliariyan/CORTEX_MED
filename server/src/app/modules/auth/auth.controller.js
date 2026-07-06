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

const login = catchAsync(async (req, res) => {
    const result = await AuthService.loginUser(req.body);

    sendResponse(res, {
        statusCode: 200,
        message: "Login successful",
        data: result,
    });
});

module.exports = {
    register,
    login,
};