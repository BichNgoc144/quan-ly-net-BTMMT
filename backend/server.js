const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('./db');
const User = require('./models/User');
const Machine = require('./models/Machine');

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

// Đăng ký
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).send('Email already exists');

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashed });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).send('Invalid email or password');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid email or password');

        const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).send('Login error');
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

// Khởi động server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
