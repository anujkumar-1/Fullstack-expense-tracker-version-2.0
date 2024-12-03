const DataTypes = require("sequelize")
const User = require("./User")
const sequelize = require("../utils/Database")


const expenseTable = sequelize.define("expense", {
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

User.hasMany(expenseTable)
expenseTable.belongsTo(User)

module.exports = expenseTable