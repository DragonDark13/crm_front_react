import React from 'react';
import {Button, ButtonProps} from "@mui/material";

interface ICancelButton extends ButtonProps {
    text?: string

}

const CancelButton = ({text = "Закрити", ...rest}: ICancelButton) => {
    return (
        <Button {...rest} variant={"outlined"} color="primary">
            {text}
        </Button>
    );
};

export default CancelButton;
