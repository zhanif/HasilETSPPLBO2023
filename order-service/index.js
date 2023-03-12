const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const mongoose = require('mongoose')
const axios = require('axios')
const Order = require('./schemas/Order')

const app = express()
const port = 8114

mongoose.connect(`mongodb://localhost:27017/ets_order_service`).then(() => {
    serviceLog(`Successfully connected to database`)
})

const conn = mongoose.connection;
conn.on('error', () => console.error.bind(console, 'connection error'));
conn.once('open', () => console.info('Connection to Database is successful'));

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
        const session = await conn.startSession();
        try {
            session.startTransaction()
            await Order.create([data], {session})
            let datax = {
                id_cafe: req.body.id_cafe,
                id_outlet: req.body.id_outlet,
                order_number: randomString
            }
            let resp = await axios.post(`http://localhost:8111/kitchen/ticket`, datax)
            if (resp.status == 200) throw new Error(`Unable to create ticket`)
            await session.commitTransaction()
        }
        catch(e) {
            console.log(e);
            await session.abortSession()
        }
        
        res.status(201).json({
            success: true,
            message: 'Order has been created'
        })
    } catch (error) {
        res.status(400).json({
            success: true,
            message: 'Unable to create order'
        })
    }
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
})
