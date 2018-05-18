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
const welcomePeopleContainer = document.querySelector('#welcomePeopleContainer');
const feedContainter = document.querySelector('.feed-container');
const welcomeUserContent = document.querySelector('#welcomeUserContent');
const feedContent = document.querySelector('#feedContent');

const frameContainer = document.querySelector('#profileIframeContainer');
const closeProfileBtn = document.querySelector('.close-profile');

const homeLeft = document.querySelector('.home-authenticated-left');
const homeRight = document.querySelector('.home-authenticated-right');
const toggleSize = document.querySelector('.adjust-size-btn').querySelector('i');;


var database,
    storage,
    users = [],
    posts = [],
    activeUser,
    userLoggedIn = false,
    userHasSavedCreds = false,
    activeUserPersona,
    containerEnglarged = 'left';

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
        if (credentials.email === user.email && credentials.password === user.pass) {
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
        document.querySelector('#createEmail').value = '';
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
        email = document.querySelector('#createEmail').value,
        password = document.querySelector('#createPassword').value,
        passwordCheck = document.querySelector('#createPasswordCheck').value,
        uniqueID,
        uniqueEmail = true;

    // CHECK FOR EMAIL ALREADY IN USE
    users.forEach(function (user) {
        if (user.email === email) {
            uniqueEmail = false;
        }
    });

    // VALIDATE PASSWORDS
    if (password !== passwordCheck) {
        console.log('PASSWORDS DONT MATCH');
        alertTextContainer.textContent = '* Passwords Do Not Match';
        return;
        // CHECK FOR CONTENTS IN FIRST, LAST, PASS, AND PASSCHECK BEFORE UPLOADING
    } else if (!firstName || !lastName || !password || !passwordCheck) {
        console.log('MISSING DATA');
        alertTextContainer.textContent = '* Your\'re Missing Info';
    } else if (!uniqueEmail) {
        console.log('NON UNIQUE EMAIL');
        alertTextContainer.textContent = '* E-mail is already in use';
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
            email: email,
            pass: password,
            about: ''
        });

        // GET TEH SELECTED FILE AND PUSH TO STORAGE
        var picturePath = document.querySelector('#pictureUpload');
        var pictureFile = picturePath.files[0];
        var storageRef = storage.ref(firstName + '_' + lastName + '_' + uniqueID);
        if (pictureFile && picturePath) {
            storageRef.put(pictureFile);
        }

        users = [];
        database.ref("users").once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                // console.log(childSnapshot.val());
                users.push(childSnapshot.val());
            });

            logInFromCreation(email, password);

            users.forEach(function (user) {
                if (user.unique_ID === uniqueID) {
                    // CLEAR OUT VALUES
                    firstName = '';
                    lastName = '';
                    email = '';
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

        hideCreateProfileModal();
    }
}

/**
 * @name logInFromCreation
 * @desc logs the user in after creating a profile
 * @param {string} lastName 
 * @param {string} password 
 */
function logInFromCreation(email, password) {
    users.forEach(function (user) {
        if (email === user.email && password === user.pass) {
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
    email = document.querySelector('#logInEmail').value;
    // lastName = document.querySelector('#logInLastName').value;
    password = document.querySelector('#logInPassword').value;
    users.forEach(function (user) {
        if (email === user.email && password === user.pass) {
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
            email: email,
            password: password
        }
        window.localStorage.setItem('SNCreds', JSON.stringify(SNCreds));
        console.log('SHOULD SAVE CREDS')
    }
}

function signOutUser() {
    var savedCreds = JSON.parse(window.localStorage.getItem('SNCreds'));
    if (savedCreds) {
        window.localStorage.removeItem('SNCreds');
        location.reload();
    } else {
        location.reload();
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
    // PUSHING EVERYTHING INTO THIS TIMEOUT BC I CURRENTLY DONT KNOW HOW
    // TO GET PAST THE ASYNC CALL SO IM JUST WAITING 1S BEOFRE RUNNING THE OTHER FUNCTIONS
    setTimeout(function () {
        createActiveUserPersona();
        createWelcomeContent();
        getPostsForFeed();
        createPeopleList();
    }, 1000);


}

function createActiveUserPersona() {
    users.forEach(function (user) {
        if (activeUser === user.unique_ID) {
            activeUserPersona = {
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                imgLocation: 'https://firebasestorage.googleapis.com/v0/b/socialnetwork-6ff89.appspot.com/o/' + user.first_name + '_' + user.last_name + '_' + user.unique_ID + '?alt=media&token=2133d104-6d2b-419c-b9d5-93c3bbdac05f',
            }
        }
    });
}

function createWelcomeContent() {
    cornerProfImg.style.display = 'flex';

    cornerProfImg.innerHTML = '<div class="user-sign-out" onclick="signOutUser()">Sign Out</div><div class="user-name">' + activeUserPersona.firstName + '</div><div class="user-img" onclick="openUserProfile(this)" data-email="' + activeUserPersona.email + '"><img onerror="this.onerror=null;this.src=\'https://firebasestorage.googleapis.com/v0/b/socialnetwork-6ff89.appspot.com/o/blankImage.png?alt=media&token=5dacfc62-362e-4be1-a929-0732441ae6be\'" src="' + activeUserPersona.imgLocation + '"/><div>';

    welcomeUserContent.innerHTML = '<div class="welcome-left"><div class="welcome-img" onclick="openUserProfile(this)" data-email="' + activeUserPersona.email + '"><img  onerror="this.onerror=null;this.src=\'https://firebasestorage.googleapis.com/v0/b/socialnetwork-6ff89.appspot.com/o/blankImage.png?alt=media&token=5dacfc62-362e-4be1-a929-0732441ae6be\'" src="' + activeUserPersona.imgLocation + '"/></div></div><div class="welcome-new-post-text"><textarea id="newPostContent" placeholder="Whatcha thinkin\' about, ' + activeUserPersona.firstName + '?"></textarea><div class="active-textarea-underline"></div><div class="post-to-feed-btn"><button onclick="pushToFeed()">Post to Feed</button></div></div>';

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

        posts.sort(function (a, b) {
            if (a.date > b.date) {
                return -1
            } else if (a.date < b.date) {
                return 1;
            } else {
                return 0
            }
        });


        var feedHTML = posts.map(function (post) {
            var poster = post.poster,
                text_content = post.text_content;
            return '<div class="feed-post"><div class="info"><div class="feed-post-img" onclick="openUserProfile(this)" data-email="' + post.poster.email + '"><img onerror="this.onerror=null;this.src=\'https://firebasestorage.googleapis.com/v0/b/socialnetwork-6ff89.appspot.com/o/blankImage.png?alt=media&token=5dacfc62-362e-4be1-a929-0732441ae6be\'" src="' + post.poster.imgLocation + '"/></div><div class="feed-post-text"><div class="feed-post-name">' + post.poster.firstName + ' ' + post.poster.lastName + '</div><div class="feed-post-date">' + post.date_string + '</div></div></div><div class="text">' + text_content + '</div><div class="feed-border"></div></div>';
        }).join('');

        feedContent.innerHTML = feedHTML;
    });
}

function pushToFeed() {
    // CREATING UNIQUE ID WITH 11 RANDOM NUMBERS
    var uniqueID,
        numArray = [];
    for (var i = 0; i < 20; i++) {
        var num = Math.floor(Math.random() * 9) + 0;
        numArray.push(num);
    }
    uniqueID = numArray.map(function (number) {
        return number;
    }).join('');

    var datePlaceHolder = new Date,
        time = datePlaceHolder.getHours() + ':' + datePlaceHolder.getMinutes(),
        date = datePlaceHolder.getMonth() + '/' + datePlaceHolder.getMonth() + '/' + datePlaceHolder.getFullYear(),
        dateString = (date + ' ' + time).toString();

    var newPostContent = document.querySelector('#newPostContent').value;

    if (!newPostContent) {
        console.log('YOU NEED CONTENT');
        return
    }
    // PUSH THE DATA TO THE DATABASE
    firebase.database().ref('Posts/' + uniqueID).set({
        date: firebase.database.ServerValue.TIMESTAMP,
        date_string: dateString,
        poster: activeUserPersona,
        poster_Id: activeUser,
        post_ID: uniqueID,
        text_content: newPostContent
    });

    document.querySelector('#newPostContent').value = '';
    setTimeout(function () {
        getPostsForFeed();
    }, 250);
}

function createPeopleList() {
    var listPeopleHTML = users.map(function (user) {
        return '<div class="person-container"><div>' + user.first_name + '</div></div>'
    }).join('');
    welcomePeopleContainer.innerHTML = listPeopleHTML;
    console.log(users);
}

function adjustSize() {
    if (containerEnglarged === 'left') {
        homeLeft.style.flex = '1'
        homeRight.style.flex = '2'
        toggleSize.classList.remove('fa-chevron-left');
        toggleSize.classList.add('fa-chevron-right');
        containerEnglarged = 'right';
    } else if (containerEnglarged === 'right') {
        homeLeft.style.flex = '2'
        homeRight.style.flex = '1'
        toggleSize.classList.remove('fa-chevron-right');
        toggleSize.classList.add('fa-chevron-left');
        containerEnglarged = 'left';
    }
}

function openUserProfile(action) {
    var profilePersona;
    users.forEach(function (user) {
        if (action.dataset.email === user.email) {
            profilePersona = user;
        }
    });
    passDataToIframe(profilePersona);
    // console.dir(profilePersona);
}

function passDataToIframe(profile) {
    closeProfileBtn.style.display = 'flex';
    frameContainer.style.display = 'flex';
    frameContainer.innerHTML = '<iframe name="' + profile.email + ' ' + activeUser + '" src="profilePage.html"></iframe>'
}

function closeProfile() {
    frameContainer.style.display = 'none';
    closeProfileBtn.style.display = 'none';
    frameContainer.innerHTML = '';
}

function createRandomBackground() {
    var backgroundContainer = document.querySelector('.random-background');

    for (var i = 0; i < 1000; i++) {
        var randomScale = Math.round(Math.random() * 10);
        var randomRotate = Math.round(Math.random() * 360);
        var html = '<div class="squigle" style="transform:scaleY(' + randomScale + ') rotate(' + randomRotate + 'deg)"></div>';
        if (i < 1) {
            backgroundContainer.innerHTML = html;
        } else {
            backgroundContainer.innerHTML = backgroundContainer.innerHTML + html;
        }
    }
}

function initialize() {
    // DEFUALT HIDE THE CREATE PROFILE
    createProfileModal.style.display = 'none';
    // DEFUALT HIDE THE AUTHENTICATED USER CONTENT
    welcomeAuthed.style.display = 'none';
    cornerProfImg.style.display = 'none';

    frameContainer.style.display = 'none'
    closeProfileBtn.style.display = 'none';

    initializeFirebase();

    // setTimeout(createRandomBackground(), 1000);

    saveLogInConfirm.addEventListener('change', updateLogInSave);

    goHomeBtn.addEventListener('click', function () {
        location.href = 'index.html';
    });
}

initialize();