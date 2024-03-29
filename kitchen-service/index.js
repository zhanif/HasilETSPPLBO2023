const express = require('express')
const bodyParser = require('body-parser')
const { serviceLog } = require('./utils')
const db = require('./database')
const axios = require('axios')
const discoveryHelper = require('./discovery-helper')
const mysql = require('mysql')
const consume = require('./consumer')

const app = express()
let port = 8111
port = 0
app.use(bodyParser.json())

// app.get('/kitchen', async (req, res) => {
//     let data = await Menu.find({})
//     res.status(200).json(data)
// })
consume().catch((err) => {
	console.error("error in consumer: ", err)
})

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

app.post('/kitchen/ticket/:order_number/accept', async (req, res) => {
    try {
         
        let result = await new Promise((resolve, reject) => {
            db.query(`UPDATE ticket SET status=? WHERE order_number=?`, ['accept', req.params.order_number], (err, res) => {
                if (err) reject(err)
                if (res.affectedRows > 0) resolve(true)
                else resolve(false)
            })
        })
        if (result) {
            let url = discoveryHelper.getInstance('order-service')
            let orderDetail = await axios.get(`${url}/order/${req.params.order_number}`)
            if (!orderDetail.data.data) throw new Error(`Invalid order data`)
            
            let total_price = 0;
            let bulkQuantity = []
            orderDetail.data.data.items.forEach(i => {
                total_price += i.price
                bulkQuantity.push({
                    id: i.id_menu,
                    quantity: i.quantity
                })
            })

            // remove stocks
            let query = ``
            bulkQuantity.forEach(item => {
                query += mysql.format(`UPDATE menu SET quantity=GREATEST(0,quantity-?) WHERE id=?;`, [item.quantity, item.id])
            })

            console.log(query);

            let result2 = await new Promise((resolve, reject) => {
                db.query(query, [], (err, res) => {
                    if (err) reject(err)
                    if (res.affectedRows > 0) resolve(true)
                    else resolve(false)
                })
            })
            if (!result2) throw new Error(`unable to remove stocks`)

            // make payment available
        
            let data = {
                id_cafe: orderDetail.data.data.id_cafe,
                id_customer: orderDetail.data.data.id_customer,
                order_number: orderDetail.data.data.order_number,
                total_price: total_price
            }
    
            url = discoveryHelper.getInstance('payment-service')
            await axios.post(`${url}/payment`, data)
            return res.status(200).json({
                success: true,
                message: "Ticket has been accepted"
            })
        }    
    } catch (error) {
        console.log(error)
    }
    res.status(400).json({
        success: true,
        message: "Unable to accept ticket"
    })
})

app.post('/kitchen/ticket/:order_number/accept', async (req, res) => {
    try {
         
        let result = await new Promise((resolve, reject) => {
            db.query(`UPDATE ticket SET status=? WHERE order_number=?`, ['reject', req.params.order_number], (err, res) => {
                if (err) reject(err)
                resolve(true)
            })
        })
        if (!result) {
            return res.status(400).json({
                success: true,
                message: "Unable to reject ticket"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Ticket has been rejected"
        })
    } catch (error) {
        console.log(error)
    }
    res.status(400).json({
        success: true,
        message: "Unable to accept ticket"
    })
})

const service = app.listen(port, () => {
    let xport = service.address().port
    serviceLog(`Listening on port ${xport} ...`, xport)
    discoveryHelper.registerWithEureka('kitchen-service', xport)
})

