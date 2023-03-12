function serviceLog(msg){
    console.log(`[\x1b[31mKitchen Service\x1b[0m] ${msg}`);
}

module.exports.serviceLog = serviceLog;