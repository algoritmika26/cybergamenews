const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const nodemail = require('nodemailer');
const port = 3000;
require('dotenv').config();
const Chat = require('./models/chats')

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
app.use(express.static('errors'));
app.set('view engine', 'ejs')

app.use(session({resave: true, secret: 'mydumbcat' , saveUninitialized: true}));

mongoose.connect(process.env.BD_LINK, {
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
    try{
      res.render('index.ejs', { 
        'req':req,
        'image':User.image_url,
        'user_id':User.user_id,
        'user':User
      })
    } catch{
      res.redirect('/auth/login')
    }

  }
})

app.get('/secretadminsuperlink/', async(req, res) => {
  if (!req.session.secret_id) return res.redirect('/auth/login')
  else{
      const User = await user.findOne({
        secret_id: req.session.secret_id
      })
    if (User.Roles != 'ADMIN') {
        res.redirect('/error/403')
    }else{

      let admusers = [];
      let userroles = [];

      let users = await user.find().sort().exec(async function(err, sorted_users) {
        for(i=0; i < sorted_users.length; i++){
          if(sorted_users[i].Roles == 'ADMIN'){
            admusers.push(sorted_users[i].login)
          }
        }
      })

      console.log(admusers, userroles)

      res.render('adminpanel.ejs', {
        req:req,
        Users: admusers,
        UsersRoles: userroles
      })
    }
  }
})

app.get('/secretadminsuperlink/posters', async(req, res) => {
  
  if (!req.session.secret_id) return res.redirect('/auth/login')
  else{
    const User = await user.findOne({
      secret_id: req.session.secret_id
    })
  if (User.Roles != 'ADMIN') {
      res.redirect('/error/403')
  }else{
    res.render('newPosters.ejs', {
      req:req
    })
  }
  }
})

app.get('/secretadminsuperlink/admins', async(req, res) => {
  if (!req.session.secret_id) return res.redirect('/auth/login')
  else{
    const User = await user.findOne({
      secret_id: req.session.secret_id
    })
  if (User.Roles != 'ADMIN') {
      res.redirect('/error/403')
  }else{
    res.render('newAdmins.ejs', {
      req:req
    })
  }
  }
})

app.get('/posts/edit/*', async(req, res) => {
  let link = req.url.slice(12)
  const post = await Post.findOne({
    id: link
  })

  console.log(link)

  if(!post) return res.send('такого поста нет')

  if(!req.session.secret_id) return res.redirect('/auth/login')

  if(req.session.secret_id == post.author_sid ){
  const selfusers = await user.findOne({
    secret_id: req.session.secret_id
  })

  res.render('post.ejs', {
    'editMode':true,
    'req': req,
    'image':selfusers.image_url,
    'user_id':selfusers.user_id,
    'user':selfusers,
    'post': post,
    'date': post.datg.toLocaleDateString("ru-RU"),
  })
}else{
  return res.sendFile(__dirname + '/errors/403.html')
}
})



app.get('/chat/*', async(req, res) => {
  if(!req.session.secret_id) return res.redirect('/auth/login')
  let mine_id = req.url.slice(6).split('_')[0]
  let user2_id = req.url.split('_')[1]
  console.log(mine_id + ' ' + user2_id)

  const chat = await Chat.findOne({
    user1: mine_id,
    user2: user2_id
  })

  if(!chat){
    let createchat = await new Chat({
      user1: mine_id,
      user2: user2_id
    });

    createchat.save()
  }

  res.render('chat.ejs', {
    historyChat: chat.messagehistory,
    user1: mine_id,
    user2: user2_id
  })
})

app.get('/posts/', urlencodedParser, async(req,res) => {

  let page = await Post.find().sort([['date', 'descending']]).exec(async function(err, posts){
    
    let posted = [];

    for(var i=0; i<posts.length; i++){
      posted.push(posts[i])
    }
    if(!req.session.secret_id) res.render('posts.ejs', {
      Posts: posted,
      'req':req 
    })
    else{
      let users = await user.findOne({
        secret_id: req.session.secret_id
      })

      res.render('posts.ejs', {
        Posts: posted,
        'req':req,
        'image':users.image_url,
        'user_id':users.user_id,
        'user':users
    })

  }
})  

})

