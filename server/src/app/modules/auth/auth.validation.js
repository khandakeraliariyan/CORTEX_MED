const { z } = require("zod");

const registerValidation = z.object({
    body: z.object({
        name: z.string().min(3),

        email: z.string().email(),

        password: z.string().min(6),

        role: z.enum(["admin", "doctor", "receptionist"]),
    }),
});

const loginValidation = z.object({
    body: z.object({
        email: z.string().email(),

        password: z.string().min(6),
    }),
});

const refreshValidation = z.object({
    body: z.object({
        refreshToken: z.string(),
    }),
});

module.exports = {
    registerValidation,
    loginValidation,
    refreshValidation,
};