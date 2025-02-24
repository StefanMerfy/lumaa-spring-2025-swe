require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

const jwtSecret = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Expect "Bearer <token>"
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId; // Attach userId to request
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING userId AS "userId"',
            [username, hashedPassword]
        );

        const userId = newUser.rows[0].userId;
        const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });

        res.status(201).json({ userId, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query('SELECT userId AS "userId", password FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const userId = user.rows[0].userId;
        const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ userId, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new task (Protected)
app.post('/tasks', authenticateToken, async (req, res) => {
    const { title, description } = req.body;
    const userId = req.userId;

    try {
        const newTask = await pool.query(
            'INSERT INTO tasks (userId, title, description) VALUES ($1, $2, $3) RETURNING taskid',
            [userId, title, description]
        );

        res.status(201).json({ taskId: newTask.rows[0].taskid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get tasks for the logged-in user (Protected)
app.get('/tasks', authenticateToken, async (req, res) => {
    const userId = req.userId;

    try {
        const tasks = await pool.query(
            'SELECT taskid, title, description, completed FROM tasks WHERE userId = $1',
            [userId]
        );

        res.status(200).json(tasks.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a task (Protected)
app.put('/tasks/:taskId', authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    const { title, description } = req.body;
    const userId = req.userId;

    try {
        const result = await pool.query(
            'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE taskid = $3 AND userId = $4 RETURNING taskid, title, description',
            [title, description, taskId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        res.status(200).json({ message: `Task with ID ${taskId} updated`, task: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a task (Protected)
app.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    const userId = req.userId;

    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE taskid = $1 AND userId = $2 RETURNING taskid',
            [taskId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        res.status(200).json({ message: `Task with ID ${taskId} deleted` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Toggle task completion (Protected)
app.patch('/tasks/:taskId/toggle', authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    const userId = req.userId;

    try {
        const result = await pool.query(
            'UPDATE tasks SET completed = NOT completed WHERE taskid = $1 AND userId = $2 RETURNING taskid, completed',
            [taskId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        res.status(200).json({
            message: `Task with ID ${taskId} toggled`,
            completed: result.rows[0].completed,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
