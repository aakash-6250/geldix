const Visitor = require('../models/visitors');
const axios = require('axios');

module.exports = async (req, res, next) => {
    try {
        let ip= req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip= ip.split(':').pop();
        console.log(ip);
        const response = await axios(`http://ip-api.com/json/${ip}`);
        console.log(response.data)
        if (response.data.status === 'success') {
            const { lat, lon, country, city } = response.data;
            const existingVisitor = await Visitor.findOne({ ip });
            if (!existingVisitor) {
                const visitor = await new Visitor({ ip, location: { lat, lng: lon, country, city } }).save();
            } else {
                existingVisitor.location = { lat, lon, country, city };
                existingVisitor.visits++;
                await existingVisitor.save();
            }
        }
    } catch (error) {
        console.log(error);
    }
}