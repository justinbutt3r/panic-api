const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const initClientDbConnection = require("./utils/dbUtil");
const EventModel = require("./schema/event");
const cors = require("cors");
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbName = "panicApp";
const connectionString = `${process.env.MONGOLINK}${dbName}${process.env.MONGOSETTINGS}`;
const databaseConnection = initClientDbConnection(connectionString, dbName);

const Event = EventModel(databaseConnection);

app.get("/events", async (req, res, next) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (e) {
    next(e);
  }
});

app.get("/events/:id", async (req, res, next) => {
  try {
    const singleEvent = await Event.findById(req.params.id);
    singleEvent ? res.json(singleEvent) : res.send({ status: "empty" });
  } catch (e) {
    next(e);
  }
});

app.post("/processEvent", (req, res, next) => {
  try {
    const data = req.body;
    const panicEvent = new Event(data);

    panicEvent
      .save()
      .then((result) => {
        console.log(result);

        const io = req.app.get("socketio");
        io.emit("PanicEvent", result);
        res.send({ status: "ok" });
      })
      .catch((e) => {
        res.send({ status: "fail" });
      });
  } catch (e) {
    next(e);
  }
});

app.use(function (err, req, res, next) {
  res.status(404).send({ error: err.message });
});

const server = http.createServer(app);

server.listen(4000, () => {
  console.log("Listening on 4000");
});
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

app.set("socketio", io);

io.on("connection", function (socket) {
  console.log("a user connected");

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});
