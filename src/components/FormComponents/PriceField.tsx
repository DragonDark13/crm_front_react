import {ChangeEvent, FC} from "react";
import {TextField, TextFieldProps} from "@mui/material";


export interface IPriceField extends TextFieldProps {
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label?: string,
}


const PriceField: ({value, onChange, label, ...rest}: IPriceField) => JSX.Element = ({
                                                                                         value,
                                                                                         onChange,
                                                                                         label = '"Ціна за 1шт (Закупівельна)"',
                                                                                         ...rest
                                                                                     }: IPriceField) => (

    <TextField

        size={"small"}
        label={label}
        type="number"
        value={value}
        onChange={onChange}
        fullWidth
        margin="normal"
        inputProps={{inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]{0,2}', step: 0.01}}
         {...rest}
    />
);

export default PriceField;
