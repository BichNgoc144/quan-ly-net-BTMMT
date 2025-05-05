import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ toggleForm, setIsAuthenticated, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        axios.post('http://localhost:5000/api/login', { email, password })
            .then(response => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                setIsAuthenticated(true);
                setUser({ role: response.data.role });
                setError('');
            })
            .catch(error => {
                setError('Invalid email or password');
            });
    };

    return (
        <>
            {/* Hình nền toàn màn hình */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url(https://khoinguonsangtao.vn/wp-content/uploads/2021/12/hinh-nen-may-tinh-4k-game-lien-minh.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: -1
            }} />

            {/* Form đăng nhập */}
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="card p-4 shadow" style={{ width: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <h3 className="text-center mb-4">Đăng nhập</h3>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
                    </form>
                    <p className="text-center mt-3">
                        Chưa có tài khoản?{' '}
                        <button className="btn btn-link p-0" onClick={toggleForm}>
                            Đăng ký
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;
