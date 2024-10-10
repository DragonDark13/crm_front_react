import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AddButtonWithMenu from "./AddButtonWithMenu";

const MainMenu = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    CRM Магазин
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <Button color="inherit" component={Link} to="/crm_front_react/">
                        Головна
                    </Button>
                    <Button color="inherit" component={Link} to="/crm_front_react/clients">
                        Управління клієнтами
                    </Button>
                    <Button color="inherit" component={Link} to="/crm_front_react/sales">
                        Продажі
                    </Button>
                    <Button color="inherit" component={Link} to="/crm_front_react/products">
                        Каталог товарів
                    </Button>
                    <Button color="inherit" component={Link} to="/crm_front_react/purchases">
                        Закупівлі
                    </Button>
                    <Button color="inherit" component={Link} to="/crm_front_react/analytics">
                        Аналітика та звіти
                    </Button>
                    <AddButtonWithMenu/>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default MainMenu;
