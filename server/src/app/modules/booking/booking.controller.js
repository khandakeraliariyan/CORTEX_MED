const catchAsync = require("../../utils/catchAsync");

const sendResponse = require("../../utils/sendResponse");

const BookingService = require("./booking.service");

const createBooking = catchAsync(async (req, res) => {

    const result = await BookingService.bookPatient(
        req.body
    );

    sendResponse(res, {
        statusCode: 201,
        message: "Patient booked successfully",
        data: result
    });

});

module.exports = {

    createBooking

};