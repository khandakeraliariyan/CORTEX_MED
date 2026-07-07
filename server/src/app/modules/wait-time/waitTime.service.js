const Appointment = require("../appointment/appointment.model");
const Doctor = require("../doctor/doctor.model");

const recalculateQueue = async (doctorId) => {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        return;
    }

    const avgTime = doctor.avgConsultationTime;

    const queue = await Appointment.find({
        doctor: doctorId,
        status: "waiting",
    }).sort({
        priority: 1,
        tokenNumber: 1,
    });

    const bulkOperations = queue.map((patient, index) => ({
        updateOne: {
            filter: {
                _id: patient._id,
            },
            update: {
                estimatedWait: index * avgTime,
            },
        },
    }));

    if (bulkOperations.length) {
        await Appointment.bulkWrite(bulkOperations);
    }

    return await Appointment.find({
        doctor: doctorId,
        status: "waiting",
    }).sort({
        priority: 1,
        tokenNumber: 1,
    });
};

module.exports = {
    recalculateQueue,
};