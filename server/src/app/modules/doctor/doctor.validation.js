const { z } = require("zod");

const createDoctorValidation = z.object({
    body: z.object({
        user: z.string(),

        department: z.string(),

        specialty: z.string(),

        room: z.string(),

        consultationFee: z.number(),

        avgConsultationTime: z.number(),

        workingDays: z.array(z.string()),

        startTime: z.string(),

        endTime: z.string(),
    }),
});

module.exports = {
    createDoctorValidation,
};