#!/usr/bin/env node
/* Filename: server.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file runs the server. It handles the login sessions and routing. Database schemas and command parsing/executing logic is held elsewhere and imported here.
 */

const express = require('express');
const database = require('./db/db.js');
const Command = require('./command.js').command;
const session = require('express-session');
const multer  = require('multer');
//setup where to store and what to name the file
const storage = multer.diskStorage({
  destination: './public_html/img/avatars/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Set up the express server
const app = express();
const port = 80;
const sessionAge = 1200000; //20 mins


/*  Description: This function determines if a session exists in the request
 *      (the session middleware should have added it there if such a session
 *      existed on the server that matched the req's cookie). If it exists,
 *      next() is called.
 *  Parameters: Basic express middleware parameters: req, res, next.
 */
function authenticate(req, res, next) {
    if (req.session.user) {
        console.log(req.session.user);
        next();
    } else {
        //res.send('NOT ALLOWED');
        res.redirect('/');
    }
}


// NOTE: I'm using a regular expression here, but '/' would probably work too?
app.use(/\/.*/, express.json()); //parse request body json into req.body
app.use(session({
    secret: 'unsecure secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: sessionAge,
        secure: false
    }
}));
app.use('/home.html', authenticate);
app.use('/account.html', authenticate);
app.use('/help.html', authenticate);
app.use('/avatar/', authenticate);
app.use(/\/command\/.*/, authenticate);
app.use('/', express.static('public_html'));


app.listen(port, () => {
    console.log('App listening');
});


// Handle a login request by authenticating and adding a session if valid
app.post('/login/', (req, res) => {
    const u = req.body.username;
    database.account.authenticate(u, req.body.password, (valid) => {
        if (valid) {
            req.session.user = u;
            res.json({validUser: true});
        } else {
            res.json({validUser: false});
        }
    });
});


// Handle a signup request by attempting to create an account, then if
// successful, add a session as well
app.post('/signup/', (req, res) => {
    const u = req.body.username;
    database.account.create(u, req.body.password, (success) => {
        if (success) {
            req.session.user = u;
            res.json({validUser: true});
        } else {
            res.json({validUser: false});
        }
    });
});


// Handle a request to log out by destroying the session and going to login page
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log('Problem logging out: ' + err);
        console.log('Logged out');
        res.redirect('/');
    });
});


// Handle a post request to upload an avatar image for the user
app.post('/avatar/', upload.single('image'), (req, res) => {
    // req.file is the `image` file
    //find the user's trainer
    database.account.getTrainer(req.body.username, (err, trainer) => {
        if (err) {
            console.log('Error getting trainer: ' + err);
            res.json({failed: true});

        } else if (trainer) {
            //found a trainer, add the image to the trainer
            trainer.setPhoto(req.file.filename);
            res.json({failed: false});

        } else {
            res.json({failed: true});
        }
    });
});


// Handle a post request that contains a pokemeow 'main' command in
// req.body.command. The command is parsed as a 'main' command and executed.
// 'Main' command just means it is a command that is valid from the top-most
// scope (the user is not in an encounter or battle). Any other command will be
// treated as invalid.
app.post('/command/', (req, res) => {
    console.log('/command/: ' + req.body.command);
    const cmd = new Command(req.body.command, req.session.user, database);
    cmd.parseMain(); // Note that this is being parsed as a 'main' command
    cmd.execute((err, output) => {
        if (err) console.log('ERROR: ' + err);
        res.json(output);
    });
});


// Handle a post request that contains a 'random encounter' command
app.post('/command/rand-enc/', (req, res) => {
    console.log('/command/rand-enc/: ' + req.body.command);
    const cmd = new Command(req.body.command, req.session.user, database);
    cmd.parseEnc();
    cmd.execute((err, output) => {
        if (err) console.log('ERROR: ' + err);
        res.json(output);
    });
});


// Handle a post request that contains a 'battle' command
app.post('/command/battle/', (req, res) => {
    console.log('/command/battle/: ' + req.body.command);
    const cmd = new Command(req.body.command, req.session.user, database);
    cmd.parseBattle();
    cmd.execute((err, output) => {
        if (err) console.log('ERROR: ' + err);
        res.json(output);
    });
});


// Redirects invalid requests to Game page (home.html).
// If user is not logged in, they are then redirected to login page.
app.all('*', (req, res) => { res.redirect('/home.html'); });
