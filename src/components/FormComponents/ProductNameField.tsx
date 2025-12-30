import {ChangeEvent, FC} from "react";
import {TextField} from "@mui/material";

const ProductNameField: FC<{
    label?: string
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}> = ({value, onChange, error, label = "Назва товару"}) => (
    <TextField
        size={"small"}
        label={label}
        value={value}
        onChange={onChange}
        fullWidth
        margin="normal"
        error={!!error}
        helperText={error ? error : "не менше 10 символів"}
        slotProps={{
            htmlInput:{maxLength:50}
        }}
    />
);


export default ProductNameField;