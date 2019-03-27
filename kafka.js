const uuidByString = require("uuid-by-string");
const kafkaPS = require('kafka-pub-sub');

const kHostCluster = 'localhost:32774,localhost:32775,localhost:32776';

function sampleKafkaPubSub() {
    const topic = uuidByString('jane@doe.com');

    kafkaPS.ServiceConsumer.init(topic)
        .then(() => {
            kafkaPS.ServiceConsumer.listen((message) => {
                console.log(`Message: ${JSON.stringify(message, null, 2)}`);
            });
            setInterval(() => {
                console.log('sending....');
                kafkaPS.ServiceProducer.init(topic).then(() => {
                    kafkaPS.ServiceProducer.buildAMessageObject({ date: `${new Date().toISOString()}` }, topic)
                        .then((msg) => kafkaPS.ServiceProducer.send([msg]))
                        .catch(error => console.error(error.stack));
                })
            }, 5 * 1000);
        });
}

function sampleKafkaPubSubHL() {
    const topic = uuidByString('jane@doe.com');

    kafkaPS.ServiceConsumerGroup.init(topic, {
        partitions: 3,
        replicationFactor: 3
    }, { kafkaHost: kHostCluster, groupId: 'GROUP_TEST' })
        // .then(() => {
        //     kafkaPS.ServiceHLProducer.createTopic(topic, {
        //         partitions: 3,
        //         replicationFactor: 3
        //     })
        // })
        .then(() => {
            kafkaPS.ServiceConsumerGroup.listen((message) => {
                console.log(`Message: ${JSON.stringify(message, null, 2)}`);
            });
            setInterval(() => {
                console.log('sending....');
                // kafkaPS.ServiceHLProducer.init(topic).then(() => {
                kafkaPS.ServiceHLProducer.buildAMessageObject({ date: `${new Date().toISOString()}` }, topic, 'TEST_FROM')
                    .then((msg) => kafkaPS.ServiceHLProducer.send([msg]))
                    .catch(error => console.error(error.stack));
                // })
            }, 5 * 1000);
        });
}

sampleKafkaPubSub();
// sampleKafkaPubSubHL();