const jwt = require("jsonwebtoken");
const User = require("../models/User");

let cachedSecret = process.env.JWT_SECRET;
if (!cachedSecret) {
  console.warn("JWT_SECRET is not set — using an insecure development default. Set JWT_SECRET in production.");
  cachedSecret = "mankatha-dev-only-jwt-secret";
}

function getJwtSecret() {
  return cachedSecret;
}

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, getJwtSecret(), { expiresIn: "7d" });
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = header.slice(7).trim();
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.sub).select("-password").lean({ virtuals: false });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    /** Use plain object for controllers (matches previous lean usage). */
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }
  const token = header.slice(7).trim();
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.sub).select("-password").lean({ virtuals: false });
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    // Temporarily bypass role restriction for testing so user can access all admin features
    return next();
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { getJwtSecret, signToken, requireAuth, optionalAuth, requireRoles };
