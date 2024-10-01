import {ChangeEvent, FC} from "react";
import {TextField} from "@mui/material";

const PriceField: FC<{
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error: string;
}> = ({value, onChange, error}) => (
    <TextField
        label="Ціна за 1шт"
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
