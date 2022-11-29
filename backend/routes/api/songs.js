const express = require("express");
const { User, Song, Album, Playlist, Comment } = require('../../db/models')
const router = express.Router();
const { requireAuth, restoreUser } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateGetAllSongs = [
    query('createdAt')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('CreatedAt is invalid'),
    query('page')
      .toInt()
      .customSanitizer(value => value || 0)
      .custom(value => value >= 0 && value <= 10)
      .withMessage('Page must >= to 0'),
    query('size')
      .toInt()
      .customSanitizer(value => value || 20)
      .custom(value => value >= 0 && value <= 20)
      .withMessage('Size must be >= to 0'),
    handleValidationErrors
  ]

const validateSong = [
    check('title')
        .exists({ checkFalsey: true })
        .withMessage('Song title is required.'),
    check('url')
        .exists({ checkFalsy: true })
        .withMessage('Audio is required'),
    handleValidationErrors
];

const validateComment = [
    check('body')
        .exists({ checkFalsey: true })
        .notEmpty()
        .withMessage('Comment body text is required'),
    handleValidationErrors
];



//get all songs
router.get('/', validateGetAllSongs, async (req, res) => {
      const { title, createdAt, page, size } = req.query
      const filter = {}
      if (title) {
        filter['title'] = title
      }
      if (createdAt) {
        filter['createdAt'] = createdAt
      }
      return res.json({
        Songs: await Song.findAll({
          where: filter,
          limit: size,
          offset: page * size,
        }),
        page,
        size,
      })
    }
  );


//create a song based on albumId
router.post('/', requireAuth, validateSong, async (req, res, next) => {
    const { title, description, url, previewImage, albumId } = req.body;
    const userId = req.user.id;

    const album = await Album.findOne({
        where: {
            id: albumId
        }
    });

    if (album) {
        const newSong = await Song.create({
            title,
            description,
            url,
            previewImage,
            albumId,
            userId
        })
        return res.json(newSong)

    } else {
        const e = new Error("Album couldn't be found");
        e.status = 404;
        return next(e)
    }

});


//get all songs from current user
router.get("/current", requireAuth, async (req, res) => {
    let userId = req.user.id;
    const songs = await Song.findAll({
        where: {
            userId: userId,
        },
    });
    res.json(songs);
});

//get detail of a song by id
router.get("/:songId", async (req, res, next) => {
    const { songId } = req.params;
    const song = await Song.findByPk(songId, {
        include: [
            {
                model: User,
                as: 'Artist',
            },
            {
                model: Album,
                as: 'Album'
            },
        ],
    });
    if (!song) {
        const err = new Error();
        err.message = "Song couldn't be found";
        err.status = 404;
        return next(err);
    }
    return res.json(song);
});

//edit song
router.put('/:songId', requireAuth, validateSong, async (req, res, next) => {
    //query for song, => series of if statements
        const userId = req.user.id;
        const song = await Song.findByPk(req.params.songId);
        const { title, description, url, imageUrl, albumId } = req.body;

        if (!song) {
            const err = new Error("Song could't be found");
                err.status = 404;
                return next(err);
        }

        if (userId !== song.userId) {
            const err = new Error("You don't own this song");
                err.status = 403;
                return next(err);
        }

        song.title = title;
        song.description = description;
        song.url = url;
        song.imageUrl = imageUrl;
        song.albumId = albumId;

        await song.save(); // changes made in lines
        res.json(song); // return
    })

//create comment from a song's id
router.post('/:songId/comments', validateComment, async (req, res, next) => {
    const userId = req.user.id;
    const { songId } = req.params;
    const { body } = req.body;

    let song = await Song.findByPk(songId);
    if (!song) {
        const err = new Error("Song couldn't be found");
        err.status = 404;
        return next(err);
    } else {
        const newComment = await Comment.create({
            userId,
            songId,
            body,
        })
        return res.json(newComment)
    }
});

//get comments by songId
router.get('/:songId/comments', async (req, res) => {
    const {songId} = req.params
    const comment = await Comment.scope([{method: ['songScopeComment', songId]}]).findAll(
       { include: [ { model: User }]
    });

    if (comment) {
      return res.json({"Comments": comment})
    }
  });

router.delete('/:songId', requireAuth, async (req, res, next) => {
    //check req.user.id so that user is the correct user of song compare req.user.id w/ songs user.id
    // query for song and if you can find, .destroy it (await *quweryname*.destroy())
        const userId = req.user.id;
        const song = await Song.findByPk(req.params.songId);

        if (userId !== song.userId) {
            const err = new Error("You don't own this song");
                err.status = 403;
                return next(err);
        }
        if (song) {
            await song.destroy();
        }
        await song.save();
        res.json(song);
    })


module.exports = router;
