import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {FC} from "react";
import {ICategory} from "../../utils/types";
import {customMenuProps} from "../../utils/function";

interface ISupplierSelectProps {
    suppliers: ICategory[]; // Можна уточнити тип постачальників
    value: number | string;
    onChange: (e: SelectChangeEvent<string | number>) => void;
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
            MenuProps={customMenuProps}
            labelId="supplier-select-label"
            value={value}
            onChange={(e) => onChange(e)}
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