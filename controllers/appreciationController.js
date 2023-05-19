const { Op } = require("sequelize");
const catchAsync = require("../utils/catchAsync")
const Appreciation = require("../models/Appreciation");
const AppreciationUser = require('../models/AppreciationUser');
const User = require('../models/User');
const sendPush = require("../utils/sendPush");
const notification = require('../dictionary/appreciationDictionary');

Appreciation.belongsToMany(User, { through: AppreciationUser, foreignKey: 'appreciation_id' });
User.belongsToMany(Appreciation, { through: AppreciationUser, foreignKey: 'user_id' });

// User.hasOne(Appreciation, {
//     foreignKey: {
//         name: 'creator_id',
//     }
// });
// Appreciation.belongsTo(User);

exports.createAppreciation = catchAsync(async (req, res, next) => {
    var { question, tree_id, gratitude, photos, user_ids } = req.body;

    const appreciationResponse = await Appreciation.create({
        question: question,
        tree_id: tree_id,
        gratitude: gratitude,
        photos: photos,
        creator_id: req.user.id,
    });

    let users = [];
    photos = JSON.parse(photos);

    if (user_ids) {
        users = user_ids.map(el => {
            return {
                user_id: el,
                appreciation_id: appreciationResponse.id
            }
        });
        await AppreciationUser.bulkCreate(users);

        users = users.map(el => el.user_id);

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

        for (let i = 0; i < appreciationUsers.length; i++) {
            await sendPush({}, appreciationUsers[i].fcm_token, notification(appreciationUsers[i].lang, req.user.name));
        }
    }

    delete appreciationResponse.dataValues.creator_id;
    delete appreciationResponse.dataValues.created_at;
    delete appreciationResponse.dataValues.photos;
    res.status(200).json({ ...appreciationResponse.dataValues, users: users, photos: photos });
});

exports.listAppreciation = catchAsync(async (req, res, next) => {

    const appreciations = await Appreciation.findAll({
        where: {
            tree_id: req.params.id
        },
        include: [{
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'avatar'],
            through: { attributes: [] },
            required: false,
        }],
        order: [
            ["created_at", "DESC"]
        ],
    });

    for (let i = 0; i < appreciations.length; i++) {

        appreciations[i].photos = JSON.parse(appreciations[i].photos);
        if (appreciations[i].creator_id === req.user.id) {
            appreciations[i].dataValues.creator = true;
        }
        else {
            appreciations[i].dataValues.creator = false;
        }

        for (let j = 0; j < appreciations[i].dataValues.users.length; j++) {
            if (appreciations[i].dataValues.users[j].dataValues.id === appreciations[i].dataValues.creator_id) {
                appreciations[i].dataValues.users[j].dataValues.is_creator = true;
                delete appreciations[i].dataValues.creator_id;
            }
            else
                appreciations[i].dataValues.users[j].dataValues.is_creator = false;
        }

        if (appreciations[i].dataValues.hasOwnProperty('creator_id')) {
            const user = await User.findByPk(appreciations[i].creator_id, {
                attributes: [
                    'id', 'name', 'avatar'
                ]
            });
            user.dataValues.is_creator = true;
            appreciations[i].dataValues.users.push(user);
            delete appreciations[i].dataValues.creator_id;
        }
    }

    res.status(200).json(appreciations);
});

exports.updateAppreciation = catchAsync(async (req, res, next) => {

    let user_ids = req.body.user_ids;

    await Appreciation.update(req.body, {
        where: {
            id: req.params.id
        }
    });
    const appreciation = await Appreciation.findByPk(req.params.id);
    await AppreciationUser.destroy({
        where: {
            appreciation_id: req.params.id
        }
    });

    user_ids = user_ids
        .filter(v => v !== appreciation.dataValues.creator_id)
        .map(e => { return { user_id: e, appreciation_id: appreciation.dataValues.id } });

    await AppreciationUser.bulkCreate(user_ids);

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