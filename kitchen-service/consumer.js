const { serviceLog } = require("./utils")
const { Kafka } = require('kafkajs')

const clientId = 'order-service'
const brokers = ['localhost:9092']
const topic = 'order-events'

const kafka = new Kafka({clientId: 'kitchen-service', brokers})
const consumer = kafka.consumer({groupId: clientId})

const consume = async () => {
    await consumer.connect()
    await consumer.subscribe({topic})
    await consumer.run({
        eachMessage: ({message}) => {
            serviceLog(`Consumer: ${message.value}`)
        }
    })
}

module.exports = consume