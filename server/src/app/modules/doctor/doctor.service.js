const Doctor = require("./doctor.model");

const User = require("../auth/auth.model");

const AppError = require("../../errors/AppError");

const hashPassword = require("../../utils/hashPassword");

const createDoctor = async (payload) => {
    const { user: userField, ...doctorFields } = payload;

    let user;

    if (typeof userField === "string") {
        user = await User.findById(userField);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        if (user.role !== "doctor") {
            throw new AppError(
                400,
                "User must have doctor role"
            );
        }
    } else {
        const exists = await User.findOne({ email: userField.email });

        if (exists) {
            throw new AppError(409, "Email already exists");
        }

        user = await User.create({
            name: userField.name,
            email: userField.email,
            password: await hashPassword(userField.password),
            role: "doctor",
        });
    }

    const exists = await Doctor.findOne({
        user: user._id,
    });

    if (exists) {
        throw new AppError(
            409,
            "Doctor already exists"
        );
    }

    return await Doctor.create({ ...doctorFields, user: user._id });
};

const listDoctors = async () => {
    return await Doctor.find().populate("user", "name email role isActive");
};

module.exports = {
    createDoctor,
    listDoctors,
};