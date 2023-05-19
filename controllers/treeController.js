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
        creator_id: req.user.id,
        ...req.body
    });

    delete tree.dataValues.creator_id;

    res.status(200).json(tree);
});

exports.updateTree = catchAsync(async (req, res, next) => {

    await Tree.update(req.body, {
        where: {
            id: req.params.id
        },
        individualHooks: true,
    });

    const tree = await Tree.findByPk(req.params.id, {
        attributes: ['name', 'count', 'skin_id', 'is_leaf_falls']
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
    let trees = await Tree.findAll({
        where: {
            [Op.and]: [sequelize.literal(`exists (SELECT * FROM user_trees WHERE user_id = '${req.user.id}' and tree_id = tree.id)`)]
        },
        include: [{
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'avatar'],
            where: {
                id: {
                    [Op.ne]: req.user.id
                }
            },
            through: { attributes: [] },
            required: false
        }],
        order: [
            ["created_at", "DESC"]
        ]
    });

    trees.forEach(el => {
        el.dataValues.is_creator = el.creator_id === req.user.id;
        delete el.dataValues.creator_id;
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

    tree.dataValues.users = tree.users.filter(el => el.id !== req.user.id);

    res.status(200).json(tree);
});

exports.joinToTree = catchAsync(async (req, res, next) => {

    const existedUser = await UserTree.findOne({
        where: {
            user_id: req.user.id,
            tree_id: req.params.id
        }
    });

    if (existedUser) {
        res.status(400).json({
            message: "You already in tree"
        });
    }
    const tree = await Tree.findByPk(req.params.id, {
        attributes: {
            exclude: ['creator_id']
        }
    });

    if (!tree) {
        res.status(400).json({
            "message": "Tree doesn't exist"
        });

        return;
    }

    await UserTree.create({
        tree_id: req.params.id,
        user_id: req.user.id
    });

    res.status(200).json(tree);
});

exports.deleteUserFromTree = catchAsync(async (req, res, next) => {
    await UserTree.destroy({
        user_id: req.params.user_id,
        tree_id: req.params.id
    });

    res.status(200);
})

exports.exitFromTree = catchAsync(async (req, res, next) => {

    const isAdmin = await Tree.findOne({
        where: {
            id: req.params.id,
            creator_id: req.user.id
        }
    });

    if (isAdmin) {
        await Tree.destroy({ where: { id: req.params.id } })

        res.status(200).json({
            "status": "deleted"
        });
    }
    else {
        await UserTree.destroy({
            where: {
                tree_id: req.params.id,
                user_id: req.user.id
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
    }
})

exports.saveMyTree = catchAsync(async (req, res, next) => {

    const filepath = path.join(__dirname, '/../storage/');
    const json = JSON.parse(req.body.backup);

    try {
        await util.promisify(fs.writeFile)(filepath + req.user.id + '.json', JSON.stringify(json));
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
        const tree = await util.promisify(fs.readFile)(filepath + req.user.id + '.json', 'utf8');
        res.status(200).json({
            backup: tree
        });
    } catch (err) {
        console.error(err)
        res.status(500).json({});
    }
}