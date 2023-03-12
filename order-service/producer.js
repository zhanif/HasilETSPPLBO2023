const { serviceLog } = require("./utils")
const { Kafka } = require('kafkajs')

const clientId = 'order-service'
const brokers = ['localhost:9092']
const topic = 'order-events'

const kafka = new Kafka({clientId, brokers})
const producer = kafka.producer()

const produce = async () => {
    await producer.connect()
    let i = 0

    setInterval(async () => {
        try {
            await producer.send({
                topic,
                messages: [
                    {
                        key: String(i),
                        value: 'This is message: ' + i
                    }
                ]
            })
            i++
            console.log("HERE");
        } catch (error) {
            console.error(`Producer unable to post`)
        }    
    }, 5000)

}

module.exports = produce