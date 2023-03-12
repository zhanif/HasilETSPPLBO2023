const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    id_cafe: mongoose.Types.ObjectId,
    order_number: String,
    total_price: Number,
}, {versionKey: false, timestamps: true})

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)