//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8080);
var crypto = require("crypto");
var bodyParser = require("body-parser");

var USERS = {};
var MQ = {};

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('asdfasdfHello World!');
});

app.get('/users', function(req, res){
	res.send(Object.keys(USERS));
});

app.post('/users', function(req, res){
	if(USERS[req.body.username]){
		res.status(406);
		res.send("USER ALREADY EXISTS");
	}else{
		var hash = crypto.createHash("sha1");
		hash.update(req.body.password);
		var pass = hash.digest('hex');
		USERS[req.body.username] = {
			username: req.body.username,
			password: pass
		};
		MQ[req.body.username] = [];
		res.send("CREATED");
	}
});

app.get('/app', function(req, res){
	res.send("todo: this");
});

app.post('/login', function(req, res){
	if(!USERS[req.body.username]){
		res.status(403).send("USER NOT FOUND");
	}else{
		var hash = crypto.createHash("sha1");
		hash.update(req.body.password);
		var pass = hash.digest("hex");
		if(USERS[req.body.username].password == pass){
			res.redirect("/app");
		}else res.status(403).send('PASS WRONG');
	}
	res.end();
});

app.get("/messages/:user", function(req, res){
	if(MQ[req.params.user]){
		res.send(MQ[req.params.user]);
		MQ[req.params.user] = [];
	}else{
		res.code(404).send("NO USER");
	}
});

app.post("/messages/:user", function(req, res){
	if(!MQ[req.params.user]){
		res.status(400).send("NO USER");
	}else{
		MQ[req.params.user].push(req.body.message);
		res.send("OK");
	}
});

app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
