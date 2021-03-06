/* Filename: login.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file contains the functions used to login and create
 *      accounts when either button is pressed.
 */

//constants
const serverURL = 'http://157.245.236.86';
//const serverURL = 'http://64.227.49.233';


$('#loginBtn').click(() => {
    //check that the fields have been filled in
    const nameInput = $('#username').val();
    const passInput = $('#pass').val();
    if (!nameInput || !passInput) {
        alert('You need to fill in all the fields.');
        return;
    }

    //construct data to send
    const data = {
        username: nameInput,
        password: passInput
    };

    //send new user info
    $.ajax({
        type: "POST",
        url: serverURL + '/login/',
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (response) => {
            if (response.validUser) {
                $('#issueMsg').hide();
                window.location.href = './home.html';
            } else {
                $('#issueMsg').show();
            }
        },
        error: (err) => {
            console.log(err);
        }
    });
});


$('#createBtn').click(() => {
    //check that the fields have been filled in
    const nameInput = $('#newUsername').val();
    const passInput = $('#newPass').val();
    if (!nameInput || !passInput) {
        alert('You need to fill in all the fields.');
        return;
    }

    //construct data to send
    const data = {
        username: nameInput,
        password: passInput
    };

    //send new user info
    $.ajax({
        type: "POST",
        url: serverURL + '/signup/',
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (response) => {
            if (response.validUser) {
                window.location.href = './help.html';
            } else {
                alert('Could not add user.');
            }
        },
        error: (err) => {
            console.log(err);
        }
    });
});
