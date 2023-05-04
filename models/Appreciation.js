const { DataTypes } = require('sequelize');
const sequelize = require('../dbConnect');
const Tree = require('./Tree');

const Appreciation = sequelize.define('appreciations', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    creator_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tree_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [0, 65]
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [0, 80]
        }
    },
    appreciation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [0, 200]
        }
    },
    photos: {
        type: DataTypes.STRING,
    }
}, {
    updatedAt: false,
    createdAt: 'created_at'
});

Appreciation.addHook('afterCreate', async (appreciation, options) => {
    await Tree.increment(
        'count',
        {
            where: {
                id: appreciation.tree_id
            }
        },
    );
})

module.exports = Appreciation;