const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Order = require("../models/Order");
const PurchaseItem = require("../models/PurchaseItem");

// Fetch paginated Purchase Items
router.get("/purchasesitems", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const purchases = await PurchaseItem.find()
      .populate('itemId') // Populating item details from Item schema
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await PurchaseItem.countDocuments();

    res.status(200).json({
      purchases,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching purchase data:", error);
    res.status(500).json({ success: false, error: "Failed to fetch purchase data" });
  }
});


router.get("/dashboard-stats", async (req, res) => {
  try {
    // 1. Total number of items
    const totalItems = await Item.countDocuments();

    // 2. Total quantity of items
    const totalQuantity = await Item.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } },
      { $project: { _id: 0, totalQuantity: 1 } },
    ]);

    // 3. Category-wise quantity of items with sizes and designs
    const categoryWiseQuantity = await Item.aggregate([
      {
        $group: {
          _id: "$category",
          totalQuantity: { $sum: "$totalQuantity" },
          sizes: { $push: "$size" },
          designs: { $push: "$designs" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalQuantity: 1,
          sizes: 1,
          designs: 1,
          _id: 0,
        },
      },
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
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!updatedItem)
//       return res.status(404).json({ message: "Item not found" });
//     res.json(updatedItem);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Update Item quantities for specific size and design
router.put("/:id", async (req, res) => {
  try {
    const { sizeId, designId, sizeQuantityChange, designQuantityChange } =
      req.body;

    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Update size quantity if sizeId and change are provided
    if (sizeId && sizeQuantityChange !== undefined) {
      const size = item.size.find((s) => s._id.toString() === sizeId);
      if (size) {
        size.quantity += sizeQuantityChange;
        item.totalQuantity += sizeQuantityChange;
        if (size.quantity < 0) {
          return res
            .status(400)
            .json({ message: "Size quantity cannot be negative" });
        }
      } else {
        return res.status(404).json({ message: "Size not found" });
      }
    }

    // Update design quantity if designId and change are provided
    if (designId && designQuantityChange !== undefined) {
      const design = item.designs.find((d) => d._id.toString() === designId);
      if (design) {
        design.quantity += designQuantityChange;
        item.totalQuantity += designQuantityChange;
        if (design.quantity < 0) {
          return res
            .status(400)
            .json({ message: "Design quantity cannot be negative" });
        }
      } else {
        return res.status(404).json({ message: "Design not found" });
      }
    }

    await item.save();
    res.json(item);
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
  const { ids, sizes, designs } = req.body;
  try {
    // Fetch items based on IDs
    const items = await Item.find({ _id: { $in: ids } }).lean(); // Use lean() for plain JavaScript objects

    // Process items to include only selected sizes and designs
    const itemsWithSelections = items.map((item) => {
      const itemId = item._id.toString();

      // Get selected size and design for the current item
      const selectedSizeId = sizes[itemId];
      const selectedDesignId = designs[itemId];

      // Filter sizes and designs based on provided IDs
      const filteredSizes = item.size.filter(
        (size) => size._id.toString() === selectedSizeId
      );
      const filteredDesigns = item.designs.filter(
        (design) => design._id.toString() === selectedDesignId
      );

      return {
        ...item,
        size: filteredSizes,
        designs: filteredDesigns,
        selectedSize: selectedSizeId || "",
        selectedDesign: selectedDesignId || "",
      };
    });

    res.json(itemsWithSelections);
  } catch (error) {
    console.error("Error fetching items:", error); // Log error for debugging
    res.status(500).json({ message: "Failed to fetch items", error });
  }
});

router.post("/purchase/new", async (req, res) => {
  try {
    const { itemId, sizeId, designId, quantity, price } = req.body;

    // Step 1: Find the Item by itemId
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Step 2: Find the size and design from the item using sizeId and designId
    const selectedSize = item.size.find(s => s._id.toString() === sizeId);
    const selectedDesign = item.designs.find(d => d._id.toString() === designId);

    if (!selectedSize) {
      return res.status(404).json({ success: false, message: "Size not found" });
    }
    if (!selectedDesign) {
      return res.status(404).json({ success: false, message: "Design not found" });
    }

    // Step 3: Create a new PurchaseItem and embed the size and design details
    const newPurchaseItem = new PurchaseItem({
      itemId: item._id,
      size: {
        _id: selectedSize._id,
        size: selectedSize.size
      },
      design: {
        _id: selectedDesign._id,
        design: selectedDesign.design
      },
      quantity: quantity,
      price: price || item.price // use item price if price is not provided
    });

    // Step 4: Save the new PurchaseItem
    await newPurchaseItem.save();

    res.status(201).json({ success: true, data: newPurchaseItem });
  } catch (error) {
    console.error("Error creating purchase item:", error);
    res.status(500).json({ success: false, error: "Failed to create purchase item" });
  }
});


module.exports = router;
