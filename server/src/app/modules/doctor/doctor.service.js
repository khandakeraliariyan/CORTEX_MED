const Doctor = require("./doctor.model");

const User = require("../auth/auth.model");

const AppError = require("../../errors/AppError");

const createDoctor = async (payload) => {

    const user = await User.findById(payload.user);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    if (user.role !== "doctor") {
        throw new AppError(
            400,
            "User must have doctor role"
        );
    }

    const exists = await Doctor.findOne({
        user: payload.user,
    });

    if (exists) {
        throw new AppError(
            409,
            "Doctor already exists"
        );
    }

    return await Doctor.create(payload);
};

module.exports = {
    createDoctor,
};