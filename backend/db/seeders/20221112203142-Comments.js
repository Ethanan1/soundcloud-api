'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Comments', [{
      id: 1,
      songId: 1,
      userId: 1,
      body: 'Cool!!!!',
    },
  {
    id: 2,
    songId: 2,
    userId: 2,
    body: 'Its okay',
  }], {});

  },

  async down(queryInterface, Sequelize) {

     await queryInterface.bulkDelete('People', null, {});

  }
};
