const { DataTypes } = require("sequelize");
const sequelize = require("../dbConnect");
const Appreciation = require("./Appreciation");
const User = require("./User");

const AppreciationUser = sequelize.define('appreciation_users', {
    user_id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    appreciation_id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    }
}, {
    timestamps: false,
});

module.exports = AppreciationUser;