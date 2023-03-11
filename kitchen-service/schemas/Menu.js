const mongoose = require('mongoose')

const MenuSchema = new mongoose.Schema({
    id_cafe: mongoose.Types.ObjectId,
    id_outlet: Number,
    name: String,
    price: Number,
}, {versionKey: false})

module.exports = mongoose.models.Menu || mongoose.model('Menu', MenuSchema)