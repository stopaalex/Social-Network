var email,
    users,
    posts,
    selectedProfile;

function getEmail() {
    email = window.name;
}

/**
 * @name initializeFirebase
 * @desc creating the initial firebase database connection
*/
function reInitializeFirebase() {
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

        users.forEach(function(user) {
            if (user.email === email) {
                selectedProfile = user;
            }
        });

        selectedProfile.pictue = 'https://firebasestorage.googleapis.com/v0/b/socialnetwork-6ff89.appspot.com/o/' + selectedProfile.first_name + '_' + selectedProfile.last_name + '_' + selectedProfile.unique_ID + '?alt=media&token=2133d104-6d2b-419c-b9d5-93c3bbdac05f';

        createProfileHeader();
        createProfilePosts();

    });
}

function createProfileHeader() {
    let profileImg = document.querySelector('#profileImg');
    let profileName = document.querySelector('#profileName');
    profileImg.innerHTML = '<img src="' + selectedProfile.pictue + '"/>';
    profileName.textContent = selectedProfile.first_name + ' ' + selectedProfile.last_name;
}

function createProfilePosts() {
    posts = [];
    var ref = database.ref("Posts");

    ref.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var post = childSnapshot.val();
            if (post.poster.email === selectedProfile.email) {
                posts.push(post);
            }
        });

        let postsContainer = document.querySelector('#profilePosts');

        var postHTML = posts.map(function(post) {
            return '<div class="profile-post"><div class="profile-post-date">' + post.date_string + '</div><div class="profile-post-text">' + post.text_content + '</div></div>'
        }).join('');

        postsContainer.innerHTML = postHTML;
    });
}

function initialize() {
    getEmail();

    reInitializeFirebase()
}

initialize();
