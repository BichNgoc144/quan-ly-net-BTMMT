module.exports = (sequelize, DataTypes) => {
    const UserRevenue = sequelize.define('UserRevenue', {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users', // Liên kết với bảng Users
                key: 'id',
            },
            onDelete: 'CASCADE', // Xóa doanh thu nếu người dùng bị xóa
        },
        revenue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY, // Lưu ngày
            allowNull: false,
        },
    });

    // Định nghĩa mối quan hệ giữa UserRevenue và Users
    UserRevenue.associate = function (models) {
        UserRevenue.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return UserRevenue;
};
