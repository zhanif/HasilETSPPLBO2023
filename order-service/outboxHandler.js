const Outbox = require("./schemas/Outbox")

class OutboxHandler {
    constructor() {

    }
    create(aggregate_id, type, payload) {
        return {
            aggregate_id: aggregate_id,
            aggregate_type: 'Order',
            type: type,
            payload: payload
        }
    }
    async createOrder(aggregate_id, payload) {
        let outbox = this.create(aggregate_id, 'OrderCreated', payload)
        const ret = await Outbox.create(outbox)
        return ret
    }
}

module.exports = OutboxHandler