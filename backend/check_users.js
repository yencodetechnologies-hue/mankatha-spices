require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to DB");
    
    const users = await User.find({}).select('+password');
    console.log("Users in DB:");
    users.forEach(u => {
      console.log(`- Email: ${u.email} | Role: ${u.role} | isActive: ${u.isActive}`);
    });
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}

checkUsers();
