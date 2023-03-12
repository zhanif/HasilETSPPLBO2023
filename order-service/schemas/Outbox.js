const mongoose = require('mongoose')

const OutboxSchema = new mongoose.Schema({
    aggregate_id: mongoose.Types.ObjectId,
    aggregate_type: String,
    type: String,
    payload: String
}, {versionKey: false, timestamps: true})

module.exports = mongoose.models.Outbox || mongoose.model('Outbox', OutboxSchema)