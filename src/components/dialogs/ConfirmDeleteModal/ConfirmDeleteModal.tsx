import React from 'react';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogContentText
} from "@mui/material";
import {IConfirmDeleteModal} from "../../../utils/types";
import CancelButton from "../../Buttons/CancelButton";
import CustomDialog from "../CustomDialog/CustomDialog";

const ConfirmDeleteModal = ({
                                openConfirmDeleteModal, handleCloseDeleteModal, selectedDeleteModalProductId,
                                handleDelete
                            }: IConfirmDeleteModal) => {
    return (
        <CustomDialog maxWidth={"sm"} title={'Підтвердити видалення'} handleClose={handleCloseDeleteModal}
                      open={openConfirmDeleteModal}>
            <DialogContent>
                <DialogContentText sx={{mb: 2}}>
                    Видалити товар? Пов’язані історичні записи не видаляються. Якщо товар має записи історії,
                    сервер не дозволить видалити його.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <CancelButton text={'Відмінити'} onClick={handleCloseDeleteModal}/>
                <Button
                    onClick={() => selectedDeleteModalProductId && handleDelete(selectedDeleteModalProductId, 'product_only')}
                    variant={"contained"}
                >
                    Видалити товар
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default ConfirmDeleteModal;
