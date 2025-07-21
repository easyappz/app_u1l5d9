const multer = require('multer');
const path = require('path');
const Photo = require('../models/Photo');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size to 5MB
  fileFilter: fileFilter
}).single('photo');

// Upload photo handler
exports.uploadPhoto = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const photo = new Photo({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        owner: req.user._id
      });

      await photo.save();
      res.status(201).json({ message: 'Photo uploaded successfully', photo });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save photo data' });
    }
  });
};

// Toggle photo status (active/inactive)
exports.togglePhotoStatus = async (req, res) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.photoId, owner: req.user._id });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found or not authorized' });
    }

    photo.status = photo.status === 'active' ? 'inactive' : 'active';
    await photo.save();

    res.json({ message: 'Photo status updated', photo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update photo status' });
  }
};

// Get random photo
exports.getRandomPhoto = async (req, res) => {
  try {
    const photo = await Photo.aggregate([
      { $match: { status: 'active' } },
      { $sample: { size: 1 } }
    ]);

    if (!photo.length) {
      return res.status(404).json({ error: 'No active photos found' });
    }

    res.json({ photo: photo[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random photo' });
  }
};

// Rate a photo
exports.ratePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Simple rating logic (can be expanded with user-specific ratings)
    photo.rating = req.body.rating;
    await photo.save();

    res.json({ message: 'Photo rated successfully', photo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate photo' });
  }
};

// Get user's photos
exports.getUserPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ owner: req.user._id });
    res.json({ photos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user photos' });
  }
};
