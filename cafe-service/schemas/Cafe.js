const mongoose = require('mongoose')

const CafeSchema = new mongoose.Schema({
    name: String,
    isAvailable: Boolean,
    timeStart: Number,
    timeEnd: Number,
}, {versionKey: false})

module.exports = mongoose.models.Cafe || mongoose.model('Cafe', CafeSchema)