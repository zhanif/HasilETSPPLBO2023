const express = require('express')
const axios = require('axios')
const app = express()

const port = 8112
const db = require('./database')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')

const registeryUrl = `http://localhost:3000`

async function registerService(name, address) {
    try {
        await axios.post(`${registeryUrl}/register`, {name, address})
        serviceLog(`Successfully registered with the registry`)
    } catch (error) {
        serviceLog(`Unable to register the service`)
    }
}

async function unregisterService(name) {
    try {
        await axios.post(`${registeryUrl}/unregister`, {name})
        serviceLog(`Successfully unregistered from the registry`)
    } catch (error) {
        serviceLog(`Unable to unregister the service`)
    }
}

async function lookupService(name) {
    try {
        const response = await axios.get(`${registeryUrl}/lookup/${name}`)
        return response.data.data.address
    } catch (error) {
        serviceLog(`Unable to lookup the service`)
    }
}

app.use(bodyParser.json())

app.get('/', async (req, res) => {
    getCustomers = async () => {
        return new Promise(function(resolve, reject) {
            db.query(`SELECT id, name, address FROM customers`, (err, res) => {
                if (err) throw reject(err)
                let data = []
                res.forEach(element => {
                    data.push({
                        id: element.id,
                        name: element.name,
                        address: element.address
                    })
                });
                resolve(data)
            })
        })
    }
    let data = await getCustomers()
    res.status(200).json(data)
})

app.post('/', (req, res) => {
    const data = {
        name: req.body.name,
        address: req.body.address
    }
    db.query(`INSERT INTO customers VALUES (?, ?, ?)`, [null, data.name, data.address], (err, res) => {
        if (err) throw new Error(err)
        serviceLog("Customer has been created")
    })
    res.status(201).json({
        success: true,
        message: "Customer has been created"
    })
})


app.patch('/:id', (req, res) => {
    const data = {
        name: req.body.name,
        address: req.body.address
    }

    db.query(`UPDATE customers SET name=?, address=? WHERE id=?`, [data.name, data.address, req.params.id], (err, req) => {
        if (err) throw new Error(err)
        serviceLog("Customer has been updated")
    })
    res.status(200).json({
        success: true,
        message: "Customer has been updated"
    })
})

app.delete('/:id', (req, res) => {
    db.query(`DELETE FROM customers WHERE id=?`, [req.params.id], (err, res) => {
        if (err) throw new Error(err)
        serviceLog("Customer has been deleted")
    })
    res.status(200).json({
        success: true,
        message: "Customer has been deleted"
    })
})

app.listen(port, () => {
    serviceLog(`Listening on port ${port}...`)
    registerService('customer-service', `http://localhost:${port}`)
})
