var express = require('express');
var init = require('./init');
var app = express();
var proxy = require('./proxy');
var config = require('./config').website;
var hbs = require('hbs');

app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

app.engine('html', hbs.__express);

app.use(init);
app.use('/static/', express.static('static'));

app.get('/', function(req, res){
    res.render('index');
});

app.get('/webhp', function(req, res){
    res.render('index');
});

app.route('/login')
    .get(function(req, res){
            res.render('login');
    });

app.get('/*', proxy.handler);

app.listen(config.port, config.host);
console.log('Server listen %s:%s', config.host, config.port);

