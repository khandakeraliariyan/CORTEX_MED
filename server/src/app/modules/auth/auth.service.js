const User = require("./auth.model");

const AppError = require("../../errors/AppError");

const hashPassword = require("../../utils/hashPassword");
const comparePassword = require("../../utils/comparePassword");

const { generateToken, verifyToken } = require("../../utils/jwt");

const config = require("../../config");
const Doctor = require("../doctor/doctor.model");

const getOrCreateDoctorProfile = async (userId) => {
    let doctorProfile = await Doctor.findOne({ user: userId }).select("_id");

    if (!doctorProfile) {
        doctorProfile = await Doctor.create({ user: userId });
    }

    return doctorProfile;
};

const registerUser = async (payload) => {
    if (payload.role === "admin") {
        throw new AppError(
            403,
            "Admin accounts cannot be self-registered"
        );
    }

    const exists = await User.findOne({
        email: payload.email,
    });

    if (exists) {
        throw new AppError(409, "Email already exists");
    }

    payload.password = await hashPassword(payload.password);

    const user = await User.create(payload);

    // If the registered user is a doctor,
    // automatically create a doctor profile.
    if (user.role === "doctor") {
        await getOrCreateDoctorProfile(user._id);
    }

    user.password = undefined;

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

    const refreshToken = generateToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expire
    );

    await User.updateOne(
        { _id: user._id },
        { lastLogin: new Date() }
    );
    user.password = undefined;

    const authUser = user.toObject();

    if (user.role === "doctor") {
        const doctorProfile = await getOrCreateDoctorProfile(user._id);
        authUser.doctorId = doctorProfile._id;
    }

    return {
        accessToken,
        refreshToken,
        user: authUser,
    };
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError(401, "Refresh token is required");
    }

    let decoded;
    try {
        decoded = verifyToken(refreshToken, config.jwt_refresh_secret);
    } catch {
        throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
        throw new AppError(401, "User not found");
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

    return { accessToken };
};

const getMe = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    if (user.role === "doctor") {
        const doctorProfile = await getOrCreateDoctorProfile(user._id);

        return {
            ...user.toObject(),
            doctorId: doctorProfile ? doctorProfile._id : null,
        };
    }

    return user;
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    getMe,
};
