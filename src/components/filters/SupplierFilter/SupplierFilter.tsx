import React from 'react';
import {Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import {ISupplier} from "../../../utils/types";

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
                    tid={supplier.name}
                    key={supplier.id}
                    control={
                        <Checkbox
                            checked={selectedFilterSuppliers.includes(supplier.id)}
                            onChange={() => handleSupplierFilterChange(supplier.id)}
                        />
                    }
                    label={supplier.name}
                    title={supplier.name}
                    componentsProps={{

                        typography: {
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }}
                    classes={{
                        label: 'supplier_name'
                    }}
                />
            ))}
        </FormGroup>
    );
};

export default SupplierFilter;
