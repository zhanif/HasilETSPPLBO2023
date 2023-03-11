const db = require('./database')
const { serviceLog } = require('./utils')

let sql = `DROP TABLE IF EXISTS menu`

db.query(sql, (err, res) => {
    if (err) throw new Error(err)
    serviceLog("Table menu has been dropped!")
})

sql = `CREATE TABLE menu
(
    id int NOT NULL AUTO_INCREMENT,
    id_cafe VARCHAR(255),
    id_outlet INTEGER,
    name VARCHAR(255),
    price INTEGER,
    quantity INTEGER,
    PRIMARY KEY (id)
)`

db.query(sql, (err, res) => {
    if (err) throw new Error(err)
    serviceLog("Table menu has been created!")
})