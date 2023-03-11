const mysql = require('mysql')
const { serviceLog } = require('./utils')

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ets_kitchen_service"
})

db.connect((err) => {
    if (err) throw new Error(err)
    serviceLog("Connected to database")
})

module.exports = db