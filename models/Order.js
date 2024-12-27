import {DataTypes} from "sequelize"
import sequelize from '../utils/Database.js';

import User from "./User.js"

const Order = sequelize.define("order", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    paymentstatus: DataTypes.STRING,
    orderid: DataTypes.STRING,
    status: DataTypes.STRING

})


User.hasMany(Order)
Order.belongsTo(User)

export default Order