const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../dbConnect');
const UserTree = require('./UserTree');

const Tree = sequelize.define('tree', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    creator_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        validate: {
            len: [0, 50]
        }
    },
    skin_id: {
        type: DataTypes.INTEGER,
    },
    is_leaf_falls: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    finish: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}, {
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'trees',
});

Tree.addHook('afterCreate', async (tree, options) => {
    await UserTree.create({
        user_id: tree.creator_id,
        tree_id: tree.id
    });
});

Tree.addHook('beforeUpdate', async (tree, options) => {
    if (tree.dataValues.skin_id !== tree._previousDataValues.skin_id) {
        tree.dataValues.count = 0;
    }
})

module.exports = Tree;