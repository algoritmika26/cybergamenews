const express = require('express');
const server = express();
const port = 3000;

// Это главная страница сайта
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

server.listen(port, () => console.log('Сервер запущен'));



