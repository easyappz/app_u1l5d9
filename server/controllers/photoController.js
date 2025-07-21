const Photo = require('../models/Photo');
const User = require('../models/User');

exports.uploadPhoto = async (req, res) => {
  try {
    const { url } = req.body;
    const photo = new Photo({ owner: req.userId, url });
    await photo.save();
    res.status(201).json({ photo });
  } catch (error) {
    res.status(500).json({ error: 'Photo upload failed' });
  }
};

exports.togglePhotoStatus = async (req, res) => {
  try {
    const { photoId } = req.params;
    const user = await User.findById(req.userId);
    const photo = await Photo.findOne({ _id: photoId, owner: req.userId });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (!photo.isActive && user.points < 1) {
      return res.status(400).json({ error: 'Not enough points to activate photo' });
    }

    photo.isActive = !photo.isActive;
    if (photo.isActive) {
      user.points -= 1;
    }
    await photo.save();
    await user.save();

    res.json({ photo, points: user.points });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle photo status' });
  }
};

exports.getRandomPhoto = async (req, res) => {
  try {
    const { gender, minAge, maxAge } = req.query;
    const currentUser = await User.findById(req.userId);

    let query = { isActive: true, owner: { $ne: req.userId } };
    if (gender) {
      query['owner.gender'] = gender;
    }
    if (minAge && maxAge) {
      query['owner.age'] = { $gte: Number(minAge), $lte: Number(maxAge) };
    }

    const photos = await Photo.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      { $unwind: '$owner' },
      { $match: query },
      { $sample: { size: 1 } }
    ]);

    if (photos.length === 0) {
      return res.status(404).json({ error: 'No photos available for rating' });
    }

    res.json({ photo: photos[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random photo' });
  }
};

exports.ratePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { score } = req.body;
    const photo = await Photo.findById(photoId);
    const rater = await User.findById(req.userId);
    const owner = await User.findById(photo.owner);

    if (!photo || !photo.isActive) {
      return res.status(404).json({ error: 'Photo not found or inactive' });
    }

    if (photo.owner.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot rate own photo' });
    }

    const alreadyRated = photo.ratings.some(rating => rating.rater.toString() === req.userId.toString());
    if (alreadyRated) {
      return res.status(400).json({ error: 'Photo already rated by user' });
    }

    photo.ratings.push({
      rater: req.userId,
      score,
      raterGender: rater.gender,
      raterAge: rater.age
    });
    await photo.save();

    rater.points += 1;
    owner.points -= 1;
    await rater.save();
    await owner.save();

    res.json({ message: 'Photo rated', points: rater.points });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate photo' });
  }
};

exports.getUserPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ owner: req.userId });
    const stats = photos.map(photo => {
      const ratings = photo.ratings;
      const maleRatings = ratings.filter(r => r.raterGender === 'male');
      const femaleRatings = ratings.filter(r => r.raterGender === 'female');
      const otherRatings = ratings.filter(r => r.raterGender === 'other');
      const ageGroups = {
        '0-18': ratings.filter(r => r.raterAge <= 18),
        '19-30': ratings.filter(r => r.raterAge > 18 && r.raterAge <= 30),
        '31-50': ratings.filter(r => r.raterAge > 30 && r.raterAge <= 50),
        '51+': ratings.filter(r => r.raterAge > 50)
      };

      return {
        photoId: photo._id,
        url: photo.url,
        isActive: photo.isActive,
        stats: {
          totalRatings: ratings.length,
          averageScore: ratings.length ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(2) : 0,
          byGender: {
            male: {
              count: maleRatings.length,
              average: maleRatings.length ? (maleRatings.reduce((sum, r) => sum + r.score, 0) / maleRatings.length).toFixed(2) : 0
            },
            female: {
              count: femaleRatings.length,
              average: femaleRatings.length ? (femaleRatings.reduce((sum, r) => sum + r.score, 0) / femaleRatings.length).toFixed(2) : 0
            },
            other: {
              count: otherRatings.length,
              average: otherRatings.length ? (otherRatings.reduce((sum, r) => sum + r.score, 0) / otherRatings.length).toFixed(2) : 0
            }
          },
          byAge: {
            '0-18': {
              count: ageGroups['0-18'].length,
              average: ageGroups['0-18'].length ? (ageGroups['0-18'].reduce((sum, r) => sum + r.score, 0) / ageGroups['0-18'].length).toFixed(2) : 0
            },
            '19-30': {
              count: ageGroups['19-30'].length,
              average: ageGroups['19-30'].length ? (ageGroups['19-30'].reduce((sum, r) => sum + r.score, 0) / ageGroups['19-30'].length).toFixed(2) : 0
            },
            '31-50': {
              count: ageGroups['31-50'].length,
              average: ageGroups['31-50'].length ? (ageGroups['31-50'].reduce((sum, r) => sum + r.score, 0) / ageGroups['31-50'].length).toFixed(2) : 0
            },
            '51+': {
              count: ageGroups['51+'].length,
              average: ageGroups['51+'].length ? (ageGroups['51+'].reduce((sum, r) => sum + r.score, 0) / ageGroups['51+'].length).toFixed(2) : 0
            }
          }
        }
      };
    });

    res.json({ photos: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user photos' });
  }
};
