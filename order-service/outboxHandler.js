const Outbox = require("./schemas/Outbox")

class OutboxHandler {
    constructor() {

    }
    createPayload(payload) {
        const {_id, ...rest } = payload
        payload.id = payload._id
        delete payload['_id']
        return JSON.stringify(payload)
    }
    create(aggregate_id, type, payload) {
        return {
            aggregate_id: aggregate_id,
            aggregate_type: 'Order',
            type: type,
            payload: this.createPayload(payload)
        }
    }
    async createOrder(aggregate_id, payload) {
        let outbox = this.create(aggregate_id, 'OrderCreated', payload)
        const ret = await Outbox.create(outbox)
        return ret
    }
}

module.exports = OutboxHandler