import React from 'react';
import {FilledTextFieldProps, TextField, TextFieldProps} from "@mui/material";

interface IDateFieldCustom extends FilledTextFieldProps {

}

const DateFieldCustom = ({...rest}: IDateFieldCustom) => {
     const today = new Date().toISOString().split('T')[0];
    const minDate = '2023-01-01';
    return (
        <TextField
            {...rest}
            sx={{marginBottom: 0}}
            size={"small"}
            type="date"
            fullWidth
            inputProps={{
                max: today,
                min: minDate,
            }}
            margin="normal"
        />
    );
};

export default DateFieldCustom;
