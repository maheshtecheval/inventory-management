const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const designSchema = new mongoose.Schema({
  design: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  style: { type: String },
  shed: { type: String },
  price: { type: Number, required: true },
  size: [sizeSchema],
  unit: { type: String }, // Box/Sqft/No
  designNo:{ type: String },
  totalQuantity:{ type: Number, required: true },
  category: {
    type: String,
    enum: ["Tiles", "Bath Tub", "Wash Basin"],
    required: true,
  }, 
  designs: [designSchema],
  notes: { type: String },
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
















// const mongoose = require('mongoose');

// const itemSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     style: { type: String },
//     size: { type: String },
//     design: { type: String },
//     shed: { type: String },
//     quantity: { type: Number, required: true },
//     price: { type: Number, required: true },
//     unit: { type: String }, // Box/Sqft/No
//     category: { type: String, enum: ['Tiles', 'Bath Tub', 'Wash Basin'], required: true }, // New category field
//     notes: { type: String },
// });

// const Item = mongoose.model('Item', itemSchema);
// module.exports = Item;
