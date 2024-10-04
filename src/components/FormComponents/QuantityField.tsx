import {ChangeEvent, FC} from "react";
import {TextField} from "@mui/material";
//TODO інркремент і дкремент

const QuantityField: FC<{
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error: string;
}> = ({value, onChange, error}) => {
    console.log("value:::::",value);

    return(<TextField
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
        }}  // Обмеження значення від 1 до 1000
    />)
    };


export default QuantityField;