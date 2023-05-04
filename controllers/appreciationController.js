const { Op } = require("sequelize");
const catchAsync = require("../utils/catchAsync")
const Appreciation = require("../models/Appreciation");
const AppreciationUser = require('../models/AppreciationUser');
const User = require('../models/User');
const sendPush = require("../utils/sendPush");
const notification = require('../dictionary/appreciationDictionary');

exports.createAppreciation = catchAsync(async (req, res, next) => {
    var { title, tree_id, appreciation, photos, user_ids } = req.body;

    const appreciationResponse = await Appreciation.create({
        title: title,
        tree_id: tree_id,
        appreciation: appreciation,
        photos: photos,
        creator_id: req.user_id,
    });

    let users = user_ids.map(el => {
        return {
            user_id: el,
            appreciation_id: appreciationResponse.id
        }
    });

    await AppreciationUser.bulkCreate(users);

    users = users.map(el => el.user_id);
    delete appreciationResponse.dataValues.creator_id;
    delete appreciationResponse.dataValues.created_at;

    const appreciationUsers = await User.findAll({
        where: {
            id: {
                [Op.in]: users
            },
            fcm_token: {
                [Op.ne]: null
            }
        }
    });
    const creator = await User.findByPk(req.user_id);
    console.log(creator);

    for (let i = 0; i < appreciationUsers.length; i++) {
        await sendPush({}, appreciationUsers[i].fcm_token, notification(appreciationUsers[i].lang, creator.name));
    }

    res.status(200).json({
        appreciation: appreciationResponse
    });
});

exports.listAppreciation = catchAsync(async (req, res, next) => {

    const appreciations = await Appreciation.findAll({
        where: {
            tree_id: req.params.id
        },
        order: [
            ["created_at", "DESC"]
        ],
        attributes: {
            exclude: ['creator_id']
        }
    });

    res.status(200).json(appreciations);
});

exports.updateAppreciation = catchAsync(async (req, res, next) => {
    await Appreciation.update(req.body, {
        where: {
            id: req.params.id
        }
    });

    res.status(200).json({
        status: 'success'
    });
});

exports.deleteAppreciation = catchAsync(async (req, res, next) => {
    await Appreciation.destroy({
        where: {
            id: req.params.id
        }
    });

    res.status(204).json();
});