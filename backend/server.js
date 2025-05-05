const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

let rooms = [
    { id: 1, name: 'Room 1', available: true },
    { id: 2, name: 'Room 2', available: false },
    { id: 3, name: 'Room 3', available: true },
];

let users = [
    {
        id: 1,
        email: 'admin@example.com',
        password: '', // Mật khẩu sẽ được mã hóa khi server khởi động
        role: 'admin',
    }
];

// Mã hóa mật khẩu mới cho admin khi server khởi động
bcrypt.hash('admin@123', 10, (err, hash) => {
    if (err) throw err;

    // Cập nhật mật khẩu admin thành mật khẩu mới đã mã hóa
    users[0].password = hash; // users[0] là admin

    console.log('Mật khẩu admin mới đã được mã hóa:', users[0].password);  // In mật khẩu đã mã hóa vào console
});

// Xác thực JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    if (!token) {
        return res.status(403).send('Access denied');
    }

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) {
            return res.status(403).send('Invalid token');
        }
        req.user = user;
        next();
    });
};

// Đăng nhập và trả về JWT
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) {
        return res.status(400).send('Invalid email or password');
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Đăng ký người dùng mới (Mặc định là user)
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra nếu email đã tồn tại trong hệ thống
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
        return res.status(400).send('Email already exists');
    }

    // Mã hóa mật khẩu trước khi lưu
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;

        // Tạo tài khoản mới với vai trò mặc định là user
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            role: 'user',
        };

        users.push(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// API - GET Rooms
app.get('/api/rooms', authenticateToken, (req, res) => {
    res.json(rooms);
});

// API - POST Add a new room (Only Admin)
app.post('/api/rooms', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }

    const room = req.body;
    rooms.push(room);
    res.status(201).json(room);
});

// API - PUT Update room availability
app.put('/api/rooms/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const updatedRoom = req.body;
    rooms = rooms.map((room) => (room.id == id ? { ...room, ...updatedRoom } : room));
    res.json(updatedRoom);
});

// API - DELETE Room (Only Admin)
app.delete('/api/rooms/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }

    const { id } = req.params;
    rooms = rooms.filter((room) => room.id != id);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
