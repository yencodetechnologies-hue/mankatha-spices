const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mankatha_db').then(async () => {
  const User = require('./models/User');
  const Order = require('./models/Order');
  
  const u = await User.findOne({email: 'nithyagopalsamy2020@gmail.com'});
  if (u) {
    const res = await Order.updateMany(
      { customerId: { $exists: false } },
      { $set: { customerId: u._id } }
    );
    console.log('Updated', res.modifiedCount, 'orders');
  }
  process.exit(0);
});
