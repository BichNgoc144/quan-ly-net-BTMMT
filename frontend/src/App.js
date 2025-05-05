import React, { useEffect, useState } from 'react';
import Login from './Login';
import Register from './Register';
import RoomList from './RoomList';
import LandingPage from './LandingPage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setShowLogin(false);
        setShowRegister(false);
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
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
                <span className="navbar-brand">Không chơi Net đời không nể</span>
                <div className="ms-auto">
                    {!isAuthenticated ? (
                        <>
                            <button className="btn btn-outline-light me-2" onClick={toggleLogin}>Đăng nhập</button>
                            <button className="btn btn-outline-light" onClick={toggleRegister}>Đăng ký</button>
                        </>
                    ) : (
                        <button className="btn btn-danger" onClick={handleLogout}>Đăng xuất</button>
                    )}
                </div>
            </nav>

            {/* Nội dung */}
            <div className="container mt-4">
                {!isAuthenticated ? (
                    <>
                        {showLogin && <Login toggleForm={toggleRegister} />}
                        {showRegister && <Register toggleForm={toggleLogin} />}
                        {!showLogin && !showRegister && <LandingPage />}
                    </>
                ) : (
                    <RoomList />
                )}
            </div>
        </div>
    );
}

export default App;
