/* Filename: home.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description:
 */

//constants
const serverURL = 'http://157.245.236.86';


// Submit the command when either the button is clicked or 'Enter' is pressed
$('#commandBtn').click(() => { submitCommand(); });
$('#command').keypress(function (e) {
    if (e.which == 13) {
        submitCommand();
    }
});


function submitCommand() {
    //if no input, do nothing
    const cmdStr = $('#command').val();
    if (cmdStr == '') {
        return;
    }

    $.ajax({
        type: 'POST',
        url: serverURL + '/command/',
        data: JSON.stringify({command: cmdStr}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (response) => {
            if (response.valid) {
                printOutput(response.output);
            } else {
                alert('Invalid Command');
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
    $('#outputSection').append(output);
}
