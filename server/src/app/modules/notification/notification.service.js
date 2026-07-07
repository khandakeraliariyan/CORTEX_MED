const SocketService = require("../../socket/socket.service");

const {
    SOCKET_EVENTS,
} = require("../../socket/socket.events");

const queueUpdated = (doctorId) => {
    SocketService.emit(
        SOCKET_EVENTS.QUEUE_UPDATED,
        {
            doctorId,
        }
    );
};

const patientCalled = (appointment) => {
    SocketService.emit(
        SOCKET_EVENTS.PATIENT_CALLED,
        appointment
    );
};

const patientCompleted = (appointment) => {
    SocketService.emit(
        SOCKET_EVENTS.PATIENT_COMPLETED,
        appointment
    );
};

const waitUpdated = (doctorId) => {
    SocketService.emit(
        SOCKET_EVENTS.WAIT_UPDATED,
        {
            doctorId,
        }
    );
};

module.exports = {
    queueUpdated,
    patientCalled,
    patientCompleted,
    waitUpdated,
};