const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend (React)
app.use(cors());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request from ${req.headers.origin} to ${req.url}`);
  next();
});

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*', // Replace with your React app's URL if necessary
    methods: ['GET', 'POST'],
  },
});

// Data stores for chats and agents
let activeChats = [];
let inactiveChats = [];
let chatHistory = {};
let agentSocketID = null; // Agent's socket ID
const agentUsername = 'Agent'; // Agent's username

// Helper function to generate unique Chat IDs
const generateChatID = () => crypto.randomBytes(16).toString('hex');

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Agent registration
  socket.on('registerAgent', () => {
    agentSocketID = socket.id;
    console.log('Agent registered:', agentSocketID);

    // Send active and inactive chats to the agent
    socket.emit('activeChats', activeChats);
    socket.emit('inactiveChats', inactiveChats);
  });

  // Emit new chat to all agents when a new chat is created
  socket.on('startChat', (chatData) => {
    io.emit('newChat', chatData); // Broadcast the new chat to all agents
  });

  // Agent selects a chat
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

    // Notify agent
    if (agentSocketID) {
      io.to(agentSocketID).emit('activeChats', activeChats);
    }
  });

  // Customer or Agent sends a message
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
    if (sender === agentUsername) {
      io.to(chat.socketID).emit('receiveMessage', { sender: agentUsername, text: message, chatID });
    } else {
      if (agentSocketID) {
        io.to(agentSocketID).emit('receiveMessage', { sender: chat.username, text: message, chatID });
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

      // Notify agent
      if (agentSocketID) {
        io.to(agentSocketID).emit('activeChats', activeChats);
        io.to(agentSocketID).emit('inactiveChats', inactiveChats);
      }

      console.log(`Chat ${chatID} marked as inactive.`);
    }
  });

  // Handle actual disconnection
  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);

    // Handle agent disconnection
    if (socket.id === agentSocketID) {
      console.log('Agent disconnected.');
      agentSocketID = null;
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

      // Notify agent
      if (agentSocketID) {
        io.to(agentSocketID).emit('activeChats', activeChats);
        io.to(agentSocketID).emit('inactiveChats', inactiveChats);
      }

      console.log(`Chat ${removedChat.chatID} moved to inactive.`);
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
