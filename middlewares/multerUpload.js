import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ✅ Unified uploads directory
const uploadDir = 'uploads';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Storage config for profile picture (stores in 'uploads/')
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// ✅ Middleware for single profile picture
const uploadProfilePic = (req, res, next) => {
  const upload = multer({ storage: profilePicStorage }).single('profilePic');

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    if (req.file) {
      req.profilePic = {
        fileName: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }
    next();
  });
};

// ✅ Storage config for multiple top photos (stores in 'uploads/')
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `gallery_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// ✅ Multer instance for gallery photos
const uploadtophotos = multer({ storage: galleryStorage });

export default {
  uploadProfilePic,
  uploadtophotos
};