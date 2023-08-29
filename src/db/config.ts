import { Dialect, Sequelize } from 'sequelize'

const dbName = process.env.DB_NAME as string
const dbUser = process.env.DB_USER as string
const dbHost = process.env.DB_HOST
const dbDriver = process.env.DB_DRIVER as Dialect
const dbPassword = process.env.DB_PASSWORD
const dbUrl = process.env.DB_URL as string


const sequelizeConnection = new Sequelize(dbUrl, {
  dialect: dbDriver,
  storage: "../../bitespeed/db.sqlite",
  pool: {
    idle: 10000
  }
})

export default sequelizeConnection