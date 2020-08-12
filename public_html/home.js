/* Filename: home.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description:
 */

//constants
const serverURL = 'http://157.245.236.86';
//const serverURL = 'http://64.227.49.233';
var modeURL = '/command/';

$(document).ready(() => {
    printMain();
});

// Submit the command when either the button is clicked or 'Enter' is pressed
$('#commandBtn').click(() => { submitCommand(); });
$('#command').keypress(function (e) {
    if (e.which == 13) {
        submitCommand();
    }
});

/*  Description: This function submits the command string given by the user to
 *      the server, then it handles the response by calling 'printOutput'.
 *  Parameters: none.
 */
function submitCommand() {
    //if no input, do nothing
    const standoutStr = $('#command').val();
    if (standoutStr == '') {
        return;
    }

    $.ajax({
        type: 'POST',
        url: serverURL + modeURL,
        data: JSON.stringify({command: standoutStr}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (response) => {
            if (response.main) {
                printMain();
                modeURL = '/command/';
            } else if (response.encounter) {
                printPkmn(response.encounter);
                modeURL = '/command/rand-enc/';
            } else if (response.battle) {
                printOutput(response.battle);
                modeURL = '/command/battle/';
            } else {
                printMsg('Invalid Command');
            }
        }
    });

    //clear input
    $('#command').val("");
}


/*  Description: This function puts a message in the message box
 *  Parameters:
 *      msg - the message to be displayed
 */
function printMsg(msg) {
    $('#msg').empty();
    $('#msg').append(msg);
}

/* Description: clears the output window
 */
function clow() {
    $('#msg').empty();
    $('#entity').empty();
}

/* Description: This function prints out the options available to the player at
 *     the main game-screen.
 */
function printMain() {
    clow();
    let bgUrl='./img/bg/city.png'
    $('#outputWindow').css('background-image', `url(${bgUrl})`);
    $('#msg').text('Options');
    $('#entity').append(`random-encounter - starts an encounter
        with a random pokemon<br>`);
    $('#entity').append(`view-party - prints out a list of pokemon
        in your party<br>`);
    $('#entity').append(`<view-pokemon - prints out a list of the
        pokemon you\'ve caught<br>`);
    $('#entity').append(`view name - prints out more information
        about pokemon \'name\'<br>`);
    $('#entity').append(`remove name - removes pokemon \'name\'
        from your party<br>`);
    $('#entity').append(`add name - adds pokemon \'name\' to your
        party<br>`);
    $('#entity').append(`release name - releases the pokemon
        \'name\' back to the wild<br>`);
}

/* Description: This function prints out the info for one pokemon
 * Parameters:
 *     pkmn - the object containing the pokemon's info
 */
function printPkmn(pkmn) {
    clow();
    let bgUrl = './img/bg/kanto.png';
    $('#outputWindow').css("background-image", `url(${bgUrl})`);
    $('#msg').text(`A wild ${pkmn.name} appeared!`);
    $('#entity').append(`${pkmn.name}<br>`);
    $('#entity').append($('<img>', { src: pkmn.sprite, width: '160px',
        alt: `A picture of ${pkmn.name}.` }));
    $('#entity').append('<br>');
    let type2 = pkmn.pType2 ? ` / ${pkmn.pType2}<br>` : '<br>';
    $('#entity').append(`Type: ${pkmn.pType1}${type2}`);
}
