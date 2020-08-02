#!/usr/bin/env node
/* Filename: server.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file runs the server. As the project gets larger, we will
 *      likely have to split this up into smaller units while using this file
 *      as the main control/start the server from here. Most notably, the
 *      database schemas and access will be done from (posssibly multiple)
 *      other files.
 */

const express = require('express');
const db = require('./db/db.js');
const session = require('express-session');

// Set up the express server
const app = express();
const port = 80;


function authenticate(req, res, next) {
    if (req.cookies.login && req.session.user) {
        next();
    } else {
        res.sendFile('./public_html/index.html');
    }
}


app.use(session({
    key: 'login',
    secret: 'unsecure secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 10000
    }
}));
app.use(/\/((?!index.html).)*/, authenticate);
app.use('/', express.static('public_html'));
// NOTE: I'm using a regular expression here, but '/' would probably work too?
app.use(/\/.*/, express.json()); //parse request body json into req.body


app.listen(port, () => {
    console.log('App listening');
});


app.post('/login/', (req, res) => {
    const u = req.body.username;
    if (db.account.authenticate(u, req.body.password)) {
        req.session.user = u;
        res.sendFile('./public_html/home.html');
    } else {
        res.json({validUser: false});
    }
});


app.post('/signup', (req, res) => {
    const u = req.body.username;
    if (db.account.create(u, req.body.password)) {
        req.session.user = u;
        res.sendFile('./public_html/home.html');
    } else {
        res.json({validUser: false});
    }
});
