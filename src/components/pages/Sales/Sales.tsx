import React from 'react';
import SalesHistoryTable from "./SalesHistoryTable";
import {Typography} from "@mui/material";

const Sales = () => {
    return (
        <div className="crm-page">
            <div className="crm-page-heading">
                <Typography className="crm-page-title" marginBlockEnd={1} variant={"h4"}>Продажі</Typography>
                <Typography className="crm-page-description" marginBottom={4}>Перегляд і керування продажами</Typography>
            </div>
            <SalesHistoryTable/>
        </div>
    );
};

export default Sales;
