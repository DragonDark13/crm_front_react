import React from 'react';
import {Box, Typography, Grid, Paper, List, ListItem, ListItemText, Divider, IconButton, Avatar} from '@mui/material';
import {Chart} from './Chart'; // Твій графік (необхідно додати компонент Chart)
import {Sidebar} from './Sidebar'; // Твоя бічна панель (додається окремо)

const Dashboard: React.FC = () => {
    return (
        <Box display="flex" sx={{backgroundColor: '#f5f6fa', minHeight: '100vh'}}>
            {/* Бічна панель */}
            <Sidebar/>

            <Box sx={{flex: 1, marginLeft: '80px', padding: 3}}>
                {/* Верхня частина */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">Statistics All Product</Typography>
                    <Typography>{new Date().toLocaleDateString()}</Typography>
                </Box>

                {/* Основний контент */}
                <Grid container spacing={3} my={3}>
                    {/* Карточки зверху */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{padding: 2}}>
                            <Typography>Total Amount</Typography>
                            <Typography variant="h4">$46,820.84</Typography>
                            <Typography color="green">↑ 4.2% Message</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{padding: 2}}>
                            <Typography>Total Revenue (CRM)</Typography>
                            <Typography variant="h4">$12,480.20</Typography>
                            <Typography color="red">↓ 4.2% Message</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{padding: 2}}>
                            <Typography>Total Customer</Typography>
                            <Typography variant="h4">10,540</Typography>
                            <Typography color="green">↑ 4.2% Message</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Продажі за компаніями */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{padding: 2}}>
                            <Typography>Sales by Company</Typography>
                            {/* Проста таблиця компаній */}
                            <List>
                                {['Ibox', 'Icolor', 'Pstore', 'Digimap', 'Ishop', 'Petshop'].map((company) => (
                                    <ListItem key={company}>
                                        <ListItemText primary={company}/>
                                        <Typography>...</Typography>
                                        <Typography>4.5M</Typography> {/* Додати свої значення */}
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* CRM трафік (графік) */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{padding: 2}}>
                            <Typography>CRM Traffic</Typography>
                            <Chart/>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard;
