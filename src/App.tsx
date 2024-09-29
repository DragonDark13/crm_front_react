import React, {useEffect, useState} from 'react';
import {
    Button, Box, DialogContent, DialogTitle, Dialog, DialogContentText, DialogActions
} from '@mui/material';

import ProductHistoryModal from "./components/ProductHistoryModal/ProductHistoryModal";
import {CircularProgress, Typography} from '@mui/material'; // Імпорт компонентів Material-UI

//TODO Create dialog components
//TODO add type interface
//TODO add handle error


import './App.css'
import {
    addNewCategory,
    addProduct,
    addPurchase,
    addSale,
    deleteProduct,
    fetchGetAllCategories, fetchGetAllSuppliers,
    fetchProducts,
    updateProduct
} from "./api/api";
import AddProductModal from "./components/AddProductModal/AddProductModal";
import EditProductModal from "./components/EditProductModal/EditProductModal";
import PurchaseProductModal from "./components/PurchaseProductModal/PurchaseProductModal";
import SaleProductModal from "./components/SaleProductModal/SaleProductModal";
import CreateNewCategoryModal from "./components/CreateNewCategoryModal/CreateNewCategoryModal";
import CategoryFilter from "./components/CategoryFilter/CategoryFilter";
import ProductTable from "./components/ProductTable/ProductTable";
import AddSupplierModal from "./components/AddSupplierModal/AddSupplierModal";
import SupplierFilter from "./components/SupplierFilter/SupplierFilter";


export interface IBaseProduct {
    name: string;
    quantity: number;
    total_price: number;
    price_per_item: number;
}

export interface IProduct extends IBaseProduct {
    id: number;
    category_ids: number[]
    supplier: ISupplier | null
}

export interface ISupplierID {
    supplier_id: number | null;
}

export interface INewProduct extends IBaseProduct, ISupplierID {
    category_ids: number[]
}

export interface IEditProduct extends IBaseProduct, ISupplierID {
    id: number;
    category_ids: number[]
}

export interface ICategory {
    id: number
    name: string;
}

