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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // const allowedOrigins = ['https://example.com', 'https://another-allowed-domain.com'];
  // app.use((req, res, next) => {
  //   const origin = req.headers.origin;
  //   if (allowedOrigins.includes(origin)) {
  //     res.header("Access-Control-Allow-Origin", origin); // Specific origin
  //     res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials
  //   }
  //   res.header("Cross-Origin-Resource-Policy", "same-origin");
  //   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //   next();
  // });

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
