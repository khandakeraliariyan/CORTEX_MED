const Queue = require("./queue.model");

const insertPatient = async (appointment, triage) => {
    return await Queue.create({

        doctor:
            appointment.doctor,

        appointment:
            appointment._id,

        priority:
            triage.priority,

        tokenNumber:
            appointment.tokenNumber

    });

};

module.exports = {
    insertPatient
};