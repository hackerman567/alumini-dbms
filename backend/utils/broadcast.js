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
