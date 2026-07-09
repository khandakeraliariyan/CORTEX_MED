const Doctor = require("./doctor.model");

const User = require("../auth/auth.model");

const AppError = require("../../errors/AppError");

const hashPassword = require("../../utils/hashPassword");

const ensureDoctorProfiles = async () => {
    const doctorUsers = await User.find({
        role: "doctor",
        isActive: true,
    }).select("_id");

    const doctorUserIds = doctorUsers.map((user) => user._id);

    if (doctorUserIds.length === 0) {
        return;
    }

    const existingProfiles = await Doctor.find({
        user: { $in: doctorUserIds },
    }).select("user");

    const existingUserIds = new Set(
        existingProfiles.map((profile) => profile.user.toString())
    );

    const missingProfiles = doctorUserIds
        .filter((userId) => !existingUserIds.has(userId.toString()))
        .map((userId) => ({ user: userId }));

    if (missingProfiles.length > 0) {
        await Doctor.insertMany(missingProfiles);
    }
};

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
    await ensureDoctorProfiles();

    return await Doctor.find().populate("user", "name email role isActive");
};

module.exports = {
    createDoctor,
    listDoctors,
};
