const express = require('express')
const app = express()

const port = 8113
const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/ets_cafe_service`).then(() => {
    serviceLog(`Successfully connected to database`)
})

const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const Cafe = require('./schemas/Cafe')
const Outlet = require('./schemas/Outlet')

app.use(bodyParser.json())

app.get('/cafe', async (req, res) => {
    let data = await Cafe.find({})
    res.status(200).json(data)
})

app.post('/cafe', async (req, res) => {
    const data = {
        name: req.body.name,
        timeStart: req.body.timeStart,
        timeEnd: req.body.timeEnd
    }
    const cafe = await Cafe.create(data)
    if (!cafe) return res.status(400).json({ success: false, message: "Unable to create a cafe"})
    const dataOutlet = {
        id_cafe: cafe._id,
        data: {
            id: 1,
            lat: req.body.outlet.lat,
            long: req.body.outlet.long
        }
    }
    await Outlet.create(dataOutlet)
    res.status(201).json({
        success: true,
        message: "Cafe has been created"
    })
})

app.get('/cafe/:id', async (req, res) => {
    let cafe = await Cafe.findOne({_id: req.params.id})
    let outlet = await Outlet.findOne({id_cafe: req.params.id})

    let dataOutlet = []
    if (outlet) dataOutlet = outlet.data.map(i => {
        return {
            id: i.id,
            lat: i.lat,
            long: i.long
        }
    })
    res.status(200).json({
        _id: cafe._id,
        name: cafe.name,
        timeStart: cafe.timeStart,
        timeEnd: cafe.timeEnd,
        outlet: dataOutlet
    })
})

app.put('/cafe/:id', async (req, res) => {
    const data = {
        name: req.body.name,
        timeStart: req.body.timeStart,
        timeEnd: req.body.timeEnd
    }
    await Cafe.findOneAndUpdate({_id: req.params.id}, data)
    res.status(200).json({
        success: true,
        message: "Cafe has been updated"
    })
})

app.delete('/cafe/:id', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Menu has been deleted"
    })
})

app.post('/cafe/:id/outlet', async (req, res) => {
    let id = 0

    let cafe = await Outlet.findOne({id_cafe: req.params.id})
    id = cafe.data[cafe.data.length - 1].id + 1
    serviceLog(id)

    let data = {
        id: id,
        lat: req.body.lat,
        long: req.body.long
    }
    await Outlet.updateOne({id_cafe: req.params.id}, {$push: {data: data}})
    res.status(201).json({
        success: true,
        message: "Cafe has been created"
    })
})

const service = app.listen(port, () => {
    serviceLog(`Listening on port ${service.address().port} ...`)
})
