const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");

const HospitalService = require("./hospital.service");

const getSettings = catchAsync(async (req, res) => {
    const result = await HospitalService.getSettings();

    sendResponse(res, {
        statusCode: 200,
        message: "Hospital settings fetched successfully",
        data: result,
    });
});

const updateSettings = catchAsync(async (req, res) => {
    const result = await HospitalService.updateSettings(req.body);

    sendResponse(res, {
        statusCode: 200,
        message: "Hospital settings updated successfully",
        data: result,
    });
});

module.exports = {
    getSettings,
    updateSettings,
};
