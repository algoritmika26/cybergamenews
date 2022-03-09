const express = require('express');
const server = express();
const port = 3000;

server.use(express.static('files'))
// Это главная страница сайта
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

// не главная страница
server.get("/breathedge", (req, res) => {
  res.sendFile(__dirname + "/breathedge.html")
})

// Это обработчик страницы game_test.html
server.get("/test_game", (req, res) => {
  res.sendFile(__dirname + "/test_game.html")
})

// Это обработчик страницы cyberpunk_2077.html
server.get("/cyberpunk2077-top-igra", (req, res) => {
  res.sendFile(__dirname + "/cyberpunk_2077.html")
})

// Это страница code vein
server.get("/code-vein", (req, res) => {
  res.sendFile(__dirname + "/code_vein.html")
})

// Это страница witcher3
server.get("/igra-witcher3", (req, res) => {
  res.sendFile(__dirname + "/witcher3.html")
})
// Это страница metro-exodus
server.get("/metro-exodus", (req, res) => {
  res.sendFile(__dirname + "/metro_exodus.html")
})
// Это страница идей и предложений, мб попозжа!)
server.get("/ideas-mail", (req, res) => {
  res.sendFile(__dirname + "/mail.html")
})
// Это страница (придумаю потом)
server.get("/LoL", (req, res) => {
  res.sendFile(__dirname + "/LoL.html")
})

server.get("/csgo", (req, res) => {
  res.sendFile(__dirname + "/csgo.html")
})

server.get("/windbound", (req, res) => {
  res.sendFile(__dirname + "/windbound.html")
})
server.listen(port, () => console.log('Сервер запущен'));

