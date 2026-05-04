let io;

export const setIo = (ioInstance) => {
    io = ioInstance;
};

export const broadcast = (event, data) => {
    if (io) {
        io.emit(event, data);
    } else {
        console.warn("Attempted to broadcast before Socket.io was initialized");
    }
};
export const broadcastToRoom = (room, event, data) => {
    if (io) {
        io.to(room).emit(event, data);
    } else {
        console.warn("Attempted to broadcast to room before Socket.io was initialized");
    }
};