export interface IPurchaseData extends ISupplierID {
    quantity: number
    price_per_item: number,
    total_price: number,
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

export interface ISupplier {
    id: number;
    name: string;
    contact_info: string | null
}

function App() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true); // Стан для прелоадера
    const [error, setError] = useState<string | null>(null); // Стан для помилок
    const [newProduct, setNewProduct] = useState<INewProduct>({
        name: '',
        supplier_id: null,
        quantity: 0,
        total_price: 0,
        price_per_item: 0,
        category_ids: [],
        // created_date: '',
    });
    const [editProduct, setEditProduct] = useState<IEditProduct | null>(null); // Для зберігання товару, який редагується
    const [openEdit, setOpenEdit] = useState(false); // Відповідає за стан модального вікна для редагування
    const [openAdd, setOpenAdd] = useState(false); // Відповідає за стан модального вікна для додавання

    const [order, setOrder] = useState<'asc' | 'desc'>('asc'); // Порядок сортування (asc/desc)
    const [orderBy, setOrderBy] = useState<keyof IProduct>('name'); // Колонка для сортування


    const [openHistory, setOpenHistory] = useState(false); // Стан для модального вікна історії
    const [openPurchase, setOpenPurchase] = useState(false); // Стан для модального вікна історії

    const [productId, setProductId] = useState<number | null>(null)
    const [openCategoryCreateModal, setOpenCategoryCreateModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedDeleteModalProductId, setSelectedDeleteModalProductId] = useState<number | null>(null);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([])

    const [purchaseDetails, setPurchaseDetails] = useState<IPurchaseData>({
        quantity: 0,
        price_per_item: 0,
        total_price: 0,
        supplier_id: null,
        purchase_date: new Date().toISOString().slice(0, 10), // Формат YYYY-MM-DD
    });

    const [openSale, setOpenSale] = useState(false);

    const [saleData, setSaleData] = useState<ISaleData | null>(null);

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedFilterCategories, setSelectedFilterCategories] = useState<number[]>([]);
    const [selectedFilterSuppliers, setSelectedFilterSuppliers] = useState<number[]>([]);

    const [isModalAddSupplierOpen, setModalOpenAddSupplierOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpenAddSupplierOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpenAddSupplierOpen(false);
    };


    const handleOpenSale = (product: IProduct) => {
        setSaleData({
            customer: '',
            quantity: 1,
            price_per_item: product.price_per_item,
            total_price: product.price_per_item,
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
        setEditProduct({
            id: product.id,
            name: product.name,
            supplier_id: product.supplier ? product.supplier.id : null,
            quantity: product.quantity,
            total_price: product.total_price,
            price_per_item: product.price_per_item,
            category_ids: product.category_ids,
        })
        setPurchaseDetails({
            ...purchaseDetails,
            supplier_id: product.supplier ? product.supplier.id : null,
            price_per_item: product.price_per_item,
        });
        setOpenPurchase(true);
    };

    // Функції для відкриття/закриття модальних вікон
    const handleOpenEdit = (product: IProduct) => {
        setEditProduct({
            id: product.id,
            name: product.name,
            supplier_id: product.supplier ? product.supplier.id : null,
            quantity: product.quantity,
            total_price: product.total_price,
            price_per_item: product.price_per_item,
            category_ids: product.category_ids,
        });
        setOpenEdit(true);
        setSelectedCategories(product.category_ids);
    };
    const handleCloseEdit = () => {
        setEditProduct(null);
        setOpenEdit(false)
        setSelectedCategories([]);
    };

    const handleOpenAdd = () => {
        setOpenAdd(true)
        setNewProduct((newProduct) => {
            return {
                ...newProduct,
            }
        })
    };
    const handleCloseAdd = () => {
        setNewProduct({
            name: '',
            supplier_id: null,
            quantity: 0,
            total_price: 0,
            price_per_item: 0,
            category_ids: [],
            // created_date: '',
        })
        setOpenAdd(false);
    }
    const handleClosePurchase = () => {
        setPurchaseDetails({
            quantity: 0,
            price_per_item: 0,
            total_price: 0,
            supplier_id: null,
            purchase_date: new Date().toISOString().slice(0, 10),
        })

        setOpenPurchase(false)
    }

    const handleCloseCategoryModal = () => {
        setOpenCategoryCreateModal(false)
    }

    useEffect(() => {
        fetchProductsFunc();
    }, []);

    const fetchProductsFunc = () => {
        fetchProducts()
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                    setFilteredProducts(data);

                } else {
                    console.error('Fetched data is not an array:', data);
                    setProducts([]); // Встановлюємо порожній масив у разі невідповідності
                    setFilteredProducts([]);
                }
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
                setError('There was an error fetching the products!');
                setFilteredProducts([]);

                setProducts([]); // Встановлюємо порожній масив у разі помилки
            })
            .finally(() => {
                setIsLoading(false); // Завершуємо завантаження
            });
    };

    const handleDelete = (productId: number) => {
        deleteProduct(productId)
            .then(() => {
                handleCloseDeleteModal()
                fetchProductsFunc()
            }) // Після видалення оновлюємо список продуктів
            .catch(error => {
                console.error('There was an error deleting the product!', error);
            });
    };

    const handleAdd = () => {
        addProduct(newProduct)
            .then(() => {
                fetchProductsFunc();
                handleCloseAdd(); // Закрити модальне вікно після додавання
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


    const handleSort = (property: keyof IProduct) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortProducts = (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => {
        const stabilizedProducts = products.map((el, index) => [el, index] as [IProduct, number]);
        stabilizedProducts.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];  // This is fine because `index` is a number
        });
        return stabilizedProducts.map((el) => el[0]);
    };

    const getComparator = (order: 'asc' | 'desc', orderBy: keyof IProduct) => {
        return order === 'desc'
            ? (a: IProduct, b: IProduct) => (b[orderBy] != null && a[orderBy] != null ? (b[orderBy] < a[orderBy] ? -1 : 1) : 0)
            : (a: IProduct, b: IProduct) => (a[orderBy] != null && b[orderBy] != null ? (a[orderBy] < b[orderBy] ? -1 : 1) : 0);
    };
    const handleSubmitPurchase = () => {
        const purchaseData: IPurchaseData = {
            quantity: purchaseDetails.quantity,
            price_per_item: purchaseDetails.price_per_item,
            total_price: purchaseDetails.total_price,
            supplier_id: purchaseDetails.supplier_id,
            purchase_date: purchaseDetails.purchase_date,
        };

        if (!editProduct) return null

        addPurchase(editProduct.id, purchaseData).then(() => {

            handleClosePurchase(); // Закрити модальне вікно
            fetchProductsFunc(); // Оновити список товарів
        })
            .catch(error => {
                console.error('There was an error processing the purchase!', error);
            });
    };

    const handleSale = () => {
        if (saleData) {
            addSale(saleData.productId, saleData).then(() => {
                handleCloseSale();
                fetchProductsFunc();
                // Тут можна також оновити список продуктів або історію, якщо потрібно
            })
                .catch(error => {
                    console.error('There was an error saving the sale!', error);
                });
        }

    };

    const fetchSuppliersFunc = () => {
        fetchGetAllSuppliers()
            .then(data => {
                if (Array.isArray(data)) {
                    setSuppliers(data);  // Припустимо, що ви маєте state для постачальників
                } else {
                    console.error('Fetched data is not an array:', data);
                    setSuppliers([]);  // Очищення при помилці
                }
            })
            .catch(error => {
                console.error('Error fetching suppliers', error);
            });
    };

    useEffect(() => {
        // Отримання списку всіх

        fetchGetAllCategories().then(data => {

            if (Array.isArray(data)) {
                setCategories(data as ICategory[]);
            } else {
                console.error('Fetched data is not an array:', data);
                setCategories([])
            }

        })
            .catch(error => {
                console.error('Error fetching categories', error);
            });

        fetchSuppliersFunc();
    }, []);

    const createNewCategory = (categoryName: string) => {
        addNewCategory(categoryName).then(() => {
            fetchGetAllCategories().then(data => {

                if (Array.isArray(data)) {
                    setCategories(data as ICategory[]);
                } else {
                    console.error('Fetched data is not an array:', data);
                    setCategories([])
                }

            })

            handleCloseCategoryModal(); // Закрити модальне вікно після додавання
        })
            .catch(error => {
                console.error('There was an error adding the product!', error);
            });
    };


    const handleCategoryChange = (categoryId: number) => {

        setSelectedCategories((prevState: number[]) => {
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

    const handleOpenCategoryCreateModal = () => {
        setOpenCategoryCreateModal(true)
    }

    // Функція для фільтрації по категоріях
    const handleCategoryFilterChange = (categoryID: number) => {
        const updatedCategories = selectedFilterCategories.includes(categoryID)
            ? selectedFilterCategories.filter(id => id !== categoryID)
            : [...selectedFilterCategories, categoryID];

        setSelectedFilterCategories(updatedCategories);
        applyFilters(updatedCategories, selectedFilterSuppliers);
    };

    // Функція для фільтрації по постачальниках
    const handleSupplierFilterChange = (supplierID: number) => {
        console.log("supplierID", supplierID);
        const updatedSuppliers = selectedFilterSuppliers.includes(supplierID)
            ? selectedFilterSuppliers.filter(id => id !== supplierID)
            : [...selectedFilterSuppliers, supplierID];

        setSelectedFilterSuppliers(updatedSuppliers);
        applyFilters(selectedFilterCategories, updatedSuppliers);
    };

    // Функція застосування обох фільтрів
    const applyFilters = (updatedCategories: number[], updatedSuppliers: number[]) => {
        let filtered = products;

        // Фільтрація по категоріях
        if (updatedCategories.length > 0) {
            filtered = filtered.filter(product =>
                product.category_ids.some(categoryId => updatedCategories.includes(categoryId))
            );
        }

        // Фільтрація по постачальниках
        if (updatedSuppliers.length > 0) {
            filtered = filtered.filter(product => {
                    if (product.supplier === null) return false
                    return updatedSuppliers.includes(product.supplier.id)
                }
            );
        }

        setFilteredProducts(filtered);
    };

    const handleDeleteModalOpen = (productId: number) => {
        setSelectedDeleteModalProductId(productId)
        setOpenDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setSelectedDeleteModalProductId(null);
    };

    const handleOpenHistoryModal = (product_id: number) => {
        setProductId(product_id); // Встановлюємо productId
        setOpenHistory(true); // Відкриваємо модальне вікно
    }

    const handleCloseHistoryModal = () => {
        setOpenHistory(false);
        setProductId(null); // Встановлюємо productId
    }

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
                    <Button color="primary" onClick={handleOpenCategoryCreateModal} variant={"outlined"}>
                        Add New Category
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleOpenModal}>
                        Add Supplier
                    </Button>

                    <h2>Фільтри</h2>
                    <div style={{display: 'flex', gap: '20px'}}>
                        <div>
                            <h3>Категорії</h3>
                            <CategoryFilter
                                selectedFilterCategories={selectedFilterCategories}
                                handleCategoryFilterChange={handleCategoryFilterChange}
                                categories={categories}
                            />
                        </div>
                        <div>
                            <h3>Постачальники</h3>
                            <SupplierFilter
                                selectedFilterSuppliers={selectedFilterSuppliers}
                                handleSupplierFilterChange={handleSupplierFilterChange}
                                suppliers={suppliers}
                            />
                        </div>
                    </div>

                    <ProductTable
                        filteredProducts={filteredProducts}
                        order={order}
                        orderBy={orderBy}
                        handleSort={handleSort}
                        sortProducts={sortProducts}
                        getComparator={getComparator}
                        handleOpenEdit={handleOpenEdit}
                        handleDelete={handleDeleteModalOpen}
                        handlePurchase={(product) => {
                            console.log('Purchase product:', product)
                            handlePurchase(product)
                        }}
                        handleOpenSale={(product) => {
                            console.log('Open sale for product:', product)
                            handleOpenSale(product)
                        }}
                        handleOpenHistoryModal={handleOpenHistoryModal}
                    /> {/* Кнопка для відкриття модального вікна для додавання */}


                </React.Fragment>
            )}


            {/* Модальне вікно для додавання нового товару */}

            {
                openAdd && <AddProductModal
                    suppliers={suppliers}
                    setNewProduct={setNewProduct}
                    newProduct={newProduct}
                    open={openAdd}
                    categories={categories}
                    handleAdd={handleAdd}
                    handleCategoryChange={handleCategoryChange}
                    handleCloseAdd={handleCloseAdd}
                    selectedCategories={selectedCategories}/>
            }

            {(openEdit && editProduct) &&
            <EditProductModal suppliers={suppliers}
                              selectedCategories={selectedCategories} categories={categories}
                              handleCategoryChange={handleCategoryChange} open={openEdit}
                              handleCloseEdit={handleCloseEdit}
                              editProduct={editProduct}
                              setEditProduct={setEditProduct} handleEditSave={handleEditSave}/>}


            {(openHistory && productId) && (
                <ProductHistoryModal
                    openHistory={openHistory}
                    onClose={handleCloseHistoryModal}
                    productId={productId} // Передаємо productId
                />
            )}

            {(openPurchase && purchaseDetails) && <PurchaseProductModal openPurchase={openPurchase}
                                                                        suppliers={suppliers}
                                                                        handleClosePurchase={handleClosePurchase}
                                                                        purchaseDetails={purchaseDetails}
                                                                        setPurchaseDetails={setPurchaseDetails}
                                                                        handleSubmitPurchase={handleSubmitPurchase}/>}


            {
                (openSale && saleData) &&
                <SaleProductModal
                    openSale={openSale}
                    handleCloseSale={handleCloseSale}
                    saleData={saleData}
                    setSaleData={setSaleData}
                    handleSale={handleSale}
                />
            }

            {
                openCategoryCreateModal &&
                <CreateNewCategoryModal
                    createNewCategory={createNewCategory}
                    openCategoryCreateModal={openCategoryCreateModal}
                    handleCloseCategoryModal={handleCloseCategoryModal}
                />
            }

            <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this product?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDelete(selectedDeleteModalProductId!)} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <AddSupplierModal
                fetchSuppliersFunc={fetchSuppliersFunc}
                open={isModalAddSupplierOpen}
                handleClose={handleCloseModal}
            />


        </React.Fragment>
    );
}

export default App;
