import http from 'http';
import SocketService from "./services/socket"
import { startMessageConsumer } from './services/kafka'
async function init() {
    await startMessageConsumer();
    const httpServer = http.createServer();
    const PORT = process.env.PORT ? process.env.PORT: 8000;
    const socketService = new SocketService();

    socketService.io.attach(httpServer);

    httpServer.listen(
        PORT,
        () => console.log(
            `HTTP Server Started at ${PORT}`
        )
    );

    socketService.initListeners();
}

init();