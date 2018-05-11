// MAIN JS PAGE FOR THE SOCIAL NETWORK

// // // // // // // // // // // /
// CONSTANTS AND VARIABLES // //
// // // // // // // // // // /
const goHomeBtn = document.querySelector('#goHome');
const logInCont = document.querySelector('#welcomeLoginContent');
const splashContent = document.querySelector('#welcomeWelcomeContent');
const createProfileModal = document.querySelector('#createProfileModal');
const saveLogInConfirm = document.querySelector('#saveLogInConfirm');
const welcomeNoAuth = document.querySelector('.home-welcome-not-authenticated');

const cornerProfImg = document.querySelector('.welcome-corner-profile');
const welcomeAuthed = document.querySelector('.home-welcome-authenticated');
const welcomeUserContainer = document.querySelector('.welcome-user-container');
const feedContainter = document.querySelector('.feed-container');
const welcomeUserContent = document.querySelector('#welcomeUserContent');
const feedContent = document.querySelector('#feedContent');


var database,
    storage,
    users = [],
    posts = [],
    activeUser,
    userLoggedIn = false,
    userHasSavedCreds = false;

// // // // // // /
// FUNCTIONS // //
// // // // // //

/**
 * @name initializeFirebase
 * @desc creating the initial firebase database connection
*/
function initializeFirebase() {
    var config = {
        apiKey: "AIzaSyDmhOnSLgpxFDryaKyK3mAEhXdXu6MLvsc",
        authDomain: "socialnetwork-6ff89.firebaseapp.com",
        databaseURL: "https://socialnetwork-6ff89.firebaseio.com",
        projectId: "socialnetwork-6ff89",
        storageBucket: "socialnetwork-6ff89.appspot.com",
        messagingSenderId: "492815653675"
    };
    firebase.initializeApp(config);

    database = firebase.database();

    storage = firebase.storage();

    getUserInfo();
}

/**
 * @name getUserInfo
 * @desc gets all of the users information
*/
function getUserInfo() {
    users = [];
    var ref = database.ref("users");

    ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            // console.log(childSnapshot.val());
            users.push(childSnapshot.val());
        });

        checkForSavedCreds();
    });
}

/**
 * @name UpdateUserInfo
 * @desc updates the users array to ensure all user data is accounted for.
*/
function updateUserInfo() {
    users = [];
    var ref = database.ref("users");

    ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            // console.log(childSnapshot.val());
            users.push(childSnapshot.val());
        });
    });
}

/**
 * @name checkForSavedCreds
 * @desc checks the local storage for saved credentials and then auto logs in
 */
function checkForSavedCreds() {
    var savedCreds = JSON.parse(window.localStorage.getItem('SNCreds'));
    if (savedCreds) {
        userHasSavedCreds = true;
        autoLogIn(savedCreds);
    }
}

/**
 * @name autoLogIn
 * @desc takes the local storagfe saved credentials and runs them through against the users to ensure the user exists and then 'logs in' and gets feed
 * @param {object} credentials - credentials saved to the local storage
 */
function autoLogIn(credentials) {
    users.forEach(function (user) {
        if (credentials.lastName === user.last_name && credentials.password === user.pass) {
            userLoggedIn = true;
            activeUser = user.unique_ID;
            // document.querySelector('#feedAddContent').innerHTML = newPostHTML;
            logInCont.style.display = 'none';
        }
    });
    if (userLoggedIn) {
        logInCont.style.display = 'none';
        splashContent.style.display = 'none';
        getLoggedInUserInfo();
    }
}

/**
 * @name showCreateProfileModal
 * @desc shows the create profile modal
 */
function showCreateProfileModal() {
    createProfileModal.style.display = 'flex';
}

/**
 * @name hideCreateProfileModal
 * @desc hides teh create profile modal
 */
