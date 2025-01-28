import React, { useEffect, useState } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, TextField, TablePagination, Grid, Tab, Tabs } from '@mui/material';
import AppBar from '../components/AppBar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const Reports = () => {
  // const initialData = [
  //   { id: 1, name: 'John Doe', age: 28, city: 'New York', date: new Date('2024-01-15') },
  //   { id: 2, name: 'Jane Smith', age: 34, city: 'Los Angeles', date: new Date('2024-01-20') },
  //   { id: 3, name: 'Sam Johnson', age: 45, city: 'Chicago', date: new Date('2024-01-25') },
  //   { id: 4, name: 'Chris Lee', age: 40, city: 'Miami', date: new Date('2024-02-05') },
  //   { id: 5, name: 'Patricia Green', age: 29, city: 'Seattle', date: new Date('2024-02-10') },
  //   { id: 6, name: 'Michael Brown', age: 32, city: 'Austin', date: new Date('2024-02-15') },
  //   { id: 7, name: 'Linda White', age: 56, city: 'Dallas', date: new Date('2024-02-18') },
  //   { id: 8, name: 'James Harris', age: 38, city: 'San Francisco', date: new Date('2024-02-20') },
  // ];

  const [data, setData] = useState([]);
  const [search, setSearch] = useState({ sender: '', number: '', message: '', timestamp: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);  // State for tracking the active tab


  const fetchData = async () => {
  
      const counts = await axios.get(`${process.env.REACT_APP_API_URL}/api/sms`)
    
      console.log(counts.data.sms)
      setData(counts.data.sms)
      return counts.data
  
  };

  useEffect(() => {
     fetchData();
  },[])


  const handleSearchChange = (e, column) => {
    setSearch({ ...search, [column]: e.target.value });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = data.filter(row => {
    const matchesSender = row.sender.toLowerCase().includes(search.sender.toLowerCase()) || search.sender === '';
    const matchesNumber = row.number.toString().includes(search.number) || search.number === '';
    const matchesMessage= row.message.toLowerCase().includes(search.message.toLowerCase()) || search.message === '';
    const matchesStartDate = !startDate || new Date(row.timestamp) >= startDate;
    const matchesEndDate = !endDate || new Date(row.timestamp)<= endDate;

    return matchesSender && matchesNumber && matchesMessage && matchesStartDate && matchesEndDate;
  });

  const handleExport = () => {
    const headers = ['Sender', 'Number', 'Message', 'Date'];
    const rows = filteredData.map(item => [item.sender, item.number, item.message, new Date(item.timestamp).toLocaleDateString()]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.target = '_blank';
    link.download = 'report.csv';
    link.click();
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <h2>Reports</h2>
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="report tabs">
        <Tab label="SMS" />
        <Tab label="Chat" />
      </Tabs>

      {/* SMS Tab Content */}
      {activeTab === 0 && (
        <div>
          <h3>SMS Report</h3>
          <Grid container spacing={2} style={{ marginBottom: '16px' }}>
            <Grid item>
              Date Range: 
            </Grid>

            <Grid item>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newDate) => setStartDate(newDate)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) => setEndDate(newDate)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleExport}>
                Export to CSV
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2} style={{ marginBottom: '16px' }}>
            <Grid item>
              <TextField
                label="Search by Sender"
                variant="outlined"
                size="small"
                value={search.sender}
                onChange={(e) => handleSearchChange(e, 'sender')}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Search by Number"
                variant="outlined"
                size="small"
                value={search.number}
                onChange={(e) => handleSearchChange(e, 'number')}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Search by Message"
                variant="outlined"
                size="small"
                value={search.message}
                onChange={(e) => handleSearchChange(e, 'message')}
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Sender</TableCell>
                  <TableCell>Number</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.sender}</TableCell>
                    <TableCell>{row.number}</TableCell>
                    <TableCell>{row.message}</TableCell>
                    <TableCell>{new Date(row.timestamp).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      )}

      {/* Chat Tab Content */}
      {activeTab === 1 && (
        <div>
          <h3>Chat Report</h3>
          {/* You can add similar components here for chat, like SMS */}
        </div>
      )}
    </Container>
  );
};

export default Reports;
