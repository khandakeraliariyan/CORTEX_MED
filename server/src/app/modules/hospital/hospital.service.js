const HospitalSettings = require("./hospital.model");

// Singleton settings document - there is only ever one hospital per deployment.
const getSettings = async () => {
    let settings = await HospitalSettings.findOne();

    if (!settings) {
        settings = await HospitalSettings.create({});
    }

    return settings;
};

const updateSettings = async (payload) => {
    const settings = await getSettings();

    if (payload.hospitalName !== undefined) {
        settings.hospitalName = payload.hospitalName;
    }

    if (payload.facilityId !== undefined) {
        settings.facilityId = payload.facilityId;
    }

    await settings.save();

    return settings;
};

module.exports = {
    getSettings,
    updateSettings,
};