function hideCreateProfileModal() {
    // HIDE THE MODAL AND CLEAR ALL THE DATA
    createProfileModal.style.display = 'none';
    document.querySelector('#createFirstName').value = '',
        document.querySelector('#createLastName').value = '',
        document.querySelector('#createPassword').value = '',
        document.querySelector('#createPasswordCheck').value = '',
        document.querySelector('#createProfileAlert').textContent = null;
}

/**
 * @name createNewUserProfile
 * @desc writes a new users data to the database
*/
function createNewUserProfile() {
    // COLLECT THE USER INPUT CONTENT
    var alertTextContainer = document.querySelector('#createProfileAlert'),
        firstName = document.querySelector('#createFirstName').value,
        lastName = document.querySelector('#createLastName').value,
        password = document.querySelector('#createPassword').value,
        passwordCheck = document.querySelector('#createPasswordCheck').value,
        uniqueID;

    // VALIDATE PASSWORDS
    if (password !== passwordCheck) {
        console.log('PASSWORDS DONT MATCH');
        alertTextContainer.textContent = '* Passwords Do Not Match';
        return;
        // CHECK FOR CONTENTS IN FIRST, LAST, PASS, AND PASSCHECK BEFORE UPLOADING
    } else if (!firstName || !lastName || !password || !passwordCheck) {
        console.log('MISSING DATA');
        alertTextContainer.textContent = '* Your\'re Missing Info';
    } else {
        // CREATING UNIQUE ID WITH 11 RANDOM NUMBERS
        var numArray = [];
        for (var i = 0; i < 11; i++) {
            var num = Math.floor(Math.random() * 9) + 0;
            numArray.push(num);
        }
        uniqueID = numArray.map(function (number) {
            return number;
        }).join('');

        // PUSH THE DATA TO THE DATABASE
        firebase.database().ref('users/' + uniqueID).set({
            unique_ID: uniqueID,
            first_name: firstName,
            last_name: lastName,
            pass: password
        });

        // GET TEH SELECTED FILE AND PUSH TO STORAGE
        var picturePath = document.querySelector('#pictureUpload');
        var pictureFile = picturePath.files[0];
        var storageRef = storage.ref(firstName + '_' + lastName + '_' + uniqueID);
        if (pictureFile) {
            storageRef.put(pictureFile);
        }

        users = [];
        database.ref("users").once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                // console.log(childSnapshot.val());
                users.push(childSnapshot.val());
            });

            logInFromCreation(lastName, password);

            users.forEach(function (user) {
                if (user.unique_ID === uniqueID) {
                    // CLEAR OUT VALUES
                    firstName = '';
                    lastName = '';
                    password = '';
                    passwordCheck = '';
                    picturePath = null;
                    pictureFile = null;
                    // HIDE THE MODAL
                    createProfileModal.style.display = 'none';
                    alertTextContainer.textContent = null;
                    console.log('PROFILE CREATED');
                }
            });
        });

        // CHECK TO ENSURE NEW USER WAS CREATED AND THEN CLEAR INPUTS
    }
}

/**
 * @name logInFromCreation
 * @desc logs the user in after creating a profile
 * @param {string} lastName 
 * @param {string} password 
 */
function logInFromCreation(lastName, password) {
    users.forEach(function (user) {
        if (lastName === user.last_name && password === user.pass) {
            userLoggedIn = true;
            activeUser = user.unique_ID;
            // document.querySelector('#feedAddContent').innerHTML = newPostHTML;
            logInCont.style.display = 'none';
        }
    });
    if (userLoggedIn) {
        logInCont.style.display = 'none';
        splashContent.style.display = 'none';
        console.log('LOGGED IN');
        getLoggedInUserInfo();
    } else {
        console.log('BAD CREDENTIALS');
    }
}

/**
 * @name userLogIn
 * @desc log in from the user
 */
