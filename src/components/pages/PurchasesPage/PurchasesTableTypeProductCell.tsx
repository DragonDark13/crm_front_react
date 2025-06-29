import React from 'react';
import {TableCell, Tooltip, Typography} from "@mui/material";
import {AttachMoney, Luggage, ShoppingBag} from "@mui/icons-material";

interface IPurchasesTableTypeProductCell {
    type:string
}

const PurchasesTableTypeProductCell = ({type}:IPurchasesTableTypeProductCell) => {
    return (
        <Tooltip title={
            type === "Product" ? "Товар" :
                type === "Packaging" ? "Пакування" : "Інше"
        }>
            <Typography variant="subtitle2" component="span">
                {type === "Product" && <Tooltip title="Товар">
                    <ShoppingBag fontSize="small"/>
                </Tooltip>
                }
                {type === "Packaging" &&
                <Tooltip title="Пакування">
                    <Luggage fontSize="small"/>
                </Tooltip>
                }
                {type === "Other Investment" &&
                <Tooltip title="Інші вкладення">
                    <AttachMoney fontSize="small"/>
                </Tooltip>
                }
            </Typography>

        </Tooltip>

    );
};

export default PurchasesTableTypeProductCell;
