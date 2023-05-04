var fs = require('fs');
const path = require('path');
const util = require('util');
const sequelize = require('sequelize');
const { Op } = require("sequelize");

const Tree = require('../models/Tree');
const UserTree = require('../models/UserTree');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

Tree.belongsToMany(User, { through: UserTree, foreignKey: 'tree_id' });
User.belongsToMany(Tree, { through: UserTree, foreignKey: 'user_id' });


exports.createTree = catchAsync(async (req, res, next) => {

    const tree = await Tree.create({
        creator_id: req.user_id,
        ...req.body
    });
    delete tree.dataValues.creator_id;
    delete tree.dataValues.created_at;

    res.status(201).json(tree);
});

exports.updateTree = catchAsync(async (req, res, next) => {
    await Tree.update(req.body, {
        where: {
            id: req.params.id
        },
    });

    const tree = await Tree.findByPk(req.params.id, {
        attributes: ['name', 'count']
    });

    res.status(200).json(tree);
})

exports.deleteTree = catchAsync(async (req, res, next) => {
    await Tree.destroy({
        where: {
            id: req.params.id
        }
    });

    res.status(204).json({});
})

exports.getTrees = catchAsync(async (req, res, next) => {
    const trees = await Tree.findAll({
        attributes: { exclude: ['creator_id'] },
        where: {
            [Op.and]: [sequelize.literal(`exists (SELECT * FROM user_trees WHERE user_id = '${req.user_id}' and tree_id = tree.id)`)]
        },
        include: [{
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'avatar'],
            where: {
                id: {
                    [Op.ne]: req.user_id
                }
            },
            through: { attributes: [] },
            required: false
        }],
        order: [
            ["created_at", "DESC"]
        ]
    });

    res.status(200).json(trees);
})

exports.getTreeById = catchAsync(async (req, res, next) => {

    let tree = await Tree.findByPk(req.params.id, {
        include: {
            model: User,
            as: 'users',
            attributes: ['name', 'id'],
            through: { attributes: [] }
        },
        attributes: ['id', 'name', 'count', 'skin_id', 'is_leaf_falls'],
    });

    tree.dataValues.users = tree.users.filter(el => el.id !== req.user_id);

    res.status(200).json(tree);
});

exports.joinToTree = catchAsync(async (req, res, next) => {
    await UserTree.create({
        tree_id: req.params.id,
        user_id: req.user_id
    });

    const tree = await Tree.findByPk(req.params.id, {
        attributes: {
            exclude: ['creator_id']
        }
    });

    res.status(200).json(tree);
});

exports.exitFromTree = catchAsync(async (req, res, next) => {

    await UserTree.destroy({
        where: {
            tree_id: req.params.id,
            user_id: req.user_id
        }
    });

    const userTrees = await UserTree.findAll({
        where: {
            tree_id: req.params.id
        }
    });


    if (userTrees.length === 0) {
        await Tree.destroy({
            where: {
                id: req.params.id
            }
        });
    }

    res.status(204).json({});
})

exports.saveMyTree = catchAsync(async (req, res, next) => {

    const filepath = path.join(__dirname, '/../storage/');
    const json = JSON.parse(req.body.backup);

    try {
        await util.promisify(fs.writeFile)(filepath + req.user_id + '.json', JSON.stringify(json));
        res.status(200).json({
            status: "success"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "failed"
        });
    }
});

exports.getMyTree = async (req, res, next) => {
    try {
        const filepath = path.join(__dirname, '/../storage/');
        const tree = await util.promisify(fs.readFile)(filepath + req.user_id + '.json', 'utf8');
        res.status(200).json({
            backup: tree
        });
    } catch (err) {
        console.error(err)
        res.status(500).json({});
    }
}