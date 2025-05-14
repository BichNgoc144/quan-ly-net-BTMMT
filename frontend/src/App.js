import React, { useEffect, useState } from 'react';
import Login from './Login';
import Register from './Register';
import LandingPage from './LandingPage';
import MachineManager from './MachineManager';
import Deposit from './Deposit';
import UseMachine from './UseMachine';
import SatictisTime from './SatictisTime';
import RevenueByMachine from './RevenueByMachine';
import UserManagement from './UserManagement';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showManageMachines, setShowManageMachines] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('home');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('id');

        if (token && role && id) {
            setIsAuthenticated(true);
            setUser({ id, role });

            fetch(`http://localhost:5000/api/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.balance !== undefined) {
                        setBalance(data.balance);
                    }
                });
        }
    }, [currentScreen]);

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
        setShowLogin(false);
        setShowRegister(false);
        setShowManageMachines(false);
        setCurrentScreen('home');
    };

    const toggleLogin = () => {
        setShowLogin(true);
        setShowRegister(false);
    };

    const toggleRegister = () => {
        setShowRegister(true);
        setShowLogin(false);
    };

    return (
        <div className="App">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
                <div className="d-flex align-items-center w-100">
                    <span className="navbar-brand">NetZone</span>

                    {/* Admin Buttons */}
                    {isAuthenticated && user?.role === 'admin' && (
                        <>
                            <button
                                className="btn btn-outline-light ms-2"
                                onClick={() => setShowManageMachines(true)}
                            >
                                Quản lý máy
                            </button>
                            <button
                                className="btn btn-outline-light ms-2"
                                onClick={() => setCurrentScreen('manageTime')}
                            >
                                Thống kê thời gian
                            </button>
                            <button
                                className="btn btn-outline-light ms-2"
                                onClick={() => setCurrentScreen('revenueByMachine')}
                            >
                                Doanh thu theo máy
                            </button>
                            <button
                                className="btn btn-outline-light ms-2"
                                onClick={() => setCurrentScreen('userManagement')}
                            >
                                Quản lý người dùng
                            </button>
                        </>
                    )}

                    {/* User Buttons */}
                    {isAuthenticated && user?.role === 'user' && (
                        <>
                            <button
                                className="btn btn-outline-light ms-2"
                                onClick={() => setCurrentScreen('useMachine')}
                            >
                                Sử dụng máy
                            </button>
                            <button
                                className="btn btn-outline-light ms-2"
                                onClick={() => setCurrentScreen('deposit')}
                            >
                                Nạp tiền
                            </button>
                        </>
                    )}

                    <div className="ms-auto d-flex gap-2">
                        {!isAuthenticated ? (
                            <>
                                <button className="btn btn-outline-light" onClick={toggleLogin}>Đăng nhập</button>
                                <button className="btn btn-outline-light" onClick={toggleRegister}>Đăng ký</button>
                            </>
                        ) : (
                            <button className="btn btn-danger" onClick={handleLogout}>Đăng xuất</button>
                        )}
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                {!isAuthenticated ? (
                    <>
                        {showLogin && (
                            <Login
                                toggleForm={toggleRegister}
                                setUser={setUser}
                                setIsAuthenticated={setIsAuthenticated}
                                setCurrentScreen={setCurrentScreen}
                            />
                        )}
                        {showRegister && <Register toggleForm={toggleLogin} />}
                        {!showLogin && !showRegister && <LandingPage />}
                    </>
                ) : user?.role === 'admin' ? (
                    <>
                        {currentScreen === 'manageTime' && <SatictisTime />}
                        {currentScreen === 'revenueByMachine' && <RevenueByMachine />}
                        {currentScreen === 'userManagement' && <UserManagement />}
                        {showManageMachines && <MachineManager />}
                    </>
                ) : user?.role === 'user' ? (
                    <>
                        {currentScreen === 'home' && <LandingPage />}
                        {currentScreen === 'deposit' && (
                            <Deposit userId={user.id} setBalance={setBalance} setCurrentScreen={setCurrentScreen} />
                        )}
                        {currentScreen === 'useMachine' && (
                            <>
                                <p className="text-muted">💰 Số dư hiện tại: {balance.toLocaleString()} VNĐ</p>
                                {balance < 5000 ? (
                                    <>
                                        <p className="text-danger">Bạn không đủ tiền để sử dụng máy. Vui lòng nạp tiền.</p>
                                        <button className="btn btn-success" onClick={() => setCurrentScreen('deposit')}>
                                            👉 Chuyển đến trang Nạp tiền
                                        </button>
                                    </>
                                ) : (
                                    <UseMachine token={localStorage.getItem('token')} />
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <LandingPage />
                )}
            </div>
        </div>
    );
}

export default App;
