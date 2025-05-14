const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('./db');
const User = require('./models/User');
const Machine = require('./models/Machine');
const Deposit = require('./models/Deposit');
const Session = require('./models/Session');
const { Sequelize } = require('sequelize');
const MachineRevenue = require('./models/MachineRevenue'); 
const UserRevenue = require('./models/UserRevenue'); 





const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Khởi tạo & đồng bộ CSDL
sequelize.sync({ alter : true }).then(async () => {
    console.log('✅ Database synced with MySQL');

    // Tạo admin nếu chưa tồn tại
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    console.log('User Model:', User);  // Kiểm tra xem User có phải là một function (Sequelize model) không

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin@123', 10);
        await User.create({
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
        });
        console.log('🔐 Admin mặc định đã được tạo');
    }
}).catch((err) => {
    console.error('❌ Error syncing database:', err);
    process.exit(1);  // Dừng server nếu có lỗi
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

sequelize.sync({ alter: true }).then(() => {
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
app.get('/api/machines/admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    const machines = await Machine.findAll();
    res.json(machines);
});

// API lấy danh sách máy cho user
app.get('/api/machines/user', authenticateToken, async (req, res) => {
    if (req.user.role === 'admin') {
        return res.status(403).send('Access denied');  // Nếu là admin, từ chối truy cập
    }
    try {
        // Lấy tất cả các máy từ cơ sở dữ liệu
        const machines = await Machine.findAll();
        if (!machines || machines.length === 0) {
            return res.status(404).json({ message: 'Không có máy nào trong hệ thống' });
        }
        // Trả về danh sách máy
        res.json(machines);
    } catch (err) {
        console.error('❌ Lỗi khi lấy danh sách máy:', err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách máy', error: err.message });
    }
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

// API bắt đầu phiên sử dụng máy
app.post('/api/start-session', authenticateToken, async (req, res) => {
    console.log("User info:", req.user); 
    const userId = req.user.id;
    const { machineId } = req.body;  // ID máy được chọn

    console.log('Session Model:', Session);  // Kiểm tra xem Session có đúng là một function không
    console.log("Data received:", req.user.id);

    console.log("Data received:", req.body);


    try {
        // Kiểm tra người dùng có tồn tại không
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Lấy giá của máy từ bảng 'machines'
        const machine = await Machine.findByPk(machineId);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });

        const costPerHour = machine.price;  // Lấy giá máy
        console.log(Session);  // Kiểm tra xem Session có phải là một function (mô hình Sequelize) không


        // Tạo phiên sử dụng mới với trạng thái "in-progress"
        const newSession = await Session.create({
            user_id: userId,
            machine_id: machineId,  // Lưu ID máy vào phiên
            start_time: new Date(),
            status: 'in-progress',
            cost: 0  // Mặc định là trừ 0 khi bắt đầu phiên
        });

        // Cập nhật trạng thái của máy sau khi tạo phiên
        await machine.update({ status: 'in-use' });


        console.log('Session model:', Session);


        res.json({ message: 'Phiên sử dụng đã bắt đầu', sessionId: newSession.id, costPerHour });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', err });
    }
});

// API kết thúc phiên sử dụng máy và tính tiền
app.post('/api/end-session', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.body;  // ID phiên sử dụng

    const transaction = await sequelize.transaction(); // Bắt đầu giao dịch

    try {
        // Kiểm tra người dùng có tồn tại không
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Tìm phiên sử dụng
        const session = await Session.findByPk(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.status === 'completed') return res.status(400).json({ message: 'Session đã kết thúc rồi' });

        // Lấy giá của máy từ bảng 'machines'
        const machine = await Machine.findByPk(session.machine_id);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });

        const costPerHour = machine.price;  // Lấy giá máy

        // Tính thời gian sử dụng và chi phí
        const endTime = new Date();
        const startTime = new Date(session.start_time);
        const durationInMinutes = Math.ceil((endTime - startTime) / (1000 * 60));  // Tính thời gian theo phút
        const durationInHours = Math.ceil(durationInMinutes / 60);  // Chuyển đổi phút thành giờ

        const cost = durationInHours * costPerHour;  // Tính chi phí dựa trên giờ

        // Cập nhật phiên với thời gian kết thúc và chi phí
        await Session.update(
            { end_time: endTime, status: 'completed', cost },
            { where: { id: sessionId }, transaction }
        );

        // Cập nhật số dư người dùng
        if (user.balance < cost) {
            return res.status(403).json({ message: 'Không đủ tiền để thanh toán' });
        }

        await User.update({ balance: user.balance - cost }, { where: { id: userId }, transaction });

        // Commit giao dịch
        await transaction.commit();

        res.json({ message: `Phiên sử dụng kết thúc. Bạn đã bị trừ ${cost} VNĐ.` });
    } catch (err) {
        // Nếu có lỗi, rollback giao dịch
        await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error', err });
    }
});




// API lấy lịch sử phiên sử dụng
app.get('/api/users/:id/sessions', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);  // Lấy ID người dùng từ params

    try {
        // Kiểm tra người dùng có tồn tại không
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Lấy lịch sử các phiên sử dụng của người dùng
        const sessions = await Session.findAll({
            where: { user_id: userId },
            order: [['start_time', 'DESC']],  // Sắp xếp theo thời gian bắt đầu (mới nhất lên đầu)
        });

        if (sessions.length === 0) {
            return res.status(404).json({ message: 'Không có phiên sử dụng nào' });
        }

        res.json(sessions);  // Trả về danh sách các phiên
    } catch (err) {
        console.error('Lỗi tạo session:', err);  // Ghi log chi tiết lỗi
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// API lấy danh sách máy (user)
app.get('/api/machines', authenticateToken, async (req, res) => {
    if (req.user.role === 'admin') return res.status(403).send('Access denied');  // Kiểm tra quyền admin
    try {
        // Lấy tất cả các máy từ cơ sở dữ liệu
        const machines = await Machine.findAll();
        if (!machines || machines.length === 0) {
            return res.status(404).json({ message: 'Không có máy nào trong hệ thống' });
        }
        // Trả về danh sách máy
        res.json(machines);
    } catch (err) {
        console.error('❌ Lỗi khi lấy danh sách máy:', err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách máy', error: err.message });
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

const { Op } = require('sequelize');

// API thống kê doanh thu theo thời gian
app.get('/api/revenue', authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Thiếu tham số thời gian' });
    }

    try {
        // Lấy doanh thu trong khoảng thời gian từ startDate đến endDate
        const revenueData = await Deposit.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
            ],
            where: {
                created_at: {
                    [Op.gte]: new Date(startDate), // Lọc theo ngày bắt đầu
                    [Op.lte]: new Date(endDate),   // Lọc theo ngày kết thúc
                }
            },
            group: ['date'],
            order: [['date', 'ASC']],
        });

        // Tính tổng doanh thu
        const totalRevenue = revenueData.reduce((acc, data) => acc + parseFloat(data.amount), 0);

        res.json({
            totalRevenue,
            revenueData: revenueData.map(item => ({
                date: item.date,
                amount: item.amount,
            })),
        });
    } catch (error) {
        console.error('Lỗi khi thống kê doanh thu:', error);
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
});

app.get('/api/revenue-by-machine', authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Thiếu tham số thời gian' });
    }

    try {
        // Lấy thông tin doanh thu theo máy trong khoảng thời gian
        const revenueByMachine = await Session.findAll({
            attributes: [
                'machine_id',
                [sequelize.fn('SUM', sequelize.col('cost')), 'totalRevenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
                [sequelize.fn('SUM', sequelize.col('duration')), 'totalHours'],
                [sequelize.fn('AVG', sequelize.col('cost')), 'avgRevenuePerHour']
            ],
            include: [
                {
                    model: Machine,
                    attributes: ['name'],
                },
            ],
            where: {
                start_time: {
                    [Op.gte]: new Date(startDate),
                    [Op.lte]: new Date(endDate),
                },
            },
            group: ['machine_id'],
            order: [['totalRevenue', 'DESC']], // Sắp xếp theo doanh thu cao nhất
        });

        // Trả về doanh thu theo máy
        res.json({
            revenueByMachine,
            totalRevenue: revenueByMachine.reduce((acc, item) => acc + parseFloat(item.totalRevenue), 0),
        });
    } catch (error) {
        console.error('Lỗi khi thống kê doanh thu theo máy:', error);
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
});

// API lấy danh sách người dùng
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Lấy tất cả người dùng từ cơ sở dữ liệu
        const users = await User.findAll();
        res.json(users); // Trả về danh sách người dùng
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
});

// API cập nhật trạng thái người dùng
app.put('/api/users/:id/status', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const { status } = req.body; // Nhận trạng thái từ request body (hoạt động/khóa)

    try {
        // Cập nhật trạng thái người dùng
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = status;  // Cập nhật trạng thái
        await user.save();  // Lưu lại thay đổi

        res.json({ message: `Trạng thái người dùng đã được cập nhật thành ${status}` });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
});

// API lấy chi tiết người dùng
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    try {
        // Tìm người dùng theo ID
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);  // Trả về thông tin chi tiết người dùng
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết người dùng:', error);
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
});


// Khởi động server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
