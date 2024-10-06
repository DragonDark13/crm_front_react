import {TextField} from "@mui/material";
import {FC} from "react";

export interface ITotalPriceField {
    value: number;
    label?: string;
}

const TotalPriceField: FC<{ value: number }> = ({value, label = "Загальна сума (Закупівельна)"}: ITotalPriceField) => (
    <TextField
        label={label}
        type="number"
        value={value}
        fullWidth
        margin="normal"
        disabled
        inputProps={{min: 0, step: 0.01, max: 10000}}

    />
);

export default TotalPriceField;
