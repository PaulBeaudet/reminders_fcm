// reminder.js ~ copyright 2017 Paul Beaudet ~ MIT License
var path = require('path');

var firebase = {
    admin: require('firebase-admin'),
    init: function(){
        var serviceAccount = require(path.join(__dirname+'/keys/reminder-test-1213a693dc33.json'));
        firebase.admin.initializeApp({
            credential: firebase.admin.credential.cert(serviceAccount),
            databaseURL: "https://reminder-test-b0c4e.firebaseio.com/"
        });
    },
    pushIt: function(fcmToken, reminder){
        var payload = {data: {title: 'Reminder',body: reminder}};
        firebase.admin.messaging().sendToDevice(fcmToken, payload).then(function(response) {
            console.log("Successfully sent message:", response);
        }).catch(function(error) {
            console.log("Error sending message:", error);
        });
    }
};

var notify = {
    users: [],
    createReminder: function(clientId){
        return function createEvent(data){
            var idx = notify.grabIndex(clientId);
            if(idx > -1){
                socket.io.to(clientId).emit('confirm', {message: 'Pending reminder'});
                var fcmToken = notify.users[idx].fcmToken; // hold this in closure
                setTimeout(function pushIt(){
                    firebase.pushIt(fcmToken, data.reminder);
                }, data.timeToFire); // send in specified millis
            } else {
                socket.io.to(clientId).emit('confirm', {message: 'Something went wrong, reload'});
            }
        };
    },
    registerUser: function(clientId){
        return function onRegister(data){
            notify.users.push({
                clientId: clientId,
                fcmToken: data.token
            });
        };
    },
    removeUser: function(clientId){
        return function onRemoveUser(){
            notify.users.splice(notify.grabIndex(clientId), 1); // remove user w/ clientId
        };
    },
    grabIndex: function(clientId){
        return notify.users.map(function(user){
            return user.clientId;
        }).indexOf(clientId);
    },
};

var socket = {
    io: require('socket.io'),
    listen: function(server){
        socket.io = socket.io(server);
        socket.io.on('connection', function(client){
            client.on('myToken', notify.registerUser(client.id));
            client.on('myReminder', notify.createReminder(client.id));
            client.on('disconnect', notify.removeUser(client.id));
        });
    }
};

var route = {
    setUpReminder: function(){
        return function(req, res){
            res.sendFile(path.join(__dirname+'/web/makeReminder.html'));
        };
    }
};

var serve = {                                                // handles express server setup
    express: require('express'),                             // server framework library
    parse: require('body-parser'),                           // middleware to parse JSON bodies
    theSite: function(){                                     // method call to serve site
        serve.app = serve.express();                         // create famework object
        var http = require('http').Server(serve.app);        // http server for express framework
        serve.app.use(serve.parse.json());                   // support JSON bodies
        serve.app.use(serve.parse.urlencoded({extended: true})); // idk, something was broken maybe this fixed it
        serve.app.use('/', serve.express.static(path.join(__dirname, 'public'))); // serve static files for site resources
        serve.router = serve.express.Router();               // create express router object to add routing events to
        serve.router.get('/', route.setUpReminder());        // Set up a push reminder to test out FCM
        serve.app.use(serve.router);                         // get express to user the routes we set
        return http;
    }
};

var http = serve.theSite();                                  // set express middleware and routes up
socket.listen(http);                                         // listen for socket io connections
http.listen(process.env.PORT);                               // listen on specified PORT enviornment variable, when our main db is up
firebase.init();                                             // setup communication with firebase servers to do push notifications