function userLogIn() {
    var lastName, password;
    lastName = document.querySelector('#logInLastName').value;
    password = document.querySelector('#logInPassword').value;
    users.forEach(function (user) {
        if (lastName === user.last_name && password === user.pass) {
            userLoggedIn = true;
            activeUser = user.unique_ID;
            // document.querySelector('#feedAddContent').innerHTML = newPostHTML;
            logInCont.style.display = 'none';
        }
    });
    if (userLoggedIn) {
        console.log('LOGGED IN');
        logInCont.style.display = 'none';
        splashContent.style.display = 'none';
        getLoggedInUserInfo();
    } else {
        console.log('BAD CREDENTIALS');
    }

    if (updateLogInSave()) {
        var SNCreds = {
            lastName: lastName,
            password: password
        }
        window.localStorage.setItem('SNCreds', JSON.stringify(SNCreds));
    }
}

/**
 * @name updateLogInSave
 * @desc checks for the save credential chekcbox
 * @return {bool} bool that states if the check box ix checked or not
 */
function updateLogInSave() {
    var checkbox = document.querySelector('#saveLogInConfirm');
    if (checkbox.checked) {
        checkbox.classList.add('saveLogInCheck');
    } else {
        checkbox.classList.remove('saveLogInCheck');
    }

    return checkbox.checked;
}

/**
 * @name getLoggedInUserInfo
 * @desc once the user has been logged get the new content - types of log ins - auto(localstorage saved creds), user(entering name and password), creation(after creating a new profile)
*/
function getLoggedInUserInfo() {

    welcomeNoAuth.style.display = 'none';
    welcomeAuthed.style.display = 'flex';

    updateUserInfo();
    setTimeout(function() {
        createWelcomeContent();
    }, 1000);
    // createWelcomeContent();
    // welcomeUserContent.innerHTML = createWelcomeContent();

    getPostsForFeed();
}

function createWelcomeContent() {
    var activeUserInfo = {
        firstName: '',
        lastName: '',
        imgLocation: ''
    }
        
    users.forEach(function(user) {
        if (activeUser === user.unique_ID) {
            activeUserInfo = {
                firstName: user.first_name,
                lastName: user.last_name,
                imgLocation: 'https://firebasestorage.googleapis.com/v0/b/socialnetwork-6ff89.appspot.com/o/' + user.first_name + '_' + user.last_name + '_' + user.unique_ID + '?alt=media&token=2133d104-6d2b-419c-b9d5-93c3bbdac05f',
            }
        }
    });
    cornerProfImg.style.display = 'flex';
    cornerProfImg.innerHTML = '<div class="user-name">' + activeUserInfo.firstName + '</div><div class="user-img"><img src="' + activeUserInfo.imgLocation + '"/><div>'
    welcomeUserContent.innerHTML = '<div>Welcome to the SOCIALnetwork ' + activeUserInfo.firstName+ '!</div>';

    // console.log(activeUserInfo);
}

/**
 * @name getPostsForFeed
 * @desc gets all of the posts for the feed
*/
function getPostsForFeed() {
    posts = [];
    // Defining the reference to get data from the database
    var ref = database.ref("Posts");
    ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            posts.push(childSnapshot.val());
        });
        // var feedHTML = posts.map(function (post) {
        //     var poster = post.poster;
        //     var text_content = post.text_content;
        //     return '<div class="feed-post"><div class="info">' + poster + '</div><div class="text">' + text_content + '</div></div>';
        // }).join('');

        // if (userLoggedIn) {
        //     document.querySelector('#feedAddContent').innerHTML = newPostHTML;
        //     document.querySelector('#feedContent').innerHTML = feedHTML;
        // }
    });
}

function initialize() {
    // DEFUALT HIDE THE CREATE PROFILE
    createProfileModal.style.display = 'none';
    // DEFUALT HIDE THE AUTHENTICATED USER CONTENT
    welcomeAuthed.style.display = 'none';
    cornerProfImg.style.display = 'none';

    initializeFirebase();

    saveLogInConfirm.addEventListener('change', updateLogInSave);

    goHomeBtn.addEventListener('click', function () {
        location.href = 'index.html';
    });
}

initialize();