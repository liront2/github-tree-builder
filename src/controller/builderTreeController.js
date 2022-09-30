const HttpStatus = require('http-status-codes');

const builderModel = require('../model/builderModel');

module.exports = async(req, res, next) => {
    try {
        const response = await builderModel(req);
        res.status(HttpStatus.OK);
        res.json(response);
    } catch (error) {
        return next(error)
    }
}
