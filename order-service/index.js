const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const axios = require('axios')
const mongoose = require('mongoose')
const Outbox = require('./outboxHandler')
const Order = require('./schemas/Order')
const discoveryHelper = require('./discovery-helper')
const produce = require('./producer')

const app = express()
const port = 8114

const outbox = new Outbox

produce().catch(err => { console.error(err) })

mongoose.connect(`mongodb://localhost:27017/ets_order_service`).then(() => {
    serviceLog(`Successfully connected to database`)
})

app.use(bodyParser.json())

app.post('/order', async (req, res) => {
    try {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
        let randomString = '';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 6; j++) {
                randomString += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            
            let status = await Order.countDocuments({order_number: randomString})
            if (status == 0) break
        }
    
        if (randomString == '') throw new Error(`Bad random string generated...`)
    
        let data = {
            id_customer: req.body.id_customer,
            id_cafe: req.body.id_cafe,
            id_outlet: req.body.id_outlet,
            order_number: randomString,
            items: req.body.items
        }
        let order = await Order.create(data)
        let payload = await Order.findById(order._id)
        let outboxRetVal = await outbox.createOrder(order._id, payload)
        if (order) {
            return res.status(201).json({
                success: true,
                message: 'Order has been created'
            })
        }
    } catch (error) {
        console.log(error);
    }
    res.status(400).json({
        success: false,
        message: 'Unable to create order'
    })
})

app.get('/order/:number', async (req,res) => {
    let data = await Order.findOne({order_number: req.params.number})
    return res.status(200).json({
        success: true,
        data: data
    })
})

app.post('/order/:number/items', async (req, res) => {
    try {
        let data = req.body.items
        await Order.updateOne({order_number: req.params.number}, {$push: {items: data}})
        res.status(200).json({
            success: true,
            message: 'Order items have been updated'
        })
    } catch (error) {
        res.status(400).json({
            success: true,
            message: 'Unable to update order items'
        })        
    }
})

app.put('/order/:number/items', async (req, res) => {
    try {
        let data = req.body.items
        await Order.updateOne({order_number: req.params.number}, {items: data})
        res.status(200).json({
            success: true,
            message: 'Order items have been updated'
        })
    } catch (error) {
        res.status(400).json({
            success: true,
            message: 'Unable to update order items'
        })        
    }
})

const service = app.listen(port, () => {
    let xport = service.address().port
    serviceLog(`Listening on port ${xport} ...`, xport)
    discoveryHelper.registerWithEureka('order-service', xport)
})

