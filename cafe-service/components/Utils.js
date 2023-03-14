

var portData = 0
class Utils {
    static serviceLog(msg, port = null) {
        portData = port == null? portData : port
        console.log(`[\x1b[32mCafe Service${portData != 0 ? ':' + portData : ''}\x1b[0m] ${msg}`)
    }
}

module.exports  = Utils;
