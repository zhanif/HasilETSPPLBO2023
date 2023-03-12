const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const db = require('./database')

const app = express()
const port = 8116

app.use(bodyParser.json())

app.post('/payment', async (req, res) => {
    try {
        let data = {
            id_cafe: req.body.id_cafe,
            id_customer: req.body.id_customer,
            order_number: req.body.order_number,
            total_price: req.body.total_price
        }
            
        let result = await new Promise((resolve, reject) => {
            db.query(`INSERT INTO payment(\`id_cafe\`, \`id_customer\`, \`order_number\`, \`total_price\`) VALUES (?, ?, ?, ?)`, [data.id_cafe, data.id_customer, data.order_number, data.total_price], (err, res) => {
                if (err) reject(err)
                resolve(true)
            })
        })
        if (result) {
            return res.status(201).json({
                success: true,
                message: "Payment has been created"
            })
        }   
    } catch (error) {
        console.log(error)
    }

    res.status(400).json({
        success: true,
        message: "Unable to create payment"
    })
})

app.post('/payment/:order_number/pay', async (req, res) => {
    let result = await new Promise((resolve, reject) => {
        db.query(`UPDATE payment SET status=? WHERE order_number=?`, ['paid', req.params.order_number], (err, res) => {
            if (err) reject(err)
            resolve(true)
        })
    })
    if (!result) {
        return res.status(400).json({
            success: true,
            message: "Unable to pay payment"
        })
    }
    res.status(200).json({
        success: true,
        message: "Payment has been paid"
    })   
})

const service = app.listen(port, () => {
    let xport = service.address().port
    serviceLog(`Listening on port ${xport} ...`, xport)
})
