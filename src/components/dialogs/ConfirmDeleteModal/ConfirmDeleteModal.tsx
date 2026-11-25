import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogContentText,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Radio,
    RadioGroup
} from "@mui/material";
import {IConfirmDeleteModal} from "../../../utils/types";
import CancelButton from "../../Buttons/CancelButton";
import CustomDialog from "../CustomDialog/CustomDialog";

const ConfirmDeleteModal = ({
                                openConfirmDeleteModal, handleCloseDeleteModal, selectedDeleteModalProductId,
                                handleDelete
                            }: IConfirmDeleteModal) => {
    const [deleteMode, setDeleteMode] = useState<'product_only' | 'all_related'>('product_only');

    return (
        <CustomDialog maxWidth={"sm"} title={'Підтвердити видалення'} handleClose={handleCloseDeleteModal}
                      open={openConfirmDeleteModal}>
            <DialogContent>
                <DialogContentText sx={{mb: 2}}>
                    Обери, що саме потрібно видалити:
                </DialogContentText>
                <FormControl>
                    <RadioGroup
                        value={deleteMode}
                        onChange={(event) => setDeleteMode(event.target.value as 'product_only' | 'all_related')}
                    >
                        <FormControlLabel
                            value="product_only"
                            control={<Radio/>}
                            label="Видалити тільки товар"
                        />
                        <FormHelperText sx={{ml: 4, mb: 1}}>
                            Пов’язані записи залишаться. Якщо вони існують, сервер не дозволить видалити товар окремо.
                        </FormHelperText>
                        <FormControlLabel
                            value="all_related"
                            control={<Radio color="error"/>}
                            label="Видалити товар і всі пов’язані дані"
                        />
                        <FormHelperText sx={{ml: 4}} error>
                            Безповоротно видаляться історія закупівель, продажів, повернень, руху залишків,
                            аудит товару та його зв’язки з подарунковими наборами. Дані клієнтів, постачальників
                            і пакувальних матеріалів залишаться.
                        </FormHelperText>
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <CancelButton text={'Відмінити'} onClick={handleCloseDeleteModal}/>
                <Button
                    onClick={() => selectedDeleteModalProductId && handleDelete(selectedDeleteModalProductId, deleteMode)}
                    variant={"contained"}
                    color={deleteMode === 'all_related' ? 'error' : 'primary'}
                >
                    {deleteMode === 'all_related' ? 'Видалити все' : 'Видалити товар'}
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default ConfirmDeleteModal;
