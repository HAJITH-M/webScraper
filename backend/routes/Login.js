const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// Middleware to verify JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";



router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to authenticate user' });
    }
  });

  // POST request to handle user sign-up
  router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Basic validation to check if any field is missing
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.status(201).json({ msg: "User registered successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});



module.exports = (req, res) => {
  app(req, res);
};

  module.exports = router;