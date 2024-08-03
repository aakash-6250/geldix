const { Long } = require('mongodb');
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    },
    visits: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;