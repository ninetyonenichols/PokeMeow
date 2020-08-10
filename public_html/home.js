/* Filename: home.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description:
 */

//constants
//const serverURL = 'http://157.245.236.86';
const serverURL = 'http://64.227.49.233';
var modeURL = '/command/';

$(document).ready(() => {
    printMain();
    $('outputWindow').prepend('Welcome to PokeMeow!<br>');
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
    const cmdStr = $('#command').val();
    if (cmdStr == '') {
        return;
    }

    $.ajax({
        type: 'POST',
        url: serverURL + modeURL,
        data: JSON.stringify({command: cmdStr}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (response) => {
            if (response.main) {
                printMain();
                modeURL = '/command/';
            } else if (response.encounter) {
                printPkmn(response.encounter);
                modeURL = '/command/rand-enc/';
            } else {
                printOutput('Invalid Command');
            }
        }
    });

    //clear input
    $('#command').val("");
}


/*  Description: This function formats and constructs the html to display the
 *      server's response to the page's '#outputSection'.
 *  Parameters:
 *      output - the object containing the server's output from the command
 */
function printOutput(output) {
    $('#outputWindow').append(JSON.stringify(output) + '<br>');
}

/* Description: This function prints out the options available to the player at
 *     the main game-screen.
 */
function printMain() {
    //$('#outputWindow').append('');  
    $('#outputWindow').empty();  
    $('#outputWindow').append('<span class=\"cmd\">Options</span><br>');  
    $('#outputWindow').append(`<span class=\"cmd\">random-encounter</span> - starts an encounter 
        with a random pokemon<br>`);  
    $('#outputWindow').append(`<span class=\"cmd\">view-party</span> - prints out a list of pokemon
        in your party<br>`);  
    $('#outputWindow').append(`<span class=\"cmd\">view-pokemon</span> - prints out a list of the
        pokemon you\'ve caught<br>`);  
    $('#outputWindow').append(`<span class=\"cmd\">view name</span> - prints out more information
        about pokemon \'name\'<br>`);  
    $('#outputWindow').append(`<span class=\"cmd\">remove name</span> - removes pokemon \'name\' 
        from your party<br>`);  
    $('#outputWindow').append(`<span class=\"cmd\">add name</span> - adds pokemon \'name\' to your
        party<br>`);  
    $('#outputWindow').append(`<span class=\"cmd\">release name</span> - releases the pokemon 
        \'name\' back to the wild<br>`);  
}

/* Description: This function prints out the info for one pokemon
 * Parameters: 
 *     pkmn - the object containing the pokemon's info
 */
function printPkmn(pkmn) {
    let type2 = pkmn.pType2 ? ` / ${pkmn.pType2}<br>` : '<br>';
    $('#outputWindow').empty();
    $('#outputWindow').append(`A wild ${pkmn.name} appeared!<br>`);
    $('#outputWindow').append(`${pkmn.name}<br>`);
    $('#outputWindow').append($('<img>', { src: pkmn.sprite, width: '100px',
        alt: `A picture of ${pkmn.name}.` }));
    $('#outputWindow').append('<br>');
    $('#outputWindow').append(`Type: ${pkmn.pType1}${type2}`);
    $('#outputWindow').append('<span class=\"cmd\">Options</span><br>');
    $('#outputWindow').append('<span class=\"cmd\">throw-ball</span> - throw a PokeBall.<br>');
    $('#outputWindow').append('<span class=\"cmd\">run</span> run away.<br>');
}
