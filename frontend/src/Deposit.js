import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Deposit({ setBalance, setCurrentScreen }) {
    const [amount, setAmount] = useState('');
    const [history, setHistory] = useState([]);
    const userId = Number(localStorage.getItem('id'));

    if (!userId || isNaN(userId)) {
        console.error("❌ Không lấy được userId hợp lệ từ localStorage");
    }

    const token = localStorage.getItem('token');

    const fetchHistory = async () => {
        if (!userId) {
            console.warn("⚠️ Không có userId để lấy lịch sử.");
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/users/${parseInt(userId)}/deposits`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setHistory(res.data || []);
        } catch (err) {
            console.error("❌ Lỗi khi lấy lịch sử:", err.response?.data || err.message || err);
        }
    };

    useEffect(() => {
        console.log("👉 userId nhận được trong Deposit:", userId);
        fetchHistory();
    }, [userId]);



    const handleDeposit = async () => {
        console.log("🟢 Bấm nút nạp tiền");
        const value = parseFloat(amount);
        const url = `http://localhost:5000/api/users/${userId}/deposit`;

        console.log("🧾 userId:", userId);
        console.log("🔗 Gọi tới URL:", url);
        if (!value || value <= 0) {
            alert("❗ Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:5000/api/users/${parseInt(userId)}/deposit`,
                { amount: value },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            alert(res.data.message || "✅ Nạp tiền thành công!");
            if (typeof setBalance === 'function') {
                const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (userRes.data.balance !== undefined) {
                    setBalance(userRes.data.balance); // ✅ cập nhật App
                    console.log("🟢 Balance mới sau nạp:", userRes.data.balance)
                    // ✅ Buộc App.js render lại để nhận balance mới
                    if (typeof setCurrentScreen === 'function') {
                        setCurrentScreen('home');
                        setTimeout(() => setCurrentScreen('useMachine'), 0);
                    }

                }
            }

            setAmount('');
            fetchHistory(); // cập nhật lại lịch sử
        } catch (err) {
            console.error("💥 Deposit error:", err.response?.data || err.message || err);
            alert(`❌ Lỗi khi nạp tiền: ${err.response?.data?.message || err.message || "Không rõ nguyên nhân"}`);
        }
    };


    return (
        <div className="card p-3 mt-4">
            <h5 className="mb-3">💰 Nạp tiền vào tài khoản</h5>
            <input
                type="number"
                className="form-control"
                placeholder="Nhập số tiền..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button className="btn btn-success mt-2" onClick={handleDeposit}>
                Nạp tiền
            </button>

            <hr />
            <h6>Lịch sử nạp tiền:</h6>
            <ul className="list-group">
                {history.length === 0 ? (
                    <li className="list-group-item">Chưa có lịch sử</li>
                ) : (
                    history.map(item => (
                        <li className="list-group-item" key={item.id}>
                            💸 {item.amount.toLocaleString()} VNĐ - 🕒 {new Date(item.created_at).toLocaleString()}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default Deposit;
