const connectDB = require("./config/db");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

// COnnect the database:
connectDB();

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
