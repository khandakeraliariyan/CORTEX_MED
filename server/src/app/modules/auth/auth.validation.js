const { z } = require("zod");

const registerValidation = z.object({
    body: z.object({
        name: z.string().min(3),

        email: z.string().email(),

        password: z.string().min(6),

        role: z.enum(["admin", "doctor", "receptionist"]),
        department: z.string().trim().min(1).optional(),
    }).superRefine((body, ctx) => {
        if (body.role === "doctor" && !body.department) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["department"],
                message: "Department is required for doctor accounts",
            });
        }
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
