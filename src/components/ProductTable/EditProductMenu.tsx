import React from "react";
import {
    Menu,
    MenuItem,
    MenuProps
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SellIcon from "@mui/icons-material/Sell";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";

const EditProductMenu = ({
                             anchorEl,
                             open,
                             handleClose,
                             selectedProduct,
                             handleOpenEdit,
                             handlePurchase,
                             handleOpenSale,
                             handleOpenHistoryModal,
                             handleDelete,
                             isAuthenticated
                         }) => {
    return (
        <Menu
            PaperProps={{elevation: 1}}
            aria-labelledby="product-menu-button"
            anchorEl={anchorEl}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            open={open}
            onClose={handleClose}
        >
            <MenuItem onClick={() => {
                handleOpenEdit(selectedProduct);
                handleClose();
            }}>
                <EditIcon color="primary" fontSize="small" sx={{mr: 1}}/>
                Редагувати
            </MenuItem>

            <MenuItem onClick={() => {
                handlePurchase(selectedProduct);
                handleClose();
            }}>
                <ShoppingCartIcon color="primary" fontSize="small" sx={{mr: 1}}/>
                Купівля
            </MenuItem>

            <MenuItem onClick={() => {
                handleOpenSale(selectedProduct);
                handleClose();
            }}>
                <SellIcon color="primary" fontSize="small" sx={{mr: 1}}/>
                Продаж
            </MenuItem>

            <MenuItem onClick={() => {
                handleOpenHistoryModal(selectedProduct.id);
                handleClose();
            }}>
                <HistoryIcon fontSize="small" sx={{mr: 1}}/>
                Історія
            </MenuItem>

            <MenuItem
                onClick={() => {
                    handleDelete(selectedProduct.id);
                    handleClose();
                }}
                disabled={!isAuthenticated}
            >
                <DeleteIcon fontSize="small" sx={{mr: 1}} color="error"/>
                Видалити
            </MenuItem>
        </Menu>
    );
};

export default EditProductMenu;
