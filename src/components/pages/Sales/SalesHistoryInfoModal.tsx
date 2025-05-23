import React from 'react';
import CustomDialog from "../../dialogs/CustomDialog/CustomDialog";
import {DialogActions, DialogContent} from "@mui/material";
import CancelButton from "../../Buttons/CancelButton";
import {SaleItemInfo} from "./SalesHistoryTable";

interface ISalesHistoryInfoModal {
    modalOpen: boolean;
    handleModalInfoClose: () => void;
    selectedSale: SaleItemInfo
}

const SalesHistoryInfoModal = ({handleModalInfoClose,modalOpen,selectedSale}:ISalesHistoryInfoModal) => {
    return (
        <CustomDialog maxWidth="xs" title={'Інформація про продаж'} open={modalOpen}
                      handleClose={handleModalInfoClose}>
            <DialogContent>
                {selectedSale && (
                    <>
                        <p><strong>Назва:</strong> {selectedSale.product_name}</p>
                        <p><strong>Кількість:</strong> {selectedSale.quantity_sold}</p>
                        <p><strong>Ціна:</strong> {selectedSale.unit_price}</p>
                        <p><strong>Сума:</strong> {selectedSale.total_price}</p>
                        <p><strong>Дата:</strong> {selectedSale.sale_date}</p>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleModalInfoClose}/>
            </DialogActions>
        </CustomDialog>

    );
};

export default SalesHistoryInfoModal;
