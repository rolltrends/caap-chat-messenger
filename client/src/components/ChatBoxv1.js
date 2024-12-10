import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, List, ListItem } from '@mui/material';
import socket from '../socket'; // Import the Socket.IO instance.

const ChatBox = ({ userType }) => {
  const [message, setMessage] = useState(''); // Current message input.
  const [chat, setChat] = useState([]); // Array of all chat messages.

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { userType, message }); // Send the message with user type.
      setMessage(''); // Clear the message input.
    }
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setChat((prevChat) => [...prevChat, data]); // Add the new message to chat history.
    });

    return () => {
      socket.off('receive_message'); // Cleanup the listener on unmount.
    };
  }, []);

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {userType === 'admin' ? 'Agent Chat' : 'Customer Support'}
      </Typography>
      <List
        sx={{
          height: 300,
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: 1,
          mb: 2,
        }}
      >
        {chat.map((msg, index) => (
          <ListItem
            key={index}
            sx={{
              justifyContent: msg.userType === userType ? 'flex-end' : 'flex-start',
            }}
          >
            <Typography
              sx={{
                bgcolor: msg.userType === 'admin' ? 'primary.main' : 'secondary.main',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '16px',
                maxWidth: '70%',
              }}
            >
              {msg.message}
            </Typography>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBox;
