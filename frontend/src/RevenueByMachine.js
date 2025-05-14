import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RevenueByMachine = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchRevenueByMachine = async () => {
        try {
            const response = await axios.get(`/api/revenue-by-machine?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`  // Thêm token vào header nếu cần
                }
            });
            setRevenueData(response.data.revenueByMachine);
            setDataLoaded(true);
        } catch (error) {
            console.error('Lỗi khi tải doanh thu theo máy:', error);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchRevenueByMachine();
        }
    }, [startDate, endDate]);

    return (
        <div>
            <h3>Báo Cáo Doanh Thu Theo Máy</h3>
            <div>
                <label>
                    Từ ngày:
                    <input type="date" onChange={e => setStartDate(e.target.value)} />
                </label>
                <label>
                    Đến ngày:
                    <input type="date" onChange={e => setEndDate(e.target.value)} />
                </label>
                <button onClick={fetchRevenueByMachine}>Lọc</button>
            </div>

            <div>
                {dataLoaded ? (
                    <div>
                        <h4>Doanh thu từ {startDate} đến {endDate}:</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã máy</th>
                                    <th>Tên máy</th>
                                    <th>Tổng giờ sử dụng</th>
                                    <th>Số phiên</th>
                                    <th>Tổng doanh thu</th>
                                    <th>Trung bình/giờ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.map((machine) => (
                                    <tr key={machine.machine_id}>
                                        <td>{machine.machine_id}</td>
                                        <td>{machine.Machine.name}</td>
                                        <td>{machine.totalHours} giờ</td>
                                        <td>{machine.totalSessions}</td>
                                        <td>{machine.totalRevenue} đ</td>
                                        <td>{machine.avgRevenuePerHour} đ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>Chưa có dữ liệu</p>
                )}
            </div>
        </div>
    );
};

export default RevenueByMachine;
