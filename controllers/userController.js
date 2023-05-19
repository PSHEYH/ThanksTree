const User = require("../models/User");
const Backup = require("../models/Backup");
const catchAsync = require("../utils/catchAsync");

exports.updateProfile = catchAsync(async (req, res, next) => {

    await User.update(req.body, {
        where: {
            id: req.user.id
        }
    });

    res.status(200).json({
        status: 'success'
    });
});


exports.getProfile = catchAsync(async (req, res, next) => {

    const user = await User.findByPk(req.user.id, {
        attributes: ['name', 'email', 'avatar', 'lang', 'is_notify']
    });
    res.status(200).json(user);
})

exports.saveBackup = catchAsync(async (req, res, next) => {

    await Backup.create({
        user_id: req.user.id,
        backup: req.body.backup
    });
    res.status(201).json({
        status: 'success'
    });
});

exports.getBackup = catchAsync(async (req, res, next) => {
    const backup = await Backup.findOne({
        order: [
            ['created_at', 'DESC']
        ],
        where: {
            user_id: req.user.id
        },
        attributes: {
            include: ['backup'],
            exclude: ['user_id', 'created_at']
        }
    });

    res.status(200).json(backup);
});