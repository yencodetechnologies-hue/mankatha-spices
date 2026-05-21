const express = require('express');
const router = express.Router();
const ServiceArea = require('../models/ServiceArea');

// Check if a pincode is serviceable
router.post('/check-location', async (req, res) => {
  try {
    const { pincode } = req.body;
    
    // As requested, statically making it available for EVERYTHING
    return res.json({
      success: true,
      available: true,
      city: pincode || "Serviceable Area",
      message: "We are available here!"
    });
  } catch (error) {
    console.error('Check location error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin routes to manage service areas
router.get('/', async (req, res) => {
  try {
    const areas = await ServiceArea.find().sort({ createdAt: -1 });
    res.json({ success: true, areas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { pincode, city, available } = req.body;
    let area = await ServiceArea.findOne({ pincode });
    
    if (area) {
      area.city = city || area.city;
      if (available !== undefined) area.available = available;
      await area.save();
    } else {
      area = new ServiceArea({ pincode, city, available });
      await area.save();
    }
    
    res.json({ success: true, area, message: 'Service area saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ServiceArea.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service area deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
