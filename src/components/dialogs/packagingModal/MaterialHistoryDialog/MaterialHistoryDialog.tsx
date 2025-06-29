import React from "react";
import {DialogContent, DialogActions} from "@mui/material";
import MaterialHistoryTable from "./MaterialHistoryTable";
import CancelButton from "../../../Buttons/CancelButton";
import CustomDialog from "../../CustomDialog/CustomDialog";
import {IMaterialSupplier} from "../../../../utils/types";


interface MaterialHistoryDialogProps {
    open: boolean;
    handleClose: () => void;
    selectedMaterial: { name: string } | null;
    materialHistory: any[]; // типізуй точніше за потреби
    selectedSupplierData: IMaterialSupplier
}

const MaterialHistoryDialog: React.FC<MaterialHistoryDialogProps> = ({
                                                                         open,
                                                                         handleClose,
                                                                         selectedMaterial,
                                                                         materialHistory,
                                                                         selectedSupplierData

                                                                     }) => {
    return (
        <CustomDialog
            maxWidth="sm"
            open={open}
            handleClose={handleClose}
            title={`Історія ${selectedMaterial?.name || ""}`}
        >
            <DialogContent>
                <MaterialHistoryTable selectedSupplierData={selectedSupplierData} materialHistory={materialHistory}/>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose}/>
            </DialogActions>
        </CustomDialog>
    );
};

export default MaterialHistoryDialog;
