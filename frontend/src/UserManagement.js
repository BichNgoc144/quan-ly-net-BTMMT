import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Lấy danh sách người dùng
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setUsers(response.data);  // Cập nhật danh sách người dùng
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
        }
    };

    // Cập nhật trạng thái người dùng
    const updateStatus = async (userId, status) => {
        try {
            await axios.put(`/api/users/${userId}/status`, { status }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            fetchUsers();  // Tải lại danh sách người dùng sau khi cập nhật trạng thái
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        }
    };

    // Lấy chi tiết người dùng
    const viewUserDetails = (userId) => {
        setSelectedUserId(userId);
    };

    useEffect(() => {
        fetchUsers();  // Lấy danh sách người dùng khi trang được tải
    }, []);

    return (
        <div>
            <h3>Danh Sách Người Dùng</h3>
            <table>
                <thead>
                    <tr>
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số dư</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>{user.balance} đ</td>
                            <td>
                                {user.status === 'active' ? (
                                    <span style={{ color: 'green' }}>Hoạt động</span>
                                ) : (
                                    <span style={{ color: 'red' }}>Khóa</span>
                                )}
                            </td>
                            <td>
                                <button onClick={() => updateStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}>
                                    {user.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                                </button>
                                <button onClick={() => viewUserDetails(user.id)}>Chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedUserId && <UserDetails userId={selectedUserId} />}
        </div>
    );
};

// Component để xem chi tiết người dùng
const UserDetails = ({ userId }) => {
    const [userDetails, setUserDetails] = useState(null);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setUserDetails(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết người dùng:', error);
        }
    };

    useEffect(() => {
        fetchUserDetails();  // Lấy chi tiết người dùng khi component được tải
    }, [userId]);

    return (
        <div>
            {userDetails ? (
                <div>
                    <h4>Chi tiết người dùng</h4>
                    <p>Tên đăng nhập: {userDetails.username}</p>
                    <p>Họ tên: {userDetails.fullName}</p>
                    <p>Email: {userDetails.email}</p>
                    <p>Số dư: {userDetails.balance} đ</p>
                    <p>Trạng thái: {userDetails.status === 'active' ? 'Hoạt động' : 'Khóa'}</p>
                </div>
            ) : (
                <p>Đang tải dữ liệu người dùng...</p>
            )}
        </div>
    );
};

export default UserManagement;
