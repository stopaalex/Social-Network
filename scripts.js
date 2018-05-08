const goHomeBtn = document.querySelector('#goHome');
var database;

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

    var ref = firebase.database().ref("users");

    ref.on("value", function (snapshot) {
        var data = [];
        snapshot.forEach(function (childSnapshot) {
            // console.log(childSnapshot.val());
            data.push(childSnapshot.val());
        });

        console.log(data);

        var html = data.map(function(data) {
            return '<div>' + data.first_name + '</div>'
        }).join('');

        document.querySelector('.home-body').innerHTML = html;

    });
}

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

    writeUserData();

}

initialize();