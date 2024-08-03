const Visitor = require('../models/visitors');
const axios = require('axios');

module.exports = async (req, res, next) => {
    const ip = 'geldix.in';
    const response = await axios(`http://ip-api.com/json/${ip}`);
    const { lat, lon, country, city } = response.data;
    const existingVisitor = await Visitor.findOne({ ip });
    if(!existingVisitor){
        const visitor = await new Visitor({ip, location: {lat, lng:lon, country, city}}).save();
    }else{
        existingVisitor.location = {lat, lon, country, city};
        existingVisitor.visits++;
        await existingVisitor.save();
    }
}