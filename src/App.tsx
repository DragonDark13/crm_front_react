import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Button, TextField, Modal, Box, TableSortLabel
} from '@mui/material';

// Стили для модального вікна
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

interface IProduct {
    id: number;
    name: string;
    supplier: string;
    quantity: number;
    total_price: number;
    price_per_item: number;
}

function App() {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState<object[IProduct]>({
        name: '',
        supplier: '',
        quantity: '',
        total_price: '',
        price_per_item: '',
    });
    const [editProduct, setEditProduct] = useState<object[IProduct]>(null); // Для зберігання товару, який редагується
    const [openEdit, setOpenEdit] = useState(false); // Відповідає за стан модального вікна для редагування
    const [openAdd, setOpenAdd] = useState(false); // Відповідає за стан модального вікна для додавання

    const [order, setOrder] = useState('asc'); // Порядок сортування (asc/desc)
    const [orderBy, setOrderBy] = useState('name'); // Колонка для сортування

    const [productHistory, setProductHistory] = useState([]); // Історія змін товару
    const [openHistory, setOpenHistory] = useState(false); // Стан для модального вікна історії

    // Функції для відкриття/закриття модальних вікон
    const handleOpenEdit = (product) => {
        setEditProduct(product);
        setOpenEdit(true);
    };
    const handleCloseEdit = () => setOpenEdit(false);
    const handleOpenAdd = () => setOpenAdd(true);
    const handleCloseAdd = () => setOpenAdd(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get('http://localhost:5000/api/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
            });
    };

    const handleDelete = (productId) => {
        axios.delete(`http://localhost:5000/api/product/${productId}`)
            .then(() => {
                fetchProducts();
            })
            .catch(error => {
                console.error('There was an error deleting the product!', error);
            });
    };

    const handleAdd = () => {
        axios.post('http://localhost:5000/api/products', newProduct)
            .then(() => {
                fetchProducts();
                handleCloseAdd(); // Закрити модальне вікно після додавання
                setNewProduct({
                    name: '',
                    supplier: '',
                    quantity: '',
                    total_price: '',
                    price_per_item: '',
                });
            })
            .catch(error => {
                console.error('There was an error adding the product!', error);
            });
    };

    const handleEditSave = () => {
        axios.put(`http://localhost:5000/api/product/${editProduct.id}`, editProduct)
            .then(() => {
                fetchProducts();
                handleCloseEdit(); // Закрити модальне вікно після збереження
            })
            .catch(error => {
                console.error('There was an error updating the product!', error);
            });
    };

    const fetchProductHistory = (productId) => {
        axios.get(`http://localhost:5000/api/product/${productId}/history`)
            .then(response => {
                setProductHistory(response.data);
                setOpenHistory(true); // Відкрити модальне вікно
            })
            .catch(error => {
                console.error('There was an error fetching the product history!', error);
            });
    };


    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortProducts = (products, comparator) => {
        const stabilizedProducts = products.map((el, index) => [el, index]);
        stabilizedProducts.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedProducts.map((el) => el[0]);
    };

    const getComparator = (order, orderBy) => {
        return order === 'desc'
            ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
            : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
    };

    return (
        <div>
            <h1>Product List</h1>

            {/* Таблиця продуктів */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'name'}
                                    direction={orderBy === 'name' ? order : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Supplier</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'quantity'}
                                    direction={orderBy === 'quantity' ? order : 'asc'}
                                    onClick={() => handleSort('quantity')}
                                >
                                    Quantity
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'total_price'}
                                    direction={orderBy === 'total_price' ? order : 'asc'}
                                    onClick={() => handleSort('total_price')}
                                >
                                    Total Price
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'price_per_item'}
                                    direction={orderBy === 'price_per_item' ? order : 'asc'}
                                    onClick={() => handleSort('price_per_item')}
                                >
                                    Price per Item
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{sortProducts(products, getComparator(order, orderBy)).map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.supplier}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{product.total_price}</TableCell>
                            <TableCell>{product.price_per_item}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary" onClick={() => handleOpenEdit(product)}>
                                    Edit
                                </Button>
                                <Button variant="contained" color="secondary"
                                        onClick={() => handleDelete(product.id)}>
                                    Delete
                                </Button>
                                <Button variant="contained" color="default"
                                        onClick={() => fetchProductHistory(product.id)}>
                                    History
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Кнопка для відкриття модального вікна для додавання */}
            <Button variant="contained" color="primary" onClick={handleOpenAdd}>
                Add New Product
            </Button>

            {/* Модальне вікно для додавання нового товару */}
            <Modal
                open={openAdd}
                onClose={handleCloseAdd}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <h2 id="modal-title">Add New Product</h2>
                    <TextField
                        label="Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <TextField
                        label="Supplier"
                        value={newProduct.supplier}
                        onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                    />
                    <TextField
                        label="Quantity"
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: Number(e.target.value)})}
                    />

                    <TextField
                        label="Total Price"
                        type="number"
                        value={newProduct.total_price}
                        onChange={(e) => setNewProduct({...newProduct, total_price: e.target.value})}
                    />
                    <TextField
                        label="Price per Item"
                        type="number"
                        value={newProduct.price_per_item}
                        onChange={(e) => setNewProduct({...newProduct, price_per_item: e.target.value})}
                    />
                    <Button variant="contained" color="primary" onClick={handleAdd}>
                        Add Product
                    </Button>
                </Box>
            </Modal>

            {/* Модальне вікно для редагування товару */}
            <Modal
                open={openEdit}
                onClose={handleCloseEdit}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <h2 id="modal-title">Edit Product</h2>
                    {editProduct && (
                        <div>
                            <TextField
                                label="Name"
                                value={editProduct.name}
                                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                            />
                            <TextField
                                label="Supplier"
                                value={editProduct.supplier}
                                onChange={(e) => setEditProduct({...editProduct, supplier: e.target.value})}
                            />
                            <TextField
                                label="Quantity"
                                type="number"
                                value={editProduct.quantity}
                                onChange={(e) => setEditProduct({...editProduct, quantity: Number(e.target.value)})}
                            />
                            <TextField
                                label="Total Price"
                                type="number"
                                value={editProduct.total_price}
                                onChange={(e) => setEditProduct({...editProduct, total_price: e.target.value})}
                            />
                            <TextField
                                label="Price per Item"
                                type="number"
                                value={editProduct.price_per_item}
                                onChange={(e) => setEditProduct({...editProduct, price_per_item: e.target.value})}
                            />
                            <Button variant="contained" color="primary" onClick={handleEditSave}>
                                Save Changes
                            </Button>
                        </div>
                    )}
                </Box>
            </Modal>

            <Modal
                open={openHistory}
                onClose={() => setOpenHistory(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <h2 id="modal-title">Product History</h2>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Change Type</TableCell>
                                    <TableCell>Change Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productHistory.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>{record.change_type}</TableCell>
                                        <TableCell>{record.change_amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Modal>

        </div>
    );
}

export default App;
