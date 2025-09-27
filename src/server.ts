import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Server as SocketIO } from 'socket.io';
import { createServer } from 'http';
import chatRouter from './routes/chatRoutes';
import sessionRouter from './routes/sessionRoutes';
import { registerSocketHandlers } from './sockets/socketHandler';
import { run } from './services/indexArticles';
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] } });

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/sessions', sessionRouter);

// Socket.io
io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

run();

const PORT = process.env.PORT;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
