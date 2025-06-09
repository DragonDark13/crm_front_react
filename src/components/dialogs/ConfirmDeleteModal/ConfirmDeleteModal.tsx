import React from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {IConfirmDeleteModal} from "../../../utils/types";
import CancelButton from "../../Buttons/CancelButton";

const ConfirmDeleteModal = ({
                                openConfirmDeleteModal, handleCloseDeleteModal, selectedDeleteModalProductId,
                                handleDelete
                            }: IConfirmDeleteModal) => {
    return (
        <Dialog open={openConfirmDeleteModal} onClose={handleCloseDeleteModal}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this product?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleCloseDeleteModal} >
                    Cancel
                </CancelButton>
                <Button onClick={() => {
                    selectedDeleteModalProductId && handleDelete(selectedDeleteModalProductId!)
                }}  variant={"contained"}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export default ConfirmDeleteModal;
