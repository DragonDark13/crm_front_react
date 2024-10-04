import {ChangeEvent, FC} from "react";
import {Box, Button, IconButton, InputAdornment, TextField} from "@mui/material";
//TODO інркремент і дкремент
import {Add, Remove} from '@mui/icons-material';


const QuantityField: FC<{
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error: string;
    onIncrement: () => void; // Додано проп для інкременту
    onDecrement: () => void; // Додано проп для декременту
}> = ({value, onChange, error, onIncrement, onDecrement}) => {

    return (
        <Box display="flex" alignItems="center">

            <TextField
                label="Кількість"
                type="text"
                value={value.toString()}
                onChange={onChange}
                fullWidth
                margin="normal"
                error={!!error}
                helperText={error}
                inputProps={{
                    min: 1,
                    max: 1000,
                    step: 1,
                    pattern: "[1-9][0-9]*"
                }} // Обмеження значення від 1 до 1000

                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton
                                onClick={onDecrement}
                                disabled={value <= 1} // Вимкнути кнопку, якщо значення <= 1
                            >
                                <Remove/>
                            </IconButton>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={onIncrement}
                                disabled={value >= 1000} // Вимкнути кнопку, якщо значення >= 1000
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