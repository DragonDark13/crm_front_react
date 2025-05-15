import React from 'react';
import {FormControl, InputLabel, MenuItem, Select, TextFieldProps} from '@mui/material';

interface Customer {
    id: number;
    name: string;
}

interface CustomerSelectProps extends TextFieldProps{
    customers: Customer[];
    value: number | string;
    label?: string;
    onChange: (event: React.ChangeEvent<{ value: unknown }>) => void;

    [key: string]: any; // решта пропсів передаються через rest
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
                                                           customers,
                                                           value,
                                                           error,
                                                           label = "Покупець",
                                                           onChange,
                                                           ...rest
                                                       }) => {
    return (

        <FormControl   size="small" fullWidth margin="normal" sx={{marginBottom: 0}} error={!!error} {...rest}>
            <InputLabel   size="small" id="customer-select-label">
                {label}
            </InputLabel>
            <Select
                labelId="customer-select-label"
                margin="none"
                size="small"
                label={label}
                value={value}
                onChange={onChange}
                fullWidth
            >
                {customers.map((customer) => (
                    <MenuItem key={customer.id + customer.name} value={customer.id}>
                        {customer.name}
                    </MenuItem>
                ))}
            </Select>
            {error && <span className="error">{error}</span>}
        </FormControl>
    );
};

export default CustomerSelect;
