const express = require('express');
const server = express();
const port = 3000;

// Это главная страница сайта
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

// game
server.get("/game1", (req, res) => {
  res.send('Тут будет описание game1')
  // res.sendFile(__dirname + "/index.html")
})




server.listen(port, () => console.log('Сервер запущен'));



