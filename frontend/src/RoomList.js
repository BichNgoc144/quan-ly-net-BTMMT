import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to view the rooms.');
            return;
        }

        axios.get('http://localhost:5000/api/rooms', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => {
                setRooms(response.data);
                setError('');
            })
            .catch(err => {
                setError('Failed to fetch rooms.');
            });
    }, []);

    return (
        <div>
            <h1>Room List</h1>
            {error && <p>{error}</p>}
            <ul>
                {rooms.map(room => (
                    <li key={room.id}>{room.name} - {room.available ? 'Available' : 'Occupied'}</li>
                ))}
            </ul>
        </div>
    );
};

export default RoomList;
