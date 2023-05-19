const Tree = require("../models/Tree");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/app.error');

const isTreeOwner = catchAsync(async (req, res, next) => {

    const { creator_id } = await Tree.findByPk(res.params.id);
    if (creator_id != req.user.id) {
        return next(new AppError('You are not creator of tree', 403));
    }

    next();
})

module.exports = isTreeOwner;