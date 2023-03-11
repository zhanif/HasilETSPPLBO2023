function serviceLog(msg){
    console.log(`[\x1b[32mService Registry\x1b[0m] ${msg}`);
}

module.exports.serviceLog = serviceLog;