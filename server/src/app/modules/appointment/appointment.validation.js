const { z } = require("zod");

const createAppointmentValidation = z.object({
    body: z.object({
        patientName: z.string(),

        age: z.number(),

        gender: z.enum([
            "male",
            "female",
            "other",
        ]),

        phone: z.string(),

        doctor: z.string(),

        symptoms: z.string(),
    }),
});

module.exports = {
    createAppointmentValidation,
};