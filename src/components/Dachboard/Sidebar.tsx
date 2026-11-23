import React, {useState} from 'react';
import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Popover,
    Tooltip
} from '@mui/material';
import {
    Home,
    People,
    ShoppingCart,
    Store,
    BarChart,
    Receipt,
    Luggage,
    AttachMoney,
    Business,
    AssignmentReturn,
    CloudUpload,
    SettingsBackupRestore
} from '@mui/icons-material';
import {Link, useLocation} from 'react-router-dom';
import AddButtonWithMenu from "../MainMenu/AddButtonWithMenu";
import {CardGiftcard} from "@mui/icons-material";
import {useAuth} from "../context/AuthContext";

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const {roles} = useAuth();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const iconFontSize = 'small';
    const isActive = (path: string) => location.pathname === path;

    const menuGroups = [
        {
            title: "Продажі",
            icon: <ShoppingCart fontSize={iconFontSize}/>,
            items: [
                {title: "Управління клієнтами", path: "/crm_front_react/clients", icon: <People fontSize={iconFontSize}/>},
                {title: "Замовлення", path: "/crm_front_react/orders", icon: <ShoppingCart fontSize={iconFontSize}/>},
                {title: "Історія продажів", path: "/crm_front_react/sales", icon: <ShoppingCart fontSize={iconFontSize}/>},
                {title: "Повернення", path: "/crm_front_react/returns", icon: <AssignmentReturn fontSize={iconFontSize}/>}
            ]
        },
        {
            title: "Каталог і склад",
            icon: <Store fontSize={iconFontSize}/>,
            items: [
                {title: "Каталог товарів", path: "/crm_front_react/products", icon: <Store fontSize={iconFontSize}/>},
                {title: "ГіфтБокси", path: "/crm_front_react/gift_sets", icon: <CardGiftcard fontSize={iconFontSize}/>},
                {title: "Пакування", path: "/crm_front_react/packaging", icon: <Luggage fontSize={iconFontSize}/>}
            ]
        },
        {
            title: "Закупівлі",
            icon: <Receipt fontSize={iconFontSize}/>,
            items: [
                {title: "Історія закупівель", path: "/crm_front_react/purchases", icon: <Receipt fontSize={iconFontSize}/>},
                {title: "Імпорт закупівель", path: "/crm_front_react/import-purchases", icon: <CloudUpload fontSize={iconFontSize}/>},
                {title: "Управління постачальниками", path: "/crm_front_react/suppliers", icon: <Business fontSize={iconFontSize}/>}
            ]
        },
        {
            title: "Фінанси",
            icon: <AttachMoney fontSize={iconFontSize}/>,
            items: [
                {title: "Фінансові операції", path: "/crm_front_react/financial-journal", icon: <AttachMoney fontSize={iconFontSize}/>},
                {title: "Інші витрати", path: "/crm_front_react/other-investments", icon: <AttachMoney fontSize={iconFontSize}/>}
            ]
        },
        {
            title: "Аналітика",
            icon: <BarChart fontSize={iconFontSize}/>,
            items: [
                {title: "Аналітика та звіти", path: "/crm_front_react/analytics", icon: <BarChart fontSize={iconFontSize}/>}
            ]
        },
        ...(roles.includes('manager') ? [{
            title: "Адміністрування",
            icon: <SettingsBackupRestore fontSize={iconFontSize}/>,
            items: [
                {title: "Скидання бази даних", path: "/crm_front_react/database-settings", icon: <SettingsBackupRestore fontSize={iconFontSize}/>}
            ]
        }] : [])
    ];

    const handleGroupClick = (event: React.MouseEvent<HTMLButtonElement>, groupTitle: string) => {
        if (openGroup === groupTitle && anchorEl === event.currentTarget) {
            setAnchorEl(null);
            setOpenGroup(null);
            return;
        }

        setAnchorEl(event.currentTarget);
        setOpenGroup(groupTitle);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setOpenGroup(null);
    };

    const selectedGroup = menuGroups.find(group => group.title === openGroup);

    return (
        <Box
            className="crm-sidebar"
            sx={{
                width: 80,
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
                gap: 2,
            }}
        >
            <Tooltip title="Головна" placement="right">
                <IconButton
                    size={iconFontSize}
                    color={isActive("/crm_front_react/") ? "primary" : "inherit"}
                    component={Link}
                    to="/crm_front_react/"
                >
                    <Home fontSize={iconFontSize}/>
                </IconButton>
            </Tooltip>

            {menuGroups.map(group => {
                const groupIsActive = group.items.some(item => isActive(item.path));

                return (
                    <Tooltip key={group.title} title={group.title} placement="right">
                        <IconButton
                            size={iconFontSize}
                            color={groupIsActive ? "primary" : "inherit"}
                            onClick={(event) => handleGroupClick(event, group.title)}
                            aria-label={group.title}
                            aria-haspopup="menu"
                            aria-expanded={openGroup === group.title}
                        >
                            {group.icon}
                        </IconButton>
                    </Tooltip>
                );
            })}

            <Popover
                open={Boolean(anchorEl && selectedGroup)}
                anchorEl={anchorEl}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        minWidth: 230,
                        py: 1,
                    }
                }}
            >
                {selectedGroup?.items.map(item => (
                    <MenuItem
                        key={item.path}
                        component={Link}
                        to={item.path}
                        selected={isActive(item.path)}
                        onClick={handleMenuClose}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.title}</ListItemText>
                    </MenuItem>
                ))}
            </Popover>

            <AddButtonWithMenu/>
        </Box>
    );
};
