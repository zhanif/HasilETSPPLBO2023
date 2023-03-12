const express = require('express')
const { serviceLog } = require('./utils')
const mongoose = require('mongoose')
const axios = require('axios')
const Transaction = require('./schemas/Transaction')

const discoveryHelper = require('./discovery-helper')
const app = express()
let port = 8117
port = 0
mongoose.connect(`mongodb://localhost:27017/ets_transaction_service`).then(() => {
    serviceLog(`Successfully connected to database`)
})

app.use(express.json())

app.post('/transaction', async (req, res) => {
    try {
        let data = {
            id_cafe: req.body.id_cafe,
            order_number: req.body.order_number,
            total_price: req.body.total_price
        }
        await Transaction.create(data)
        return res.status(200).json({
            success: true,
            message: 'Transaction report has been saved'
        })
    } catch (error) {
        console.error(error)
    }

    res.status(400).json({
        success: false,
        message: 'Unable to save transaction report'
    })
})



const service = app.listen(port, () => {
    let xport = service.address().port
    serviceLog(`Listening on port ${xport} ...`, xport)
    discoveryHelper.registerWithEureka('transaction-service', xport)
})
