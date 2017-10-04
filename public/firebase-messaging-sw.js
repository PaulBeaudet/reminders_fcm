importScripts('https://www.gstatic.com/firebasejs/4.4.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.4.0/firebase-messaging.js');

var fb = { // sigelton for firebase shit
    config: {
        apiKey: "AIzaSyAvJE10V7FUDxAG0YIkwrn1PBxslqDn_-s",
        authDomain: "reminder-test-b0c4e.firebaseapp.com",
        databaseURL: "https://reminder-test-b0c4e.firebaseio.com",
        projectId: "reminder-test-b0c4e",
        storageBucket: "reminder-test-b0c4e.appspot.com",
        messagingSenderId: "638191345900"
    },
    init: function(){
        firebase.initializeApp(fb.config);
        fb.messaging = firebase.messaging();
    }
};

fb.init();
