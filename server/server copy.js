const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);
const HOST = '0.0.0.0'; // Binds to all network interfaces

// Enable CORS for frontend (React)
app.use(cors());

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000','http://192.168.1.6:3000'], // Replace with your React app's URL if different
    methods: ['GET', 'POST'],
    // credentials: true,
  },
});

// Data stores for chats and admin
let activeChats = [];
let inactiveChats = [];
let chatHistory = {};
let adminSocketID = null; // Admin's socket ID
const adminUsername = 'Admin'; // Admin's username

// Helper function to generate unique Chat IDs
const generateChatID = () => crypto.randomBytes(16).toString('hex');

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Admin registration
  socket.on('registerAdmin', () => {
    adminSocketID = socket.id;
    console.log('Admin registered:', adminSocketID);

    // Send active and inactive chats to admin
    socket.emit('activeChats', activeChats);
    socket.emit('inactiveChats', inactiveChats);
  });

  // Emit new chat to all admins when a new chat is created
  socket.on('startChat', (chatData) => {
    // Emit new chat to all connected admins
    io.emit('newChat', chatData); // This will broadcast the new chat to all admins
  });


  // Admin selects a chat
  socket.on('selectChat', ({ chatID }) => {
    if (chatHistory[chatID]) {
      socket.emit('chatHistory', { chatID, history: chatHistory[chatID] });
    } else {
      socket.emit('error', { message: 'Chat history not found.' });
    }
  });

  // Customer creates a chat
  socket.on('createChat', async ({ username }) => {
    if (!username || username.trim() === '') {
      socket.emit('error', { message: 'Username cannot be empty' });
      return;
    }

    const chatID = generateChatID();

    // Save the chat in the database
    const newChat = await prisma.chat.create({
      data: {
        chatID,
        username,
        socketID: socket.id,
        isActive: true, // Mark chat as active
      },
    });

    activeChats.push({ chatID: newChat.chatID, username: newChat.username, socketID: newChat.socketID });
    chatHistory[chatID] = [];

    console.log(`New chat created: ${username} (${chatID})`);
    socket.emit('chatID', { chatID });
    socket.emit('chatHistory', chatHistory[chatID]);

    // Notify admin
    if (adminSocketID) {
      io.to(adminSocketID).emit('activeChats', activeChats);
    }
  });

  // Customer or Admin sends a message
  socket.on('sendMessage', async ({ chatID, message, sender }) => {
    if (!chatID || !message || !sender) return;

    const chat = activeChats.find((c) => c.chatID === chatID);
    if (!chat) {
      socket.emit('error', { message: `ChatID ${chatID} not found` });
      return;
    }

    // Save message to the database
    await prisma.message.create({
      data: {
        chatID,
        sender,
        text: message,
      },
    });

    // Save message to chat history
    chatHistory[chatID].push({ sender, text: message });

    console.log(`${sender} sent a message: ${message}`);

    // Forward message
    if (sender === adminUsername) {
      io.to(chat.socketID).emit('receiveMessage', { sender: adminUsername, text: message, chatID });
    } else {
      if (adminSocketID) {
        io.to(adminSocketID).emit('receiveMessage', { sender: chat.username, text: message, chatID });
      }
    }
  });

  // Mark chat as inactive
  socket.on('endChat', async ({ chatID }) => {
    const index = activeChats.findIndex((chat) => chat.chatID === chatID);
    if (index !== -1) {
      const [inactiveChat] = activeChats.splice(index, 1);
      inactiveChats.push(inactiveChat);

      // Update chat status in the database
      await prisma.chat.update({
        where: { chatID },
        data: { isActive: false },
      });

      // Notify admin
      if (adminSocketID) {
        io.to(adminSocketID).emit('activeChats', activeChats);
        io.to(adminSocketID).emit('inactiveChats', inactiveChats);
      }

      console.log(`Chat ${chatID} marked as inactive.`);
    }
  });

  // Handle actual disconnection
  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);

    // Handle admin disconnection
    if (socket.id === adminSocketID) {
      console.log('Admin disconnected.');
      adminSocketID = null;
      return;
    }

    // Move disconnected customer chats to inactive
    const index = activeChats.findIndex((chat) => chat.socketID === socket.id);
    if (index !== -1) {
      const [removedChat] = activeChats.splice(index, 1);
      inactiveChats.push(removedChat);

      // Update chat status in the database
      await prisma.chat.update({
        where: { chatID: removedChat.chatID },
        data: { isActive: false },
      });

      // Notify admin
      if (adminSocketID) {
        io.to(adminSocketID).emit('activeChats', activeChats);
        io.to(adminSocketID).emit('inactiveChats', inactiveChats);
      }

      console.log(`Chat ${removedChat.chatID} moved to inactive.`);
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
