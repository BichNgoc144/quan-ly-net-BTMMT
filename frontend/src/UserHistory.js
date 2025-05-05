import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserHistory = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('/api/users')
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    return (
        <div>
            <h1>User History</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} - {user.room} from {user.startTime} to {user.endTime}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserHistory;
