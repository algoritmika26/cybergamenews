const express = require('express');
const server = express();
const port = 3000;

server.use(express.static("files"))

// Это главная страница сайта
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

// не главная страница
server.get("/braethedge", (req, res) => {
  res.sendFile(__dirname + "/breathedge.html")
})


server.listen(port, () => console.log('Сервер запущен'));



