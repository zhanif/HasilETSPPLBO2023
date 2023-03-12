const express = require('express')
const app = express()

let port = 8113
port = 0
const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/ets_cafe_service`).then(() => {
    serviceLog(`Successfully connected to database`)
})

const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const Cafe = require('./schemas/Cafe')
const Outlet = require('./schemas/Outlet')
const discoveryHelper = require('./discovery-helper')

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
            lat: req.body.lat,
            long: req.body.long
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

app.delete('/cafe/:id', async (req, res) => {
    await Cafe.deleteOne({_id: req.params.id})
    res.status(200).json({
        success: true,
        message: "Cafe has been deleted"
    })
})

app.post('/cafe/:id/outlet', async (req, res) => {
    let id = 1

    let data = {
        id: id,
        lat: req.body.lat,
        long: req.body.long
    }

    let outlet = await Outlet.findOne({id_cafe: req.params.id})
    if (!outlet) {
        await Outlet.create({
            id_cafe: req.params.id,
            data: data
        })
    }
    else {
        data.id = outlet.data[outlet.data.length - 1].id + 1
        await Outlet.updateOne({id_cafe: req.params.id}, {$push: {data: data}})
    }
    res.status(201).json({
        success: true,
        message: "Cafe outlet has been created"
    })
})

app.put('/cafe/:id/outlet/:outlet', async (req, res) => {
    try {
        await Outlet.updateOne({'data.id': req.params.outlet, id_cafe: req.params.id}, {'$set': {
            'data.$.lat': req.body.lat,
            'data.$.long': req.body.long
        }})
        res.status(200).json({
            success: true,
            message: "Cafe outlet has been updated"
        })
    } catch (error) {
        res.status(400).json({
            success: true,
            message: "Unable to update cafe outlet"
        })
        console.log(error);
    }
})

app.delete('/cafe/:id/outlet/:outlet', async (req, res) => {
    try {
        await Outlet.updateOne({id_cafe: req.params.id}, {'$pull': {data: {id: req.params.outlet}}})
        res.status(200).json({
            success: true,
            message: "Cafe outlet has been deleted"
        })
    } catch (error) {
        res.status(400).json({
            success: true,
            message: "Unable to delete cafe outlet"
        })
        console.log(error);        
    }
})

const service = app.listen(port, () => {
    let xport = service.address().port
    serviceLog(`Listening on port ${xport} ...`, xport)
    discoveryHelper.registerWithEureka('cafe-service', xport)
})
