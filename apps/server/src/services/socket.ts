import { Server } from 'socket.io';
import Redis from 'ioredis'
import prismaClient from "./prisma";

const pub = new Redis({
    host: 'redis-13c54108-pg-chat-app.a.aivencloud.com',
    port: 12388,
    username: 'default',
    password: 'AVNS_FN0U-SeHK1cp0v34V8B',
    maxRetriesPerRequest: 100
});
const sub = new Redis({
    host: 'redis-13c54108-pg-chat-app.a.aivencloud.com',
    port: 12388,
    username: 'default',
    password: 'AVNS_FN0U-SeHK1cp0v34V8B',
    maxRetriesPerRequest:100
});

class SocketService {

    private readonly _io: Server;

    constructor() {
        console.log("Socket Server Initialised");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            },
        });
        sub.subscribe("MESSAGES");
    }
    public initListeners() {
        const io = this.io;

        console.log("Initialised Socket Listeners");

        io.on('connect', (socket) => {
            console.log(`New Socket Connected`, socket.id);

            socket.on("event:message", async ({ message }: {message: string}) => {
                console.log("New Message Received", message);
                await pub.publish('MESSAGES', JSON.stringify({ message }));
            })
        });

        sub.on('message', async (channel, message) => {
            if (channel === 'MESSAGES') {
                console.log("New Message from Redis", message);
                io.emit('message', message);
                await prismaClient.message.create({
                    data: {
                        text: message,
                    },
                });
            }
        });
    }

    get io() {
        return this._io;
    }
}
export default SocketService;