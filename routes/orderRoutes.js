const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const Item = require("../models/Item");
const fs = require("fs");
const path = require("path");

// 1. Place Order
router.post("/place-order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//2. GET /api/orders
// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find().populate('items'); // Populate item details if needed
//     res.json(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error.message);
//     res.status(500).json({ message: error.message || "Server error" });
//   }
// });

// Order API - get paginated orders
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find()
      .skip(skip)
      .limit(limitNum)
      .populate("items.item_id");

    const totalOrders = await Order.countDocuments();

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order and populate items
    const order = await Order.findById(orderId).populate("items.item_id");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);
    // Update stock quantities
    for (const item of order.items) {
      const itemInDb = await Item.findById(item._id);

      if (itemInDb) {
        // Increment the stock quantity by the quantity of the deleted order item
        await Item.findByIdAndUpdate(item._id, {
          $inc: { quantity: item.quantity },
        });
      } else {
        console.warn(`Item with id ${item._id} not found`);
      }
    }

    res
      .status(200)
      .json({ message: "Order deleted and stock updated successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Order API - get order by ID
router.get("/order/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items"); // Populate item details if needed
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});
//3. POST /api/create-order
router.post("/create-order", async (req, res) => {
  try {
    const { customerName, mobile, email, address, items } = req.body;

    if (
      !customerName ||
      !mobile ||
      !email ||
      !address ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "All required fields (customerName, mobile, email, address, items) must be provided, and items must be an array with at least one item.",
      });
    }

    // Fetch item details based on the provided item IDs
    const itemDetails = await Item.find({
      _id: { $in: items.map((item) => item._id) },
    });

    // Calculate total for each item and overall total, and update item quantities
    const processedItems = itemDetails.map((item) => {
      const orderItem = items.find((i) => i._id === String(item._id)); // Ensure proper comparison

      if (!orderItem) {
        throw new Error(`Item with ID ${item._id} not found in the order`);
      }

      const orderQuantity = Number(orderItem.quantity);
      const itemPrice = Number(item.price);

      // Check for stock availability
      if (item.quantity < orderQuantity) {
        throw new Error(`Not enough stock for item: ${item.name}`);
      }

      // Reduce item stock by the ordered quantity
      item.quantity -= orderQuantity;
      item.save(); // Save the updated item to the database

      return {
        _id: item._id,
        name: item.name,
        size: item.size,
        design: item.design,
        shed: item.shed,
        price: itemPrice,
        quantity: orderQuantity,
        total: itemPrice * orderQuantity,
      };
    });

    const totalAmount = processedItems.reduce(
      (acc, item) => acc + item.total,
      0
    );

    // Save order to database
    const newOrder = new Order({
      customerName,
      mobile,
      email,
      address,
      items: processedItems.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_total_price: item.price * item.quantity,
      })),
      totalAmount,
    });

    await newOrder.save();

    // Generate PDF
    const doc = new PDFDocument();
    const filename = `order_${newOrder._id}.pdf`;
    const filepath = path.join(__dirname, "..", "invoices", filename);

    // Ensure the invoices directory exists
    fs.mkdirSync(path.join(__dirname, "..", "invoices"), { recursive: true });

    doc.pipe(fs.createWriteStream(filepath));

    // doc.fontSize(18).text("Order Invoice", { align: "center" });
    // doc.moveDown();
    // Header
    doc.fontSize(16).text("ABC Pvt ltd.", { align: "center" });
    doc
      .fontSize(12)
      .text(
        "Address: Shivaji Nagar, Tehsil - Barshi, District - Osmanabad | Contact: 91 8888724838",
        { align: "center" }
      );
    doc.moveDown();
    const lineStart = { x: 50, y: 190 };
    const lineEnd = { x: 550, y: 190 };
    doc.moveTo(lineStart.x, lineStart.y).lineTo(lineEnd.x, lineEnd.y).stroke();
    doc.moveDown();
    // Customer and Order Information
    doc.fontSize(12).text(`Customer: ${customerName}`);
    doc.text(`Email: ${email}`);
    doc.text(`Mobile: ${mobile}`);
    doc.text(`Address: ${address}`);
    doc.moveDown();
    doc.fontSize(14).text("Order Items List", { align: "center" });
    processedItems.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}: ${item.name}`);
      doc.moveDown();
      doc
        .fontSize(11)
        .text(
          `Size: ${item.size}  |  Design: ${item.design}  |  Shed: ${
            item.shed
          }  |  Price: Rs ${item.price.toFixed(2)}`
        );
      doc
        .fontSize(10)
        .text(
          `Quantity: ${item.quantity}  |  Total: Rs ${item.total.toFixed(2)}`
        );

      doc.moveDown();
      doc.moveDown();
    });

    doc
      .fontSize(14)
      .text(`Total Amount: Rs ${totalAmount.toFixed(2)}`, { align: "right" });

    doc.moveDown();
    doc.moveDown();
    doc.fontSize(12).text("Note:");
    doc
      .fontSize(10)
      .text("This is a computer-generated bill. No stamp required.", {
        align: "left",
      });

    doc.end();

    res.json({
      message: "Order created and PDF generated",
      pdfUrl: `http://localhost:5000/invoices/${filename}`,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/order-without-bill", async (req, res) => {
  try {
    const { customerName, mobile, email, address, items } = req.body;

    if (
      !customerName ||
      !mobile ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "All required fields (customerName, mobile,  items) must be provided, and items must be an array with at least one item.",
      });
    }

    // Fetch item details based on the provided item IDs
    const itemDetails = await Item.find({
      _id: { $in: items.map((item) => item._id) },
    });

    // Calculate total for each item and overall total, and update item quantities
    const processedItems = itemDetails.map((item) => {
      const orderItem = items.find((i) => i._id === String(item._id)); // Ensure proper comparison

      if (!orderItem) {
        throw new Error(`Item with ID ${item._id} not found in the order`);
      }

      const orderQuantity = Number(orderItem.quantity);
      const itemPrice = Number(item.price);

      // Check for stock availability
      if (item.quantity < orderQuantity) {
        throw new Error(`Not enough stock for item: ${item.name}`);
      }

      // Reduce item stock by the ordered quantity
      item.quantity -= orderQuantity;
      item.save(); // Save the updated item to the database

      return {
        _id: item._id,
        name: item.name,
        size: item.size,
        design: item.design,
        shed: item.shed,
        price: itemPrice,
        quantity: orderQuantity,
        total: itemPrice * orderQuantity,
      };
    });

    const totalAmount = processedItems.reduce(
      (acc, item) => acc + item.total,
      0
    );

    // Save order to database
    const newOrder = new Order({
      customerName,
      mobile,
      email: email || "NA",
      address: address || "NA",
      items: processedItems.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_total_price: item.price * item.quantity,
      })),
      totalAmount,
    });

    await newOrder.save();
    res.json({
      message: "Order created and PDF generated",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});
//4. Order API - search orders by customerName
router.get("/search", async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const searchRegex = new RegExp(query, "i");
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({
      customerName: { $regex: searchRegex },
    })
      .populate("items.item_id")
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments({
      customerName: { $regex: searchRegex },
    });

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      orders,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error searching orders:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;
