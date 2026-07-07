const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");
const QueueService = require("./queue.service");

const getQueue = catchAsync(async (req, res) => {
    const result = await QueueService.getDoctorQueue(
        req.params.doctorId
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Queue fetched successfully",
        data: result,
    });
});

const callNextPatient = catchAsync(async (req, res) => {
    const result = await QueueService.callNextPatient(
        req.params.doctorId
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Next patient called",
        data: result,
    });
});

const completePatient = catchAsync(async (req, res) => {
    const result = await QueueService.completePatient(
        req.params.appointmentId
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Consultation completed",
        data: result,
    });
});

module.exports = {
    getQueue,
    callNextPatient,
    completePatient,
};