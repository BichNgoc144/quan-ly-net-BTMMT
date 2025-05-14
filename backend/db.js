const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('netzone', 'root', 'susu14042005', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Kết nối cơ sở dữ liệu thành công!');
  })
  .catch(err => {
    console.error('❌ Không thể kết nối đến cơ sở dữ liệu:', err);
    process.exit(1);  // Dừng server nếu có lỗi kết nối
  });

module.exports = sequelize;
