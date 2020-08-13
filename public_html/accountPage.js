/* Filename: account.js
 * Authors: Justin Nichols (jdnscieArea.), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file contains the functions needed to upload an avatar
 *      image to the server.
 */

//constants
//const serverURL = 'http://157.245.236.86';
const serverURL = 'http://64.227.49.233';

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
                alert('Avatar uploaded.');
            }
        }
    });
});
