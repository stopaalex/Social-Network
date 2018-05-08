const goHomeBtn = document.querySelector('#goHome');
var database,
    users,
    posts;

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
    getPostsForFeed();
}

/**
 * @name getPostsForFeed
 * @desc gets all of the posts for the feed
 * @return {void}
*/
function getPostsForFeed() {
    var ref = database.ref("Posts");

    ref.on("value", function(snapshot) {
        posts = [];
        snapshot.forEach(function(childSnapshot) {
            posts.push(childSnapshot.val());
        });
        // console.log(posts);

        var feedHTML = posts.map(function(post) {
            var poster = post.poster;
            var text_content = post.text_content;
            return '<div class="feed-post"><div class="info">' + poster + '</div><div class="text">' + text_content + '</div></div>';
        }).join('');

        document.querySelector('#feedContent').innerHTML = feedHTML;
    });
}

/**
 * @name getUserInfo
 * @desc gets all of the users information
 * @return {void}
*/
function getUserInfo() {
    var ref = database.ref("users");

    ref.on("value", function(snapshot) {
        users = [];
        snapshot.forEach(function(childSnapshot) {
            // console.log(childSnapshot.val());
            users.push(childSnapshot.val());
        });
        console.log(users);
    });
}

/**
 * @name writeUserData
 * @desc writes a new users data to the database
 * @return {void}
*/
function writeUserData() {
    firebase.database().ref('users/' + 12345678912).set({
        first_name: 'Alan',
        last_name: 'Mark',
        uniquer_ID: 12345678912
    });
}

function initialize() {
    goHomeBtn.addEventListener('click', function () {
        location.href = 'index.html';
    });

    initializeFirebase();

    // writeUserData();

}

initialize();