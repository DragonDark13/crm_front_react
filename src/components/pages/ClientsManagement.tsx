import React from 'react';
import CustomerPage from "./CustomerPage";
import {Box, Typography} from "@mui/material";

const ClientsManagement = () => {
    return (
        <div className="crm-page">
            <div className="crm-page-heading">
                <Typography className="crm-page-title" marginBlockEnd={1} variant={"h4"}>Управління клієнтами</Typography>
                <Typography className="crm-page-description" marginBottom={4}>Інформація про клієнтів.</Typography>
            </div>
            <CustomerPage/>
        </div>
    );
};

export default ClientsManagement;
