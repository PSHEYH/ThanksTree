const AppError = require('../utils/app.error');

const handleForeignKeyError = (err) => {
    const message = `Foreign key constraints failed in field ${err.fields[0]}`;
    return new AppError(message, 404);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 404);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        statusCode: err.statusCode,
        status: 'error',
        message: err.message,
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    console.log(err);
    const errorName = err.name;
    const errorMessage = err.message;
    let error = { ...err };
    error.message = errorMessage;

    if (errorName === 'SequelizeForeignKeyConstraintError') {
        error = handleForeignKeyError(error);
    }
    if (errorName === 'SequelizeValidationError') {
        error = handleValidationErrorDB(error);
    }
    sendErrorDev(error, res);
};
