const mongoose = require('mongoose')

const OutletSchema = new mongoose.Schema({
    id_cafe: mongoose.Types.ObjectId,
    data: [
        {
            id: Number,
            lat: String,
            long: String
        }
    ]
}, {versionKey: false})

module.exports = mongoose.models.Outlet || mongoose.model('Outlet', OutletSchema)