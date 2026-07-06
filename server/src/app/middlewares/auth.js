const { verifyToken } = require("../utils/jwt");

const config = require("../config");

const AppError = require("../errors/AppError");

const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;

            if (!token) {
                throw new AppError(401, "Unauthorized");
            }

            const decoded = verifyToken(
                token,
                config.jwt_access_secret
            );

            req.user = decoded;

            if (
                roles.length &&
                !roles.includes(decoded.role)
            ) {
                throw new AppError(
                    403,
                    "Forbidden"
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = auth;