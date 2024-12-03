const Sequelize = require("sequelize")
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER_NAME, process.env.DB_USER_PASSWORD, {
    host: "localhost",
    dialect: "mysql"

})

module.exports = sequelize