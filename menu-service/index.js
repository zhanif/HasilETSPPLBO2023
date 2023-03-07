const express = require('express')
const app = express()

const port = 8113
const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/ets_menu_service`).then(() => {
    serviceLog(`Successfully connected to database`)
})

const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const Menu = require('./schemas/Menu')

app.use(bodyParser.json())

app.get('/', async (req, res) => {
    let data = await Menu.find({})
    res.status(200).json(data)
})

app.post('/', async (req, res) => {
    const data = {
        name: req.body.name,
        price: req.body.price
    }
    await Menu.create(data)
    res.status(201).json({
        success: true,
        message: "Menu has been created"
    })
})


app.patch('/:id', (req, res) => {
    const data = {
        name: req.body.name,
        address: req.body.address
    }

    res.status(200).json({
        success: true,
        message: "Menu has been updated"
    })
})

app.delete('/:id', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Menu has been deleted"
    })
})

app.listen(port, () => { serviceLog("Service Started") })

