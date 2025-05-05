import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ toggleForm }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // Gửi yêu cầu đăng nhập đến backend
        axios.post('http://localhost:5000/api/login', { email, password })
            .then(response => {
                // Lưu JWT token vào localStorage sau khi đăng nhập thành công
                localStorage.setItem('token', response.data.token);
                setError('');
                // Chuyển hướng sau khi đăng nhập thành công
                window.location.href = '/'; // Điều hướng về trang chính sau khi đăng nhập
            })
            .catch(error => {
                setError('Invalid email or password');
            });
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Login</button>
            </form>
            {error && <p>{error}</p>} {/* Hiển thị lỗi nếu có */}
            <p>
                Don't have an account? <button onClick={toggleForm}>Register</button>
            </p>
        </div>
    );
};

export default Login;
