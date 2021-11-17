if(process.env.NODE_ENV !== "production"){
  require("dotenv").config()                 // LOAD ALL OF THE ENVIRONMENT VARAIBLES and set them inside process.env in line no 23
}

const express = require("express");
const app=express();
const bcrypt=require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)
const users=[];

app.use(express.urlencoded({extended:false}));

app.use(express.static("public"));

app.use(flash());

app.use(session({
  secret:process.env.SESSION_SECRET, //key that we want to keep secret so that we can encrypt all of the environment variables in it
  resave:false,
  saveUninitialized:false
}))

app.use(passport.initialize())    // set all the basic things
app.use(passport.session())      //We want our variables to be persistent across the entire session a user has that is going to work with app.use in line 22

app.use(methodOverride("_method"));

app.set("view-engine","ejs")

app.get("/",checkAuth,function(req,res){
  res.render("index.ejs", {name:req.user.name})
});

app.get("/login",notAuth,function(req,res){
  res.render("login.ejs")
});

app.post("/login",notAuth,passport.authenticate("local",{                   //using local strategy
  successRedirect:"/",     // if login is a success
  failureRedirect:"/login",  // if login is not successful
  failureFlash:true         // this will show a message depending on the error to the user
}))

app.get("/register",notAuth,function(req,res){
  res.render("register.ejs")
});

app.post("/register",notAuth,async function(req,res){
  try{
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    users.push({
      id:Date.now().toString(),
      name:req.body.name,
      email:req.body.email,
      password:hashedPassword
    })
    res.redirect("/login");
  }catch{
    res.register("/register");
  }
  console.log(users);
})

app.delete("/logout",function(req,res){
  req.logOut()
  res.redirect("/login")
})

function checkAuth(req,res,next){                 //Middleware function : req , res and the next is called whenever the auuthentication is done
  if(req.isAuthenticated()){                     // if authenticated,then it will cary out thenext funct. otherwise it will redirect it to the login page
    return next()
  }
    res.redirect("/login")
}

function notAuth(req,res,next){
  if(req.isAuthenticated()){                    // if the person is already authenticated and wants to go to the login page or wants to register again, then it redirects it to the home page
    return res.redirect("/")
  }
    next();
}




app.listen(3000,function(){
  console.log("Server started on port 3000");
});
