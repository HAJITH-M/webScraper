const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// Middleware to verify JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// POST request for user login
router.post('/login', async (req, res) => { 
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // If user doesn't exist
        if (!user) {
            return res.status(401).json({ error: 'Invalid email' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT token with id and email
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '3m' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
});

// POST request for user sign-up
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Basic validation to check if any field is missing
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'Password must contain at least one number, one special character, and be at least 8 characters long' 
        });
    }

    try {
        // Check if the email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        // Generate JWT token for the new user with id and email
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, {
            expiresIn: '3m',
        });

        res.status(201).json({ msg: "User registered successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
 
// Export the router to be used in the main app
module.exports = router;
