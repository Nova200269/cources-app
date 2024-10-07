const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const { getClientIp } = require("request-ip");
const connectDB = require('./app/config/initDatabase');
const Routes = require('./app/routes/index');

const app = express();

dotenv.config();
connectDB();
initMiddleware()
startApp()

function startApp() {
  Routes(app);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function initMiddleware() {
  app.use(cors());
  app.use(helmet());
  app.use(express.json({ limit: "150kb" }));

  app.use((req, res, next) => {
    res.header("Access-control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });

  const limiter = rateLimit({
    limit: 200,
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
      return getClientIp(req);
    },
    message: "Too many requests from this IP, please try again in an hour!",
  });
  app.use(limiter);
}
