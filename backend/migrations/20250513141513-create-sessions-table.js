module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('sessions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users', // Liên kết với bảng 'users'
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            start_time: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            end_time: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'in-progress',
            },
            cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('sessions');
    }
};
