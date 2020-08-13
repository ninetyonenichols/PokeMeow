/* Filename: account.js
 * Authors: Justin Nichols (jdnscieArea.), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file contains the functions needed to upload an avatar
 *      image to the server and display some information about a trainer.
 */

//constants
//const serverURL = 'http://157.245.236.86';
const serverURL = 'http://64.227.49.233';


// Get the user's trainer from the server and display some of it on the page.
$(document).ready(() => {
    getTrainer();
});


$('#uploadAvatar').click(() => {
    const avatar = $('#avatarFile').prop('files')[0];

    //check that an image has been selected
    if (!avatar) {
        alert('You need to select an image to upload.');
        return;
    }

    //create a form to send
    const formData = new FormData();
    formData.append('image', avatar);

    //send a post request
    $.ajax({
        type: 'POST',
        url: serverURL + '/avatar/',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: (response) => {
            if (response.failed) {
                alert('Failed to upload avatar.');
            } else {
                getTrainer();
            }
        }
    });
});


/*  Description: Sends a GET request to the server for the user's trainer info,
 *      then calls 'setupPage' to display it.
 *  Parameters: none.
 */
function getTrainer() {
    //send a get request for the trainer object
    $.ajax({
        type: 'GET',
        url: serverURL + '/get/trainer',
        dataType: "json",
        success: (response) => {
            if (response.trainer) {
                setupPage(trainer);
            } else {
                alert('Could not find your trainer info.');
            }
        }
    });
}


/*  Description: Sets the relevant information on the page using the user's
 *      trainer object.
 *  Parameters:
 *      trainer - the trainer object
 */
function setupPage(trainer) {
    //set the name and avatar
    $('#username').text(trainer.name);
    $('#avatar').attr('src', trainer.photo);

    //set the number of pokemon
    const numPokemon = trainer.party.length + trainer.pokemon.length;
    $('#numPokemon').text(numPokemon);

    //list party pokemon
    if (trainer.party.length == 0) {
        $('#partyList').append($('li').text('None'));
        $('#partyList').css('list-style', 'none');
    } else {
        for (let p of trainer.party) {
            $('#partyList').append($('li').text(p));
        }
    }
}
