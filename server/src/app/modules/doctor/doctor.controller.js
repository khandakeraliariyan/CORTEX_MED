const catchAsync = require("../../utils/catchAsync");

const sendResponse = require("../../utils/sendResponse");

const DoctorService = require("./doctor.service");

const createDoctor = catchAsync(
    async (req, res) => {

        const result =
            await DoctorService.createDoctor(
                req.body
            );

        sendResponse(res, {
            statusCode: 201,
            message: "Doctor created successfully",
            data: result,
        });

    }
);

module.exports = {
    createDoctor,
};