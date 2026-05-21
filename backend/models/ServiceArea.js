const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  city: {
    type: String,
    default: 'Chennai'
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceArea', serviceAreaSchema);
