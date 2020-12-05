const connectDB = require("./config/db");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

// Connect the database:
connectDB();

// Config the routes:
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/post", require("./routes/api/post"));
app.use("/api/profile", require("./routes/api/profile"));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
