/* Filename: home.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description:
 */

//constants
const serverURL = 'http://157.245.236.86';
var modeURL = '/command/';


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
                printOutput(response.main);
                if (response.main == 'Random Encounter') {
                    modeURL = '/command/rand-enc/';
                }
            } else if (response.encounter) {
                printOutput(response.encounter);
                if (response.encounter == 'Run Away') {
                    modeURL = '/command/';
                }
            } else {
                printOutput('Invalid Command');
            }
        }
    });

    //clear input
    $('#command').val("");
}


/*  Description: This function formats and constructs the html to display the
 *      server's response to the page's 'outputSection'.
 *  Parameters:
 *      output - the object containing the server's output from the command
 */
function printOutput(output) {
    $('#outputSection').append(output + '<br>');
}
