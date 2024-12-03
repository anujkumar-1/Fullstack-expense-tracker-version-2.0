const DataTypes = require("sequelize")
const User = require("./User")
const sequelize = require("../utils/Database")

const Income = sequelize.define("income", {
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false

    },
    category:{
        type: DataTypes.STRING,
        allowNull: false
    }
})


User.hasMany(Income)
Income.belongsTo(User)

module.exports = Income