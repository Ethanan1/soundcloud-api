'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Songs', [{
      id: 1,
      albumId: 1,
      userId: 1,
      title: "Circo Loco",
      previewImage: 'image_Circo_Loco',
      url: "",
      description: "Track 1"
    },
    {
      id: 2,
      albumId: 2,
      userId: 2,
      title: "Under the Influence",
      previewImage: 'image_Under_the_Influence',
      description: "Track 2"
    }
  ], {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete('Songs', null, {});

  }
};
