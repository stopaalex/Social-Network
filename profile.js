var email,
    users,
    posts,
    selectedProfile,
    currentUser,
    selectedProfileIsCurrentUser = false,
    editingProfile = false;

const profileImg = document.querySelector('#profileImg');
const profileName = document.querySelector('#profileName');
const profileEdit = document.querySelector('#profileEdit');
const aboutContainer = document.querySelector('#profileAbout');
const postsContainer = document.querySelector('#profilePosts');

function getEmail() {
    var temp = window.name.split(' ');
    email = temp[0];
    currentUser = temp[1];
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

        users.forEach(function (user) {
            if (user.email === email) {
                selectedProfile = user;
            }
        });

        selectedProfile.pictue = 'https://firebasestorage.googleapis.com/v0/b/socialnetwork-6ff89.appspot.com/o/' + selectedProfile.first_name + '_' + selectedProfile.last_name + '_' + selectedProfile.unique_ID + '?alt=media&token=2133d104-6d2b-419c-b9d5-93c3bbdac05f';

        if (selectedProfile.unique_ID === currentUser) {
            selectedProfileIsCurrentUser = true;
        } else {
            selectedProfileIsCurrentUser = false;
        }
        createProfileHeader();
        createProfilePosts();

    });
}

function createProfileHeader() {
    profileImg.innerHTML = '<img src="' + selectedProfile.pictue + '"/>';
    profileName.textContent = selectedProfile.first_name + ' ' + selectedProfile.last_name;
    if (selectedProfileIsCurrentUser) {
        profileEdit.innerHTML = '<button onclick="updateEditProfile()">Edit Profile</button>'
    } else {
        profileEdit.innerHTML = '';
    }
}

function createProfilePosts() {
    posts = [];
    var ref = database.ref("Posts");

    ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var post = childSnapshot.val();
            if (post.poster.email === selectedProfile.email) {
                posts.push(post);
            }
        });

        aboutContainer.textContent = selectedProfile.about;

        var postHTML = posts.map(function (post) {
            return '<div class="profile-post"><div class="profile-post-date">' + post.date_string + '</div><div class="profile-post-text">' + post.text_content + '</div></div>'
        }).join('');
        postsContainer.innerHTML = postHTML;
    });
}

function updateEditProfile(contentUpdated) {
    if (!editingProfile) {
        aboutContainer.text_content = '';
        aboutContainer.innerHTML = '<textarea id="addAboutText"></textarea><button class="saveAboutText" onclick="updateProfile()">Save</button>'
        profileEdit.innerHTML = '<button onclick="updateEditProfile()"  >Close Edit</button>';
        editingProfile = true;
    } else {
        aboutContainer.innerHTML = '';
        aboutContainer.textContent = selectedProfile.about;
        profileEdit.innerHTML = '<button onclick="updateEditProfile()">Edit Profile</button>';
        editingProfile = false;
    }
}

function updateProfile() {
    var aboutContent = document.querySelector('#addAboutText').value;
    // PUSH THE DATA TO THE DATABASE
    database.ref('users/' + selectedProfile.unique_ID).update({
        about: aboutContent
    });
     location.reload();
}

function initialize() {
    getEmail();

    reInitializeFirebase()
}

initialize();
