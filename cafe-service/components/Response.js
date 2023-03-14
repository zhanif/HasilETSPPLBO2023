class ResponseJSON {
    constructor() {}

    static success(res, message = null, data = null, code = 200) {
        res.status(code).json({
            success: true,
            message: message || 'Sucess',
            data: data,
        });
    }

    static error(res, message, data) {
        res.status(500).json({
            status: false,
            message: message || 'Bad Request',
            data: data,
        });
    }
}

module.exports = ResponseJSON;