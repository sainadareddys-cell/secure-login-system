const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const DB_FILE = "database.json";

// Read DB
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        return { users: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
}

// Write DB
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// REGISTER
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    let db = readDB();

    if (db.users.find(u => u.username === username)) {
        return res.json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.users.push({ username, password: hashedPassword });

    writeDB(db);

    res.json({ message: "Registered successfully" });
});

// LOGIN
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    let db = readDB();

    const user = db.users.find(u => u.username === username);
    if (!user) {
        return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.json({ message: "Wrong password" });
    }

    res.json({ message: "Login successful" });
});

// START SERVER
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
