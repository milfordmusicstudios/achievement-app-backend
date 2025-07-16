
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  res.json({ url: `/uploads/${req.file.filename}` });
});
const db = require("./db.json");

app.get("/users", (req, res) => {
  res.json(db.users || []);
});

const fs = require("fs");

app.post("/users", (req, res) => {
  const db = require("./db.json");
  const users = db.users || [];

  const newUser = req.body;

  // Optionally check if user with same email exists
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
