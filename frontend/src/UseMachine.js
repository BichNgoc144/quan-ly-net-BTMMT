// frontend/src/UseMachine.js
import React, { useEffect } from 'react';
import axios from 'axios';

function UseMachine({ token }) {
    useEffect(() => {
        console.log("👉 Token nhận được trong UseMachine:", token);
    }, [token]);

    const handleUseMachine = async () => {
        console.log("🟢 Bấm nút sử dụng máy");

        try {
            const res = await axios.post(
                'http://localhost:5000/api/use-machine',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(res.data.message || "✅ Đã sử dụng máy");
        } catch (err) {
            const msg = err.response?.data?.message || "❌ Lỗi khi sử dụng máy.";
            console.error("💥 Lỗi khi gọi API:", err);
            alert(msg);
        }
    };

    return (
        <div className="card p-3 mt-4">
            <h5 className="mb-3">🖥️ Sử dụng máy </h5>
            <button className="btn btn-primary" onClick={handleUseMachine}>
                Bắt đầu sử dụng
            </button>
        </div>
    );
}

export default UseMachine;
