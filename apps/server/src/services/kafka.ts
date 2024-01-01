import {Kafka, Producer} from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";
const kafka = new Kafka({
    brokers: ["kafka-a7da8d1-pg-chat-app.a.aivencloud.com:12400"],
    ssl: {
        ca: [fs.readFileSync(path.resolve('./ca.pem'), "utf-8")],
    },
    sasl: {
        username: "avnadmin",
        password: "AVNS_a9_CjYgAyff-3E9gduN",
        mechanism: "plain"
    },

})

let producer: null | Producer = null;

export async function createProducer() {
    if(producer) return producer;
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message: string) {
    const producer = await createProducer();
    await producer.send({
        messages: [{
            key: `message-${Date.now()}`,
            value: message
        }],
        topic: "MESSAGES"
    })
    return true;
}

export async function startMessageConsumer() {
    console.log("Consumer is Running");
    const consumer = await kafka.consumer({groupId: "default"})
    await consumer.connect();
    await consumer.subscribe({
        topic: "MESSAGES",
        fromBeginning: true
    });
    await consumer.run({
        autoCommit: true,
        eachMessage: async ({message, pause}) => {
            console.log(`New Message Received`);
            if(!message.value) return;
            try {
                await prismaClient.message.create({
                    data: {
                        text: message.value?.toString(),
                    },
                });
            }
            catch(err) {
                console.log("Something is Wrong");
                pause();
                setTimeout(() => {
                    consumer.resume([{topic: "MESSAGES"}]);
                }, 60 * 1000);
            }
        }

    });
}


export default kafka