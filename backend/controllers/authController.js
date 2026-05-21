const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");

function publicUser(doc) {
  const id = doc._id != null ? String(doc._id) : String(doc.id);
  return {
    id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone || "",
    role: doc.role,
    isActive: doc.isActive,
  };
}

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Email is already registered." });
    }
    const hashed = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashed,
      phone: phone != null ? String(phone).trim() : "",
      role: "customer",
    });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: publicUser(user.toObject()),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Registration failed." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log("BODY:", req.body);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    console.log("USER:", user);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const ok = await bcrypt.compare(String(password), user.password);
    console.log("MATCH:", ok);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = signToken(user._id);
    user.password = undefined;
    res.json({
      token,
      user: publicUser(user.toObject()),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Login failed." });
  }
}

async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

function getGoogleClient(clientId) {
  return new OAuth2Client(clientId);
}

async function loginWithGoogle(req, res) {
  try {
    const { credential } = req.body || {};
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(400).json({ message: "GOOGLE_CLIENT_ID is not configured on server." });
    }
    if (!credential) {
      return res.status(400).json({ message: "Google credential token is required." });
    }

    const ticket = await getGoogleClient(clientId).verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const email = String(payload?.email || "").toLowerCase().trim();
    const verified = Boolean(payload?.email_verified);
    const name = String(payload?.name || "").trim();

    if (!email || !verified) {
      return res.status(401).json({ message: "Google account email is not verified." });
    }

    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      const pseudoPassword = await bcrypt.hash(`google_${Date.now()}_${email}`, 10);
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: pseudoPassword,
        role: "customer",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled." });
    }

    const token = signToken(user._id);
    res.json({ token, user: publicUser(user.toObject ? user.toObject() : user) });
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: "Google login failed." });
  }
}

const nodemailer = require("nodemailer");

async function sendMailHelper(to, subject, text, html) {
  try {
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: '"Mankatha Spices" <noreply@mankathaspices.com>',
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully: %s", info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL: %s", previewUrl);
    }
    return { success: true, previewUrl, messageId: info.messageId };
  } catch (err) {
    console.error("Nodemailer failed to send email:", err);
    return { success: false, error: err.message };
  }
}

async function registerSendOtp(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists && exists.isActive) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const hashed = await bcrypt.hash(String(password), 10);

    let user;
    if (exists) {
      exists.name = String(name).trim();
      exists.password = hashed;
      exists.phone = phone != null ? String(phone).trim() : "";
      exists.registerOtp = otp;
      exists.registerOtpExpires = otpExpires;
      user = await exists.save();
    } else {
      user = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashed,
        phone: phone != null ? String(phone).trim() : "",
        role: "customer",
        isActive: false,
        registerOtp: otp,
        registerOtpExpires: otpExpires,
      });
    }

    const subject = `Your Mankatha Spices Registration OTP: ${otp}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ede6dc; padding: 20px; border-radius: 12px; background-color: #fcfcf9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #8dbe20; margin: 0;">Mankatha Spices</h2>
          <p style="font-size: 0.9rem; color: #6b7280; margin: 5px 0 0 0;">Premium Organic Groceries & Spices</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #ede6dc; margin-bottom: 20px;">
        <h3 style="color: #374151;">Welcome to Mankatha Spices, ${name}!</h3>
        <p style="color: #4b5563; line-height: 1.6;">Thank you for registering. To complete your registration, please verify your email address by entering the 6-digit verification code below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 2.2rem; font-weight: 800; letter-spacing: 5px; color: #8dbe20; background: #f0f7e6; padding: 10px 25px; border-radius: 8px; border: 1px solid #d3ecb2;">${otp}</span>
        </div>
        <p style="color: #ef4444; font-size: 0.85rem; font-weight: 600; text-align: center;">This code is valid for 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #ede6dc; margin-top: 30px; margin-bottom: 15px;">
        <p style="font-size: 0.8rem; color: #9ca3af; text-align: center;">This is an automated security email. Please do not reply directly to this mail.</p>
      </div>
    `;

    const mailResult = await sendMailHelper(normalizedEmail, subject, `Your Registration OTP is ${otp}`, emailHtml);

    res.json({
      message: "OTP sent to your email address successfully.",
      previewUrl: mailResult.previewUrl || ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send registration OTP." });
  }
}

