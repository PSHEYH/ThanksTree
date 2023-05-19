const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_SERVER,
    port: 3306,
    dialect: 'mysql',
    charset: 'utf8',
});

module.exports = sequelize;