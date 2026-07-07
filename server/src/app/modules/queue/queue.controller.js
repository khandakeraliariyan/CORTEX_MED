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
        data: result
    });

});

module.exports = {

    getQueue

};