const express = require("express");
const { User, Song, Album, PlaylistSong, Comment, Playlist } = require('../../db/models')
const router = express.Router();
const { requireAuth, restoreSession, restoreUser } = require('../../utils/auth');
const { Model } = require("sequelize");
const playlists = require("../../db/models/playlists");
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const user = require("../../db/models/user");

const validatePlaylist = [
    check('name')
        .exists({ checkFalsey: true })
        .withMessage('Playlist name is required'),
    handleValidationErrors
];

//create a playlist
router.post('/', requireAuth, validatePlaylist, async (req, res) => {
    const { name, imageUrl } = req.body;
    const { user } = req;
    const createPlaylist = await Playlist.create({
        userId: user.id,
        name: name,
        previewImage: imageUrl,
    });
    return res.json(createPlaylist)
});

//get all playlist by current user
router.get('/current', requireAuth, async (req, res) => {
    const currPlaylist = await Playlist.findAll({
        where: { userId: req.user.id },
    });

    if (currPlaylist) {
        return res.json({ 'Playlists': currPlaylist })
    }

    if (!currPlaylist) {
        const e = new Error('Playlist not found');
        e.status = 404;
        return next(e);
    }

    if (currPlaylist.userId !== user.id) {
        const e = new Error('You do not have permission');
        e.status = 403;
        return next(e);
    }
});

//add a song to playlist based on id
router.post("/:playlistId/songs", requireAuth, async (req, res, next) => {
    const { playlistId } = req.params;
    const { songId } = req.body;
    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) {
      const e = new Error('Playlist not found');
      e.status = 404;
      return next(e);
    }
    const song = await Song.findByPk(songId);
    if (!song) {
        const e = new Error('Song not found');
        e.status = 404;
        return next(e);
    }
    return res.json(await PlaylistSong.create({ playlistId, songId }));
  });

//get details of a playlist by id
router.get('/:playlistId', async (req, res, next) => {
    const { playlistId } = req.params;
    const playlist = await PlaylistSong.findOne({
        where: {
            playlistId
        }
    });

    if (playlist) {
        const playlistSongs = await Playlist.findOne({
            where: {
                id: playlist.playlistId
            },
            include: {
                model: Song,
                through: { attributes: [] }
            }
        });
        return res.json(playlistSongs)
    } else {
        if (!playlist) {
            const e = new Error('Playlist not found');
            e.status = 404;
            return next(e);
        }
    }
});

//edit a playlist
router.put('/:playlistId', requireAuth, validatePlaylist, async (req, res, next) => {
    const { playlistId } = req.params;
    const { body } = req.body;
    const playlist = await Playlist.findByPk(playlistId);
    if (playlist) {
        await playlist.update({ ...body });
        return res.json(playlist)
    } else {
        const e = new Error('Playlist not found');
        e.status = 404;
        return next(e);
    }
});


router.delete('/:playlistId', requireAuth, restoreUser, async (req, res, next) => {
    //check req.user.id so that user is the correct user of song compare req.user.id w/ songs user.id
    // query for song and if you can find, .destroy it (await *quweryname*.destroy())
        const userId = req.user.id;
        const { playlistId } = req.params;
        const playlist = await Playlist.findByPk(playlistId);

        if (playlist) {
            if (userId !== playlist.userId) {
                const err = new Error("You don't own this song");
                    err.status = 403;
                    return next(err);
            }
            await playlist.destroy();
        }
        await playlist.save();
        res.json(playlist);
    })









module.exports = router;
