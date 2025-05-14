import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UseMachine({ token }) {
    // State quản lý trạng thái loading và thông báo
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [machines, setMachines] = useState([]); // State để lưu danh sách máy
    const [selectedMachineId, setSelectedMachineId] = useState(null); // State để lưu ID máy được chọn

    useEffect(() => {
        console.log("👉 Token nhận được trong UseMachine:", token);

        // Lấy danh sách máy từ API khi component được load
        const fetchMachines = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/machines/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMachines(res.data);  // Lưu danh sách máy vào state
            } catch (err) {
                console.error("Lỗi khi lấy danh sách máy:", err);
                setError('Không thể lấy danh sách máy');
            }
        };

        fetchMachines();
    }, [token]);

    const handleUseMachine = async () => {

        if (!token) {
            setError("❌ Token không hợp lệ.");
            return;
        }

        if (!selectedMachineId) {
            setError("❌ Vui lòng chọn một máy.");
            return;
        }

        console.log("🟢 Bấm nút sử dụng máy");

        setLoading(true);
        setError(null); // Reset lỗi trước khi gọi API

        try {
            // Thực hiện yêu cầu API bắt đầu phiên sử dụng máy
            const res = await axios.post(
                'http://localhost:5000/api/start-session',
                {
                    machineId: selectedMachineId // Sử dụng ID máy được chọn
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token qua header
                    },
                }
            );

            alert(res.data.message || "✅ Đã sử dụng máy");
        } catch (err) {
            console.error("💥 Lỗi khi gọi API:", err);
            console.error("💥 Chi tiết lỗi:", err.response);

            // Kiểm tra xem lỗi có từ API trả về không
            const msg = err.response?.data?.message || "❌ Lỗi khi sử dụng máy. Vui lòng thử lại!";
            setError(msg);  // Lưu lỗi vào state để hiển thị cho người dùng
        } finally {
            setLoading(false); // Reset loading khi hoàn tất yêu cầu
        }
    };

    return (
        <div className="card p-3 mt-4">
            <h5 className="mb-3">🖥️ Sử dụng máy</h5>
            {error && <p className="text-danger">{error}</p>}  {/* Hiển thị lỗi nếu có */}

            <div className="form-group">
                <label htmlFor="machineSelect">Chọn máy:</label>
                <select
                    id="machineSelect"
                    className="form-control"
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                >
                    <option value="">Chọn một máy</option>
                    {machines.map((machine) => (
                        <option key={machine.id} value={machine.id}>
                            {machine.name} - {machine.status} - {machine.price}
                        </option>
                    ))}
                </select>
            </div>

            <button
                className="btn btn-primary mt-3"
                onClick={handleUseMachine}
                disabled={loading} // Disable button khi đang gọi API
            >
                {loading ? 'Đang xử lý...' : 'Bắt đầu sử dụng'}
            </button>
        </div>
    );
}

export default UseMachine;
