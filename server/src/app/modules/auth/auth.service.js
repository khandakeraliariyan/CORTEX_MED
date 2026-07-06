const User = require("./auth.model");
const AppError = require("../../errors/AppError");

const hashPassword = require("../../utils/hashPassword");

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

module.exports = {
    registerUser,
};