const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const md5 = require('md5')
const { serviceLog } = require('./utils')
const db = require('./database')
const discoveryHelper = require('./discovery-helper')
const {Tracer, BatchRecorder} = require('zipkin')
const {HttpLogger} = require('zipkin-transport-http')
const CLSContext = require('zipkin-context-cls')

const ctxImpl = new CLSContext
const recorder = new BatchRecorder({
    logger: new HttpLogger({
        endpoint: `http://127.0.0.1:9411/api/v1/spans`
    })
})
const tracer = new Tracer({ctxImpl, recorder, localServiceName: 'Customer Service'})
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware

const app = express()
let port = 8112
port = 0
app.use(bodyParser.json())
app.use(zipkinMiddleware({tracer}))

app.get('/customer', async (req, res) => {
    getCustomers = async () => {
        return new Promise(function(resolve, reject) {
            db.query(`SELECT id, name, username, address FROM customers`, (err, res) => {
                if (err) throw reject(err)
                let data = []
                res.forEach(element => {
                    data.push({
                        id: element.id,
                        name: element.name,
                        username: element.username,
                        address: element.address
                    })
                });
                resolve(data)
            })
        })
    }
    let data = await getCustomers()
    res.status(200).json(data)
})

app.post('/customer', (req, res) => {
    const data = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        address: req.body.address
    }
    db.query(`INSERT INTO customers(\`name\`, \`username\`, \`password\`, \`address\`) VALUES (?, ?, ?, ?)`, [data.name, data.username, md5(data.password), data.address], (err, res) => {
        if (err) throw new Error(err)
        serviceLog("Customer has been created")
    })
    res.status(201).json({
        success: true,
        message: "Customer has been created"
    })
})


app.patch('/customer/:id', (req, res) => {
    const data = {
        name: req.body.name,
        address: req.body.address
    }

    db.query(`UPDATE customers SET name=?, address=? WHERE id=?`, [data.name, data.address, req.params.id], (err, req) => {
        if (err) throw new Error(err)
        serviceLog("Customer has been updated")
    })
    res.status(200).json({
        success: true,
        message: "Customer has been updated"
    })
})

app.delete('/customer/:id', (req, res) => {
    db.query(`DELETE FROM customers WHERE id=?`, [req.params.id], (err, res) => {
        if (err) throw new Error(err)
        serviceLog("Customer has been deleted")
    })
    res.status(200).json({
        success: true,
        message: "Customer has been deleted"
    })
})

const service = app.listen(port, () => {
    let xport = service.address().port
    serviceLog(`Listening on port ${xport} ...`, xport)
    discoveryHelper.registerWithEureka('customer-service', xport)
})
