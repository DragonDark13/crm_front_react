import React from 'react';
import {TextField, TextFieldProps} from "@mui/material";

interface ICustomTextArea extends Omit<TextFieldProps, 'variant'>{

}


const CustomTextArea = ({...rest}:ICustomTextArea) => {
    return (
        <TextField
            slotProps={{
                htmlInput: {maxLength:500}
            }}
            size={"small"}
            multiline={true}
            rows={2}
            fullWidth
            margin="dense"
            variant="outlined"
            label="Детальний опис"
            {...rest}
        />
    );
};

export default CustomTextArea;
