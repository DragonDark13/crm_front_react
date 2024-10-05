import React from 'react';
import {List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import {INotificationPanel} from "../../utils/types";
//TODO ерехід до товару

const NotificationPanel = ({lowQuantityProducts, handleListItemClick}: INotificationPanel) => {
    return (
        <List>
            {lowQuantityProducts.map(product => (
                <ListItemButton key={product.id + product.name} onClick={() => handleListItemClick(product.id)}>
                    <ListItemIcon>
                        <NotificationImportantIcon/>
                    </ListItemIcon>
                    <ListItemText primary={product.name} secondary={`Кількість: ${product.quantity}`}/>
                </ListItemButton>
            ))}
        </List>

    );
};

export default NotificationPanel;
