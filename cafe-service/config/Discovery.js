const Eureka = require('eureka-js-client').Eureka

class Discovery {
    constructor(appName, port, eurekaHost = 'localhost', eurekaPort = 8761, hostName = 'localhost', ipAddress = '127.0.0.1') {
        this.client = this.client = new Eureka({
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
        this.client.start( error => {
            serviceLog(error || "Registered to Discovery Server")
        })
        this.client.on('deregistered', () => {
            process.exit()
            serviceLog('after deregistered')
        })
    
        this.client.on('started', () => {
            serviceLog("Eureka host: " + eurekaHost)
        })
        process.on('SIGINT', this.exitHandler.bind(null, {exit:true}))
    }
    exitHandler(options, exitCode) {
        if (options.cleanup) {
        }
        if (exitCode || exitCode === 0) serviceLog(exitCode)
        if (options.exit) {
            this.client.stop()
        }
    }
    getInstance(name) {
        const service = this.client.getInstancesByAppId(name)
        let url = null
        if (service) url = `http://${service[0].hostName}:${service[0].port.$}`
    
        return url
    }
}

module.exports = Discovery
