const mongoose = require('mongoose')

const MenuSchema = new mongoose.Schema({
    name: String,
    price: Number,
}, {versionKey: false})

module.exports = mongoose.models.Menu || mongoose.model('Menu', MenuSchema)