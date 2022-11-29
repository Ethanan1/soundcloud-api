const express = require('express');
const { Song, Album, Playlist } = require('../../db/models')
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid Email'),
  check('username')
    .exists({ checkFalsy: true })
    .withMessage('Username is required'),
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('First Name is required'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Last Name is required'),
  handleValidationErrors
];

// Sign up
router.post('/', validateSignup, async (req, res, next) => {
  const { firstName, lastName, email, password, username } = req.body;
  const existingEmail = await User.findOne({ where: { email } })
  if (existingEmail) {
    const e = new Error("Email already exists")
    e.status = 403;
    return next(e);
  }
  const user = await User.signup({
    email,
    username,
    password,
    firstName,
    lastName,
  });

  const token = await setTokenCookie(res, user);
  return res.json({
    ...user.toSafeObject(),
    token,
  });
});


//get details of an artist by id
router.get('/:userId', async (req, res, next) => {
  const { userId } = req.params
  const songs = await Song.findAll({
    where: { userId },
    attributes: { include: ['previewImage'] }
  });
  const albums = await Album.count({ where: { userId } })
  const artistDetails = await User.findByPk(userId);

  if (artistDetails) {
    return res.json({
      "id": artistDetails.id,
      "username": artistDetails.username,
      "totalSongs": songs.length,
      "totalAlbums": albums,
      "imageUrl": artistDetails.imageUrl,
      'songs': songs
    });
  } else {
    const e = new Error("No artist information available");
    e.status = 404;
    return next(e);
  }

});

//get all songs of an artist by id
router.get('/:userId/songs', async (req, res, next) => {
    const { userId } = req.params
    const user = await User.findByPk(userId)
    if (!user) {
      const e = new Error("No user information available");
      e.status = 404;
      return next(e);
    }
    return res.json({
      Songs: await Song.findAll({ where: { userId } })
    })
  })


//get all playlist by user id
router.get("/:userId/playlists", async (req, res, next) => {
    const { userId } = req.params
    const user = await User.findByPk(userId)
    if (!user) {
      const e = new Error("No user information available");
      e.status = 404;
      return next(e);
    }
    return res.json({
      Playlists: await Playlist.findAll({ where: { userId } })
    })
  })

module.exports = router;
