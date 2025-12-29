import React, {ChangeEvent, ChangeEventHandler, ReactNode} from 'react';
import {
    FilledSelectProps,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent, SelectProps,
    TextFieldProps
} from '@mui/material';

interface Customer {
    id: number;
    name: string;
}

// export type CustomerSelectProps = FilledSelectProps & {
//     customers: Customer[];
//     value: number | string;
//     label?: string;
//     onChange:((event: SelectChangeEvent<string | number>, child: ReactNode) => void) | undefined
//
// }

type CustomerSelectProps = Omit<
    SelectProps<string | number>,
    'value' | 'onChange'
> & {
    customers: Customer[];
    value: string | number;
    label?: string;
    error?: boolean;
    onChange: ((event: SelectChangeEvent<string | number>, child: ReactNode) => void) | undefined
    [key: string]: any; // решта пропсів передаються через rest

};

const CustomerSelect: React.FC<CustomerSelectProps> = ({
                                                           customers,
                                                           value,
                                                           error,
                                                           label = "Покупець",
                                                           onChange,
                                                           ...selectProps
                                                       }) => {
    return (

        <FormControl   size="small" fullWidth margin="normal" sx={{marginBottom: 0}} error={!!error} >
            <InputLabel   size="small" id="customer-select-label">
                {label}
            </InputLabel>
            <Select
                labelId="customer-select-label"
                size="small"
                label={label}
                value={value}
                onChange={onChange}
                fullWidth
                {...selectProps}
            >
                {customers.map((customer:Customer) => (
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
