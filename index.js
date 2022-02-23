const express = require('express');
const server = express();
const port = 3000;

// Это главная страница сайта
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

// Это обработчик страницы cyberpunk_2077.html
server.get("/cyberpunk2077-top-igra", (req, res) => {
  res.sendFile(__dirname + "/cyberpunk_2077.html")
})

server.listen(port, () => console.log('Сервер запущен'));



