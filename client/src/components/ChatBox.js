import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const ChatBox = ({ chatID, username, socket, setMessages, messages, isAdmin }) => {
  const [message, setMessage] = useState('');

  // Send a message
  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const sender = isAdmin ? 'Admin' : 'You'; // Admin is always 'Admin', Customer sees 'You'
    const receiver = isAdmin ? username || 'Customer' : 'Admin'; // Admin sees the customer's name, Customer sees 'Admin'

    // Emit message with chatID, sender, message, and receiver
    socket.emit('sendMessage', { chatID, message, sender, receiver });

    // If admin, label their message as 'You'
    if (isAdmin) {
      setMessages((prev) => [...prev, { sender: 'You', text: message }]); // Admin sends message as 'You'
    } else {
      setMessages((prev) => [...prev, { sender: 'You', text: message }]); // Customer sends message as 'You'
    }

    setMessage(''); // Clear the input field after sending
  };

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (msg.chatID === chatID) {
        // Avoid adding duplicate messages based on message text and sender
        const isDuplicate = messages.some((m) => m.text === msg.text && m.sender === msg.sender);
        
        if (!isDuplicate) {
          // If Admin is receiving message, show Customer's name
          if (msg.sender !== 'Admin' && isAdmin) {
            // setMessages((prev) => [...prev, { sender: msg.sender || 'Customer', text: msg.text }]);
            setMessages((prev) => [...prev, { sender: msg.sender || 'Customer', text: msg.text }]);
          } else {
            setMessages((prev) => [...prev, msg]); // Add message for Admin's view or Customer's view
          }
        }
      }
    };

    // socket.on('receiveMessage', handleReceiveMessage); --> this makes duplicated message in admindashboard.js


    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [chatID, socket, messages, setMessages, isAdmin]);

  return (
    <Box>
      <Paper elevation={3} sx={{ padding: 2, height: '400px', overflowY: 'scroll' }}>
        <Typography variant="h6">Chat with {username || 'Unknown'}</Typography>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              color={msg.sender === 'You' ? 'primary' : msg.sender === 'Admin' ? 'secondary' : 'purple'}
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
