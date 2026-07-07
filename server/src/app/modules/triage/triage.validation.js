const { z } = require("zod");

const triageValidation = z.object({
    body: z.object({
        appointmentId: z.string()
    })
});

module.exports = {
    triageValidation
};