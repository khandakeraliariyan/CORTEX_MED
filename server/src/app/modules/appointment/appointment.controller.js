const catchAsync = require("../../utils/catchAsync");

const sendResponse = require("../../utils/sendResponse");

const AppointmentService = require("./appointment.service");

const createAppointment = catchAsync(async (req, res) => {

    const result =
        await AppointmentService.createAppointment(
            req.body
        );

    sendResponse(res, {
        statusCode: 201,
        message:
            "Appointment created successfully",
        data: result,
    });

});

module.exports = {
    createAppointment,
};