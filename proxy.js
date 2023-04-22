var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({limit: myLimit}));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        request({ url: "https://api.turso.io/v2" + req.url, method: req.method, json: req.body, headers: {'Authorization': req.header('Authorization')} },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
//                console.log(body);
            }).pipe(res);
    }
});

app.listen(8008, function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});