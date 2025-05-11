const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('./db');
const User = require('./models/User');
const Machine = require('./models/Machine');
const Deposit = require('./models/Deposit');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Khởi tạo & đồng bộ CSDL
sequelize.sync({ alter: true }).then(async () => {
    console.log('✅ Database synced with MySQL');

    // Tạo admin nếu chưa tồn tại
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin@123', 10);
        await User.create({
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
        });
        console.log('🔐 Admin mặc định đã được tạo');
    }
});

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(403).send('Access denied');

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};

sequelize.authenticate().then(() => {
    console.log('✅ Kết nối DB thành công');
}).catch(err => {
    console.error('❌ Lỗi kết nối DB:', err);
    process.exit(1); // dừng server nếu kết nối DB lỗi
});


// Đăng ký
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).send('Email already exists');

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashed, role: 'user' });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

// Đăng nhập (Sửa để luôn trả đúng id)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });
        res.json({ token, role: user.role, id: user.id });
    } catch (err) {
        console.error('🔥 Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Login error', error: err.message });
    }
});

// GET danh sách máy (admin)
app.get('/api/machines', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    const machines = await Machine.findAll();
    res.json(machines);
});

// POST thêm máy
app.post('/api/machines', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');

    const { name, status, price } = req.body;
    if (!name || !status || !price) return res.status(400).send('Missing data');

    try {
        const newMachine = await Machine.create({ name, status, price });
        res.status(201).json(newMachine);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating machine');
    }
});

// DELETE xoá máy
app.delete('/api/machines/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');

    const id = req.params.id;
    await Machine.destroy({ where: { id } });
    res.status(204).send();
});

// API nạp tiền và lưu lịch sử
app.post('/api/users/:id/deposit', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { amount } = req.body;

    if (!amount || amount <= 0 || isNaN(userId)) {
        return res.status(400).json({ message: 'Số tiền hoặc userId không hợp lệ' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        await User.increment('balance', { by: amount, where: { id: userId } });
        await Deposit.create({ user_id: userId, amount });

        res.json({ message: `✅ Nạp ${amount} VNĐ thành công` });
    } catch (error) {
        console.error('🔥 Lỗi server khi nạp tiền:', error);
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
});

// API lấy lịch sử nạp tiền
app.get('/api/users/:id/deposits', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: 'userId không hợp lệ' });

    try {
        const deposits = await Deposit.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        res.json(deposits);
    } catch (error) {
        console.error('❌ Lỗi khi lấy lịch sử nạp tiền:', error);
        res.status(500).json({ message: 'Lỗi khi truy vấn dữ liệu' });
    }
});

// Sử dụng máy – trừ tiền nếu đủ
app.post('/api/use-machine', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const cost = 5000;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.balance < cost) {
            return res.status(403).json({ message: 'Insufficient balance' });
        }

        await User.update(
            { balance: user.balance - cost },
            { where: { id: userId } }
        );

        res.json({ message: `Máy đã được sử dụng. Trừ ${cost} VNĐ.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', err });
    }
});

// ✅ API lấy thông tin người dùng (bao gồm balance)
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            balance: user.balance
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user data', error: err.message });
    }
});


// Khởi động server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
