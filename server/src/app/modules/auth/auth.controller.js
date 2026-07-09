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

const refresh = catchAsync(async (req, res) => {
    const result = await AuthService.refreshAccessToken(req.body.refreshToken);

    sendResponse(res, {
        statusCode: 200,
        message: "Token refreshed successfully",
        data: result,
    });
});

const me = catchAsync(async (req, res) => {
    const result = await AuthService.getMe(req.user.id);

    sendResponse(res, {
        statusCode: 200,
        message: "Current user fetched successfully",
        data: result,
    });
});

module.exports = {
    register,
    login,
    refresh,
    me,
};