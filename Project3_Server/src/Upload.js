import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../../Project3_Client/src/assets/itemImages');
  },
  filename: (req, file, cb) => {
    console.log(req.body.menuId);
    const ext = req.body.menuId || "The Original Orange Chicken";
    const base = ext.replace(/[^a-zA-Z0-9-_]/g, '').replace(/ /g, "");
    cb(null, `${base}.png`);
  }
});

// Validate PNG only
function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/png') cb(null, true);
  else cb(new Error('Only PNG files are allowed'), false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Upload handler
export function handleFileUpload(req, res) {
  upload.single('file', 'menuId')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    return res.json({
      success: true,
      filename: req.file.filename,
      path: `../../Project3_Client/src/assets/itemImages/${req.file.filename}`
    });
  });
}