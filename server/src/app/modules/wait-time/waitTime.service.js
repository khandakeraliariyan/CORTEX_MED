const Appointment = require("../appointment/appointment.model");
const Doctor = require("../doctor/doctor.model");

const recalculateQueue = async (doctorId) => {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) return;

    const avgTime = doctor.avgConsultationTime;

    const queue = await Appointment.find({
        doctor: doctorId,
        status: "waiting",
    }).sort({
        priority: 1,
        tokenNumber: 1,
    });

    const updates = queue.map((patient, index) => {
        patient.estimatedWait = index * avgTime;
        return patient.save();
    });

    await Promise.all(updates);

    return queue;
};

module.exports = {
    recalculateQueue,
};