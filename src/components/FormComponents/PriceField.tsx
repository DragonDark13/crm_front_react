import {ChangeEvent, FC} from "react";
import {TextField} from "@mui/material";


export interface IPriceField {
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    label?: string,
}


const PriceField: FC<{
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error: string;
}> = ({value, onChange, error,label='"Ціна за 1шт (Закупівельна)"'}: IPriceField) => (
    <TextField
        size={"small"}
        label={label}
        type="number"
        value={value}
        onChange={onChange}
        fullWidth
        margin="normal"
        error={!!error}
        helperText={error}
        inputProps={{inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]{0,2}', step: 0.01}}
    />
);

export default PriceField;
