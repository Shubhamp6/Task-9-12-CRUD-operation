//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const alert = require("alert");
const validator = require("validator");
mongoose.set('strictQuery', false);

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const customerSchema = new mongoose.Schema({
    email: {
      type: String,
      required : [true, "Email required"],
      unique : [true,"Email already exist"],
      validate(value){
        if(!validator.isEmail(value)){
          throw new Error("Invalid Email")
        }
      }},
    password: {
      type: String,
      required : [true,"Password required"],
      }
    ,  
    name: {
      type: String,
      required : [true,"Name required"]
    }
  });

//userSchema.plugin(findOrCreate);
const Customer = mongoose.model("Customer", customerSchema);

app.get("/users/:perPage/:page",function (req, res){
 var perPage = Math.max(0,req.params.perPage), page = Math.max(0,req.params.page);
 Customer.find({}).sort({name:1}).limit(perPage).skip(perPage*(page - 1)).exec(function(err, foundCustomer) {
    if (!err) {
      res.send(foundCustomer);
    } else {
      res.send(err);
    }
  });
});

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      const newCumtomer = new Customer({
        email: req.body.username,
        name: req.body.name,
        password: hash,
      });
  
      console.log(1);
      newCumtomer.save(function (err) {
        if (err) {
          if(err.code == 11000)
          res.send("Email already exist");
          else
          res.send(err);
        } else {
          res.send("Registered successfully!!")
        }
      });
    });
  
});

app.get("/login", function (req, res){
    Customer.findOne({ email: req.body.username }, function (err, foundCustomer) {
          if (err) {
            res.send(err);
          } else {
            if (foundCustomer) {
              bcrypt.compare(
                req.body.password,
                foundCustomer.password,
                function (err, result) {
                  if(err)
                  res.send(err);
                  else if (result) {
                    res.send("Login successfull!!");
                }
                else
                 res.send("Wrong password!");
                }
              );
            }
            else{
              res.send("No such user exist!");
            }
        }
    });
});

app.delete("/users",function(req,res){
  Customer.findOneAndDelete({ email : req.body.username},function(err,data){
   if(err){
    console.log(err);
   }else if(data){
    res.send("Deleted successfully! Deleted user is " + data);
   }else{
    alert("No such user found!!");
    res.send("Please, try again.");
   }
  });
});

app.patch("/users",function(req,res){
  Customer.findOneAndUpdate({email : req.body.username}, {$set : {password : req.body.newPassword}}, function(err,data){
    if(err){
      console.log(err);
     }else if(data){
      res.send("Updated successfully!");
     }else{
      alert("No such user found!!");
      res.send("Please, try again.");
     }
    });
});

app.put("/users",function(req,res){
  Customer.findOneAndUpdate({email: req.body.username},{email: req.body.newusername, password : req.body.newPassword},function(err,data){
    if(err){
      console.log(err);
     }else if(data){
      res.send("Updated successfully!!");

     }else{
      alert("No such user found!!");
      res.send("Please, try again.");
     }
    });
});

app.listen(3000, function () {
    console.log("Server started successfully on port 3000");
  });