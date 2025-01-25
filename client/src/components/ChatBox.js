import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const ChatBox = ({ chatID, username, socket, setMessages, messages, isAgent }) => {
  const [message, setMessage] = useState('');

  // Send a message
  const handleSendMessage = () => {
    if (!message.trim()) return;

    const sender = isAgent ? 'Agent' : 'You';
    const receiver = isAgent ? username : 'Agent';

    socket.emit('sendMessage', { chatID, message, sender, receiver }); // Notify server
    setMessages((prev) => [...prev, { sender: 'You', text: message }]); // Update local messages
    setMessage(''); // Clear input
  };

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (msg.chatID === chatID && !messages.some((m) => m.text === msg.text && m.sender === msg.sender)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    return () => socket.off('receiveMessage', handleReceiveMessage); // Cleanup
  }, [chatID, socket, messages, setMessages]);

  return (
    <Box>
      <Paper elevation={3} sx={{ padding: 2, height: '400px', overflowY: 'scroll' }}>
        <Typography variant="h6">Chat with {username || 'Unknown'}</Typography>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              color={msg.sender === 'You' ? 'primary' : msg.sender === 'Agent' ? 'secondary' : 'textPrimary'}
            >
              <strong>{msg.sender}: </strong>
              {msg.text}
            </Typography>
          </Box>
        ))}
      </Paper>
      <TextField
        label="Type a message"
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
      />
      <Button onClick={handleSendMessage} variant="contained" color="primary">
        Send
      </Button>
    </Box>
  );
};

export default ChatBox;
