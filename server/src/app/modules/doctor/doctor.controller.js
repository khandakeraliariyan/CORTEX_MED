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

const listDoctors = catchAsync(
    async (req, res) => {

        const result = await DoctorService.listDoctors();

        sendResponse(res, {
            statusCode: 200,
            message: "Doctors fetched successfully",
            data: result,
        });

    }
);

const updateDoctor = catchAsync(
    async (req, res) => {

        const result = await DoctorService.updateDoctor(
            req.params.id,
            req.body
        );

        sendResponse(res, {
            statusCode: 200,
            message: "Doctor updated successfully",
            data: result,
        });

    }
);

const deleteDoctor = catchAsync(
    async (req, res) => {

        await DoctorService.deleteDoctor(req.params.id);

        sendResponse(res, {
            statusCode: 200,
            message: "Doctor removed successfully",
            data: null,
        });

    }
);

module.exports = {
    createDoctor,
    listDoctors,
    updateDoctor,
    deleteDoctor,
};