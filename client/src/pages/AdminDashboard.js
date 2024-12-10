import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AppBar, Container, Toolbar, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import ChatBox from '../components/ChatBox';

const AdminDashboard = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [inactiveChats, setInactiveChats] = useState([]);
  const [selectedChatID, setSelectedChatID] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('');

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io('http://192.168.1.3:4000');
    setSocket(newSocket);

    // Register as admin
    newSocket.emit('registerAdmin');

    // Listen for active and inactive chats
    newSocket.on('activeChats', (chats) => setActiveChats(chats));
    newSocket.on('inactiveChats', (chats) => setInactiveChats(chats));

    // Listen for new incoming chats from customers
    newSocket.on('newChat', (chatData) => {
      setActiveChats((prevChats) => [...prevChats, chatData]);
    });

    return () => {
      newSocket.close();
      newSocket.off('activeChats');
      newSocket.off('inactiveChats');
      newSocket.off('newChat');  // Clean up the newChat listener
    };
  }, []);

  // Fetch chat history when a chat is selected
  useEffect(() => {
    if (!socket || !selectedChatID) return;

    // Request chat history from the server
    socket.emit('selectChat', { chatID: selectedChatID });

    // Listen for chat history update
    const handleChatHistory = ({ history }) => {
      setMessages(history);
    };

    socket.on('chatHistory', handleChatHistory);

    // Clean up the listener when the component unmounts or when the selected chat changes
    return () => {
      socket.off('chatHistory', handleChatHistory);
    };
  }, [socket, selectedChatID]);

  // Handle selecting a chat from the sidebar
  const handleChatSelect = (chatID) => {
    setSelectedChatID(chatID);
    setMessages([]); // Clear previous messages before fetching new ones

    const selectedChat = activeChats.find((chat) => chat.chatID === chatID);
    if (selectedChat) {
      setCurrentUsername(selectedChat.username);
    }
  };

  return (
    <div>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container sx={{ display: 'flex', marginTop: 4 }}>
        {/* Sidebar */}
        <Box sx={{ width: '300px', borderRight: '1px solid #ddd', padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Active Chats
          </Typography>
          <List>
            {activeChats.map((chat) => (
              <ListItem button key={chat.chatID} onClick={() => handleChatSelect(chat.chatID)}>
                <ListItemText primary={`Chat with ${chat.username}`} />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" gutterBottom>
            Inactive Chats
          </Typography>
          <List>
            {inactiveChats.map((chat) => (
              <ListItem button key={chat.chatID} onClick={() => handleChatSelect(chat.chatID)}>
                <ListItemText primary={`Chat with ${chat.username} (Inactive)`} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Content */}
        <Box sx={{ flexGrow: 1, padding: 2 }}>
          {selectedChatID ? (
            <ChatBox
              chatID={selectedChatID}
              username={currentUsername}
              socket={socket}
              setMessages={setMessages}
              messages={messages}
              isAdmin={true} // Admin flag to distinguish sender for Admin's view
            />
          ) : (
            <Typography variant="body1">Select a user to start chatting.</Typography>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default AdminDashboard;
