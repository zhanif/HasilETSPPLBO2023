const db = require('./database')
const { serviceLog } = require('./utils')

let sql = ''
// Menu table
// sql = `DROP TABLE IF EXISTS menu`

// db.query(sql, (err, res) => {
//     if (err) throw new Error(err)
//     serviceLog("Table menu has been dropped!")
// })

// sql = `CREATE TABLE menu
// (
//     id int NOT NULL AUTO_INCREMENT,
//     id_cafe VARCHAR(255),
//     id_outlet INTEGER,
//     name VARCHAR(255),
//     price INTEGER,
//     quantity INTEGER,
//     PRIMARY KEY (id)
// )`
// db.query(sql, (err, res) => {
//     if (err) throw new Error(err)
//     serviceLog("Table menu has been created!")
// })

// Ticket Table
sql = `DROP TABLE IF EXISTS payment`

db.query(sql, (err, res) => {
    if (err) throw new Error(err)
    serviceLog("Table payment has been dropped!")
})

sql = `CREATE TABLE payment
(
    id int NOT NULL AUTO_INCREMENT,
    id_cafe VARCHAR(255),
    id_customer INTEGER,
    order_number VARCHAR(6),
    status ENUM('pending', 'paid') DEFAULT 'pending',
    total_price INTEGER,
    PRIMARY KEY (id)
)`
db.query(sql, (err, res) => {
    if (err) throw new Error(err)
    serviceLog("Table payment has been created!")
})