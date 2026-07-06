const User = require("./auth.model");

const AppError = require("../../errors/AppError");

const hashPassword = require("../../utils/hashPassword");
const comparePassword = require("../../utils/comparePassword");

const { generateToken } = require("../../utils/jwt");

const config = require("../../config");

const registerUser = async (payload) => {
    const exists = await User.findOne({
        email: payload.email,
    });

    if (exists) {
        throw new AppError(409, "Email already exists");
    }

    payload.password = await hashPassword(payload.password);

    const user = await User.create(payload);

    return user;
};

const loginUser = async (payload) => {
    const user = await User.findOne({
        email: payload.email,
    }).select("+password");

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const matched = await comparePassword(
        payload.password,
        user.password
    );

    if (!matched) {
        throw new AppError(401, "Invalid credentials");
    }

    const jwtPayload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expire
    );

    user.password = undefined;

    return {
        accessToken,
        user,
    };
};

module.exports = {
    registerUser,
    loginUser,
};