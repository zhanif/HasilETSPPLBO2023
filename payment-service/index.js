const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const db = require('./database')
const axios = require('axios')
const discoveryHelper = require('./discovery-helper')

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

app.get('/payment/:order_number', async (req, res) => {
    try {
        let result = await new Promise((resolve, reject) => {
            db.query(`SELECT id_cafe, id_customer, order_number, status, total_price FROM payment WHERE order_number=?`, [req.params.order_number], (err, res) => {
                if (err) reject(err)
                let retVal = null
                if (res) {
                    res.forEach(element => {
                        retVal = {
                            id_cafe: element.id_cafe,
                            id_outlet: element.id_outlet,
                            id_customer: element.id_customer,
                            order_number: element.order_number,
                            status: element.status,
                            total_price: element.total_price
                        }
                    });
                }
                resolve(retVal)
            })
        })
        if (result)
        {
            return res.status(200).json({
                success: true,
                data: result
            })
        }
    } catch (error) {
        console.log(error)
    }
    res.status(400).json({
        success: true,
        message: "Unable to get payment"
    })
})

app.post('/payment/:order_number/pay', async (req, res) => {
    try {
        let result = await new Promise((resolve, reject) => {
            db.query(`UPDATE payment SET status=? WHERE order_number=?`, ['paid', req.params.order_number], (err, res) => {
                if (err) reject(err)
                if (res.affectedRows > 0) resolve(true)
                else resolve(false)
            })
        })
        if (result) {
            let select = await new Promise((resolve, reject) => {
                db.query(`SELECT id_cafe, id_customer, order_number, status, total_price FROM payment WHERE order_number=?`, [req.params.order_number], (err, res) => {
                    if (err) reject(err)
                    let retVal = null
                    if (res) {
                        res.forEach(element => {
                            retVal = {
                                id_cafe: element.id_cafe,
                                id_outlet: element.id_outlet,
                                id_customer: element.id_customer,
                                order_number: element.order_number,
                                status: element.status,
                                total_price: element.total_price
                            }
                        });
                    }
                    resolve(retVal)
                })
            })
            if (select) {
                let dataLog = {
                    id_cafe: select.id_cafe,
                    order_number: select.order_number,
                    total_price: select.total_price,
                }
                await axios.post(`http://localhost:8117/transaction`, dataLog)
            }

            return res.status(200).json({
                success: true,
                message: "Payment has been paid"
            })   
        }
    } catch (error) {
        console.log(error)
    }
    res.status(400).json({
        success: true,
        message: "Unable to pay payment"
    })
})

const service = app.listen(port, () => {
    let xport = service.address().port
    serviceLog(`Listening on port ${xport} ...`, xport)
    discoveryHelper.registerWithEureka('payment-service', xport)
})
