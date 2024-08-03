const Visitors = require('../models/visitors')

module.exports = async (req, res) => {
    try {
        const visitors = await Visitors.find()
        res.json(visitors)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}