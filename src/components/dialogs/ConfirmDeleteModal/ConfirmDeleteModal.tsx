import React from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {IConfirmDeleteModal} from "../../../utils/types";
import CancelButton from "../../Buttons/CancelButton";
import CustomDialog from "../CustomDialog/CustomDialog";

const ConfirmDeleteModal = ({
                                openConfirmDeleteModal, handleCloseDeleteModal, selectedDeleteModalProductId,
                                handleDelete
                            }: IConfirmDeleteModal) => {
    return (
        <CustomDialog maxWidth={"xs"} title={'Підтвердити видалення'} handleClose={handleCloseDeleteModal}
                      open={openConfirmDeleteModal}>
            <DialogContent>
                <DialogContentText>
                    Ти впевнений що хочешь видалити цей товар?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <CancelButton text={'Відмінити'} onClick={handleCloseDeleteModal}>

                </CancelButton>
                <Button onClick={() => {
                    selectedDeleteModalProductId && handleDelete(selectedDeleteModalProductId!)
                }} variant={"contained"}>
                    Підтвердити
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};


export default ConfirmDeleteModal;
