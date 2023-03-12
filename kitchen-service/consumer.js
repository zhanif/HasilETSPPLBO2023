const { serviceLog } = require("./utils")
const { Kafka } = require('kafkajs')

const clientId = 'kitchen-service'
const groupId = 'order-service'
const brokers = ['localhost:9092']
const topic = 'order-events'
const db = require('./database')

const kafka = new Kafka({clientId: clientId, brokers})
const consumer = kafka.consumer({groupId: groupId})

const consume = async () => {
    await consumer.connect()
    await consumer.subscribe({topic})
    await consumer.run({
        eachMessage: async ({message}) => {
            try {
                serviceLog(`Consumer -- Received: ${message.value}`)
                const receivedData = JSON.parse(message.value)
                if (receivedData.type == 'OrderCreated') {
                    let data = JSON.parse(receivedData.payload)
                    let result = await new Promise((resolve, reject) => {
                        db.query(`INSERT INTO ticket(\`id_cafe\`, \`id_outlet\`, \`order_number\`) VALUES (?, ?, ?)`, [data.id_cafe, data.id_outlet, data.order_number], (err, res) => {
                            if (err) reject(err)
                            resolve(true)
                        })
                    })
                    if (!result) throw new Error('unable to update ticket')
                    else serviceLog(`Consumer -- inserted data into ticket table`)
                }
            } catch (error) {
                console.error(error)
            }
        }
    })
}

module.exports = consume