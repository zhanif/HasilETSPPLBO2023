const express = require('express');
const CafeController = require('../controllers/CafeController');

class Router {
    constructor() {
        this.router = express.Router()
        this.initialize()
    }
    
    initialize() {
        const cafeController = new CafeController;
        this.router.get('/cafe', cafeController.getAll)
        this.router.post('/cafe', cafeController.create)
        this.router.get('/cafe/:id', cafeController.getById)
        this.router.put('/cafe/:id', cafeController.update)
        this.router.delete('/cafe/:id', cafeController.delete)
        this.router.post('/cafe/:id/outlet', cafeController.createOutlet)
        this.router.put('/cafe/:id/outlet/:outlet', cafeController.updateOutlet)
        this.router.delete('/cafe/:id/outlet/:outlet', cafeController.deleteOutlet)
    }

    getRouter() {
        return this.router
    }
}

module.exports = Router
