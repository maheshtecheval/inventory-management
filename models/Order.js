const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    mobile: { type: String },
    email: { type: String },
    address: { type: String },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    orderStatus: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered'] },
    totalAmount: { type: Number },
    internalNotes: { type: String }
}, {
    timestamps: true 
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
