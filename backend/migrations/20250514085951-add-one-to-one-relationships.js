module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm khóa ngoại cho user_id và machine_id trong bảng sessions
    await queryInterface.addConstraint('sessions', {
      fields: ['user_id'],
      type: 'foreign key',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('sessions', {
      fields: ['machine_id'],
      type: 'foreign key',
      references: {
        table: 'machines',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hủy các khóa ngoại nếu cần
    await queryInterface.removeConstraint('sessions', 'sessions_user_id_fkey');
    await queryInterface.removeConstraint('sessions', 'sessions_machine_id_fkey');
  }
};
