const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// 1. Add Item
router.post('/add', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 2. Delete Item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Edit Item
router.put('/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. Add Quantity
router.patch('/:id/add-quantity', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.quantity += req.body.quantity;
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 5. Search Item
router.get('/search', async (req, res) => {
    try {
        const query = {};
        if (req.query.name) query.name = new RegExp(req.query.name, 'i');
        if (req.query.style) query.style = new RegExp(req.query.style, 'i');
        if (req.query.size) query.size = new RegExp(req.query.size, 'i');

        const items = await Item.find(query);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. Get All Items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. Remove Quantity
router.patch('/:id/remove-quantity', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const quantityToRemove = req.body.quantity;

        if (item.quantity < quantityToRemove) {
            return res.status(400).json({ message: 'Insufficient quantity in stock' });
        }

        item.quantity -= quantityToRemove;
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//8. Get Items by Category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!['Tiles', 'Bath Tub', 'Wash Basin'].includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }
        const items = await Item.find({ category });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//9. Get item by ID

router.get('/:id', async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/get-multiple', async (req, res) => {
    try {
      const { ids } = req.body;
      const items = await Item.find({ _id: { $in: ids } });
      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
