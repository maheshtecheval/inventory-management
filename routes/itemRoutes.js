const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Order = require("../models/Order");

router.get("/dashboard-stats", async (req, res) => {
  try {
    // 1. Total number of items
    const totalItems = await Item.countDocuments();
    // 2. Total quantity of items

    const totalQuantity = await Item.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
      { $project: { _id: 0, totalQuantity: 1 } },
    ]);
    
    // 3. Category-wise quantity of items
    const categoryWiseQuantity = await Item.aggregate([
      { $group: { _id: "$category", totalQuantity: { $sum: "$quantity" } } },
      { $project: { category: "$_id", totalQuantity: 1, _id: 0 } },
    ]);

    // 4. Highest sell item (based on quantity sold)
    const highestSellItem = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 1 },
    ]);

    // 5. Highest order amount
    const highestOrderAmount = await Order.findOne()
      .sort({ totalAmount: -1 })
      .limit(1);
    // 6. Total Order Amount (Sum of all order totals)
    const totalOrderAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    res.json({
      totalItems,
      totalQuantity:
        totalQuantity.length > 0 ? totalQuantity[0].totalQuantity : 0,
      categoryWiseQuantity,
      highestSellItem: highestSellItem.length > 0 ? highestSellItem[0] : null,
      highestOrderAmount: highestOrderAmount
        ? highestOrderAmount.totalAmount
        : 0,
      totalOrderAmount: totalOrderAmount[0]?.totalAmount || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// 1. Add Item
router.post("/add", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. Delete Item
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Edit Item
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedItem)
      return res.status(404).json({ message: "Item not found" });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. Add Quantity
router.patch("/:id/add-quantity", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity += req.body.quantity;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. Search Item
router.get("/search", async (req, res) => {
  try {
    const query = {};
    if (req.query.name) query.name = new RegExp(req.query.name, "i");
    if (req.query.style) query.style = new RegExp(req.query.style, "i");
    if (req.query.size) query.size = new RegExp(req.query.size, "i");

    const items = await Item.find(query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Get All Items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. Remove Quantity
router.patch("/:id/remove-quantity", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const quantityToRemove = req.body.quantity;

    if (item.quantity < quantityToRemove) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in stock" });
    }

    item.quantity -= quantityToRemove;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//8. Get Items by Category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    if (!["Tiles", "Bath Tub", "Wash Basin"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
    const items = await Item.find({ category });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//9. Get item by ID

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/get-multiple", async (req, res) => {
  try {
    const { ids } = req.body;
    const items = await Item.find({ _id: { $in: ids } });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
