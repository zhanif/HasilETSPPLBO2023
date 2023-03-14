const express = require('express')
const Router = require('./Router')
const Discovery = require('./Discovery')
const Utils = require('../components/Utils')
const Database = require('../config/Database')

class App {
    constructor(appName) {
        this.appName = appName
        this.app = express()
        this.app.use(express.json())
        this.discovery = null
        let router = new Router
        this.app.use(router.getRouter())
        Database.connect()
    }
    listen(port = 0) {
        const service = this.app.listen(port, () => {
            let xport = service.address().port
            Utils.serviceLog(`Listening on port ${xport} ...`, xport)
            // this.discovery = new Discovery(this.appName, port)
        })
    }
}

module.exports = App;
