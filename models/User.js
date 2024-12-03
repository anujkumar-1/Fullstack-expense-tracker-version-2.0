const DataTypes = require("sequelize")

const sequelize = require("../utils/Database")


const User = sequelize.define("userInfo", {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true

    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    ispremiumuser: DataTypes.BOOLEAN,

    totalCost:{
        type: DataTypes.INTEGER,
        defaultValue: 0

    },
    totalIncome:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    }



})

module.exports = User