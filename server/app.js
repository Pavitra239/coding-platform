import "express-async-errors";
import { config } from "dotenv";
config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import notFoundHandler from "./controllers/not-found.js";
import errorHandler from "./controllers/error.js";
import authRoutes from "./routes/auth.js";


const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.all("*", notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3100;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
