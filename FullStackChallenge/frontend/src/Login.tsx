import React, { useState, useEffect } from 'react';

const API_PORT = 3000;
const API_BASE_URL = `http://localhost:${API_PORT}`;

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [tasks, setTasks] = useState<{ taskid: number; title: string; description: string; completed: boolean }[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) fetchTasks();
    }, [token]);

    const handleAuth = async (endpoint: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error(`${endpoint} failed`);

            const data = await response.json();
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setError('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchTasks = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const addTask = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: newTitle, description: newDescription }),
            });

            if (!response.ok) throw new Error('Failed to add task');

            setNewTitle('');
            setNewDescription('');
            fetchTasks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteTask = async (taskId: number) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to delete task');
            setTasks(tasks.filter(task => task.taskid !== taskId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const toggleTaskCompletion = async (taskId: number) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to toggle task completion');
            fetchTasks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const editTask = async (taskId: number) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: editedTitle, description: editedDescription }),
            });

            if (!response.ok) throw new Error('Failed to update task');
            setEditingTaskId(null);
            fetchTasks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEditing = (task: { taskid: number; title: string; description: string }) => {
        setEditingTaskId(task.taskid);
        setEditedTitle(task.title);
        setEditedDescription(task.description);
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setEditedTitle('');
        setEditedDescription('');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    if (token) {
        return (
            <div>
                <h2>Your Tasks</h2>
                <button onClick={logout}>Logout</button>
                <div>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <button onClick={addTask}>+</button>
                </div>
                <ul>
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <li key={task.taskid} style={{ marginBottom: '60px' }}>
                                {editingTaskId === task.taskid ? (
                                    <div>
                                        <input
                                            type="text"
                                            value={editedTitle}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                        />
                                        <button onClick={() => editTask(task.taskid)}>Confirm</button>
                                        <button onClick={cancelEdit}>Cancel</button>
                                    </div>
                                ) : (
                                    <div>
                                        <strong>{task.title}</strong>
                                        <p>{task.description}</p>
                                        <button onClick={() => toggleTaskCompletion(task.taskid)}>
                                            {task.completed ? 'Undo' : 'Complete'}
                                        </button>
                                        <button onClick={() => startEditing(task)}>Edit</button>
                                        <button onClick={() => deleteTask(task.taskid)}>Delete</button>
                                    </div>
                                )}
                            </li>
                        ))
                    ) : (
                        <p>No tasks found.</p>
                    )}
                </ul>
            </div>
        );
    }

    return (
        <div>
            <h2>Log In / Sign Up</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={() => handleAuth('login')}>Log In</button>
            <button onClick={() => handleAuth('register')}>Sign Up</button>
        </div>
    );
};

export default App;
