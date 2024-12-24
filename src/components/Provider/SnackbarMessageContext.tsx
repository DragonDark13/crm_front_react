import React, {createContext, useState, useContext, ReactNode} from 'react';
import {Snackbar, IconButton, Alert} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type SnackbarMessageContextType = {
    showSnackbarMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
};

const SnackbarMessageContext = createContext<SnackbarMessageContextType | undefined>(undefined);

export const useSnackbarMessage = () => {
    const context = useContext(SnackbarMessageContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

type SnackbarMessageProviderProps = {
    children: ReactNode;
};

export const SnackbarMessageProvider = ({children}: SnackbarMessageProviderProps) => {
    const [openSnackbarMessage, setOpenSnackbarMessage] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

    const showSnackbarMessage = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbarMessage(message);
        setSeverity(severity);
        setOpenSnackbarMessage(true);
    };

    const handleClose = () => {
        setOpenSnackbarMessage(false);
    };

    return (
        <SnackbarMessageContext.Provider value={{showSnackbarMessage: showSnackbarMessage}}>
            {children}
            <Snackbar
                sx={{marginTop: 10}}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={openSnackbarMessage}
                autoHideDuration={1300}
                onClose={handleClose}
                // action={
                //     <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                //         <CloseIcon fontSize="small"/>
                //     </IconButton>
                // }
            >
                <Alert variant="filled" onClose={handleClose} severity={severity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </SnackbarMessageContext.Provider>
    );
};
