import {ChangeEvent, FC} from "react";
import {Box, Button, IconButton, InputAdornment, TextField, TextFieldProps} from "@mui/material";
//TODO інркремент і дкремент
import {Add, Remove} from '@mui/icons-material';


interface QuantityFieldProps extends TextFieldProps {
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onIncrement: () => void; // Інкремент
    onDecrement: () => void; // Декремент
    readonly?: boolean;
    max?: number,
    min?: number
}


const QuantityField: FC<QuantityFieldProps> = ({
                                                   value,
                                                   onChange,
                                                   error,
                                                   onIncrement,
                                                   onDecrement,
                                                   label = "Кількість",
                                                   readonly,
                                                   max = 1000,
                                                   min = 1,
                                                   ...rest // Деструктуризація для всіх інших пропсів TextField
                                               }) => {

    return (
        <Box display="flex" alignItems="center">

            <TextField
                {...rest}
                size={"small"}
                readOnly={readonly}  // Додано проп для запрету редагування поля
                label={label}
                type="text"
                value={value.toString()}
                onChange={onChange}
                fullWidth
                margin="normal"
                error={!!error}
                helperText={error}
                inputProps={{
                    min: min,
                    max: max,
                    step: 1,
                    pattern: "[1-9][0-9]*"
                }}

                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton
                                onClick={onDecrement}
                                disabled={value <= min || readonly} // Вимкнути кнопку, якщо значення <= 1
                            >
                                <Remove/>
                            </IconButton>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={onIncrement}
                                disabled={value >= max || readonly} // Вимкнути кнопку, якщо значення >= 1000
                            >
                                <Add/>
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

        </Box>
    );
};


export default QuantityField;