const catchAsync = require("../../utils/catchAsync");

const sendResponse = require("../../utils/sendResponse");

const TriageService = require("./triage.service");

const runTriage = catchAsync(async (req, res) => {

    const result =
        await TriageService.runTriage(
            req.body.appointmentId
        );

    sendResponse(res, {
        statusCode: 200,
        message: "Triage completed",
        data: result
    });

});

module.exports = {
    runTriage
};