app.get('/post/*', async(req, res) => {
  
  let post_id = req.url.slice(6)

  const post = await Post.findOne({
    id:post_id
  })

  if(!post) return res.redirect('/');
  
  const users = await user.findOne({
    secret_id: post.author_sid
  })
  

  if(!req.session.secret_id) res.render('post.ejs', {
    'editMode':false,
    "req":req,
    "user": users,
    'post': post,
    'date': post.datg.toLocaleDateString("ru-RU")   
})


  else{
    const selfusers = await user.findOne({
      secret_id: req.session.secret_id
    })

    res.render('post.ejs', {
      'editMode':false,
      'req':req,
      'image':selfusers.image_url,
      'user_id':selfusers.user_id,
      'user':users,
      'selfuser':selfusers,
      'post': post,
      'date': post.datg.toLocaleDateString("ru-RU"),
    })
}
})

app.post('/posts/edits/*', urlencodedParser, async(req, res) => {
  if(!req.session.secret_id) return res.redirect('/auth/login');
  let id = req.url.slice(13)
  const post = await Post.findOne({
    id:id
  })

  if(!post) return res.redirect('/')
  else{
    if(req.session.secret_id == post.author_sid){

      if(req.body.title){
        post.title = req.body.title;

        if(req.body.desc){
          post.text = req.body.desc;
        }
        
        if(req.body.sdesc){
          post.short_desc = req.body.sdesc;
        }

        post.save();
      }else{
        if(req.body.desc){
          post.text = req.body.desc;
        }

        if(req.body.sdesc){
          post.short_desc = req.body.sdesc;
        }

        post.save();
      }

      return res.redirect('/posts');
  }else{
    return res.redirect('/auth/login');
  }

  }
})

app.post('/secretadminsuperlink/posters', urlencodedParser, async (req, res) => {
    if (!req.session.secret_id) return res.redirect('/auth/login'); 
    const User = await user.findOne({
      username: req.body.searchAdmin
    });
      if(!User){
        return res.sendFile(__dirname + "/errors/404.html");
      }      

      User.Roles = 'POSTER'
      await User.save()
      return res.redirect('/');
})

app.post('/secretadminsuperlink/admins', urlencodedParser, async (req, res) => {
  if (!req.session.secret_id) return res.redirect('/auth/login'); 
  const User = await user.findOne({
    username: req.body.searchAdmin
  });
    if(!User){
      return res.sendFile(__dirname + "/errors/404.html");
    }

    User.Roles = 'ADMIN'
    await User.save()
    return res.redirect('/');
})

app.post('/posts/create', urlencodedParser, async(req,res) => {
    if (!req.session.secret_id) return res.redirect('/auth/login');

  let users = await user.findOne({
    secret_id: req.session.secret_id
  })

  let id = Math.floor(Math.random() * 7800 + 500)

  if(!req.body.image2){

    let newpost = await Post.create({
      title:req.body.title,
      date: Date.now(),
      photo_url:req.body.photo_url,
      text:req.body.text,
      type:req.body.type,
      short_desc:req.body.short_text,
      id:id,
      author_sid: req.session.secret_id
    })

    console.log(newpost)

    return res.send({'Success': 'Создал'})
  
  }else{
    let newpost = await Post.create({
      title:req.body.title,
      date: Date.now(),
      photo_url:req.body.photo_url,
      photo2: req.body.image2,
      text:req.body.text,
      type:req.body.type,
      short_desc:req.body.short_text,
      id:id,
      author_sid: req.session.secret_id
    })

    return res.send({'Success': 'Создал'})
  }
})

app.get('/posts/delete/*', async(req,res) => {
  if(!req.session.secret_id) return res.redirect('/auth/login')
  let link = req.url.slice(14);

  let post = await Post.findOne({
    id: link
  })

  if(!post) return res.redirect('/')

  const users = await user.findOne({
    secret_id: post.author_sid
  })

  const selfuser = await user.findOne({
    secret_id: req.session.secret_id
  });

  console.log(selfuser)

 
  if(users.user_id != selfuser.user_id) return res.redirect('/')   
  else{

    // if(selfuser.Roles != 'ADMIN') return res.redirect('/')

    await post.remove()
    
    res.redirect('/posts/')
  }
})



app.post('/chat/*', urlencodedParser, async(req, res) => {
  if(!req.session.secret_id) return res.redirect('/auth/login')

  let mine_id = req.url.slice(6).split('_')[0]
  let user2_id = req.url.split('_')[1]
  console.log(mine_id + ' ' + user2_id)

  const chat = await Chat.findOne({
    user1: mine_id,
    user2: user2_id
  })

  if(!chat){
    let createchat = await new Chat({
      user1: mine_id,
      user2: user2_id
    });

    createchat.save()
  }

  const users = await user.findOne({
    secret_id:req.session.secret_id
  })

  let chats = req.body.chat;

  chat.messagehistory.push({'message': chats, 'user': users.username})
  await chat.save();

  res.redirect(`/chat/${mine_id}_${user2_id}`)
})

