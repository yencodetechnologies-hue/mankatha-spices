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
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const ok = await bcrypt.compare(String(password), user.password);
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

module.exports = { register, login, me, loginWithGoogle };
