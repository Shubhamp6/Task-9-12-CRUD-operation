//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 5;
const alert = require("alert");
mongoose.set('strictQuery', false);

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const customerSchema = new mongoose.Schema({
    email: String,
    password: String,
  });

//userSchema.plugin(findOrCreate);
const Customer = mongoose.model("Customer", customerSchema);

app.get("/users",function (req, res){
 Customer.find (function(err, foundCustomer) {
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
        email: req.body.Username,
        password: hash,
      });
  
      newCumtomer.save(function (err) {
        if (err) {
          res.send(err);
        } else {
          res.send("Registered successfully!!")
        }
      });
    });
  
});

app.post("/login", function (req, res){
    Customer.findOne({ email: req.body.Username }, function (err, foundCustomer) {
          if (err) {
            res.send(err);
          } else {
            if (foundCustomer) {
              bcrypt.compare(
                req.body.password,
                foundCustomer.password,
                function (err, result) {
                  if (result) {
                    res.send("Login successfull!!");
                }
                else
                 res.send("1");
                }
              );
            }
        }
    });
});

app.delete("/users",function(req,res){
  Customer.findOneAndDelete({ email : req.body.Username},function(err,data){
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
  Customer.findOneAndUpdate({email : req.body.Username}, {$set : {password : req.body.newPassword}}, function(err,data){
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
  Customer.findOneAndUpdate({email: req.body.Username},{email: req.body.newUsername, password : req.body.newPassword},function(err,data){
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