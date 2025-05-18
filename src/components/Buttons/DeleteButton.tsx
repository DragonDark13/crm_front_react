import {Button, ButtonProps} from "@mui/material";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";

interface IDeleteButton extends ButtonProps {
    text?: string

}

const DeleteButton = ({text = "Видалити", ...rest}: IDeleteButton) => {
    return (
        <Button endIcon={<DeleteIcon fontSize="small"/>} {...rest} variant={"contained"} color="error">
            {text}
        </Button>
    );
};

export default DeleteButton;