const express = require("express");
const exphbs = require("express-handlebars");
const routes = require("./routes/router");
const mpRoutes = require("./routes/markerPlanRouter");
const sqlInit = require("./routes/sql/sqlInit");
const app = express();
const cors = require("cors");
const spreadingRouter = require("./routes/spreadingRouter");
const winston = require("winston");
const websocket = require("./routes/websocket");

process.on("uncaughtException", (error, origin) => {
  console.log(error);
  console.log(origin);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(promise);
  console.log(reason);
});

const hbs = exphbs.create({
  defoaltLayout: "main",
  extname: "hbs",
});
app.use(cors());
app.use(express.json());
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");
app.use(routes);
app.use(mpRoutes);
app.use(spreadingRouter);
app.use(express.static("public"));
// app.use(express.static("./client/build"));

for (let i = 0; i < 7; i++) {
  hbs.handlebars.registerHelper(`is${i}`, function (value) {
    return value == i;
  });
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const PORT = 5000;

start = async () => {
  try {
    await sqlInit();
    app.listen(PORT, () => {
      console.log(`Server running at port:${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
