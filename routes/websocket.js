const sql = require("@frangiskos/mssql").sql;
const ws = require("ws");
const queries = require("./queries/Spreading");

const wss = new ws.Server({ port: 5001 }, () =>
  console.log("WS Server started on port 5001")
);

wss.on("connection", (ws) => {
  let interval;

  ws.on("message", async (message) => {
    message = JSON.parse(message);
    console.log(message);

    switch (message.event) {
      case "message":
        {
          console.log(message.event);
          clearInterval(interval);
          let dataprev = [{ data: "foobar" }];
          interval = setInterval(async () => {
            let data = await sql.query(queries.getMarkers(message.message));
            if (JSON.stringify(dataprev) != JSON.stringify(data)) {
              dataprev = data;
              ws.send(JSON.stringify(data));
            }
          }, 1000);
        }
        break;
      case "connection":
        {
          console.log("connection");
        }
        break;
      case "close": {
        clearInterval(interval);
        ws.close();
      }
    }
  });
  ws.on("close", () => {
    console.log("closed");
    clearInterval(interval);
  });
});
