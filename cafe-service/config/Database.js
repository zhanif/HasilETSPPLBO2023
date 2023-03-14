const mongoose = require('mongoose')
const Utils = require('../components/Utils')

class Database {
    static connect() {
        mongoose.connect(`mongodb://localhost:27017/ets_cafe_service`).then(() => {
            Utils.serviceLog(`Successfully connected to database`)
        })
    }
}

module.exports = Database
