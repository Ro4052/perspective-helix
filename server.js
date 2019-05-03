const { exec } = require("child_process");
const express = require("express");
const expressWs = require("express-ws");
const path = require("path");

const port = process.env.PORT || 3000;
const app = expressWs(express()).app;
app.use("/", express.static(path.join(__dirname, "public")));

const clients = [];
app.ws("/helixstream", ws => {
  const index = clients.length;
  clients.push(ws);
  ws.on("close", () => clients.splice(index, 1));
});

setInterval(() => {
  if (clients.length > 0) {
    exec(
      `java -jar generator.jar generate perspective.json thisisnotused.csv -n ${Math.floor(
        Math.random() * 4 + 1
      )} -o STDOUT --quiet`,
      (err, out) => {
        if (err) {
          console.log(err);
        }
        const res = JSON.stringify(
          out
            .split("\r\n")
            .slice(0, -1)
            .map(d => JSON.parse(d))
        );
        clients.forEach(client => {
          client.send(res);
        });
      }
    );
  }
}, 1000);

app.listen(port, () => console.log(`App listening on port ${port}`));
