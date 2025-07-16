const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001; // ✅ Fix: works on Render too

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});

const upload = multer({ storage });

app.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get("/users", (req, res) => {
  const db = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  res.json(db.users || []);
});

app.post("/users", (req, res) => {
  const db = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  const users = db.users || [];

  const newUser = req.body;

  if (users.find(u => u.email === newUser.email)) {
    return res.status(409).json({ error: "User already exists" });
  }

  users.push(newUser);

  const updatedDB = { ...db, users };

  fs.writeFile("./db.json", JSON.stringify(updatedDB, null, 2), (err) => {
    if (err) {
      console.error("Failed to save user:", err);
      return res.status(500).json({ error: "Could not save user" });
    }

    res.status(201).json(newUser);
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  const users = db.users || [];

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});
app.get("/logs", (req, res) => {
  const db = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  const logs = db.logs || [];
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
