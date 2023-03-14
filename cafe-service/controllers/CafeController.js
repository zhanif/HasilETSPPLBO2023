const ResponseJSON = require('../components/Response')
const Cafe = require('../schemas/Cafe')
const Outlet = require('../schemas/Outlet')

class CafeController {
    constructor() {}
    
    async getAll(req, res) {
        let data = await Cafe.find({})
        ResponseJSON.success(res, null, data)
    }
    async getById(req, res) {
        let cafe = await Cafe.findOne({_id: req.params.id})
        let outlet = await Outlet.findOne({id_cafe: req.params.id})
    
        let dataOutlet = []
        if (outlet) dataOutlet = outlet.data.map(i => {
            return {
                id: i.id,
                lat: i.lat,
                long: i.long
            }
        })
        ResponseJSON.success(res, null, {
            _id: cafe._id,
            name: cafe.name,
            timeStart: cafe.timeStart,
            timeEnd: cafe.timeEnd,
            outlet: dataOutlet
        })
    }
    async create(req, res) {
        const data = {
            name: req.body.name,
            timeStart: req.body.timeStart,
            timeEnd: req.body.timeEnd
        }
        const cafe = await Cafe.create(data)
        if (!cafe) return res.status(400).json({ success: false, message: "Unable to create a cafe"})
        const dataOutlet = {
            id_cafe: cafe._id,
            data: {
                id: 1,
                lat: req.body.lat,
                long: req.body.long
            }
        }
        await Outlet.create(dataOutlet)
        ResponseJSON.success(res, "Cafe has been created")
    }
    async update(req, res) {
        const data = {
            name: req.body.name,
            timeStart: req.body.timeStart,
            timeEnd: req.body.timeEnd
        }
        await Cafe.findOneAndUpdate({_id: req.params.id}, data)
        ResponseJSON.success(res, "Cafe has been updated")
    }
    async delete(req, res) {
        await Cafe.deleteOne({_id: req.params.id})
        ResponseJSON.success(res, "Cafe has been deleted")
    }

    async createOutlet(req, res) {
        let id = 1

        let data = {
            id: id,
            lat: req.body.lat,
            long: req.body.long
        }

        let outlet = await Outlet.findOne({id_cafe: req.params.id})
        if (!outlet) {
            await Outlet.create({
                id_cafe: req.params.id,
                data: data
            })
        }
        else {
            data.id = outlet.data[outlet.data.length - 1].id + 1
            await Outlet.updateOne({id_cafe: req.params.id}, {$push: {data: data}})
        }
        ResponseJSON.success(res, "Cafe outlet has been created")
    }
    async updateOutlet(req, res) {
        try {
            await Outlet.updateOne({'data.id': req.params.outlet, id_cafe: req.params.id}, {'$set': {
                'data.$.lat': req.body.lat,
                'data.$.long': req.body.long
            }})
            ResponseJSON.success(res, "Cafe outlet has been updated")
        } catch (error) {
            ResponseJSON.error(res, "Unable to update cafe outlet")
            console.log(error);
        }
    }
    async deleteOutlet(req, res) {
        try {
            await Outlet.updateOne({id_cafe: req.params.id}, {'$pull': {data: {id: req.params.outlet}}})
            ResponseJSON.success(res, "Cafe outlet has been deleted")
        } catch (error) {
            ResponseJSON.error(res, "Unable to delete cafe outlet")
            console.log(error);        
        }
    }
}

module.exports = CafeController;