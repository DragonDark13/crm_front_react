import React from 'react';
import CustomerPage from "./CustomerPage";
import {Box, Typography} from "@mui/material";

const ClientsManagement = () => {
    return (
        <div>
            <Typography marginBlockEnd={3} variant={"h4"}>Управління клієнтами</Typography>
            <Typography>Інформація про клієнтів.</Typography>
            <CustomerPage/>
        </div>
    );
};

export default ClientsManagement;
