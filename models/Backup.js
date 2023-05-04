const { DataTypes } = require("sequelize");
const sequelize = require("../dbConnect");

const Backup = sequelize.define('backups', {
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now(),
        primaryKey: true
    },
    backup: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [0, 400]
        }
    },
    user_id: {
        type: DataTypes.UUIDV4,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = Backup;