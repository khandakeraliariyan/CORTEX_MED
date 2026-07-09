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
        message: "Appointment booked successfully",
        data: result,
    });
});

const listAppointments = catchAsync(async (req, res) => {
    const result = await AppointmentService.listAppointments();

    sendResponse(res, {
        statusCode: 200,
        message: "Appointments fetched successfully",
        data: result,
    });
});

const trackAppointment = catchAsync(async (req, res) => {
    const result = await AppointmentService.trackAppointment(
        req.params.code
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Appointment fetched successfully",
        data: result,
    });
});

module.exports = {
    createAppointment,
    listAppointments,
    trackAppointment,
};