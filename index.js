const express = require('express');
const server = express();
const port = 3000;

server.use(express.static('files'))

// Это главная страница сайта
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

// Это обработчик страницы game_test.html
server.get("/test_game", (req, res) => {
  res.sendFile(__dirname + "/test_game.html")
})

server.listen(port, () => console.log('Сервер запущен'));



