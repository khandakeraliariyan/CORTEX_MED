const generateAppointmentCode = () => {
    const random = Math.floor(
        1000 + Math.random() * 9000
    );

    return `QURA-${random}`;
};

module.exports = generateAppointmentCode;