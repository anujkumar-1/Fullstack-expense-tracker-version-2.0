import {DataTypes} from "sequelize"
import sequelize from '../utils/Database.js';

import User from "./User.js"


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

export default expenseTable