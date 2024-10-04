import React from 'react';
import {List, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import {INotificationPanel} from "../../utils/types";
//TODO ерехід до товару

const NotificationPanel = ({lowQuantityProducts}: INotificationPanel) => {
    return (
        <List>
            {lowQuantityProducts.map(product => (
                <ListItem key={product.id}>
                    <ListItemIcon>
                        <NotificationImportantIcon/>
                    </ListItemIcon>
                    <ListItemText primary={product.name} secondary={`Кількість: ${product.quantity}`}/>
                </ListItem>
            ))}
        </List>

    );
};

export default NotificationPanel;
