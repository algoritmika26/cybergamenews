const express = require('express');
const server = express();
const port = 3000;

server.use(express.static('files'))
// Это главная страница сайта
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

// Это страница witcher3
server.get("/igra-witcher3", (req, res) => {
  res.sendFile(__dirname + "/witcher3.html")
})

server.listen(port, () => console.log('Сервер запущен'));



