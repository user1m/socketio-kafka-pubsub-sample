## React Client Kafka Pub Sub Sample

## Prerequisites

* Pull this branch of [kafka](https://github.com/NeuCleans/kafka-docker/tree/pub-sub)
* Start kafka

```
> cd kafka-docker
> git checkout -b pub-sub (if not already in branch)
> docker-compose -f docker-compose-single-broker.yml up -d
```

### To run scaled kafka:

* Update the `KAFKA_ADVERTISED_HOST_NAME:` in the `docker-compose-single-broker.scale.yml` by running `> ipconfig getifaddr en0`

```
>  docker-compose -f docker-compose-single-broker.scale.yml up -d --scale kafka=3
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

`react-client` is the client

## Acknoledgements

* [kafka-pub-sub](https://github.com/NeuCleans/kafka-pub-sub.git)