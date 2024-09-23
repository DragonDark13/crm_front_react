import React, {useEffect, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Button, TextField, Modal, Box, TableSortLabel, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import {modalStyle} from "./styled/styled";
import ProductHistoryModal from "./components/ProductHistoryModal/ProductHistoryModal";
import {CircularProgress, Typography} from '@mui/material'; // Імпорт компонентів Material-UI

//TODO Create dialog components
//TODO add type interfae
//TODO add handle error


import './App.css'
import {
    addProduct,
    addPurchase,
    addSale,
    deleteProduct,
    fetchGetAllCategories,
    fetchProducts,
    updateProduct
} from "./api/api";
import AddProductModal from "./components/AddProductModal/AddProductModal";


export interface IProduct {
    id: number;
    name: string;
    supplier: string;
    quantity: number;
    total_price: number;
    price_per_item: number;
}

export interface ICategory {
    name: string;
    id: number;
}


function App() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Стан для прелоадера
    const [error, setError] = useState<string | null>(null); // Стан для помилок
    const [newProduct, setNewProduct] = useState<object[IProduct]>({
        name: '',
        supplier: '',
        quantity: '',
        total_price: '',
        price_per_item: '',
        category_ids: []
    });
    const [editProduct, setEditProduct] = useState<object[IProduct]>(null); // Для зберігання товару, який редагується
    const [openEdit, setOpenEdit] = useState(false); // Відповідає за стан модального вікна для редагування
    const [openAdd, setOpenAdd] = useState(false); // Відповідає за стан модального вікна для додавання

    const [order, setOrder] = useState('asc'); // Порядок сортування (asc/desc)
    const [orderBy, setOrderBy] = useState('name'); // Колонка для сортування


    const [openHistory, setOpenHistory] = useState(false); // Стан для модального вікна історії
    const [openPurchase, setOpenPurchase] = useState(false); // Стан для модального вікна історії

    const [productId, setProductId] = useState<number>(null)

    const [purchaseDetails, setPurchaseDetails] = useState({
        price_per_item: 0,
        total_price: 0,
        supplier: '',
        purchase_date: new Date().toISOString().slice(0, 10), // Формат YYYY-MM-DD
    });

    const [openSale, setOpenSale] = useState(false);

    const [saleData, setSaleData] = useState({
        customer: '',
        quantity: 0,
        price_per_item: 0,
        total_price: 0,
        sale_date: new Date().toISOString().split('T')[0] // Сьогоднішня дата
    });

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleOpenSale = (product) => {
        setEditProduct(product)
        setSaleData({
            ...saleData,
            productId: product.id, // Зберігаємо ID продукту для відправки на сервер
        });
        setOpenSale(true);
    };

    const handleCloseSale = () => {
        setEditProduct(null)
        setOpenSale(false);
        setSaleData({
            customer: '',
            quantity: 0,
            price_per_item: 0,
            total_price: 0,
            sale_date: new Date().toISOString().split('T')[0],
        });
    };

    // Функція для відкриття модального вікна покупки
    const handlePurchase = (product) => {
        setEditProduct(product)
        setPurchaseDetails({
            ...purchaseDetails,
            supplier: product.supplier,
            total_price: product.price_per_item * product.quantity,
        });
        setOpenPurchase(true);
    };

    // Функції для відкриття/закриття модальних вікон
    const handleOpenEdit = (product) => {
        setEditProduct(product);
        setOpenEdit(true);
    };
    const handleCloseEdit = () => setOpenEdit(false);
    const handleOpenAdd = () => setOpenAdd(true);
    const handleCloseAdd = () => setOpenAdd(false);
    const handleClosePurchase = () => setOpenPurchase(false)

    useEffect(() => {
        fetchProductsFunc();
    }, []);

    const fetchProductsFunc = () => {
        fetchProducts()
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error('Fetched data is not an array:', data);
                    setProducts([]); // Встановлюємо порожній масив у разі невідповідності
                }
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
                setError('There was an error fetching the products!');
                setProducts([]); // Встановлюємо порожній масив у разі помилки
            })
            .finally(() => {
                setIsLoading(false); // Завершуємо завантаження
            });
    };

    const handleDelete = (productId) => {
        deleteProduct(productId)
            .then(() => fetchProductsFunc()) // Після видалення оновлюємо список продуктів
            .catch(error => {
                console.error('There was an error deleting the product!', error);
            });
    };

    const handleAdd = () => {
        addProduct(newProduct)
            .then(() => {
                fetchProductsFunc();
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
        updateProduct(editProduct.id, editProduct).then(() => {
            fetchProductsFunc();
            handleCloseEdit(); // Закрити модальне вікно після збереження
        })
            .catch(error => {
                console.error('There was an error updating the product!', error);
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

    const handleSubmitPurchase = () => {
        const purchaseData = {
            price_per_item: purchaseDetails.price_per_item,
            total_price: purchaseDetails.total_price,
            supplier: purchaseDetails.supplier,
            purchase_date: purchaseDetails.purchase_date,
        };

        addPurchase(editProduct.id, purchaseData).then(() => {
            fetchProductsFunc(); // Оновити список товарів
            handleClosePurchase(); // Закрити модальне вікно
        })
            .catch(error => {
                console.error('There was an error processing the purchase!', error);
            });
    };

    const handleSale = () => {
        addSale(editProduct.id, saleData).then(() => {
            handleCloseSale();
            // Тут можна також оновити список продуктів або історію, якщо потрібно
        })
            .catch(error => {
                console.error('There was an error saving the sale!', error);
            });
    };

    useEffect(() => {
        // Отримання списку всіх

        fetchGetAllCategories().then(data => {

            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.error('Fetched data is not an array:', data);
                setCategories([])
            }

        })
            .catch(error => {
                console.error('Error fetching categories', error);
            });
    }, []);

    const handleCategoryChange = (categoryId) => {

        setSelectedCategories((prevState) => {
            if (prevState.includes(categoryId)) {
                return prevState.filter(id => id !== categoryId); // Якщо категорія вибрана — видаляємо її
            } else {
                return [...prevState, categoryId]; // Якщо не вибрана — додаємо
            }
        });


        setNewProduct((prevProduct) => {
            const updatedCategories = prevProduct.category_ids.includes(categoryId)
                ? prevProduct.category_ids.filter(id => id !== categoryId) // Відміна вибору
                : [...prevProduct.category_ids, categoryId]; // Додавання вибраної категорії

            return {
                ...prevProduct,
                category_ids: updatedCategories // Оновлення категорій
            };
        });
    };

    return (
        <React.Fragment>


            {isLoading ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <CircularProgress/> {/* Прелоадер */}
                        <Typography variant="h6" sx={{mt: 2}}>
                            Loading...
                        </Typography>
                    </Box>
                </Box>
            ) : error ? (
                <div>{error}</div> // Відображення помилки
            ) : (
                <React.Fragment>
                    <h1>Product List</h1>
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
                                        <Button variant="contained" color="primary"
                                                onClick={() => handleOpenEdit(product)}>
                                            Edit
                                        </Button>
                                        <Button variant="contained" color="secondary"
                                                onClick={() => handleDelete(product.id)}>
                                            Delete
                                        </Button>
                                        <Button variant="contained" color="primary"
                                                onClick={() => handlePurchase(product)}>
                                            Purchase
                                        </Button>
                                        <Button variant="contained" color="primary"
                                                onClick={() => handleOpenSale(product)}>
                                            Продаж
                                        </Button>
                                        <Button variant="contained" onClick={() => {
                                            setProductId(product.id); // Встановлюємо productId
                                            setOpenHistory(true); // Відкриваємо модальне вікно
                                        }}>
                                            Історія
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

                </React.Fragment>
            )}


            {/* Модальне вікно для додавання нового товару */}

            {
                openAdd && <AddProductModal
                    setNewProduct={setNewProduct}
                    newProduct={newProduct}
                    open={openAdd}
                    categories={categories}
                    handleAdd={handleAdd}
                    handleCategoryChange={handleCategoryChange}
                    handleClose={handleCloseAdd}
                    selectedCategories={selectedCategories}/>
            }

            {/*<Modal*/}
            {/*    open={openAdd}*/}
            {/*    onClose={handleCloseAdd}*/}
            {/*    aria-labelledby="modal-title"*/}
            {/*    aria-describedby="modal-description"*/}
            {/*>*/}
            {/*    <Box sx={modalStyle}>*/}
            {/*        <h2 id="modal-title">Add New Product</h2>*/}
            {/*        <TextField*/}
            {/*            label="Name"*/}
            {/*            value={newProduct.name}*/}
            {/*            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}*/}
            {/*        />*/}
            {/*        <TextField*/}
            {/*            label="Supplier"*/}
            {/*            value={newProduct.supplier}*/}
            {/*            onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}*/}
            {/*        />*/}
            {/*        <TextField*/}
            {/*            label="Quantity"*/}
            {/*            type="number"*/}
            {/*            value={newProduct.quantity}*/}
            {/*            onChange={(e) => setNewProduct({...newProduct, quantity: Number(e.target.value)})}*/}
            {/*        />*/}

            {/*        <TextField*/}
            {/*            label="Total Price"*/}
            {/*            type="number"*/}
            {/*            value={newProduct.total_price}*/}
            {/*            onChange={(e) => setNewProduct({...newProduct, total_price: e.target.value})}*/}
            {/*        />*/}
            {/*        <TextField*/}
            {/*            label="Price per Item"*/}
            {/*            type="number"*/}
            {/*            value={newProduct.price_per_item}*/}
            {/*            onChange={(e) => setNewProduct({...newProduct, price_per_item: e.target.value})}*/}
            {/*        />*/}

            {/*        <FormGroup>*/}
            {/*            {categories.map(category => (*/}
            {/*                <FormControlLabel*/}
            {/*                    key={category.id}*/}
            {/*                    control={*/}
            {/*                        <Checkbox*/}
            {/*                            checked={selectedCategories.includes(category.id)}*/}
            {/*                            onChange={() => handleCategoryChange(category.id)}*/}
            {/*                        />*/}
            {/*                    }*/}
            {/*                    label={category.name}*/}
            {/*                />*/}
            {/*            ))}*/}
            {/*        </FormGroup>*/}

            {/*        <Button variant="contained" color="primary" onClick={handleAdd}>*/}
            {/*            Add Product*/}
            {/*        </Button>*/}
            {/*    </Box>*/}
            {/*</Modal>*/}

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

            {openHistory && (
                <ProductHistoryModal
                    openHistory={openHistory}
                    onClose={() => setOpenHistory(false)}
                    productId={productId} // Передаємо productId
                />
            )}


            <Modal
                open={openPurchase}
                onClose={() => setOpenPurchase(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <h2 id="modal-title">Purchase Product</h2>
                    <TextField
                        label="Price per Item"
                        type="number"
                        value={purchaseDetails.price_per_item}
                        onChange={(e) => setPurchaseDetails({
                            ...purchaseDetails,
                            price_per_item: Number(e.target.value)
                        })}
                    />
                    <TextField
                        label="Total Price"
                        type="number"
                        value={purchaseDetails.total_price}
                        onChange={(e) => setPurchaseDetails({...purchaseDetails, total_price: Number(e.target.value)})}
                    />
                    <TextField
                        label="Supplier"
                        value={purchaseDetails.supplier}
                        onChange={(e) => setPurchaseDetails({...purchaseDetails, supplier: e.target.value})}
                    />
                    <TextField
                        label="Purchase Date"
                        type="date"
                        value={purchaseDetails.purchase_date}
                        onChange={(e) => setPurchaseDetails({...purchaseDetails, purchase_date: e.target.value})}
                    />
                    <Button variant="contained" color="primary" onClick={handleSubmitPurchase}>
                        Confirm Purchase
                    </Button>
                </Box>
            </Modal>


            <Modal
                open={openSale}
                onClose={handleCloseSale}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <h2 id="modal-title">Продаж товару</h2>
                    <TextField
                        label="Покупець"
                        value={saleData.customer}
                        onChange={(e) => setSaleData({...saleData, customer: e.target.value})}
                    />
                    <TextField
                        label="Кількість"
                        type="number"
                        value={saleData.quantity}
                        onChange={(e) => {
                            const quantity = Number(e.target.value);
                            setSaleData({
                                ...saleData,
                                quantity,
                                total_price: (quantity * saleData.price_per_item) // Автоматично розраховуємо загальну суму
                            });
                        }}
                    />
                    <TextField
                        label="Ціна за шт"
                        type="number"
                        value={saleData.price_per_item}
                        onChange={(e) => {
                            const price = Number(e.target.value);
                            setSaleData({
                                ...saleData,
                                price_per_item: price,
                                total_price: (price * saleData.quantity) // Автоматично розраховуємо загальну суму
                            });
                        }}
                    />
                    <TextField
                        label="Загальна сума"
                        value={saleData.total_price}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        label="Дата продажу"
                        type="date"
                        value={saleData.sale_date}
                        onChange={(e) => setSaleData({...saleData, sale_date: e.target.value})}
                    />
                    <Button variant="contained" color="primary" onClick={handleSale}>
                        Зберегти продаж
                    </Button>
                </Box>
            </Modal>


        </React.Fragment>
    );
}

export default App;
