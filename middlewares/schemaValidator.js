const _ = require('lodash');
const AppError = require('../utils/app.error');
const catchAsync = require('../utils/catchAsync');

module.exports = (Schemas) => {

    const _supportedMethods = ['post', 'put'];

    const _validationOptions = {
        abortEarly: false,  // abort after the last validation error
        allowUnknown: false, // allow unknown keys that will be ignored
    };

    return catchAsync(async (req, res, next) => {
        const route = req.route.path;
        const method = req.method.toLowerCase();
        if (_.includes(_supportedMethods, method) && _.has(Schemas, route)) {
            const _schema = _.get(Schemas, route);
            if (_schema) {
                try {
                    const value = await _schema.validateAsync(req.body);
                    req.body = value;
                    return next();
                } catch (err) {
                    const details = _.map(err.details, ({ message }) => ({
                        message: message.replace(/['"]/g, ''),
                    }));
                    return next(new AppError(details, 422));
                }
            }
            return next();
        }
        return next();
    });
};