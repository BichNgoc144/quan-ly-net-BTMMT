import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';

const RevenueStats = () => {
    const [revenue, setRevenue] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Doanh thu',
                data: [],
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
        ],
    });

    const fetchRevenue = async () => {
        try {
            const response = await axios.get(`/api/revenue?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Thêm token vào header nếu cần
                }
            });
            setRevenue(response.data.totalRevenue);
            setDataLoaded(true);

            // Cập nhật dữ liệu cho biểu đồ
            const revenueData = response.data.revenueData || [];
            const dates = revenueData.map(item => item.date);
            const amounts = revenueData.map(item => item.amount);

            setChartData({
                labels: dates,
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: amounts,
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1,
                    },
                ],
            });
        } catch (error) {
            console.error('Lỗi khi tải doanh thu:', error);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchRevenue();
        }
    }, [startDate, endDate]);

    return (
        <div>
            <h3>Thống Kê Doanh Thu</h3>
            <div>
                <label>
                    Từ ngày:
                    <input type="date" onChange={e => setStartDate(e.target.value)} />
                </label>
                <label>
                    Đến ngày:
                    <input type="date" onChange={e => setEndDate(e.target.value)} />
                </label>
                <button onClick={fetchRevenue}>Lọc</button>
            </div>

            <div>
                {dataLoaded ? (
                    <div>
                        <h4>Doanh thu từ {startDate} đến {endDate}:</h4>
                        <p>{revenue} VND</p>
                    </div>
                ) : (
                    <p>Chưa có dữ liệu</p>
                )}
            </div>

            {/* Vẽ Biểu Đồ Doanh Thu */}
            {dataLoaded && chartData.labels.length > 0 && (
                <div>
                    <h4>Biểu đồ doanh thu:</h4>
                    <Line data={chartData} />
                </div>
            )}
        </div>
    );
};

export default RevenueStats;
