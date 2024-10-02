import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {ChangeEvent, FC} from "react";

interface ISupplierSelectProps {
    suppliers: any[]; // Можна уточнити тип постачальників
    value: number | string;
    onChange: (e: ChangeEvent<{ value: unknown }>) => void;
    error?: string;
    disabled?: boolean; // Для заблокованого вибору постачальника (наприклад, при редагуванні замовлення)
}

const SupplierSelect: FC<ISupplierSelectProps> = ({
                                                      disabled = false,
                                                      suppliers,
                                                      value,
                                                      onChange,
                                                      error,
                                                  }) => (
    <FormControl disabled={disabled} fullWidth margin="normal" error={!!error}>
        <InputLabel id="supplier-select-label">Постачальник</InputLabel>
        <Select
            labelId="supplier-select-label"
            value={value}
            onChange={onChange}
            label="Постачальник"
        >
            {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                </MenuItem>
            ))}
        </Select>
        {error && <span className="error">{error}</span>}
    </FormControl>
);

export default SupplierSelect