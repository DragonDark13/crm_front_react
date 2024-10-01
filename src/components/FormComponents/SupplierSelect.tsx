import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {ChangeEvent, FC} from "react";

interface ISupplierSelectProps {
    suppliers: any[]; // Можна уточнити тип постачальників
    value: number | string;
    onChange: (e: ChangeEvent<{ value: unknown }>) => void;
    error?: string;
}

const SupplierSelect: FC<ISupplierSelectProps> = ({
                                                      suppliers,
                                                      value,
                                                      onChange,
                                                      error,
                                                  }) => (
    <FormControl fullWidth margin="normal" error={!!error}>
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