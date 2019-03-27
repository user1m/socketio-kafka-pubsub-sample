## React Client Kafka Pub Sub Sample

## Prerequisites

* Pull this branch [kafka](https://github.com/NeuCleans/kafka-docker/tree/pub-sub)
* Start kafka 

```
> cd kafka-docker
> docker-compose -f docker-compose-single-broker.yml up -d
```


## Installing

```
> yarn install
> node rooms.js
> cd react-client
> yarn install
> yarn start

```

## Info

`Rooms.js` demos how a client can connect to a socket private channel and get messages from kafka-pub-sub


## Acknoledgements

* [kafka-pub-sub](https://github.com/NeuCleans/kafka-pub-sub.git)