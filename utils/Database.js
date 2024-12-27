import { Sequelize } from 'sequelize';

const sequelize = new Sequelize( "expdb", "root", "Anujkumar@1", {
    host: "localhost",
    dialect: "mysql"

})

export default sequelize;
