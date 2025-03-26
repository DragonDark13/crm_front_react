import {Button, ButtonProps} from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";

interface IAddButton extends ButtonProps {
    text?: string

}

const AddButton = ({text = "Додати", ...rest}: IAddButton) => {
    return (
        <Button {...rest} variant={"contained"} color={"secondary"} endIcon={<AddIcon/>}>
            {text}
        </Button>
    );
};

export default AddButton