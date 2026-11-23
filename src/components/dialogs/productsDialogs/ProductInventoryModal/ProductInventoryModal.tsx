import React, {useEffect, useState} from "react";
import {
    Button,
    DialogActions,
    DialogContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import {IProduct} from "../../../../utils/types";
import CustomDialog from "../../CustomDialog/CustomDialog";

interface ProductInventoryModalProps {
    product: IProduct;
    open: boolean;
    onClose: () => void;
    onSubmit: (actualQuantity: number, reason: string) => Promise<void>;
}

const inventoryReasonOptions = ["Продано", "Докуплено", "Втрачено", "Невідомо", "Інше"];

const ProductInventoryModal: React.FC<ProductInventoryModalProps> = ({
    product,
    open,
    onClose,
    onSubmit
}) => {
    const reservedQuantity = product.reserved_quantity ?? 0;
    const physicalQuantity = product.available_quantity + reservedQuantity;
    const [actualQuantity, setActualQuantity] = useState(String(physicalQuantity));
    const [reasonType, setReasonType] = useState("Невідомо");
    const [otherReason, setOtherReason] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setActualQuantity(String(physicalQuantity));
            setReasonType("Невідомо");
            setOtherReason("");
            setReason("");
        }
    }, [open, physicalQuantity]);

    const handleSubmit = async () => {
        const quantity = Number(actualQuantity);
        if (!Number.isInteger(quantity) || quantity < 0) return;
        if (reasonType === "Інше" && !otherReason.trim()) return;

        const inventoryReason = [
            reasonType === "Інше" ? `Інше: ${otherReason.trim()}` : reasonType,
            reason.trim()
        ].filter(Boolean).join(" — ");

        setIsSubmitting(true);
        try {
            await onSubmit(quantity, inventoryReason);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidQuantity = actualQuantity.trim() !== ""
        && Number.isInteger(Number(actualQuantity))
        && Number(actualQuantity) >= 0;
    const isValidReason = reasonType !== "Інше" || otherReason.trim() !== "";

    return (
        <CustomDialog title="Інвентаризація товару" open={open} handleClose={isSubmitting ? () => undefined : onClose} fullWidth maxWidth="sm">
            <DialogContent>
                <Typography variant="subtitle1" fontWeight="bold" sx={{mt: 1}}>
                    {product.name}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    Артикул: {product.article}
                </Typography>
                <Typography sx={{mt: 2}}>
                    Доступно на складі: <strong>{product.available_quantity}</strong>
                </Typography>
                <Typography>
                    Зарезервовано: <strong>{reservedQuantity}</strong>
                </Typography>
                <Typography>
                    Облікова фізична кількість: <strong>{physicalQuantity}</strong>
                </Typography>
                <TextField
                    autoFocus
                    fullWidth
                    type="number"
                    label="Фактична кількість (усі фізичні одиниці)"
                    value={actualQuantity}
                    onChange={(event) => setActualQuantity(event.target.value)}
                    inputProps={{min: 0, step: 1}}
                    sx={{mt: 2}}
                />
                <Typography sx={{mt: 1}}>
                    Різниця: <strong>
                        {isValidQuantity ? Number(actualQuantity) - physicalQuantity : "—"}
                    </strong>
                </Typography>
                <FormControl fullWidth sx={{mt: 2}}>
                    <InputLabel id="inventory-reason-label">Що сталося з товаром?</InputLabel>
                    <Select
                        labelId="inventory-reason-label"
                        value={reasonType}
                        label="Що сталося з товаром?"
                        onChange={(event) => {
                            setReasonType(event.target.value);
                            setOtherReason("");
                        }}
                    >
                        {inventoryReasonOptions.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {reasonType === "Інше" && (
                    <TextField
                        fullWidth
                        required
                        label="Опиши, що сталося"
                        value={otherReason}
                        onChange={(event) => setOtherReason(event.target.value)}
                        sx={{mt: 2}}
                    />
                )}
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Додаткова примітка"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    sx={{mt: 2}}
                />
                <Typography variant="body2" color="warning.main" sx={{mt: 2}}>
                    Під час інвентаризації всі непродані подарункові набори з цим товаром буде видалено,
                    а резерви їхніх товарів і пакування повернуто на склад. Продані набори залишаться.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Скасувати</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isValidQuantity || !isValidReason || isSubmitting}
                >
                    Провести інвентаризацію
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default ProductInventoryModal;
