import React from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {IConfirmDeleteModal} from "../../../utils/types";

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
                <Button onClick={handleCloseDeleteModal} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => {
                    selectedDeleteModalProductId && handleDelete(selectedDeleteModalProductId!)
                }} color="secondary">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export default ConfirmDeleteModal;
