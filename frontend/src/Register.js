import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ toggleForm }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        // Kiểm tra mật khẩu khớp
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp');
            setSuccess('');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                email,
                password,
                role: 'user' // Tất cả đăng ký là user
            });

            setSuccess('Đăng ký thành công! Chuyển sang trang đăng nhập...');
            setError('');
            setTimeout(() => {
                toggleForm();
            }, 2000);
        } catch (err) {
            const message = err.response?.data?.message || 'Đăng ký thất bại';
            setError(message);
            setSuccess('');
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '400px' }}>
            <h3 className="mb-3 text-center">Đăng ký tài khoản</h3>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleRegister}>
                <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Mật khẩu:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Nhập lại mật khẩu:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">Tạo tài khoản</button>
            </form>

            <p className="text-center mt-3">
                Đã có tài khoản?{' '}
                <button onClick={toggleForm} className="btn btn-link p-0">Đăng nhập</button>
            </p>
        </div>
    );
};

export default Register;
