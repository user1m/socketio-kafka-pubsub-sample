// https://www.valentinog.com/blog/socket-io-node-js-react/
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
// const axios = require("axios");
const uuidByString = require("uuid-by-string");
const kafkaPS = require('kafka-pub-sub');

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!

const users = [
    'jane@doe.com',
    'john@doe.com',
];

let connectedUsersCount = 0;


process.on('unhandledRejection', (reason, p) => {
    // https://stackoverflow.com/a/15699740/3562407
    p.catch(error => {
        const msg = "INDEX: Unhandled Rejection:\n" + error.stack;
        console.error(msg);
    });
});

// https://www.joyent.com/node-js/production/design/errors
// https://strongloop.com/strongblog/robust-node-applications-error-handling/
process.on('uncaughtException', (error) => {
    const msg = 'INDEX: Uncaught Exception:\n' + error.stack;
    console.error(msg);
});

const getUserDataAndEmit = (socket) => {
    try {
        socket.emit("fromBackend", { email: users[connectedUsersCount], id: uuidByString(users[connectedUsersCount]) });
        connectedUsersCount++;
        // Emitting a new message. It will be consumed by the clientId
    } catch (error) {
        console.error(`Error: ${error.code}`);
    }
};

function produceKafkaMessages() {
    setInterval(() => {
        console.log('sending....');
        const topic = uuidByString(users[Math.floor(Math.random() * 2)]); //random message to topic
        // const topic = uuidByString(users[0]); //random message to topic
        kafkaPS.ServiceProducer
            .buildAMessageObject({ message: `The DateTime is: ${new Date().toISOString()}` }, topic, 'TEST')
            .then((msg) => {
                kafkaPS.ServiceProducer.send([msg])
                    .catch(err => { });
            })
        // .catch((error) => { console.error('!!!ERROR: ' + error.stack); })
    }, 15 * 1000);
}

function createKafkaListenerFor(clientId, socket, io) {
    console.log("KL---clientId" + clientId);
    kafkaPS.ServiceConsumer.listen((message) => {
        console.log(`Message: ${JSON.stringify(message, null, 2)}`);
        if (message.topic !== clientId) return;
        const value = JSON.parse(message.value);
        const data = value.data;
        // socket.emit('fromBackend', { message: `You are client: ${clientId}\n Here's your message: ${data.message}` });
        io.of(`/${clientId}`).emit('fromBackend', { message: `You are client: ${clientId}\n Here's your message: ${data.message}` });
    });
    produceKafkaMessages();
}

function setupKafka(clientId, socket, io) {
    // var clientId = uuidByString(email);
    // kafkaPS.ServiceProducer.createTopic(clientId, {
    //     partitions: 1,
    //     replicationFactor: 1
    // }).then(() => kafkaPS.ServiceConsumerGroup.subscribe(clientId))

    kafkaPS.ServiceConsumer.init(clientId).then(() => {
        kafkaPS.ServiceProducer.createTopic(clientId)
            .then(() => kafkaPS.ServiceConsumer.subscribe(clientId).then(() => {
                createKafkaListenerFor(clientId, socket, io);
            }))
    });
}

function namespaces(io) {
    io.on("connection", (socket) => {
        console.log("New clientId connected");
        // setTimeout(() => getUserDataAndEmit(socket), 3 * 1000);

        const email = users[connectedUsersCount];
        const id = uuidByString(email);
        socket.emit("fromBackend", { email, id });

        // socket.on('clientConnected', (data) => {
        //     console.log(data);
        //     //create kafka topic listener
        //     createPrivateChannel(data.id);
        // });

        socket.on("disconnect", () => console.log("ClientId disconnected"));
        connectedUsersCount++;
    });

    io.of(`/${id}`)     // https://socket.io/docs/#Restricting-yourself-to-a-namespace
        .on('connection', function (socket) {
            console.log('------------client connected to private channel-----------');
            setupKafka(id, socket, io);
        });

    io.on("disconnect", () => console.log("ClientId disconnected"));
}

server.listen(port, () => console.log(`Listening on port ${port}`));

//  function initCG() {
//     await kafkaPS.ServiceConsumerGroup.init(uuidByString(users[Math.floor(Math.random() * 2)]), {
//         partitions: 1,
//         replicationFactor: 1
//     }, { kafkaHost: 'localhost:9092', groupId: 'GROUP_TEST' })
// }


// initCG();
// produceKafkaMessages();
namespaces(io);
