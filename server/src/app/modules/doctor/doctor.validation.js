const { z } = require("zod");

const newDoctorUser = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

const createDoctorValidation = z.object({
    body: z.object({
        user: z.union([z.string(), newDoctorUser]),

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