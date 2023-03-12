const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const db = require('./database')

const app = express()
const port = 8111


app.use(bodyParser.json())

// app.get('/kitchen', async (req, res) => {
//     let data = await Menu.find({})
//     res.status(200).json(data)
// })

app.post('/kitchen/menu', async (req, res) => {
    const data = {
        id_cafe: req.body.id_cafe,
        id_outlet: req.body.id_outlet,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity
    }
    let result = await new Promise((resolve, reject) => {
        db.query(`INSERT INTO menu(\`id_cafe\`, \`id_outlet\`, \`name\`, \`price\`, \`quantity\`) VALUES (?, ?, ?, ?, ?)`, [data.id_cafe, data.id_outlet, data.name, data.price, data.quantity], (err, res) => {
            if (err) reject(err)
            resolve(true)
        })
    })
    if (result) {
        return res.status(201).json({
            success: true,
            message: "Menu has been created"
        })
    }
    res.status(400).json({
        success: true,
        message: "Unable to create menu"
    })
})


app.put('/kitchen/menu/:id', async (req, res) => {
    let data = {
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity
    }
    let result = await new Promise((resolve, reject) => {
        db.query(`UPDATE menu SET name=?, price=?, quantity=? WHERE id=?`, [data.name, data.price, data.quantity, req.params.id], (err, res) => {
            if (err) reject(err)
            resolve(true)
        })
    })
    if (!result) {
        return res.status(400).json({
            success: true,
            message: "Unable to update menu"
        })
    }
    res.status(200).json({
        success: true,
        message: "Menu has been updated"
    })
})

app.delete('/kitchen/menu/:id', async (req, res) => {
    let result = await new Promise((resolve, reject) => {
        db.query(`DELETE FROM menu WHERE id: ?`, [req.params.id], (err, res) => {
            if (err) reject(err)
            resolve(true)
        })
    })
    if (!result) {
        return res.status(400).json({
            success: true,
            message: "Unable to delete menu"
        })
    }
    res.status(200).json({
        success: true,
        message: "Menu has been deleted"
    })
})

app.post('/kitchen/ticket', async (req, res) => {
    let data = {
        id_cafe: req.body.id_cafe,
        id_outlet: req.body.id_outlet,
        order_number: req.body.order_number
    }

    let result = await new Promise((resolve, reject) => {
        db.query(`INSERT INTO ticket(\`id_cafe\`, \`id_outlet\`, \`order_number\`) VALUES (?, ?, ?)`, [data.id_cafe, data.id_outlet, data.order_number], (err, res) => {
            if (err) reject(err)
            resolve(true)
        })
    })
    if (result) {
        return res.status(201).json({
            success: true,
            message: "Ticket has been created"
        })
    }
    res.status(400).json({
        success: true,
        message: "Unable to create ticket"
    })
})

app.post('/kitchen/ticket/:order_number', async (req, res) => {
    let data = {
        status: req.body.status,
    }
    let result = await new Promise((resolve, reject) => {
        db.query(`UPDATE ticket SET status=? WHERE order_number=?`, [data.status, req.params.order_number], (err, res) => {
            if (err) reject(err)
            resolve(true)
        })
    })
    if (!result) {
        return res.status(400).json({
            success: true,
            message: "Unable to update ticket"
        })
    }
    res.status(200).json({
        success: true,
        message: "Ticket has been updated"
    })   
})

const service = app.listen(port, () => {
    serviceLog(`Listening on port ${service.address().port} ...`)
})
