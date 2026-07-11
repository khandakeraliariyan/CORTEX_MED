const { z } = require("zod");

const updateHospitalSettingsValidation = z.object({
    body: z.object({
        hospitalName: z.string().trim().min(1).optional(),
        facilityId: z.string().trim().optional(),
    }),
});

module.exports = {
    updateHospitalSettingsValidation,
};
