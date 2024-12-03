const sequelize = require("../utils/Database")
const DataTypes = require("sequelize")
const User = require("./User")

const ForgotPassword = sequelize.define("forgotPassword", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isActive: DataTypes.BOOLEAN,

})

User.hasMany(ForgotPassword)
ForgotPassword.belongsTo(User)


module.exports = ForgotPassword;