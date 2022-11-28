'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {

    static associate(models) {
      Comment.belongsTo(models.Song, {
        foreignKey: "songId"
      });
      Comment.belongsTo(models.User, {
        foreignKey: "userId"
      });
    }
  }
  Comment.init({
    songId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    body: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Comment',
    scopes: {
      songScopeComment(songId) {
        const { User } = require('../models')
        return {
          where: {
            songId: songId,
          },
        }
      }
    }
  });
  return Comment;
};
