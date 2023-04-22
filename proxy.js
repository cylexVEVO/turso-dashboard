var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

app.use(bodyParser.json());

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
        // i don't know what the fuck is going on, all i know is v2 is being added to the url for Some Reason
        let url = "";
        if (req.url.startsWith("/v2")) {
            url = `https://api.turso.io${req.url}`;
        } else {
            url = `https://api.turso.io/v2${req.url}`;
        }
        request({ url, method: req.method, json: req.body, headers: {'Authorization': req.header('Authorization')} },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
            }).pipe(res);
    }
});

app.listen(8008);