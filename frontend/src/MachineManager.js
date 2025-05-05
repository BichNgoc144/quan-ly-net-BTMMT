// MachineManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MachineManager = () => {
    const [machines, setMachines] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', status: 'available', price: '', specs: '' });
    const [editing, setEditing] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchMachines();
    }, []);

    const fetchMachines = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/machines', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMachines(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách máy:', err);
        }
    };

    const handleCreateOrUpdate = async () => {
        if (!form.name || !form.price) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        try {
            if (editing) {
                await axios.put(`http://localhost:5000/api/machines/${form.id}`, {
                    name: form.name,
                    status: form.status,
                    price: parseFloat(form.price),
                    specs: form.specs
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/machines', {
                    name: form.name,
                    status: form.status,
                    price: parseFloat(form.price),
                    specs: form.specs
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setForm({ id: null, name: '', status: 'available', price: '', specs: '' });
            setEditing(false);
            setFormVisible(false);
            fetchMachines();
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert('Lỗi khi lưu máy. Kiểm tra lại thông tin hoặc kết nối backend!');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/machines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMachines();
        } catch (err) {
            console.error('Lỗi khi xoá máy:', err);
        }
    };

    const handleEdit = (machine) => {
        setForm({ ...machine });
        setEditing(true);
        setFormVisible(true);
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-start align-items-center mb-4">
                <h3 className="me-auto">Quản lý máy</h3>
                <button className="btn btn-primary" onClick={() => {
                    setFormVisible(!formVisible);
                    setForm({ id: null, name: '', status: 'available', price: '', specs: '' });
                    setEditing(false);
                }}>
                    {formVisible ? 'Ẩn thêm mới' : '➕ Thêm máy mới'}
                </button>
            </div>

            {formVisible && (
                <div className="card p-3 mb-4 shadow-sm">
                    <input
                        type="text"
                        placeholder="Tên máy"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="form-control mb-2"
                    />
                    <input
                        type="text"
                        placeholder="Cấu hình"
                        value={form.specs}
                        onChange={(e) => setForm({ ...form, specs: e.target.value })}
                        className="form-control mb-2"
                    />
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="form-control mb-2"
                    >
                        <option value="available">Sẵn sàng</option>
                        <option value="in-use">Đang sử dụng</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Giá chơi mỗi giờ"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="form-control mb-2"
                    />
                    <button className="btn btn-success" onClick={handleCreateOrUpdate}>
                        {editing ? 'Lưu chỉnh sửa' : 'Lưu máy'}
                    </button>
                </div>
            )}

            <ul className="list-group">
                {machines.map((m) => (
                    <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>ID {m.id}</strong> - <strong>{m.name}</strong> - {m.status} - {m.price} đ/h
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-warning btn-sm" onClick={() => handleEdit(m)}>✏️ Sửa</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑 Xoá</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MachineManager;
