import React, { useEffect, useState } from 'react';
import { get_users, post_users, get_users_id } from '../services/apiFunctions';
import { User, UserRequest } from '../services/types';

const UserComponent: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newUserName, setNewUserName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [fetchedUser, setFetchedUser] = useState<User | null>(null);
    const [addingUser, setAddingUser] = useState<boolean>(false);
    const [fetchingUser, setFetchingUser] = useState<boolean>(false);

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Attempting to fetch users...');
                const userList = await get_users();
                
                console.log('Fetched Users:', userList);
                
                if (userList.length > 0) {
                    setUsers(userList);
                } else {
                    setError('No users found');
                }
            } catch (err) {
                console.error('Fetch Users Error:', err);
                
                const errorMessage = err instanceof Error 
                    ? err.message 
                    : 'An unexpected error occurred';
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle adding a new user
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newUserName.trim()) {
            setError('User name cannot be empty');
            return;
        }

        setAddingUser(true);
        setError(null);

        const newUser: UserRequest = { name: newUserName.trim() };
        try {
            const createdUser = await post_users(newUser);
            // Add the new user to the list
            setUsers(prevUsers => [...prevUsers, createdUser]);
            setNewUserName('');
        } catch (err) {
            setError('Failed to add user');
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };

    // Handle fetching a user by ID
    const handleFetchUserById = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userId.trim()) {
            setError('User ID cannot be empty');
            return;
        }

        setFetchingUser(true);
        setError(null);

        try {
            const user = await get_users_id({ id: userId.trim() });
            setFetchedUser(user);
        } catch (err) {
            setError('Failed to fetch user by ID');
            console.error(err);
            setFetchedUser(null);
        } finally {
            setFetchingUser(false);
        }
    };

    return (
        <div>
            <h1>User Management</h1>

            {/* Debug Information */}
            <div style={{ 
                backgroundColor: '#f0f0f0', 
                padding: '10px', 
                margin: '10px 0',
                border: '1px solid #ccc'
            }}>
                <h3>Debug Information</h3>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Error: {error || 'None'}</p>
                <p>Users Count: {users.length}</p>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <>
                    <h2>Users List</h2>
                    {users.length > 0 ? (
                        <ul>
                            {users.map((user) => (
                                <li key={user.id}>{user.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No users found</p>
                    )}
                </>
            )}

            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
                <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter user name"
                    required
                />
                <button type="submit" disabled={addingUser}>
                    {addingUser ? 'Adding...' : 'Add User'}
                </button>
            </form>

            <h2>Fetch User by ID</h2>
            <form onSubmit={handleFetchUserById}>
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                    required
                />
                <button type="submit" disabled={fetchingUser}>
                    {fetchingUser ? 'Fetching...' : 'Fetch User'}
                </button>
            </form>

            {fetchedUser && (
                <div>
                    <h3>Fetched User</h3>
                    <p>ID: {fetchedUser.id}</p>
                    <p>Name: {fetchedUser.name}</p>
                </div>
            )}
        </div>
    );
};

export default UserComponent;