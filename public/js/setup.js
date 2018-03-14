window.firebase = function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAju42wcuCbSuZ5yCEuyQYzP0UhGBWHt3Q",
        authDomain: "train-scheduler-bbc3e.firebaseapp.com",
        databaseURL: "https://train-scheduler-bbc3e.firebaseio.com",
        projectId: "train-scheduler-bbc3e",
        storageBucket: "train-scheduler-bbc3e.appspot.com",
        messagingSenderId: "911719863589"
    };
    firebase.initializeApp(config);

    return firebase;
}()