function serviceLog(msg){
    console.log(`[\x1b[32mCustomer Service\x1b[0m] ${msg}`);
}

module.exports.serviceLog = serviceLog;