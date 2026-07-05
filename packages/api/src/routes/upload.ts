// ============================================================
// UPLOAD ROUTES — Image upload (local + Cloudinary-ready)
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, adminOnly } from '../middleware/auth';

export const uploadRouter = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Single image upload
uploadRouter.post('/image', authenticate, adminOnly, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const baseUrl = process.env.API_URL || `http://localhost:${process.env.API_PORT || 4000}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    data: { url, filename: req.file.filename },
    message: 'Image uploaded successfully',
  });
});

// Multiple image upload
uploadRouter.post('/images', authenticate, adminOnly, upload.array('images', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  }

  const baseUrl = process.env.API_URL || `http://localhost:${process.env.API_PORT || 4000}`;
  const urls = files.map(file => ({
    url: `${baseUrl}/uploads/${file.filename}`,
    filename: file.filename,
  }));

  res.json({
    success: true,
    data: urls,
    message: `${files.length} images uploaded successfully`,
  });
});
