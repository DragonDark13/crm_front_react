import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import React, {FC} from "react";
import {ICategory, ISupplierFull} from "../../utils/types";

interface ISupplierSelectProps {
    suppliers: ISupplierFull[]; // Можна уточнити тип постачальників
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
    <FormControl  required={true} size="small" disabled={disabled} fullWidth margin="normal" error={!!error}>
        <InputLabel size="small" id="supplier-select-label">Постачальник</InputLabel>
        <Select
            required={true}
            size={"small"}
            labelId="supplier-select-label"
            value={value}
            onChange={(e) => onChange(e)}
            label="Постачальник"
        >
            {suppliers.map((supplier) => (
                <MenuItem disabled={!supplier.is_active} title={supplier.name} key={supplier.id+supplier.name} value={supplier.id}>
                    <Typography color={!supplier.is_active && (supplier.id ===value) ? 'textDisabled' : 'inherit'}> {!supplier.is_active ? "не" +
                        " активний" +
                        " " : null} {supplier.name}</Typography>
                </MenuItem>
            ))}
        </Select>
        {error && <span className="error">{error}</span>}
    </FormControl>
);

export default SupplierSelect