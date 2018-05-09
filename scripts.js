const goHomeBtn = document.querySelector('#goHome');
const logInCont = document.querySelector('#feedLoginContent');
const newPostHTML = '<div class="feed-add"><div class="input"><textarea id="feedAddContent"></textarea></div><div class="post-to-feed"><button id="postToFeed">Post to feed</button></div></div>';
const createProfileModal = document.querySelector('#createProfileModal');
var database,
    users = [],
    posts = [],
    activeUser,
    userLoggedIn = false;

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
}

/**
 * @name getUserInfo
 * @desc gets all of the users information
*/
function getUserInfo() {
    var ref = database.ref("users");

    ref.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            // console.log(childSnapshot.val());
            users.push(childSnapshot.val());
        });
    });
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

function showCreateProfileModal() {
    createProfileModal.style.display = 'flex';
}

function hideCreateProfileModal() {
    createProfileModal.style.display = 'none';
}

// /**
//  * @name createNewUserProfile
//  * @desc writes a new users data to the database
// */
// function createNewUserProfile() {
//     firebase.database().ref('users/' + 12345678912).set({
//         first_name: 'James',
//         last_name: 'Dude',
//         uniquer_ID: 12345678912,
//         pass: testPass4
//     });
// }

/**
 * @name userLogIn
 * @desc log in from the user
 */
function userLogIn() {
    var lastName = document.querySelector('#logInLastName').value;
    var password = document.querySelector('#logInPassword').value;

    users.forEach(function(user) {
        if (lastName === user.last_name && password === user.pass) {
            userLoggedIn = true;
            document.querySelector('#feedAddContent').innerHTML = newPostHTML;
            logInCont.style.display = 'none';
        }
    })
    if (userLoggedIn) {
        console.log('LOGGED IN');
        getPostsForFeed();
    } else {
        console.log('BAD CREDENTIALS');
    }
}

function initialize() {
    createProfileModal.style.display = 'none';

    initializeFirebase();

    goHomeBtn.addEventListener('click', function () {
        location.href = 'index.html';
    });
}

initialize();