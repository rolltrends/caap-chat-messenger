import React, { useState, useEffect } from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Container,
} from '@mui/material';

const AdminDashboard = ({ socket }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [inactiveChats, setInactiveChats] = useState([]);

  useEffect(() => {
    // Listen for updates from the server
    socket.on('activeChats', (chats) => setActiveChats(chats));
    socket.on('inactiveChats', (chats) => setInactiveChats(chats));

    // Clean up listeners on unmount
    return () => {
      socket.off('activeChats');
      socket.off('inactiveChats');
    };
  }, [socket]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Active Chats Table */}
      <Paper style={{ marginBottom: '20px', padding: '20px' }}>
        <Typography variant="h6">Active Chats</Typography>
        <TableContainer component={Paper} style={{ marginTop: '10px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent Name</TableCell>
                <TableCell>Chat ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeChats.length > 0 ? (
                activeChats.map((chat) => (
                  <TableRow key={chat.chatID}>
                    <TableCell>{chat.username}</TableCell>
                    <TableCell>{chat.chatID}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No active chats
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Inactive Chats Table */}
      <Paper style={{ padding: '20px' }}>
        <Typography variant="h6">Inactive Chats</Typography>
        <TableContainer component={Paper} style={{ marginTop: '10px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent Name</TableCell>
                <TableCell>Chat ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inactiveChats.length > 0 ? (
                inactiveChats.map((chat) => (
                  <TableRow key={chat.chatID}>
                    <TableCell>{chat.username}</TableCell>
                    <TableCell>{chat.chatID}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No inactive chats
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
