import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    TextField,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper
} from '@mui/material';
import {fetchPackagingMaterials} from "../../api/api";
import {IMaterial} from "../../utils/types";


const PackagingMaterialList: React.FC = () => {
    const [materials, setMaterials] = useState<IMaterial[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<string>('asc');

    // Fetch materials from backend using Axios
    useEffect(() => {
        if (materials.length > 0) {

        } else {
            fetchPackagingMaterials()
                .then((response) => setMaterials(response.materials))
                .catch((error) => console.error('Error fetching packaging materials:', error));
        }

    }, []);

    // Filter and sort materials
// Filter and sort materials
    const filteredMaterials = materials
        .filter((material) =>
            material.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') {
                return sortOrder === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortBy === 'purchase_price_per_unit') {
                return sortOrder === 'asc'
                    ? a.purchase_price_per_unit - b.purchase_price_per_unit
                    : b.purchase_price_per_unit - a.purchase_price_per_unit;
            } else if (sortBy === 'available_quantity') {
                return sortOrder === 'asc'
                    ? a.available_quantity - b.available_quantity
                    : b.available_quantity - a.available_quantity;
            } else if (sortBy === 'created_date') {
                const dateA = new Date(a.created_date);
                const dateB = new Date(b.created_date);
                return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            }
            return 0;
        });

    const handleSort = (property: string) => {
        const isAsc = sortBy === property && sortOrder === 'asc';
        setSortBy(property);
        setSortOrder(isAsc ? 'desc' : 'asc');
    };

    return (
        <Paper sx={{width: '100%', overflow: 'hidden'}}>
            <h1>Список пакувальних матеріалів</h1>

            {/* Search */}
            <TextField
                label="Пошук за назвою"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                margin="dense"
            />

            {/* Sorting */}
            <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                fullWidth
                margin="dense"
            >
                <MenuItem value="name">Назва</MenuItem>
                <MenuItem value="purchase_price_per_unit">Ціна</MenuItem>
                <MenuItem value="available_quantity">Кількість в наявності</MenuItem>
                <MenuItem value="created_date">Дата створення</MenuItem> {/* Added sorting option for created_date */}
            </Select>


            <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                fullWidth
                margin="dense"
            >
                <MenuItem value="asc">По зростанню</MenuItem>
                <MenuItem value="desc">По спаданню</MenuItem>
            </Select>

            {/* IMaterial List Table */}
            <TableContainer>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'name'}
                                    direction={sortBy === 'name' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    Назва
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Постачальник</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'purchase_price_per_unit'}
                                    direction={sortBy === 'purchase_price_per_unit' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('purchase_price_per_unit')}
                                >
                                    Ціна
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'available_quantity'}
                                    direction={sortBy === 'available_quantity' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('available_quantity')}
                                >
                                    Кількість в наявності
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'created_date'}
                                    direction={sortBy === 'created_date' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('created_date')}
                                >
                                    Дата створення
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMaterials.length > 0 && filteredMaterials.map((material) => (
                            <TableRow key={material.id}>
                                <TableCell>{material.name}</TableCell>
                                <TableCell>{material.supplier.name}</TableCell>
                                <TableCell>{material.purchase_price_per_unit}</TableCell>
                                <TableCell>{material.available_quantity}</TableCell>
                                <TableCell>{new Date(material.created_date).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default PackagingMaterialList;
