const { getIO } = require("./socket");

const emit = (event, payload) => {
    const io = getIO();

    io.emit(event, payload);
};

const emitToRoom = (room, event, payload) => {
    const io = getIO();

    io.to(room).emit(event, payload);
};

module.exports = {
    emit,
    emitToRoom,
};