const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobile: { type: String },
    email: { type: String },
    address: { type: String },
    // items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    items: [
      {
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        size: { type: String },
        design: { type: String },
        item_total_price: { type: Number },
      },
    ],
    orderStatus: {
      type: String,
      default: "Delivered",
      enum: ["Pending", "Confirmed", "Shipped", "Delivered"],
    },
    totalAmount: { type: Number },
    internalNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
