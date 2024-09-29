import React from 'react';
import {Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import {ISupplier} from "../../App"; // Імпорт типу постачальника (створи, якщо ще немає)

interface ISupplierFilterProps {
    selectedFilterSuppliers: number[];
    handleSupplierFilterChange: (supplierID: number) => void;
    suppliers: ISupplier[];
}

const SupplierFilter: React.FC<ISupplierFilterProps> = ({
                                                            selectedFilterSuppliers,
                                                            handleSupplierFilterChange,
                                                            suppliers
                                                        }) => {
    return (
        <FormGroup>
            {suppliers.map(supplier => (
                <FormControlLabel
                    key={supplier.id}
                    control={
                        <Checkbox
                            checked={selectedFilterSuppliers.includes(supplier.id)}
                            onChange={() => handleSupplierFilterChange(supplier.id)}
                        />
                    }
                    label={supplier.name}
                />
            ))}
        </FormGroup>
    );
};

export default SupplierFilter;
