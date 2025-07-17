
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://tpcjdgucyrqrzuqvshki.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

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

app.get("/users", async (req, res) => {
  console.log("📣 GET /users route hit");

  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("❌ Supabase error:", error);
    return res.status(500).json({ error });
  }

  console.log("🧠 Raw data from Supabase:", data);

  res.json(data); // <— not filtering anything
});

app.post("/users", async (req, res) => {
  const newUser = req.body;

  const { data: existing, error: checkError } = await supabase
    .from("users")
    .select("*")
    .eq("email", newUser.email);

  if (checkError) return res.status(500).json({ error: checkError.message });
  if (existing.length > 0) return res.status(409).json({ error: "User already exists" });

  const { data, error } = await supabase.from("users").insert(newUser).select();
  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password);

  if (error || !data || data.length === 0) {
    return res.status(403).json({ error: "Invalid credentials" });
  }

  res.json(data[0]);
});

app.patch("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select();

  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

app.get("/logs", (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
