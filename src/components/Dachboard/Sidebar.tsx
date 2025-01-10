import React from 'react';
import {Box, IconButton, Tooltip} from '@mui/material';
import {
    Home,
    People,
    ShoppingCart,
    Store,
    BarChart,
    Receipt,
    Luggage,
    AttachMoney,
    Business
} from '@mui/icons-material';
import {Link, useLocation} from 'react-router-dom';
import AddButtonWithMenu from "../MainMenu/AddButtonWithMenu";


export const Sidebar: React.FC = () => {
    const location = useLocation(); // Отримуємо поточний шлях
    const isActive = (path: string) => location.pathname === path;

    return (
        <Box
            sx={{
                width: 80, // Ширина сайдбару
                height: 'auto',
                position: 'fixed',
                top: '50%',
                transform: 'translateY(-50%)',
                left: 0,
                backgroundColor: '#fff',
                padding: 2,
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2, // Проміжок між іконками
            }}
        >
            {/* Головна */}
            <Tooltip title="Головна" placement="right">
                <IconButton color={isActive("/crm_front_react/") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/">
                    <Home/>
                </IconButton>
            </Tooltip>

            {/* Управління клієнтами */}
            <Tooltip title="Управління клієнтами" placement="right">
                <IconButton color={isActive("/crm_front_react/clients") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/clients">
                    <People/>
                </IconButton>
            </Tooltip>

            {/* Продажі */}
            <Tooltip title="Продажі" placement="right">
                <IconButton color={isActive("/crm_front_react/sales") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/sales">
                    <ShoppingCart/>
                </IconButton>
            </Tooltip>

            {/* Каталог товарів */}
            <Tooltip title="Каталог товарів" placement="right">
                <IconButton color={isActive("/crm_front_react/products") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/products">
                    <Store/>
                </IconButton>
            </Tooltip>

            {/* Закупівлі */}
            <Tooltip title="Закупівлі" placement="right">
                <IconButton color={isActive("/crm_front_react/purchases") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/purchases">
                    <Receipt/>
                </IconButton>
            </Tooltip>

            {/* Аналітика та звіти */}
            <Tooltip title="Аналітика та звіти" placement="right">
                <IconButton color={isActive("/crm_front_react/analytics") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/analytics">
                    <BarChart/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Пакування" placement="right">
                <IconButton color={isActive("/crm_front_react/packaging") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/packaging">
                    <Luggage/>
                </IconButton>
            </Tooltip>
            {/* Інші вкладення */}
            <Tooltip title="Інші вкладення" placement="right">
                <IconButton color={isActive("/crm_front_react/other-investments") ? "primary" : "inherit"}
                            component={Link}
                            to="/crm_front_react/other-investments">
                    <AttachMoney/> {/* Іконка для вкладень, можна вибрати іншу */}
                </IconButton>
            </Tooltip>
            {/* Управління постачальниками */}
            <Tooltip title="Управління постачальниками" placement="right">
                <IconButton color={isActive("/crm_front_react/suppliers") ? "primary" : "inherit"} component={Link}
                            to="/crm_front_react/suppliers">
                    <Business/>
                </IconButton>
            </Tooltip>

            <AddButtonWithMenu/>
        </Box>
    );
};
