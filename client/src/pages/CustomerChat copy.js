import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const CustomerChat = () => {
  const [socket, setSocket] = useState(null);
  const [chatID, setChatID] = useState(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    return () => newSocket.close(); // Cleanup on unmount
  }, []);

  const handleStartChat = () => {
    if (!username.trim()) return;

    socket.emit('createChat', { username });
    socket.on('chatID', ({ chatID }) => setChatID(chatID));
    socket.on('chatHistory', (history) => setMessages(history));
  };

  // Send message from customer to admin
  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Send message with the sender as "You"
    socket.emit('sendMessage', { chatID, message, sender: 'You', receiver: 'Admin' });

    // Update local state to reflect the new message
    setMessages((prev) => [...prev, { sender: 'You', text: message }]);

    setMessage(''); // Clear message input after sending
  };

  // Receive message (either from admin or another source)
  useEffect(() => {
    if (!socket || !chatID) return;

    socket.on('receiveMessage', (msg) => {
      if (msg.chatID === chatID) {
        setMessages((prevMessages) => {
          // Avoid duplicating the same message
          if (!prevMessages.some((m) => m.text === msg.text && m.sender === msg.sender)) {
            return [...prevMessages, msg];
          }
          return prevMessages;
        });
      }
    });

    return () => socket.off('receiveMessage');
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
              Chat with Admin
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomerChat;
