const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    style: { type: String },
    size: { type: String },
    design: { type: String },
    shed: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    unit: { type: String }, // Box/Sqft/No
    category: { type: String, enum: ['Tiles', 'Bath Tub', 'Wash Basin'], required: true }, // New category field
    notes: { type: String },
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
