const express = require("express");
const { User, Song, Album, Playlist, Comment } = require('../../db/models')
const router = express.Router();
const { requireAuth, restoreSession, restoreUser } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Model } = require("sequelize");
const app = require ('../../app')

const validateComment = [
    check('body')
      .exists({ checkFalsy: true })
      .withMessage('Body is required'),
    handleValidationErrors
  ];

// edit a comment
router.put('/:commentId', requireAuth, async (req, res, next) => {
    const { commentId } = req.params;
    const { body } = req.body;
    const editComment = await Comment.findByPk(commentId);

    if (editComment) {
        await editComment.update({ ...body });
        return res.json(editComment)
    } else {
        const e = new Error('Comment not found');
        e.status = 404;
        return next(e);
    }
});

//delete a comment
router.delete('/:userId', requireAuth, async (req, res, next) => {

    const userId = req.user.id;
    const comment = await Comment.findByPk(req.params.userId);

    if (userId !== comment.userId) {
        const err = new Error("You don't own this comment");
            err.status = 403;
            return next(err);
    }

    if (comment) {
        await comment.destroy();
    }

    await comment.save();
    res.json(comment);
})











module.exports = router;
