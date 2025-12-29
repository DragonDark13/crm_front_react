import {ChangeEvent} from "react";
import { TextField, TextFieldProps} from "@mui/material";


export type IPriceField = Omit<
    TextFieldProps,
    'value' | 'onChange' | 'variant'
> & {
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
};


const PriceField: ({value, onChange, label, ...rest}: IPriceField) => JSX.Element = ({
                                                                                         value,
                                                                                         onChange,
                                                                                         label = '"Ціна за 1шт (Закупівельна)"',
                                                                                         ...rest
                                                                                     }: IPriceField) => {


    return (<TextField
            variant={"filled"}
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
    )
};

export default PriceField;
