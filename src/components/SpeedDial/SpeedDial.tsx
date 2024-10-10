import React, {useState} from 'react';
import {SpeedDial, SpeedDialAction, SpeedDialIcon} from '@mui/material';
import {Add, ShoppingCart, Category, LocalShipping} from '@mui/icons-material';

interface Action {
    icon: JSX.Element;
    name: string;
    onClick: () => void;
}

const FloatingMenu: React.FC = () => {
    const [open, setOpen] = useState(false);

    // Дії, які викликаються при натисканні на кнопку
    const actions: Action[] = [
        {
            icon: <ShoppingCart/>,
            name: 'Купити Новий Товар',
            onClick: () => handleOpenAdd(),
        },
        {
            icon: <Category/>,
            name: 'Створити Категорію',
            onClick: () => handleModalOpen('openCategoryCreate'),
        },
        {
            icon: <LocalShipping/>,
            name: 'Створити Постачальника',
            onClick: () => handleModalOpen('openAddSupplierOpen'),
        },
    ];

    return (
        <SpeedDial
            FabProps={{
                size: "medium"
            }}
            ariaLabel="SpeedDial"
            sx={{position: 'fixed', bottom: 16, right: 8}}
            icon={<SpeedDialIcon openIcon={<Add/>}/>} // Іконка +
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name} // Підказка при наведенні на іконку
                    onClick={action.onClick}
                />
            ))}
        </SpeedDial>
    );
};

// Функції, які ти використовуєш для модальних вікон
const handleOpenAdd = () => {
    console.log("Відкрити форму додавання товару");
    // Твоя логіка для відкриття форми
};

const handleModalOpen = (type: string) => {
    console.log(`Відкрити модальне вікно: ${type}`);
    // Твоя логіка для модальних вікон
};

export default FloatingMenu;