app.post("/ideas-mail", urlencodedParser, async(req, res) => {
  let author = await req.body.user
  let text = await req.body.text

  const poster = nodemail.createTransport({
    service:'gmail',
    auth:{
      user: process.env.MAIL,
      pass: process.env.PSWRD,
    }
  })
  const mailOptions = {
    from: `${author}`,
    to: process.env.MAIL,
    subject: 'CyberGameNews',
    text: `${text}`
  }

  await poster.sendMail(mailOptions)
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
    const me = await user.findOne({
      secret_id:req.session.secret_id
    })

    if(me.user_id < users.user_id){
    res.render("example.ejs", {
      'sess_sec':req.session.secret_id,
      'about': users.about,
      'user_secret':users.secret_id,
      'image_url':users.image_url,
      'username':users.login,
      'name':users.username,
      'time': users.dateRegist.toLocaleDateString("ru-RU"),
      'user_id':users.user_id,
      'user_1':me.user_id,
      'user_2':users.user_id
    })
  }else{
    res.render("example.ejs", {
      'sess_sec':req.session.secret_id,
      'about': users.about,
      'user_secret':users.secret_id,
      'image_url':users.image_url,
      'username':users.login,
      'name':users.username,
      'time': users.dateRegist.toLocaleDateString("ru-RU"),
      'user_id':users.user_id,
      'user_1':users.user_id,
      'user_2':me.user_id
    })
  }
  }
})

app.get('/settings', async(req, res) => {
  if(!req.session.secret_id) return res.redirect('/auth/login');

  let users = await user.findOne({
    secret_id:req.session.secret_id
  })

  if(!users) return res.redirect('/auth/login')
  else{
    res.render('settings.ejs', {
      'req':req,
      'name':users.login,
      'username':users.username,
      'about': users.about,
      'image':users.image_url,
      'image_url':users.image_url,
      'user_id':users.user_id
    })
  }

})



app.post('/settings/avatar/*', urlencodedParser, async (req, res) => {
  
  if(!req.session.secret_id) return res.redirect('/auth/login')

  let users = await user.findOne({
    secret_id:req.session.secret_id
  })

  if(!users) return res.redirect('/auth/login')

  else{
    let link = req.body.photo.split('.')
    console.log(link)
    let pngLink = link[link.length - 1]
    const godeLink = ['jpg', 'gif', 'png', 'jpeg']

    if(godeLink.includes(pngLink)){
      users.image_url = req.body.photo
      users.save();
    }else{
      return res.redirect(`/settings`)
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


app.post('/auth/login', urlencodedParser, async (req, res) => {
  let login = req.body.login

  const users = await user.findOne({
    login: login
  })

  if(!users){
    return res.send({'Success': 'Такого пользователя нет!'})
  }
  bcrypt.compare(req.body.password, users.password, function(err, result) {

    if(result == true){ return req.session.secret_id = users.secret_id, res.send({'Success': 'Успешно'}) }
    else return res.send({'Success': 'Неправильный пароль'})
});
})


app.post('/settings/sumbit/', urlencodedParser, async(req,res) =>{
  if(!req.session.secret_id) return res.redirect('/auth/login')

  let users = await user.findOne({
    secret_id:req.session.secret_id
  })

  if(!users) return res.redirect('/auth/login')
  else{
    let link = req.body.photo
    if(link){
      link = req.body.photo.split('.')
      
    console.log(link)
    let pngLink = link[link.length - 1]
    const godeLink = ['jpg', 'gif', 'png', 'jpeg']

    if(godeLink.includes(pngLink)){
      users.image_url = req.body.photo;
    }
  }

    users.username=req.body.nick; 
    users.about=req.body.about

    users.save()
    return res.redirect(`/profile/${users.user_id}`)
  }
})

app.post("/auth/regist", urlencodedParser, async (req, res) => {
    let login = req.body.login

    const users = await user.findOne({
      login: login
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
          login: login,
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

app.get('/error/403', function (req, res) {
    res.sendFile(__dirname + "/errors/403.html");
})

app.get('*', function(req, res){
  res.sendFile(__dirname + "/errors/404.html");
})

app.listen(port, () => console.log('Сервер запущен'));