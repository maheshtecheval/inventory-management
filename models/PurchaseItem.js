// models/PurchaseItem.js
const mongoose = require('mongoose');
const PurchaseItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  sizeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  designId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true },
  price: Number,
  unit: String,
  category: String,
  notes: String,
}, { timestamps: true });
module.exports = mongoose.model('PurchaseItem', PurchaseItemSchema);
