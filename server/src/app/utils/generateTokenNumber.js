const Appointment = require("../modules/appointment/appointment.model");

const generateTokenNumber = async (doctorId) => {
    const total =
        await Appointment.countDocuments({
            doctor: doctorId,
        });

    return total + 1;
};

module.exports = generateTokenNumber;