const express = require("express");
const { User, Song, Album, Playlist, Comment } = require('../../db/models')
const router = express.Router();
const { requireAuth, restoreUser } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Model } = require("sequelize");
const app = require('../../app');

const validateAlbum = [
    check('title')
        .exists({ checkFalsey: true })
        .withMessage('Album title is required.'),
    check('description')
        .exists({ checkFalsey: true })
        .withMessage('Album description is required.'),
    check('imageUrl')
        .exists({ checkFalsey: true })
        .withMessage('Album imageUrl is required.'),
    handleValidationErrors
];

//return all albums
router.get('/', async (req, res) => {
    const albums = await Album.findAll()
    res.json({ Albums: albums })
})

// get all albums of current user
router.get('/current', requireAuth, async (req, res) => {
    const user = req.user.id;
    const currAlbums = await Album.findAll({
        where: {
            userId: user},
    });
    return res.json(currAlbums)
});

//get details of an album from id
router.get('/:albumId', async (req, res, next) => {
    const { albumId } = req.params;
    const album = await Album.findByPk(albumId, {
        include: [{
            model: User,
            as: 'Artist'
          }, {
            model: Song,
            as: 'Songs'
          }]
    });

    if (!album) {
        const e = new Error("Album couldn't be found");
        e.status = 404;
        return next(e)
    }
    return res.json(album)
});

//create an album
router.post('/', requireAuth, validateAlbum, async (req, res, next) => {
    const { title, description, imageUrl } = req.body;
    const { user } = req;

    const album = await Album.create({
        userId: user.id,
        title,
        description,
        previewImage: imageUrl,
    });
    return res.json(album)
});

//edit album
router.put('/:albumId', requireAuth, validateAlbum, async (req, res, next) => {
    const { albumId } = req.params;
    const album = await Album.findByPk(albumId);
    if (album) {
        await album.update({...req.body});
        return res.json(album)
    } else {
        const e = new Error("Album couldn't be found");
        e.status = 404;
        return next(e)
    }
})

//delete an album
router.delete('/:albumId', requireAuth, async (req, res, next) => {
    const userId = req.user.id;
    const album = await Album.findByPk(req.params.albumId);

    if (album) {
        if (userId !== album.userId) {
            const err = new Error("You don't own this album");
                err.status = 403;
                return next(err);
        }
        await album.destroy();
        res.json({
            Message: "Successfully deleted"
        });
    } else {
        const e = new Error('No album found')
        e.status = 404;
        return next(e);
    }

})


module.exports = router;
