import React from 'react';
import {Dialog, DialogTitle, IconButton, DialogProps, useMediaQuery} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Transition from "../../../utils/Transition";
import {Breakpoint} from "@mui/system";

interface ICustomDialogProps extends DialogProps {
    title: string;
    handleClose: () => void;
    children: React.ReactNode;
    maxWidth?: Breakpoint | false;
    fullWidth?: boolean;
}

const CustomDialog: React.FC<ICustomDialogProps> = ({
                                                        open,
                                                        title,
                                                        handleClose,
                                                        children,
                                                        maxWidth = 'sm',
                                                        fullWidth = true,
                                                        fullScreen,
                                                        ...rest
                                                    }) => {
    const isMobile = useMediaQuery('(max-width:700px)');

    return (
        <Dialog
            TransitionComponent={Transition}
            keepMounted
            open={open}
            onClose={handleClose}
            aria-labelledby="custom-dialog-title"
            aria-describedby="custom-dialog-description"
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            fullScreen={fullScreen ?? isMobile}
            {...rest}
        >
            <DialogTitle variant={"h5"} id="custom-dialog-title">
                {title}
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            {children}

        </Dialog>
    );
};

export default CustomDialog;
