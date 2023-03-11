const mongoose = require('mongoose')

const items = mongoose.Schema({
    id_menu: Number,
    name: String,
    quantity: Number,
    price: Number
}, {
    _id: false
})

const OrderSchema = new mongoose.Schema({
    id_customer: Number,
    id_cafe: mongoose.Types.ObjectId,
    id_outlet: Number,
    order_number: String,
    items: [items]
}, {versionKey: false})

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema)