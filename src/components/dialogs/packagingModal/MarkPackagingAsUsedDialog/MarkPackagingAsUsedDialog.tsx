import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from "@mui/material";
import {axiosInstance} from "../../../../api/api";
import React, {useState} from "react";
import CustomDialog from "../../CustomDialog/CustomDialog";
import CancelButton from "../../../Buttons/CancelButton";
import QuantityField from "../../../FormComponents/QuantityField";
import {handleDecrementGlobal, handleIncrementGlobal, handleQuantityChangeGlobal} from "../../../../utils/function";

interface MarkPackagingAsUsedDialogProps {
    open: boolean;
    onClose: () => void;
    materialId: number;
    materialName: string;
    availableQuantity: number;
    onUpdateSuccess: () => void;
    isAuthenticated: boolean
}

const MarkPackagingAsUsedDialog: React.FC<MarkPackagingAsUsedDialogProps> = ({
                                                                                 open,
                                                                                 onClose,
                                                                                 materialId,
                                                                                 materialName,
                                                                                 availableQuantity,
                                                                                 onUpdateSuccess,
                                                                                 isAuthenticated = false
                                                                             }) => {
    const [quantityUsed, setQuantityUsed] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleUsePackaging = async () => {
        if (quantityUsed <= 0 || quantityUsed > availableQuantity) {
            setError('Кількість не може бути більшою за доступну кількість.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/update_packaging_status', {
                material_id: materialId,
                quantity_used: quantityUsed,
            });

            alert('Пакування успішно позначено як використане');
            onUpdateSuccess();
            onClose();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Помилка при оновленні пакування');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityUsed = (e) => {
        const value = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
        const numericValue = Number(value);

        if (numericValue <= availableQuantity) {
            setQuantityUsed(numericValue);
            setError('');
        } else {
            setError('Кількість не може бути більшою за доступну кількість.');
        }

    }

    return (
        <CustomDialog
            maxWidth={"xs"}
            open={open}
            handleClose={onClose}
            title="Позначити пакування як використане"
        >
            <DialogContent>
                <Typography variant="body1">
                    Пакування: {materialName} (Доступна кількість: {availableQuantity})
                </Typography>
                <QuantityField
                    min={0}
                    label="Кількість використаного пакування"
                    value={quantityUsed}
                    onChange={(e) =>
                        handleQuantityChangeGlobal(e, availableQuantity, setQuantityUsed, setError)
                    }
                    onIncrement={() =>
                        handleIncrementGlobal(quantityUsed, availableQuantity, setQuantityUsed, setError)
                    }
                    onDecrement={() =>
                        handleDecrementGlobal(quantityUsed, setQuantityUsed, setError)
                    }
                    error={error}
                />

                {error && (
                    <Typography color="error" variant="body2" mb={2}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={onClose} text={'Відмінити'}/>
                {/*<Button onClick={onClose} color="secondary">*/}
                {/*    Відмінити*/}
                {/*</Button>*/}
                <Button onClick={handleUsePackaging} color="primary" variant="contained"
                        disabled={loading || !isAuthenticated}>
                    {loading ? 'Завантаження...' : 'Позначити як використане'}
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default MarkPackagingAsUsedDialog