import {DataTypes} from "sequelize"
import sequelize from '../utils/Database.js';

import User from "./User.js"


const s3Urls = sequelize.define("s3", {
    link: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }

})

User.hasMany(s3Urls)
s3Urls.belongsTo(User)

export default s3Urls