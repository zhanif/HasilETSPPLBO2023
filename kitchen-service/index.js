const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const Menu = require('./schemas/Menu')

const app = express()
const port = 8111
const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/ets_kitchen_service`).then(() => {
    serviceLog(`Successfully connected to database`)
})

app.use(bodyParser.json())

app.get('/kitchen', async (req, res) => {
    let data = await Menu.find({})
    res.status(200).json(data)
})

app.post('/kitchen/menu', async (req, res) => {
    const data = {
        id_cafe: req.body.id_cafe,
        id_outlet: req.body.id_outlet,
        name: req.body.name,
        price: req.body.price
    }
    await Menu.create(data)
    res.status(201).json({
        success: true,
        message: "Menu has been created"
    })
})


app.put('/kitchen/menu/:id', async (req, res) => {
    let data = {
        name: req.body.name,
        price: req.body.price
    }

    await Menu.updateOne({_id: req.params.id}, data)
    res.status(200).json({
        success: true,
        message: "Menu has been updated"
    })
})

app.delete('/kitchen/menu/:id', async (req, res) => {
    await Menu.deleteOne({_id: req.params.id})
    res.status(200).json({
        success: true,
        message: "Menu has been deleted"
    })
})

const service = app.listen(port, () => {
    serviceLog(`Listening on port ${service.address().port} ...`)
})
