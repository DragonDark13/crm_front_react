import React from 'react';
import {Box, IconButton, SvgIconPropsSizeOverrides, Tooltip} from '@mui/material';
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

    const iconFontSize = 'small'

    const menuItems = [
        {title: "Головна", path: "/crm_front_react/", icon: <Home fontSize={iconFontSize} />},
        {title: "Управління клієнтами", path: "/crm_front_react/clients", icon: <People fontSize={iconFontSize} />},
        {title: "Історія продажів", path: "/crm_front_react/sales", icon: <ShoppingCart fontSize={iconFontSize} />},
        {title: "Каталог товарів", path: "/crm_front_react/products", icon: <Store fontSize={iconFontSize} />},
        {title: "ГіфтБокси", path: "/crm_front_react/gift_sets", icon: <Store fontSize={iconFontSize} />},
        {title: "Історія закупівель", path: "/crm_front_react/purchases", icon: <Receipt fontSize={iconFontSize} />},
        {title: "Аналітика та звіти", path: "/crm_front_react/analytics", icon: <BarChart fontSize={iconFontSize} />},
        {title: "Пакування", path: "/crm_front_react/packaging", icon: <Luggage fontSize={iconFontSize} />},
        {title: "Інші вкладення", path: "/crm_front_react/other-investments", icon: <AttachMoney fontSize={iconFontSize} />},
        {title: "Управління постачальниками", path: "/crm_front_react/suppliers", icon: <Business fontSize={iconFontSize} />}
    ];

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
            <>
                {menuItems.map(({title, path, icon}) => (
                    <Tooltip key={path} title={title} placement="right">
                        <IconButton
                            size={iconFontSize}
                            color={isActive(path) ? "primary" : "inherit"}
                            component={Link}
                            to={path}
                        >
                            {icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </>
            <AddButtonWithMenu/>
        </Box>
    );
};
