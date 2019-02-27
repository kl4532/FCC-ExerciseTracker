const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
// db connect
mongoose.connect(process.env.URI, { useNewUrlParser: true })
    .then(() => console.log("MongoDB conected ..."))
    .catch(err => console.log(err));; 

// Bring in user
let User = require('./models/user');

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
//
app.post("/api/exercise/new-user", (req, res)=>{
  User.findOne({username: req.body.username}, (err, data)=>{
    if(data!==null){
      res.send("User exist");
    }else{
      let user = new User;
      user.username = req.body.username;
      user.save((err, data) =>{
        if(err)throw err;
        res.json({username: data.username, id: data._id});
      })
    }
  })
});
app.get("/api/exercise/users", (req, res)=>{
  User.find({}).select("-exercise -log -count").exec((err, data)=>{
    if(err)throw err;
    res.json(data);
  });
});
app.post("/api/exercise/add", (req, res)=>{
let { userId, description, duration, date } = req.body;
  User.findById(req.body.userId, (err, usr) =>{ 
    usr.exercise = {
      description: description,
      duration: duration,
      date: date || currDate(),
                   };
    let newExercise = usr.exercise;
    usr.log.push(usr.exercise);
    usr.count = usr.log.length;
    usr.save((err, data) =>{
    if(err)throw err;
      res.json({username: usr.username, id: usr._id, exercise: usr.exercise});
    }) 
  });
});
app.get("/api/exercise/log", (req, res)=>{
  let { id, from, to, limit } = req.query;
  let count =0;
  User.findById(id).exec((err, usr)=>{
    let out = usr.log.filter(item => {
      let dt, dtFr, dtTo;
      if(from && to && limit){
        count++;
        dt = new Date(item.date);
        dtFr = new Date(from);
        dtTo = new Date(to);
        return dt>=dtFr && dt<=dtTo && count<=limit;
      }else if(from && to){
        count++;
        dt = new Date(item.date);
        dtFr = new Date(from);
        dtTo = new Date(to);
        return dt>=dtFr && dt<=dtTo;
      
      }else if(from && limit && !to){
        count++;
        dt = new Date(item.date);
        dtFr = new Date(from);
        return dt>=dtFr && count<=limit; 
      }else if(limit){
        count++;
        return count<=limit;
      }else return item.date;
    });
    //console.log(out);
    res.json({log: out});
  })
});
//Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


function currDate(){
  var d = new Date();
  let datetime = d.getFullYear() + '-' + (1+ d.getMonth()) + '-' + d.getDate();
  return datetime;
}