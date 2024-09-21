const mongoose = require("mongoose");

const PurchaseItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Item",
    },
    size: {
      size: { type: String, required: true },
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    },
    design: {
      design: { type: String, required: true },
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    },
    quantity: { type: Number, required: true },
    price: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseItem", PurchaseItemSchema);
