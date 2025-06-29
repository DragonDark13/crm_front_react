import React from 'react';
import {TableCell, Tooltip, Typography} from "@mui/material";
import {AttachMoney, Luggage, ShoppingBag} from "@mui/icons-material";

interface IPurchasesTableTypeProductCell {
    type: string
}

const PurchasesTableTypeProductCell = ({type}: IPurchasesTableTypeProductCell) => {

    type = type.toLowerCase()

    console.log('type',type);
    return (
        <Tooltip title={
            type === "product" ? "Товар" :
                type === "packaging" ? "Пакування" :
                    "Інше"
        }>
            <Typography variant="subtitle2" component="span">
                {type === "product" && <Tooltip title="Товар">
                    <ShoppingBag fontSize="small"/>
                </Tooltip>
                }
                {type === "packaging" &&
                <Tooltip title="Пакування">
                    <Luggage fontSize="small"/>
                </Tooltip>
                }
                {type === "other investment" &&
                <Tooltip title="Інші вкладення">
                    <AttachMoney fontSize="small"/>
                </Tooltip>
                }
            </Typography>

        </Tooltip>

    );
};

export default PurchasesTableTypeProductCell;
