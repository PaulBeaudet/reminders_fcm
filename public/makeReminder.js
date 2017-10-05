// makeReminder.js ~ copyright 2017 Paul Beaudet ~ License MIT
var socket = {
    io: io(),
    init: function(){
        socket.io.on('confirm', reminder.app.confirm);
    }
};

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
        fb.messaging.requestPermission().then(function onPermission(){
            return fb.messaging.getToken();            // only try to get token when we get permission
        }).then(function gotTheToken(token){           // first step is to get a token, server is going to store it anyhow
            socket.io.emit('myToken', {token: token}); // share token info with server
        }).catch(function onError(error){console.log('firebase init issue:' + error);});
        fb.messaging.onMessage(function gotAMessage(payload){
            // console.log('onMessage: ' + JSON.stringify(payload, null, 4));
            reminder.app.message = payload.data.body;
        });
    }
};


var reminder = {       //
        app: new Vue({ // I can only imagine this framework is full of dank memes
        el: '#app',
        data: {
            reminder: 'forget the milk', // reminds you that milk would be nice
            timeToFire: 5000,            // five second default
            message: 'reminder not set', // basically a status message
        },
        methods: {
            makeReminder: function(){    // method for setting up reminders
                socket.io.emit('myReminder', {
                    reminder: this.reminder,
                    timeToFire: this.timeToFire // in millis, stupidly uses setTimeout without converting anything
                });
            },
            confirm: function(data){
                this.message = data.message; // let server communicate whats its issues are
            }
        }
    })
};

fb.init();     // start firebase client up
socket.init(); // set on message evets
