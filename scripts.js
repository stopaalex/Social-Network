const goHomeBtn = document.querySelector('#goHome');
const logInCont = document.querySelector('#feedLoginContent');
const newPostHTML = '<div class="feed-add"><div class="input"><textarea id="feedAddContent"></textarea></div><div class="post-to-feed"><button id="postToFeed">Post to feed</button></div></div>';
const createProfileModal = document.querySelector('#createProfileModal');
const saveLogInConfirm = document.querySelector('#saveLogInConfirm');
var database,
    users = [],
    posts = [],
    activeUser,
    userLoggedIn = false,
    userHasSavedCreds = false;

// Hord coded in just to test functionality - not secure at all!!!
var password = '';

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

    getUserInfo();
    checkForSavedCreds();
}

/**
 * @name getUserInfo
 * @desc gets all of the users information
*/
function getUserInfo() {
    users = [];
    var ref = database.ref("users");

    ref.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
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
 * @name getPostsForFeed
 * @desc gets all of the posts for the feed
*/
function getPostsForFeed() {
    // Defining the reference to get data from the database
    var ref = database.ref("Posts");
    ref.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            posts.push(childSnapshot.val());
        });
        var feedHTML = posts.map(function(post) {
            var poster = post.poster;
            var text_content = post.text_content;
            return '<div class="feed-post"><div class="info">' + poster + '</div><div class="text">' + text_content + '</div></div>';
        }).join('');

        if (userLoggedIn) {
            document.querySelector('#feedAddContent').innerHTML = newPostHTML;
            document.querySelector('#feedContent').innerHTML = feedHTML;
            logInCont.style.display = 'none';
        }
    });
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
    createProfileModal.style.display = 'none';
}

/**
 * @name createNewUserProfile
 * @desc writes a new users data to the database
*/
function createNewUserProfile() {
    // COLLECT THE USER INPUT CONTENT
    var firstName = document.querySelector('#createFirstName').value,
        lastName = document.querySelector('#createLastName').value,
        password = document.querySelector('#createPassword').value,
        passwordCheck = document.querySelector('#createPasswordCheck').value,
        uniqueID;
    
    // VALIDATE PASSWORDS
    if (password !== passwordCheck) {
        console.log('PASSWORDS DONT MATCH');
        return;
    }  else if (!firstName || !lastName || !password || !passwordCheck) {
        console.log('MISSING DATA');
    } else {
        var numArray = [];
        for (var i = 0; i < 11; i++) {
            var num =  Math.floor(Math.random() * 9) + 0;
            numArray.push(num);
        }
        uniqueID = numArray.map(function(number) {
            return number;
        }).join('');

        firebase.database().ref('users/' + uniqueID).set({
            unique_ID: uniqueID,
            first_name: firstName,
            last_name: lastName,
            pass: password
        });

        users.forEach(function(user) {
            if (user.unique_ID === uniqueID) {
                // CLEAR OUT VALUES
                firstName = '';
                lastName = '';
                password = '';
                passwordCheck = '';
                // HIDE THE MODAL
                createProfileModal.style.display = 'none';
                console.log('PROFILE CREATED');
            }
        });
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

    users.forEach(function(user) {
        if (lastName === user.last_name && password === user.pass) {
            userLoggedIn = true;
            document.querySelector('#feedAddContent').innerHTML = newPostHTML;
            logInCont.style.display = 'none';
        }
    });
    if (userLoggedIn) {
        console.log('LOGGED IN');
        getPostsForFeed();
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
 * @name autoLogIn
 * @desc takes the local storagfe saved credentials and runs them through against the users to ensure the user exists and then 'logs in' and gets feed
 * @param {object} credentials - credentials saved to the local storage
 */
function autoLogIn(credentials) {
    users = [];
    var ref = database.ref("users");

    ref.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            // console.log(childSnapshot.val());
            users.push(childSnapshot.val());
        });

        users.forEach(function(user) {
            if (credentials.lastName === user.last_name && credentials.password === user.pass) {
                userLoggedIn = true;
                document.querySelector('#feedAddContent').innerHTML = newPostHTML;
                logInCont.style.display = 'none';
                getPostsForFeed();
            }
        });
    });
}

function initialize() {
    createProfileModal.style.display = 'none';

    initializeFirebase();

    saveLogInConfirm.addEventListener('change', updateLogInSave);
    
    goHomeBtn.addEventListener('click', function () {
        location.href = 'index.html';
    });
}

initialize();