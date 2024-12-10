import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const ChatBox = ({ chatID, username, socket, setMessages, messages, isAdmin }) => {
  const [message, setMessage] = useState('');

  // Handle sending a message to the server
  const handleSendMessage = () => {
    if (message.trim() === '') return;

    // Determine the sender's name
    const sender = isAdmin ? 'You' : username; // "You" for Admin in Admin chat, and Customer's name for customer
    const receiver = isAdmin ? username : 'Admin'; // Customer's name for Admin's side, "Admin" for Customer's side

    // Emit the message to the server with necessary data: chatID, message text, and sender
    socket.emit('sendMessage', { chatID, message, sender, receiver });

    // Update the message list in the parent component with the new message
    setMessages((prev) => [...prev, { sender, text: message }]);

    // Clear the input field after sending the message
    setMessage('');
  };

  useEffect(() => {
    // Function to handle receiving messages from the server
    const handleReceiveMessage = (msg) => {
      // Only add the message if the chatID matches
      if (msg.chatID === chatID) {
        // Avoid duplicating the same message
        const isDuplicate = messages.some(
          (m) => m.text === msg.text && m.sender === msg.sender
        );
        if (!isDuplicate) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    };

    // Set up the event listener for receiving messages
    socket.on('receiveMessage', handleReceiveMessage);

    // Cleanup function to remove the event listener when the component unmounts or chatID/socket changes
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [chatID, socket, setMessages, messages]); // Re-run effect when chatID, socket, or messages change

  return (
    <Box>
      {/* Display the chat interface inside a Paper component for styling */}
      <Paper elevation={3} sx={{ padding: 2, height: '400px', overflowY: 'scroll' }}>
        {/* Chat header, displaying the username of the person you're chatting with */}
        <Typography variant="h6" gutterBottom>
          Chat with {username ? username : 'Unknown'} {/* Display 'Unknown' if no username provided */}
        </Typography>

        {/* Map through the messages array to display each message */}
        {messages.map((msg, index) => (
          <Box key={index} sx={{ marginBottom: 2 }}>
            <Typography
              variant="body2"
              color={msg.sender === 'You' ? 'purple' : 'green'} // Assign color based on sender
            >
              <strong>{msg.sender === 'You' ? 'You' : msg.sender}: </strong>
              {msg.text}
            </Typography>
          </Box>
        ))}
      </Paper>

      <Box sx={{ marginTop: 2 }}>
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
          sx={{ marginTop: 1, marginLeft: 1 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBox;