async function registerVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "No registration in progress found for this email." });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "This email has already been verified and registered." });
    }

    if (!user.registerOtp || user.registerOtp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    if (user.registerOtpExpires && user.registerOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    user.isActive = true;
    user.registerOtp = "";
    user.registerOtpExpires = null;
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: publicUser(user.toObject()),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify registration OTP." });
  }
}

async function forgotSendOtp(req, res) {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ message: "Email or Phone number is required." });
    }
    const input = String(emailOrPhone).trim();
    
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input.toLowerCase(), isActive: true });
    } else {
      user = await User.findOne({ phone: input, isActive: true });
    }

    if (!user) {
      return res.status(404).json({ message: "No active account found with this email or phone number." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.forgotOtp = otp;
    user.forgotOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const subject = `Your Mankatha Spices Password Reset OTP: ${otp}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ede6dc; padding: 20px; border-radius: 12px; background-color: #fcfcf9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #8dbe20; margin: 0;">Mankatha Spices</h2>
          <p style="font-size: 0.9rem; color: #6b7280; margin: 5px 0 0 0;">Premium Organic Groceries & Spices</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #ede6dc; margin-bottom: 20px;">
        <h3 style="color: #374151;">Password Reset Request</h3>
        <p style="color: #4b5563; line-height: 1.6;">Hello ${user.name},</p>
        <p style="color: #4b5563; line-height: 1.6;">We received a request to reset your password. Use the 6-digit OTP code below to verify your identity and change your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 2.2rem; font-weight: 800; letter-spacing: 5px; color: #8dbe20; background: #f0f7e6; padding: 10px 25px; border-radius: 8px; border: 1px solid #d3ecb2;">${otp}</span>
        </div>
        <p style="color: #ef4444; font-size: 0.85rem; font-weight: 600; text-align: center;">This reset code is valid for 10 minutes.</p>
        <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: 0; border-top: 1px solid #ede6dc; margin-top: 30px; margin-bottom: 15px;">
        <p style="font-size: 0.8rem; color: #9ca3af; text-align: center;">This is an automated security email. Please do not reply directly to this mail.</p>
      </div>
    `;

    let mailResult = { success: false };
    if (user.email) {
      mailResult = await sendMailHelper(user.email, subject, `Your Reset OTP is ${otp}`, emailHtml);
    }

    res.json({
      message: "Reset code sent to your registered email/phone successfully.",
      previewUrl: mailResult.previewUrl || ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reset OTP." });
  }
}

async function forgotVerifyOtp(req, res) {
  try {
    const { emailOrPhone, otp } = req.body;
    if (!emailOrPhone || !otp) {
      return res.status(400).json({ message: "Email/Phone and OTP are required." });
    }
    const input = String(emailOrPhone).trim();

    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input.toLowerCase(), isActive: true });
    } else {
      user = await User.findOne({ phone: input, isActive: true });
    }

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (!user.forgotOtp || user.forgotOtp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    if (user.forgotOtpExpires && user.forgotOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    res.json({ message: "OTP verified successfully. You can reset your password now." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify forgot password OTP." });
  }
}

async function resetPassword(req, res) {
  try {
    const { emailOrPhone, otp, password } = req.body;
    if (!emailOrPhone || !otp || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const input = String(emailOrPhone).trim();
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input.toLowerCase(), isActive: true });
    } else {
      user = await User.findOne({ phone: input, isActive: true });
    }

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (!user.forgotOtp || user.forgotOtp !== String(otp)) {
      return res.status(400).json({ message: "Invalid reset code." });
    }

    if (user.forgotOtpExpires && user.forgotOtpExpires < new Date()) {
      return res.status(400).json({ message: "Reset code has expired." });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    user.password = hashed;
    user.forgotOtp = "";
    user.forgotOtpExpires = null;
    await user.save();

    res.json({ message: "Password updated successfully! You can log in now." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password." });
  }
}

module.exports = {
  register,
  login,
  me,
  loginWithGoogle,
  registerSendOtp,
  registerVerifyOtp,
  forgotSendOtp,
  forgotVerifyOtp,
  resetPassword
};
