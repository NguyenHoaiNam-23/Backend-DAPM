const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const apiRoutes = require("./routes");
const notFoundMiddleware = require("./common/middlewares/notFound.middleware");
const errorMiddleware = require("./common/middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;