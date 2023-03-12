const { serviceLog } = require("./utils")
const { Kafka } = require('kafkajs')
const Outbox = require("./schemas/Outbox")

const clientId = 'order-service'
const brokers = ['localhost:9092']
const topic = 'order-events'

const kafka = new Kafka({clientId, brokers, retry: {retries: 0}})
const producer = kafka.producer()

const produce = async () => {
    await producer.connect()

    setInterval(async () => {
        try {
            let datax = await Outbox.find().sort({createdAt: 1})
            let deletableId = []
            let content = ''
            if (datax.length > 0) {
                let temp = []
                datax.forEach(d => {
                    temp.push({
                        key: d._id.toString(),
                        value: JSON.stringify({
                            id: d._id,
                            aggregate_id: d.aggregate_id,
                            aggregate_type: d.aggregate_type,
                            type: d.type,
                            payload: d.payload
                        })
                    })
                    deletableId.push(d._id)
                })
                content = {
                    topic,
                    messages: temp
                }
                await producer.send(content)
                await Outbox.deleteMany({_id: {$in: deletableId}})

            }
            let time = new Date().toLocaleTimeString();
            serviceLog(`[${time}] Producer -- ${datax.length > 0 ? `(${datax.length} events). Sent: ${JSON.stringify(content)}` : 'Outbox is empty'}`)
        } catch (error) {
            console.error(`Producer -- Unable to post: ${error}`)
        }    
    }, 5000)

}

module.exports = produce