import {DataTypes} from "sequelize"
import sequelize from '../utils/Database.js';

import User from "./User.js"

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


export default ForgotPassword;