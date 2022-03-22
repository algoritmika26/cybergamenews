const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const bcrypt = require("bcrypt");
const multer  = require('multer')
const bodyParser = require('body-parser');
const flash = require('express-flash-notification');
const port = 3000;
const user = require('./models/users')
const moment = require('moment')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jsonParser = express.json();
const Post = require('./models/posts');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// app.use(cookieParser());
app.use(express.static('files'))
app.use(express.static('css'));
app.set('view engine', 'ejs')

app.use(session({resave: true, secret: 'mydumbcat' , saveUninitialized: true}));

mongoose.connect('mongodb+srv://pistrun333:LmHL93K2lPIUhUoo@cluster0.s4kir.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Это главная страница сайта
app.get("/",  async (req, res) => {
  if(!req.session.secret_id) res.render('index.ejs', {"req":req})
  else{

    const User = await user.findOne({
      secret_id: req.session.secret_id
    })

    res.render('index.ejs', { 
      'req':req,
      'image':User.image_url,
      'user_id':User.user_id
    })
  }
})

app.get('/profile/*',  async (req, res) => {

  if(!req.session.secret_id) return res.redirect('/auth/login')

  let unique_id = req.url.slice(9)
  console.log(unique_id)

  const users = await user.findOne({
    user_id: unique_id
  })

  if(!users){
     return res.send('такого пользователя нет')
  }else{

    res.render("example.ejs", {
      'sess_sec':req.session.secret_id,
      'user_secret':users.secret_id,
      'image_url':users.image_url,
      'name': users.username,
      'time': users.dateRegist.toLocaleDateString("ru-RU"),
      'user_id':users.user_id
    })
  }
})

app.post('/edit/avatar/*', urlencodedParser, async (req, res) => {
  
  if(!req.session.secret_id) return res.redirect('/auth/login')

  let users = await user.findOne({
    secret_id:req.session.secret_id
  })

  if(!users) return res.redirect('/auth/login')

  else{
    let link = req.body.photo.split('.')
    let pngLink = link[link.length - 1]
    const godeLink = ['jpg', 'gif', 'png', 'jpeg']
    if(godeLink.includes(pngLink)){
      users.image_url = req.body.photo
      users.save();
    }else{
      return res.redirect(`/`)
    }
    return res.redirect(`/profile/${users.user_id}`)
  }
})

//algoRitm
app.get("/auth/login", (req, res) => {
  res.sendFile(__dirname + "/login.html")
})

app.get('/leave' , (req, res) => {
  if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
})

app.get("/auth/regist", (req, res) => {
  res.sendFile(__dirname + "/regist.html")
})

app.get('/posts/', async (req, res) => {
  const posts = await Post.find({ })
  res.status(200).json(posts)
})

app.post('/api/posts/', async(req,res) => {
  const postData = {
    title: req.body.title,
    text: req.body.text
  }

  const post = new Post(postData)

  await post.save();
  res.status(201).json(post)
})

app.delete('/:postId', async(req,res) => {
  await Post.remove({_id: req.params.postId})
  res.status(200).json({
    message: 'Удалено'
  })
})


app.post('/auth/login', urlencodedParser, async (req, res) => {
  let login = req.body.login

  const users = await user.findOne({
    username: login
  })

  if(!users){
    return res.send({'Success': 'Такого пользователя нет!'})
  }
  bcrypt.compare(req.body.password, users.password, function(err, result) {

    if(result == true){ return req.session.secret_id = users.secret_id, res.send({'Success': 'Успешно'}) }
    else return res.send({'Success': 'Неправильный пароль'})
});
})

app.post("/auth/regist", urlencodedParser, async (req, res) => {
    let login = req.body.login



    const users = await user.findOne({
      username: login
    })

    if(users){
      return res.send({'Success': 'Такой пользователь уже есть'})
    }

    if(req.body.login == req.body.password || req.body.password.length < 6){
      return res.send({'Success': 'Пароль недостаточно надежный'})
    }

    else{

    console.log("_______________");
    console.log(req.body.login);
    console.log("_______________");
    console.log(req.body.password);
    console.log("_______________");

    function gen_id(){
      var abc = "1234567890";
          var rs = "";
          while (rs.length < 8) {
              rs += abc[Math.floor(Math.random() * abc.length)];
          }
          return rs;
    }

    function secret_id(){
      var abc = "abcdefghijklmnopqrstuvwxyz";
          var rs = "";
          while (rs.length < 6) {
              rs += abc[Math.floor(Math.random() * abc.length)];
          }
          return rs;
    }

    req.session.secret_id = secret_id();

    let password = req.body.password
    bcrypt.genSalt(5, async function(err, salt) {
      bcrypt.hash(password, salt, async function(err, hash) {
        let NewUser = await new user({
          username: login,
          password: hash,
          user_id: gen_id(),
          secret_id: req.session.secret_id
        })
        await NewUser.save();
        console.log(NewUser)
      });


  });

  res.send({'Success': 'Успешно'})
  }

});

// $2b$10$G4z0ZOrw51QwqkOeiRf4qOSqtR4W.tgjBeNXfU8ToRV2Gtj1ZBBLS

// app.post("/auth/login", bodebodyParser, async (req, res) => {
//   let login = await req.body.login
//   let password = await req.body.password
//   let NewUser = new user({
//     username: login,
//     password: password,
//   })
//   // NewUser.save()
//     console.log(password, login)
//     res.redirect('/')
// }) 
// не главная страница

app.get("/breathedge", (req, res) => {
  res.sendFile(__dirname + "/breathedge.html")
})

// Это обработчик страницы game_test.html
app.get("/test_game", (req, res) => {
  res.sendFile(__dirname + "/test_game.html")
})

// Это обработчик страницы cyberpunk_2077.html
app.get("/cyberpunk2077-top-igra", (req, res) => {
  res.sendFile(__dirname + "/cyberpunk_2077.html")
})

// Это страница code vein
app.get("/code-vein", (req, res) => {
  res.sendFile(__dirname + "/code_vein.html")
})

// Это страница witcher3
app.get("/igra-witcher3", (req, res) => {
  res.sendFile(__dirname + "/witcher3.html")
})
// Это страница metro-exodus
app.get("/metro-exodus", (req, res) => {
  res.sendFile(__dirname + "/metro_exodus.html")
})

// Это страница идей и предложений, мб попозжа!)
app.get("/ideas-mail", (req, res) => {
  res.sendFile(__dirname + "/mail.html")
})
// Это страница (придумаю потом)
app.get("/LoL", (req, res) => {
  res.sendFile(__dirname + "/LoL.html")
})

app.get("/csgo", (req, res) => {
  res.sendFile(__dirname + "/csgo.html")
})

// Это обработчик страницы warcraft_test.html
app.get("/warcraft-igra-novostyi-blizzard-entertainment", (req, res) => {
  res.sendFile(__dirname + "/warcraft_test.html")
})

app.get("/windbound", (req, res) => {
  res.sendFile(__dirname + "/windbound.html")
})

app.get('*', function(req, res){
  res.sendFile(__dirname + "/404.html");
})

app.listen(port, () => console.log('Сервер запущен'));

