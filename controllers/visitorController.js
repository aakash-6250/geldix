const Visitors = require('../models/visitors')

module.exports = async (req, res) => {
    try {
        const visitors = await Visitors.aggregate([{
            $sort: { updatedAt: -1 }
        }])
        res.json(visitors)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}