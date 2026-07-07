import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { env } from './env';

let io: Server;

/**
 * Real-time layer — Bonus Feature
 * Events emitted from services (e.g. sale.service.ts after a sale is created,
 * product.service.ts on low-stock) so all connected clients (Admin/Manager
 * dashboards) update live without polling.
 *
 * Client connects with: io(url, { auth: { token: accessToken } })
 */
export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Authentication token missing'));
      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: user=${socket.data.userId} role=${socket.data.role}`);

    // Admin/Manager join a shared room to receive stock & sales notifications
    if (['Admin', 'Manager'].includes(socket.data.role)) {
      socket.join('management-room');
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: user=${socket.data.userId}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  return io;
};

// Emit helpers used by sale/product services
export const emitLowStockAlert = (payload: { productId: string; name: string; stock: number }) => {
  getIO().to('management-room').emit('low-stock-alert', payload);
};

export const emitNewSale = (payload: { saleId: string; grandTotal: number; customer: string }) => {
  getIO().to('management-room').emit('new-sale', payload);
};
