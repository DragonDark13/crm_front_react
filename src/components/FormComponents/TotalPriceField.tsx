import {TextField} from "@mui/material";
import {FC} from "react";

const TotalPriceField: FC<{ value: number }> = ({value}) => (
    <TextField
        label="Загальна сума"
        type="number"
        value={value}
        fullWidth
        margin="normal"
        disabled
        inputProps={{min: 0, step: 0.01, max: 10000}}

    />
);

export default TotalPriceField;
