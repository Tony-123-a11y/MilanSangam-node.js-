import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

//  Unified uploads directory
const uploadDir = "uploads";

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//  Allowed image types
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

//  File filter for security
const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
  }
  cb(null, true);
};

//  Common storage generator
const createStorage = (prefix) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = crypto.randomBytes(12).toString("hex");
      cb(null, `${prefix}_${unique}${ext}`);
    },
  });

//  Single profile picture upload
export const uploadProfilePic = multer({
  storage: createStorage("profile"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("profilePic");

//  Multiple gallery photos upload (max 6 photos)
export const uploadTopPhotos = multer({
  storage: createStorage("gallery"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
}).array("photos", 6);
