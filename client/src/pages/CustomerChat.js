import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const CustomerChat = () => {
  const [socket, setSocket] = useState(null); // Socket.IO instance
  const [chatID, setChatID] = useState(null); // Customer's chat ID
  const [username, setUsername] = useState(''); // Customer's username
  const [message, setMessage] = useState(''); // Message input
  const [messages, setMessages] = useState([]); // Chat messages

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:4000'); // Connect to the server
    setSocket(newSocket);

    return () => newSocket.close(); // Clean up connection on component unmount
  }, []);

  // Start a new chat
  const handleStartChat = () => {
    if (!username.trim()) return;

    socket.emit('createChat', { username }); // Notify the server of the new chat
    socket.on('chatID', ({ chatID }) => setChatID(chatID)); // Set the chat ID
    socket.on('chatHistory', setMessages); // Update messages state with chat history
  };

  // Send a message
  const handleSendMessage = () => {
    if (!message.trim()) return;

    socket.emit('sendMessage', { chatID, message, sender: 'You', receiver: 'Agent' }); // Notify server
    setMessages((prev) => [...prev, { sender: 'You', text: message }]); // Update local messages
    setMessage(''); // Clear message input
  };

  // Receive messages from the server
  useEffect(() => {
    if (!socket || !chatID) return;

    socket.on('receiveMessage', (msg) => {
      if (msg.chatID === chatID) {
        setMessages((prev) => [...prev, msg]); // Update messages
      }
    });

    return () => socket.off('receiveMessage'); // Clean up listener
  }, [chatID, socket]);

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      {!chatID ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            Start a New Chat
          </Typography>
          <TextField
            label="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <Button
            onClick={handleStartChat}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Start Chat
          </Button>
        </Box>
      ) : (
        <Box>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              height: '400px',
              overflowY: 'auto',
              mb: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Chat with Agent
            </Typography>
            {messages.map((msg, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  color={msg.sender === 'You' ? 'primary' : 'secondary'}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.text}
                </Typography>
              </Box>
            ))}
          </Paper>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Type a message"
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleSendMessage}>
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomerChat;
