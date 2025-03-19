import React from 'react';
import SalesHistoryTable from "./SalesHistoryTable";
import {Typography} from "@mui/material";

const Sales = () => {
    return (
        <div>
            <Typography marginBlockEnd={1} variant={"h4"}>Продажі</Typography>
            <Typography marginBottom={4}>Перегляд і керування продажами</Typography>
            <SalesHistoryTable/>
        </div>
    );
};

export default Sales;
