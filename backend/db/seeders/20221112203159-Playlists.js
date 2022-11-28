'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Playlists', [{
      id: 1,
      userId: 1,
      name: "Her Loss Playlist",
      previewImage: 'image_Her_Loss',
    },
    {
      id: 2,
      userId: 2,
      name: "Indigo Playlist",
      previewImage: 'image_Indigo'
    }
    ], {});

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Playlists', null, {});

  }
};
