import React, {useEffect, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Button, Box, TableSortLabel,
} from '@mui/material';

import ProductHistoryModal from "./components/ProductHistoryModal/ProductHistoryModal";
import {CircularProgress, Typography} from '@mui/material'; // Імпорт компонентів Material-UI

//TODO Create dialog components
//TODO add type interface
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
import EditProductModal from "./components/EditProductModal/EditProductModal";
import PurchaseProductModal from "./components/PurchaseProductModal/PurchaseProductModal";
import SaleProductModal from "./components/SaleProductModal/SaleProductModal";


export interface IBaseProduct {
    name: string;
    supplier: string;
    quantity: number;
    total_price: number;
    price_per_item: number;
}

export interface IProduct extends IBaseProduct {
    id: number;
}

export interface INewProduct extends IBaseProduct {
    category_ids: number[]
}

export interface ICategory {
    id: number
    name: string;
}

export interface IPurchaseData {
    price_per_item: number,
    total_price: number,
    supplier: string,
    purchase_date: string,
}

export interface ISaleData {
    customer: string,
    quantity: number,
    price_per_item: number,
    total_price: number,
    sale_date: string
    productId: number
}


function App() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Стан для прелоадера
    const [error, setError] = useState<string | null>(null); // Стан для помилок
    const [newProduct, setNewProduct] = useState<INewProduct>({
        name: '',
        supplier: '',
        quantity: 0,
        total_price: 0,
        price_per_item: 0,
        category_ids: []
    });
    const [editProduct, setEditProduct] = useState<IProduct | null>(null); // Для зберігання товару, який редагується
    const [openEdit, setOpenEdit] = useState(false); // Відповідає за стан модального вікна для редагування
    const [openAdd, setOpenAdd] = useState(false); // Відповідає за стан модального вікна для додавання

    const [order, setOrder] = useState('asc'); // Порядок сортування (asc/desc)
    const [orderBy, setOrderBy] = useState('name'); // Колонка для сортування


    const [openHistory, setOpenHistory] = useState(false); // Стан для модального вікна історії
    const [openPurchase, setOpenPurchase] = useState(false); // Стан для модального вікна історії

    const [productId, setProductId] = useState<number | null>(null)

    const [purchaseDetails, setPurchaseDetails] = useState({
        price_per_item: 0,
        total_price: 0,
        supplier: '',
        purchase_date: new Date().toISOString().slice(0, 10), // Формат YYYY-MM-DD
    });

    const [openSale, setOpenSale] = useState(false);

    const [saleData, setSaleData] = useState<ISaleData | null>(null);

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleOpenSale = (product: IProduct) => {
        setEditProduct(product)
        setSaleData({
            customer: '',
            quantity: 0,
            price_per_item: 0,
            total_price: 0,
            sale_date: new Date().toISOString().split('T')[0],
            productId: product.id, // Зберігаємо ID продукту для відправки на сервер
        });
        setOpenSale(true);
    };

    const handleCloseSale = () => {
        setEditProduct(null)
        setOpenSale(false);
        setSaleData(null);
    };

    // Функція для відкриття модального вікна покупки
    const handlePurchase = (product: IProduct) => {
        setEditProduct(product)
        setPurchaseDetails({
            ...purchaseDetails,
            supplier: product.supplier,
            total_price: product.price_per_item * product.quantity,
        });
        setOpenPurchase(true);
    };

    // Функції для відкриття/закриття модальних вікон
    const handleOpenEdit = (product: IProduct) => {
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

    const handleDelete = (productId: number) => {
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
                    quantity: 0,
                    total_price: 0,
                    price_per_item: 0,
                    category_ids: [],
                });
            })
            .catch(error => {
                console.error('There was an error adding the product!', error);
            });
    };

    const handleEditSave = () => {
        if (!editProduct) return; // Перевірка, чи �� продукт для редагування
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

    const sortProducts = (products: IProduct[], comparator) => {
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
        const purchaseData: IPurchaseData = {
            price_per_item: purchaseDetails.price_per_item,
            total_price: purchaseDetails.total_price,
            supplier: purchaseDetails.supplier,
            purchase_date: purchaseDetails.purchase_date,
        };

        if (!editProduct) return null

        addPurchase(editProduct.id, purchaseData).then(() => {
            fetchProductsFunc(); // Оновити список товарів
            handleClosePurchase(); // Закрити модальне вікно
        })
            .catch(error => {
                console.error('There was an error processing the purchase!', error);
            });
    };

    const handleSale = () => {
        if (saleData && editProduct) {
            addSale(editProduct.id, saleData).then(() => {
                handleCloseSale();
                // Тут можна також оновити список продуктів або історію, якщо потрібно
            })
                .catch(error => {
                    console.error('There was an error saving the sale!', error);
                });
        }

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
                    <Button variant="contained" color="primary" onClick={handleOpenAdd}>
                        Add New Product
                    </Button>
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
                            <TableBody>
                                {products.length >0 && sortProducts(products, getComparator(order, orderBy)).map((product: IProduct, index) => (
                                <TableRow key={`${product.id}${index}`}>
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

            {(openEdit && editProduct) &&
            <EditProductModal open={openEdit} handleClose={handleCloseEdit} editProduct={editProduct}
                              setEditProduct={setEditProduct} handleEditSave={handleEditSave}/>}


            {(openHistory && productId) && (
                <ProductHistoryModal
                    openHistory={openHistory}
                    onClose={() => setOpenHistory(false)}
                    productId={productId} // Передаємо productId
                />
            )}

            {openPurchase && <PurchaseProductModal open={openPurchase}
                                                   handleClose={() => setOpenPurchase(false)}
                                                   purchaseDetails={purchaseDetails}
                                                   setPurchaseDetails={setPurchaseDetails}
                                                   handleSubmitPurchase={handleSubmitPurchase}/>}


            {
                (openSale && saleData) &&
                <SaleProductModal
                    open={openSale}
                    handleClose={handleCloseSale}
                    saleData={saleData}
                    setSaleData={setSaleData}
                    handleSale={handleSale}
                />
            }


        </React.Fragment>
    );
}

export default App;
