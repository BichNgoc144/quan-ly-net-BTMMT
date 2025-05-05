// App.js
import React, { useEffect, useState } from 'react';
import Login from './Login';
import Register from './Register';
import LandingPage from './LandingPage';
import MachineManager from './MachineManager';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showManageMachines, setShowManageMachines] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            setIsAuthenticated(true);
            setUser({ role });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUser(null);
        setShowLogin(false);
        setShowRegister(false);
        setShowManageMachines(false);
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
                    {isAuthenticated && user?.role === 'admin' && (
                        <button className="btn btn-outline-light" onClick={() => setShowManageMachines(true)}>
                            Quản lý máy
                        </button>
                    )}
                    
        <d          iv className="ms-auto d-flex gap-2">
                    {!isAuthenticated ? (
                        <>
                            <button className="btn btn-outline-light" onClick={toggleLogin}>Đăng nhập</button>
                            <button className="btn btn-outline-light" onClick={toggleRegister}>Đăng ký</button>
                        </>
                    ) : (
                        <button className="btn btn-danger" onClick={handleLogout}>Đăng xuất</button>
                    )}
                </div>
            </nav>

            <div className="container mt-4">
                {!isAuthenticated ? (
                    <>
                        {showLogin && <Login toggleForm={toggleRegister} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />}
                        {showRegister && <Register toggleForm={toggleLogin} />}
                        {!showLogin && !showRegister && (
                            <LandingPage />
                        )}
                    </>
                ) : (
                    user?.role === 'admin' && showManageMachines ? (
                        <MachineManager />
                    ) : (
                        <LandingPage />
                    )
                )}
            </div>
        </div>
    );
}

export default App;