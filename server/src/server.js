import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ecommerce API is running",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
