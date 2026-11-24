import React, {useEffect, useRef, useState} from "react";
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
import QuantityField from "../../../FormComponents/QuantityField";

interface ProductInventoryModalProps {
    product: IProduct;
    open: boolean;
    onClose: () => void;
    onSubmit: (actualQuantity: number, reason: string, inventoryDate: string) => Promise<void>;
}

const inventoryReasonOptions = ["Продано", "Докуплено", "Втрачено", "Невідомо", "Інше"];

const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const ProductInventoryModal: React.FC<ProductInventoryModalProps> = ({
    product,
    open,
    onClose,
    onSubmit
}) => {
    const reservedQuantity = product.reserved_quantity ?? 0;
    const physicalQuantity = product.available_quantity + reservedQuantity;
    const [actualQuantity, setActualQuantity] = useState(String(physicalQuantity));
    const [inventoryDate, setInventoryDate] = useState(getLocalDate());
    const [reasonType, setReasonType] = useState("Продано");
    const [otherReason, setOtherReason] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        if (open) {
            setActualQuantity(String(physicalQuantity));
            setInventoryDate(getLocalDate());
            setReasonType("Невідомо");
            setOtherReason("");
            setReason("");
        }
    }, [open, physicalQuantity]);

    const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setActualQuantity(event.target.value);
    };

    const incrementQuantity = () => {
        const quantity = Number(actualQuantity);
        if (Number.isSafeInteger(quantity) && quantity < Number.MAX_SAFE_INTEGER) {
            setActualQuantity(String(quantity + 1));
        }
    };

    const decrementQuantity = () => {
        const quantity = Number(actualQuantity);
        if (Number.isSafeInteger(quantity) && quantity > 0) {
            setActualQuantity(String(quantity - 1));
        }
    };

    const isValidQuantity = /^\d+$/.test(actualQuantity)
        && Number.isSafeInteger(Number(actualQuantity))
        && Number(actualQuantity) >= 0;
    const hasQuantityChanges = isValidQuantity && Number(actualQuantity) !== physicalQuantity;
    const isValidReason = reasonType !== "Інше" || otherReason.trim() !== "";
    const isValidInventoryDate = /^\d{4}-\d{2}-\d{2}$/.test(inventoryDate);

    const handleSubmit = async () => {
        if (!isValidQuantity || !hasQuantityChanges || !isValidReason || !isValidInventoryDate || isSubmittingRef.current) return;

        const quantity = Number(actualQuantity);
        const inventoryReason = [
            reasonType === "Інше" ? `Інше: ${otherReason.trim()}` : reasonType,
            reason.trim()
        ].filter(Boolean).join(" — ");

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        try {
            await onSubmit(quantity, inventoryReason, inventoryDate);
        } catch {
            // API errors are reported by the parent action handler; keep the form available for retry.
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

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
                <QuantityField
                    label="Фактична кількість (усі фізичні одиниці)"
                    value={actualQuantity}
                    onChange={handleQuantityChange}
                    onIncrement={incrementQuantity}
                    onDecrement={decrementQuantity}
                    min={0}
                    max={Number.MAX_SAFE_INTEGER}
                    sx={{mt: 2}}
                />
                <Typography sx={{mt: 1}}>
                    Різниця: <strong>
                        {isValidQuantity ? Number(actualQuantity) - physicalQuantity : "—"}
                    </strong>
                </Typography>
                <TextField
                    fullWidth
                    required
                    type="date"
                    label="Дата звірки"
                    value={inventoryDate}
                    onChange={(event) => setInventoryDate(event.target.value)}
                    slotProps={{inputLabel: {shrink: true}}}
                    sx={{mt: 2}}
                />
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
                    disabled={!isValidQuantity || !hasQuantityChanges || !isValidReason || !isValidInventoryDate || isSubmitting}
                >
                    Провести інвентаризацію
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default ProductInventoryModal;
