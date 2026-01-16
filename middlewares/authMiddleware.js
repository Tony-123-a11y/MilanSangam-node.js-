import jwt, { decode } from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1] || req.cookies.token;

  // Check if the Authorization header exists
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // User.findOne({_id:decoded.})
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorize" });
  }
};

export const authorizeAdmin = (req, res, next) => {
  // Check if the user role is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
