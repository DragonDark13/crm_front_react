import React from 'react';
import {TextField, TextFieldProps} from "@mui/material";

interface IDateFieldCustom extends TextFieldProps {

}

const DateFieldCustom = ({...rest}: IDateFieldCustom) => {
    return (
        <TextField
            {...rest}
            sx={{marginBottom: 0}}
            size={"small"}
            type="date"
            fullWidth
            margin="normal"
        />
    );
};

export default DateFieldCustom;
