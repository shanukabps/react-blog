const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const config = require("./config/key");
const jwt = require("jsonwebtoken");


app.use(bodyParser.urlencoded({ extended: true })); //can use express
app.use(bodyParser.json());
app.use(cookieParser());
const { User } = require("./model/user");
const { auth } = require('./middleware/auth')

mongoose
  .connect(
    config.mongoURI,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));


app.get("/", async (req, res) => {
  const users = await User.find().sort("name");
  res.send(users);
});


app.get("/api/user/auth", auth, (req, res) => {
  // console.log("auth")
  res.status(200).json({
    _id: req._id,
    isAdmin: true,
    name: req.user.name,
    email: req.user.email,
    lastname: req.user.lastname,
    role: req.user.role

  })
})

app.post("/api/users/register", async (req, res) => {
  let user = new User(req.body);
  // const salt = await bcrypt.genSalt(10);
  // user.password = await bcrypt.hash(req.body.password, salt);
  user.save((err, data) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    return res.status(200).send(user);
  });
});


// const validPassword = await bcrypt.compare(req.body.password, user.password);
// if (!validPassword) return res.status(400).send("Invalid email or password");
//  console.log(req.body.password);
app.post("/api/users/login", async (req, res) => {
  // findemail

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  //comparepassword
  user.comparePassword(req.body.password, (err, ismatch) => {
    if (!ismatch) return res.json({ loginSuccess: false, message: "wrong password" })
  })

  //generate token //store in db
  user.generateToken((err, user) => {
    if (err) {
      return res.status(400).send("err")
    }
    else {
      res.cookie('x_auth', user.token)
        .status(200)
        .json({
          user: user,
          loginSuccess: true
        })
    }

  });
  ////db ake jwt key 1ka store nokara header 1ke thiyanwa
  // var token = jwt.sign({ _id: user._id }, "secret")
  // console.log(token)
  // user.token = token
  // res.header('x-auth-token', token)
  // res.send(token)
})

app.get("/api/user/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
    if (err) return res.status(400).send("error,fail find")
    return res.status(200).send("success logout")
  })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`server running at  ${port}`)
});
