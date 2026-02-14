import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    let token = null;

    // ✅ 1. Check Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ✅ 2. If not in header, check cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // ❌ No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { userId, role }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
