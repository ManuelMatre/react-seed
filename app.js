var proCheckSecurity = require('./modules/proCheckSecurity.js');
var embarcheckLogin = require('./modules/embarcheck-login.js');
var conn = require('./modules/embarcheck-dbconnection.js');
var bodyParser = require('body-parser');
var express = require('express'),
	app = express();

app.use(bodyParser.json());

var server = app.listen(8080, function() {
	var port = server.address().port;
	console.log('Express server listening on port %s', port);
});

app.post('/GetLoadDetail', function(request, response){
	var body = request.body;
	if (body) {
		console.log('Usuario entrante');
		console.log(body);

		var dbResponse = function (result) {
			console.log('Mensaje saliente');
			response.status(200).send(result);
		}

		var loginResult = embarcheckLogin(body);
		if (loginResult.status) {
			conn.getLoadInfo(dbResponse, body.c_codigo_man);
		};
	}
});

app.post('/GetLoads', function(request, response){
	var body = request.body;
	if (body) {
		console.log('Usuario entrante');
		console.log(body);

		var dbResponse = function (result) {
			console.log('Mensaje saliente');
			response.status(200).send(result);
		}

		var loginResult = embarcheckLogin(body);
		if (loginResult.status) {
			conn.getLoads(dbResponse);
		};
	}
});

app.post('/', function(request, response){
	var body = request.body;
	if (body) {
		console.log('Terminal entrante');
		console.log(body);

		var validationResults = proCheckSecurity(body);
		console.log('Mensaje saliente');
		console.log(validationResults);

		if (validationResults.statusCode === 200) {
			response.status(validationResults.statusCode).send(validationResults.objectResponse);
		} else {
			response.status(validationResults.statusCode).send(validationResults.errorMessage);
		}
	}
});

/*app.use(function(req, res){
	res.sendStatus(404); 
});*/