const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../dbConnect');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.UUIDV4,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        validate: {
            len: [0, 50]
        }
    },
    avatar: {
        type: DataTypes.STRING,
        validate: {
            len: [0, 200]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [0, 100]
        }
    },
    lang: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [0, 4]
        }
    },
    fcm_token: {
        type: DataTypes.STRING,
    },
    notification_time: {
        type: DataTypes.TIME
    },
    is_notify: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    is_authorized: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    refresh_key: {
        type: DataTypes.STRING
    }
}, {
    updatedAt: 'updated_at',
    createdAt: false,
    tableName: 'users'
});

module.exports = User;