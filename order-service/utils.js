function serviceLog(msg){
    console.log(`[\x1b[34mOrder Service\x1b[0m] ${msg}`);
}

module.exports.serviceLog = serviceLog;