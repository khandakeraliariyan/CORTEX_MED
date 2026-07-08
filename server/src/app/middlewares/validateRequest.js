const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            req.body = parsed.body;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = validateRequest;