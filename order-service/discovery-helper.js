const { serviceLog } = require('./utils')

const Eureka = require('eureka-js-client').Eureka
const eurekaHost = 'localhost'
const eurekaPort = 8761
const hostName = 'localhost'
const ipAddress = '127.0.0.1'

var client = null

exports.registerWithEureka = function (appName, port) {
    client = new Eureka({
        instance: {
            app: appName,
            hostName: hostName,
            ipAddr: ipAddress,
            port: {
                '@enabled': 'true',
                $: port
            },
            vipAddress: appName,
            dataCenterInfo: {
                '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                name: 'MyOwn',
            },
        },
        //retry 10 time for 3 minute 20 seconds.
        eureka: {
            host: eurekaHost,
            port: eurekaPort,
            servicePath: '/eureka/apps/',
            maxRetries: 10,
            requestRetryDelay: 2000,
        },
    })
    client.start( error => {
        serviceLog(error || "Registered to Discovery Server")
    })

    function exitHandler(options, exitCode) {
        if (options.cleanup) {
        }
        if (exitCode || exitCode === 0) serviceLog(exitCode)
        if (options.exit) {
            client.stop()
        }
    }

    client.on('deregistered', () => {
        process.exit()
        serviceLog('after deregistered')
    })

    client.on('started', () => {
        serviceLog("Eureka host: " + eurekaHost)
    })

    process.on('SIGINT', exitHandler.bind(null, {exit:true}))
}

exports.getInstance = function (name) {
    const service = client.getInstancesByAppId(name)
    let url = null
    if (service) url = `http://${service[0].hostName}:${service[0].port.$}`

    return url
}