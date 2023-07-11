//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt= require("mongoose-encryption");

const mongoURL = 'mongodb://0.0.0.0:27017/userDB';

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    // Start your application logic here

    const app = express();

    app.set('view engine', 'ejs');

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static("public"));

    //Schema
    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });

    const secret=process.env.SECRET;

    userSchema.plugin(encrypt,{secret: secret, encryptedFields: ["password"]});

    //Model
    const User= new mongoose.model("User", userSchema);

    app.get("/", function(req, res){
        res.render("home");
    });

    app.get("/login", function(req, res){
        res.render("login");
    });

    app.get("/register", function(req,res){
        res.render("register");
    });

    app.post("/register", function(req, res){
        const newUser= new User({
            email : req.body.username,
            password: req.body.password
        })
        newUser.save()
        .then(function(){
            res.render("secrets");
        })
        .catch(function(err){
            console.log(err);
        })
    })

    app.post("/login", async function(req, res){
        const username= req.body.username;
        const password= req.body.password;

        await User.findOne({email: username})
        .then(function(foundUser){
            if(foundUser.password===password){
                res.render("secrets");
            }
        })
    })

    app.listen(3000, function() {
        console.log("Server started on port 3000");
    });
    
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
