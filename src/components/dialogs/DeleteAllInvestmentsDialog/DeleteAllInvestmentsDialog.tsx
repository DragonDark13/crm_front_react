import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import axios from 'axios';
import {axiosInstance} from "../../../api/api";
import {useInvestments} from "../../Provider/InvestmentsContext";

const DeleteAllInvestmentsDialog: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {handleDeleteAllOtherInvestment} = useInvestments();


    return (
        <div>
            <Button variant="contained" color="error" onClick={handleClickOpen}>
                Видалити всі інвестиції
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Підтвердження видалення</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ви впевнені, що хочете видалити **усі інвестиції**? Цю дію неможливо скасувати!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Скасувати
                    </Button>
                    <Button onClick={()=>handleDeleteAllOtherInvestment(handleClose)} color="error" autoFocus>
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DeleteAllInvestmentsDialog;
