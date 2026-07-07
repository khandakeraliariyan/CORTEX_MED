const Appointment = require("../appointment/appointment.model");

const getDoctorQueue = async (doctorId) => {

    const queue = await Appointment.find({
        doctor: doctorId,
        status: "waiting"
    })

        .sort({
            priority: 1,
            tokenNumber: 1
        });

    return queue;

};

module.exports = {
    getDoctorQueue
};