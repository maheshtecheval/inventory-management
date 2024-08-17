const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const Item = require("../models/Item");
const fs = require("fs");
const path = require("path");

// 6. Place Order
router.post("/place-order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/create-order', async (req, res) => {
    try {
      const { customerName, mobile, email, address, items } = req.body;
  
      // Fetch item details based on the provided item IDs
      const itemDetails = await Item.find({ _id: { $in: items.map(item => item._id) } });
  
      // Calculate total for each item and overall total, and update item quantities
      const processedItems = itemDetails.map(item => {
        const orderItem = items.find(i => i._id === String(item._id)); // Ensure proper comparison
  
        if (!orderItem) {
          throw new Error(`Item with ID ${item._id} not found in the order`);
        }
  
        const orderQuantity = orderItem.quantity;
  
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
          price: item.price,
          quantity: orderQuantity,
          total: item.price * orderQuantity,
        };
      });
  
      const totalAmount = processedItems.reduce((acc, item) => acc + item.total, 0);
  
      // Save order to database
      const newOrder = new Order({ 
        customerName, 
        mobile, 
        email, 
        address, 
        items: processedItems.map(item => ({ _id: item._id, quantity: item.quantity })), 
        totalAmount 
      });
  
      await newOrder.save();
  
      // Generate PDF
      const doc = new PDFDocument();
      const filename = `order_${newOrder._id}.pdf`;
      const filepath = path.join(__dirname, '..', 'invoices', filename);
  
      // Ensure the invoices directory exists
      fs.mkdirSync(path.join(__dirname, '..', 'invoices'), { recursive: true });
  
      doc.pipe(fs.createWriteStream(filepath));
  
      doc.fontSize(16).text('Order Invoice', { align: 'center' });
      doc.moveDown();
  
      processedItems.forEach(item => {
        doc.fontSize(12).text(
          `Name: ${item.name}, Size: ${item.size}, Design: ${item.design}, Shed: ${item.shed}, Price: ${item.price}, Quantity: ${item.quantity}, Total: ${item.total}`
        );
        doc.moveDown();
      });
  
      doc.fontSize(14).text(`Total Amount: ${totalAmount}`, { align: 'right' });
  
      doc.moveDown();
      doc.fontSize(10).text('This is a computer-generated bill. No stamp required.', { align: 'center' });
  
      doc.end();
  
      res.json({ message: 'Order created and PDF generated', pdfUrl: `http://localhost:5000/invoices/${filename}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Server error' });
    }
  });
  

module.exports = router;
