import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from "@mui/material";
import {axiosInstance} from "../../../../api/api";
import React, {useState} from "react";

interface MarkPackagingAsUsedDialogProps {
    open: boolean;
    onClose: () => void;
    materialId: number;
    materialName: string;
    availableQuantity: number;
    onUpdateSuccess: () => void;
}

const MarkPackagingAsUsedDialog: React.FC<MarkPackagingAsUsedDialogProps> = ({
                                                                                 open,
                                                                                 onClose,
                                                                                 materialId,
                                                                                 materialName,
                                                                                 availableQuantity,
                                                                                 onUpdateSuccess,
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

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Позначити пакування як використане</DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Пакування: {materialName} (Доступна кількість: {availableQuantity})
                </Typography>
                <TextField
                    label="Кількість використаного пакування"
                    type="number"
                    value={quantityUsed}
                    onChange={(e) => setQuantityUsed(Number(e.target.value))}
                    fullWidth
                    margin="dense"
                />
                {error && (
                    <Typography color="error" variant="body2" mb={2}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Відмінити
                </Button>
                <Button onClick={handleUsePackaging} color="primary" variant="contained" disabled={loading}>
                    {loading ? 'Завантаження...' : 'Позначити як використане'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MarkPackagingAsUsedDialog