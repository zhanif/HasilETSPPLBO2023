const db = require('./database')
const { serviceLog } = require('./utils')

let sql = `DROP TABLE IF EXISTS customers`

db.query(sql, (err, res) => {
    if (err) throw new Error(err)
    serviceLog("Table customer has been dropped!")
})

sql = `CREATE TABLE customers
(
    id int NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    address VARCHAR(255),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255),
    PRIMARY KEY (id)
)`

db.query(sql, (err, res) => {
    if (err) throw new Error(err)
    serviceLog("Table customer has been created!")
})