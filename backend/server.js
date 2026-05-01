const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_, res) => {
  res.json({ ok: true, message: "SpiceEmpire API running" });
});
app.use("/api/products", productRoutes);

app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Another backend instance is already running. Stop it first, then restart.`
        );
        return;
      }
      console.error("Server startup error", error);
    });
  })
  .catch((error) => {
    console.error("DB connection failed", error);
    process.exit(1);
  });
