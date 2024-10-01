import {ChangeEvent, FC} from "react";
import {TextField} from "@mui/material";

const ProductNameField: FC<{
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error: string;
}> = ({value, onChange, error}) => (
    <TextField
        label="Назва товару"
        value={value}
        onChange={onChange}
        fullWidth
        margin="normal"
        error={!!error}
        helperText={error}
        inputProps={{maxLength: 100}}  // Максимальна довжина 100 символів
    />
);


export default ProductNameField;