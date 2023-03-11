const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')

const serviceRegistry = new Map()
const app = express()

app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.status(200).json(Array.from(serviceRegistry.keys()))
})

app.post('/register', (req, res) => {
    let { name, address } = req.body
    serviceRegistry.set(name, address)
    res.status(200).json({
        success: true,
        message: `${name} is successfully registered!`
    })
    serviceLog(`Service ${name} has been registered`)
})

app.post('/unregister', (req, res) => {
    let { name } = req.body
    serviceRegistry.delete(name)
    res.status(200).json({
        success: true,
        message: `${name} is successfully unregistered!`
    })
    serviceLog(`Service ${name} has been unregistered`)
})

app.get('/lookup/:name', (req, res) => {
    let name = req.params.name
    let address = serviceRegistry.get(name)
    if (address) {
        res.status(200).json({
            success: true,
            data: address
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: 'Not found'
        })
    }
})

const port = 3000
app.listen(port, () => {
    serviceLog(`Listening on port ${port}...`)
})