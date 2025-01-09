import React, {useEffect, useState} from 'react';
import {Badge, Button, Drawer, IconButton} from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from "@mui/icons-material/Login";
import {IProduct, ModalNames} from "../../utils/types";
import {useProducts} from "../Provider/ProductContext";
import {
    handleModalGlobalClose,
    handleModalGlobalOpen,
    setModalStateGlobal,
    modalStateGlobal
} from "../../utils/function.ts"
import {useAuth} from "../context/AuthContext";
import {logoutUser} from "../../api/api";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import {useNavigate} from "react-router-dom";
import NotificationPanel from "../NotificationPanel/NotificationPanel";

const Header = () => {
    const {isAuthenticated, logout} = useAuth();
    const {showSnackbarMessage} = useSnackbarMessage()
    let navigate = useNavigate();


    const {products} = useProducts();


    const [lowQuantityProducts, setLowQuantityProducts] = useState<IProduct[]>([]);

    const handleLogout = async () => {
        try {
            await logoutUser(); // Call the logout API function
            logout(); // Clear token from context and localStorage
            showSnackbarMessage('Ви розлогінилися', 'success')

            // Redirect to home page or login page (e.g., using React Router)
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };


    // Use this effect to set low quantity products when data changes
    useEffect(() => {
        const lowQuantity = products.filter(product => product.available_quantity < 5);
        setLowQuantityProducts(lowQuantity);
        lowQuantity.length > 0 ? handleModalGlobalOpen("snackbarNotifyOpen") : handleModalGlobalClose("snackbarNotifyOpen")
    }, [products]);




    return (
        <React.Fragment>
            <div style={{position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: "10px"}}>
                {lowQuantityProducts.length > 0 && (
                    <IconButton
                        onClick={() => handleModalGlobalOpen("openNotificationDrawer")}
                        title={`Low quantity products: ${lowQuantityProducts.length}`} // Tooltip for low quantity products
                    >
                        <Badge badgeContent={lowQuantityProducts.length} color="error">
                            <NotificationImportantIcon/>
                        </Badge>
                    </IconButton>
                )}
                {isAuthenticated ? (
                    <Button variant={"text"} onClick={handleLogout} title="Logout" endIcon={<ExitToAppIcon/>}>
                        Вийти
                    </Button>
                ) : (
                    <Button
                        variant={"text"}
                        onClick={() => navigate('/crm_front_react/login')}
                        title="Login"
                        endIcon={<LoginIcon/>}
                    >
                        Увійти
                    </Button>
                )}
            </div>
            <Drawer anchor="right" open={modalStateGlobal.openNotificationDrawer}

                    onClose={() => handleModalGlobalClose("openNotificationDrawer")}>
                <Button variant={"outlined"} onClick={() => handleModalGlobalClose("openNotificationDrawer")}>
                    Закрити
                </Button>

            </Drawer>

        </React.Fragment>

    );
};

export default Header;
