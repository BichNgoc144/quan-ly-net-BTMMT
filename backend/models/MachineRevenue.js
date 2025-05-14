module.exports = (sequelize, DataTypes) => {
    const MachineRevenue = sequelize.define('MachineRevenue', {
        machine_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Machines', // Liên kết với bảng Machines
                key: 'id',
            },
            onDelete: 'CASCADE',  // Xóa doanh thu nếu máy bị xóa
        },
        date: {
            type: DataTypes.DATEONLY,  // Chỉ lưu ngày, không lưu giờ
            allowNull: false,
        },
        revenue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    });

    // Định nghĩa mối quan hệ giữa MachineRevenue và Machine
    MachineRevenue.associate = function (models) {
        // MachineRevenue liên kết với Machine
        MachineRevenue.belongsTo(models.Machine, { foreignKey: 'machine_id' });
    };

    return MachineRevenue;
};
