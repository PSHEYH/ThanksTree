const { DataTypes } = require('sequelize');
const sequelize = require('../dbConnect');
const Tree = require('./Tree');

const UserTree = sequelize.define('user_tree', {
    user_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    tree_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    timestamps: false,
    tableName: 'user_trees'
});

module.exports = UserTree;