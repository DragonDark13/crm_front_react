import React, {useEffect, useState} from 'react';
import {useProducts} from "../components/Provider/ProductContext";
import {useCategories} from "../components/Provider/CategoryContext";
import {useSuppliers} from "../components/Provider/SupplierContext";
import {
    IEditProduct,
    INewProduct,
    INewSupplier,
    IProduct,
    IPurchaseData,
    ISaleData,
    ModalNames
} from "../utils/types";
import {createEmptyProduct, formatDate} from "../utils/function";
import {addSupplier} from "../api/_supplier";
import {addProduct, addPurchase, addSale, deleteProduct, updateProduct, runProductInventory} from "../api/_product";
import {addNewCategory} from "../api/_categories";
import {exportToExcel} from "../api/api";
import {useNewProduct} from "./useNewProduct";
import {runCrudAction} from "../utils/runCrudAction";

interface IUseProductsCatalogParams {
    products: IProduct[];
    setModalState: React.Dispatch<React.SetStateAction<Record<ModalNames, boolean>>>;
    order: 'asc' | 'desc';
    setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
    orderBy: keyof IProduct;
    setOrderBy: React.Dispatch<React.SetStateAction<keyof IProduct>>;
    filteredAndSearchedProducts: IProduct[];
    setFilteredAndSearchedProducts: React.Dispatch<React.SetStateAction<IProduct[]>>;
    searchTerm: string;
    showSnackbarMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

export const useProductsCatalog = ({
    products,
    setModalState,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    filteredAndSearchedProducts,
    setFilteredAndSearchedProducts,
    searchTerm,
    showSnackbarMessage
}: IUseProductsCatalogParams) => {
    const {fetchProductsFunc, loadingState} = useProducts();
    // const [lowQuantityProducts, setLowQuantityProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>(products);
    // const [suppliers, setSuppliers] = useState<ISupplierFull[]>([]);
    // const tableRowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
    // const [selectedLowProductId, setSelectedLowProductId] = useState<number | null>(null);
    // let navigate = useNavigate();
    const {fetchCategoriesFunc: fetchCategoriesFromContext} = useCategories()
    const {fetchSuppliersFunc: fetchSuppliersFromContext} = useSuppliers()


    // const {logout} = useAuth();


    // const handleLogout = async () => {
    //     try {
    //         await logoutUser(); // Call the logout API function
    //         logout(); // Clear token from context and localStorage
    //         showSnackbarMessage('Ви розлогінилися', 'success')
    //
    //         // Redirect to home page or login page (e.g., using React Router)
    //     } catch (error) {
    //         console.error('Error logging out:', error);
    //     }
    // };

    const [newProduct, setNewProduct] = useState<INewProduct>(createEmptyProduct);

    const [editProduct, setEditProduct] = useState<IEditProduct | null>(null);
    const [infoProduct, setInfoProduct] = useState<IProduct | null>(null);
    const [inventoryProduct, setInventoryProduct] = useState<IProduct | null>(null);

    // Modal States
    // const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(
    //     Object.fromEntries(modalNames.map(modal => [modal, false])) as Record<ModalNames, boolean>
    // );

    const [productId, setProductId] = useState<number | null>(null);
    const [purchaseDetails, setPurchaseDetails] = useState<IPurchaseData>({
        quantity: 1,
        purchase_price_per_item: 0,
        purchase_total_price: 0,
        supplier_id: '',
        purchase_date: new Date().toISOString().slice(0, 10)
    });
    const [saleData, setSaleData] = useState<ISaleData | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const [selectedDeleteModalProductId, setSelectedDeleteModalProductId] = useState<number | null>(null);


    // const [searchTerm, setSearchTerm] = useState('');
    // const [itemsPerPage, setItemsPerPage] = useState(10); // Додайте цей рядок
    // const [filteredAndSearchedProducts, setFilteredAndSearchedProducts] = useState<IProduct[]>([])

    // Стейт для фільтрів
    // const [filters, setFilters] = useState<IStateFilters>({
    //     categories: [] as number[],
    //     suppliers: [] as number[],
    //     priceRange: [0, 1000] as [number, number],
    // });


    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);


    // const fetchSuppliersFunc = async () => {
    //     try {
    //         const data = await fetchGetAllSuppliers(); // Assuming fetchGetAllSuppliers() returns a Promise
    //         if (Array.isArray(data)) {
    //             setSuppliers(data);
    //         } else {
    //             throw new Error('Fetched data is not an array');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching suppliers', error);
    //     }
    // };

    // const fetchCategoriesFunc = async () => {
    //     try {
    //         const data: ICategory[] = await fetchGetAllCategories(); // Assuming fetchGetAllCategories() returns a Promise
    //         if (Array.isArray(data)) {
    //             setCategories(data);
    //         } else {
    //             throw new Error('Fetched data is not an array');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching categories', error);
    //     }
    // };

    const handleModalOpen = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: true}));
    };


    const resetNewProduct = () => {
        setNewProduct(createEmptyProduct());
    };

    const resetPurchaseDetails = () => {
        setEditProduct(null)
        setPurchaseDetails({
            quantity: 1,
            purchase_price_per_item: 0,
            purchase_total_price: 0,
            supplier_id: '',
            purchase_date: new Date().toISOString().slice(0, 10)
        });
    };

    const resetEditProduct = () => {
        setEditProduct(null);
        setSelectedCategories([]);
    };

    const resetSaleData = () => {
        setEditProduct(null)
        setSaleData(null);
    };

    const resetStatesMap: Partial<Record<ModalNames, () => void>> = {
        openAdd: resetNewProduct,
        openPurchase: resetPurchaseDetails,
        openEdit: resetEditProduct,
        openSale: resetSaleData,
    };

    const handleModalClose = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: false}));
        resetStatesMap[modal]?.(); // Виклик відповідної функції скидання
    };

    const handleDeleteModalOpen = (productId: number) => {
        setSelectedDeleteModalProductId(productId);
        handleModalOpen('openDelete');
    };

    const handleCloseDeleteModal = () => {
        handleModalClose('openDelete');

        setSelectedDeleteModalProductId(null);
    };


    const handleDelete = async (productId: number) => {
        await runCrudAction(
            () => deleteProduct(productId),
            fetchProductsFunc,
            {
                onSuccess: () => {
                    handleCloseDeleteModal();
                    showSnackbarMessage('Product deleted successfully!', 'success');
                },
                onError: (error) => {
                    console.error('There was an error deleting the product!', error);
                    showSnackbarMessage('Failed to delete the product!', 'error');
                },
                onRefreshError: () => showSnackbarMessage('Product was deleted, but the product list could not be refreshed.', 'warning')
            }
        );
    };

    const handleAddProduct = async () => {
        await runCrudAction(
            () => addProduct(newProduct),
            fetchProductsFunc,
            {
                onSuccess: () => {
                    handleModalClose('openAdd');
                    showSnackbarMessage('Product added successfully!', 'success');
                },
                onError: (error) => {
                    console.error('There was an error adding the product!', error);
                    showSnackbarMessage('Failed to add the product!', 'error');
                },
                onRefreshError: () => showSnackbarMessage('Product was added, but the product list could not be refreshed.', 'warning')
            }
        );
    };

    const handleEditSave = async () => {
        if (!editProduct) return;
        await runCrudAction(
            () => updateProduct(editProduct.id, editProduct),
            fetchProductsFunc,
            {
                onSuccess: () => {
                    handleModalClose('openEdit');
                    showSnackbarMessage('Product updated successfully!', 'success');
                },
                onError: (error) => {
                    console.error('There was an error updating the product!', error);
                    showSnackbarMessage('Failed to update the product!', 'error');
                },
                onRefreshError: () => showSnackbarMessage('Product was updated, but the product list could not be refreshed.', 'warning')
            }
        );
    };
    const handlePurchase = (product: IProduct) => {
        setEditProduct(mapProductToEditProduct(product));
        setPurchaseDetails(prevDetails => ({
            ...prevDetails,
            supplier_id: product.supplier ? product.supplier.id : '',
            purchase_price_per_item: product.purchase_price_per_item,
            purchase_total_price: product.purchase_price_per_item
        }));
        handleModalOpen('openPurchase');
    };

    const handleSubmitPurchase = async () => {
        if (!editProduct) return;
        const purchaseData: IPurchaseData = {
            quantity: purchaseDetails.quantity,
            purchase_price_per_item: purchaseDetails.purchase_price_per_item,
            purchase_total_price: purchaseDetails.purchase_total_price,
            supplier_id: purchaseDetails.supplier_id,
            purchase_date: purchaseDetails.purchase_date,
        };

        await runCrudAction(
            () => addPurchase(editProduct.id, purchaseData),
            fetchProductsFunc,
            {
                onSuccess: () => {
                    handleModalClose('openPurchase');
                    showSnackbarMessage('Purchase submitted successfully!', 'success');
                },
                onError: () => showSnackbarMessage('There was an error processing the purchase!', 'error'),
                onRefreshError: () => showSnackbarMessage('Purchase was saved, but the product list could not be refreshed.', 'warning')
            }
        );
    };

    const handleSale = async () => {
        if (saleData) {
            await runCrudAction(
                () => addSale(saleData.productId, saleData),
                fetchProductsFunc,
                {
                    onSuccess: () => {
                        handleModalClose('openSale');
                        showSnackbarMessage('Sale completed successfully!', 'success');
                    },
                    onError: (error) => {
                        console.error('There was an error saving the sale!', error);
                        showSnackbarMessage('Failed to save the sale!', 'error');
                    },
                    onRefreshError: () => showSnackbarMessage('Sale was saved, but the product list could not be refreshed.', 'warning')
                }
            );
        }
    };

    const handleAddSupplier = async (newSupplier: INewSupplier) => {
        await runCrudAction(
            () => addSupplier(newSupplier),
            fetchSuppliersFromContext,
            {
                onSuccess: () => {
                    handleModalClose("openAddSupplierOpen");
                    showSnackbarMessage('Supplier completed successfully!', 'success');
                },
                onError: (error) => {
                    console.error('There was an error saving the supplier!', error);
                    showSnackbarMessage('There was an error saving the supplier!', 'error');
                },
                onRefreshError: () => showSnackbarMessage('Supplier was saved, but the supplier list could not be refreshed.', 'warning')
            }
        );
    };

    const handleOpenEdit = (product: IProduct) => {
        setEditProduct(null);
        setEditProduct(mapProductToEditProduct(product));
        setSelectedCategories(product.category_ids);
        handleModalOpen('openEdit');
    };
    const handleOpenProductInfoModal = (product: IProduct) => {
        setInfoProduct(product);
        handleModalOpen('productInfoModal');
    };


    const mapProductToEditProduct = (product: IProduct): IEditProduct => ({
        id: product.id,
        name: product.name,
        supplier_id: product.supplier ? product.supplier.id : '',
        available_quantity: product.available_quantity,
        sold_quantity: product.sold_quantity,
        total_quantity: product.total_quantity,
        purchase_total_price: product.purchase_total_price,
        purchase_price_per_item: product.purchase_price_per_item,
        category_ids: product.category_ids,
        created_date: formatDate(product.created_date),
        selling_price_per_item: product.selling_price_per_item,
        selling_total_price: product.selling_total_price,
        selling_quantity: product.selling_quantity,
        article: product.article,
        product_description:product.product_description
    });


    const handleSort = (property: keyof IProduct) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // const sortProducts = (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => {
    //     const stabilizedProducts = products.map((el, index) => [el, index] as [IProduct, number]);
    //     stabilizedProducts.sort((a, b) => {
    //         const order = comparator(a[0], b[0]);
    //         if (order !== 0) return order;
    //         return a[1] - b[1];  // This is fine because index is a number
    //     });
    //     return stabilizedProducts.map((el) => el[0]);
    // };

    // const getFieldValue = (product: IProduct, field: keyof IProduct): any => {
    //     if (field === 'supplier') {
    //         return product.supplier?.name || ''; // Повертає ім'я постачальника або порожній рядок
    //     }
    //     return product[field];
    // };

    // const getComparator = (order: 'asc' | 'desc', orderBy: keyof IProduct) => {
    //     return order === 'desc'
    //         ? (a: IProduct, b: IProduct) => (getFieldValue(b, orderBy) < getFieldValue(a, orderBy) ? -1 : 1)
    //         : (a: IProduct, b: IProduct) => (getFieldValue(a, orderBy) < getFieldValue(b, orderBy) ? -1 : 1);
    // };

    const handleOpenSale = (product: IProduct) => {
        setEditProduct(mapProductToEditProduct(product));

        setSaleData({
            packaging_id: '',
            packaging_quantity: 0,
            total_cost_price: 0,
            customer: '',
            quantity: 1,
            selling_price_per_item: product.selling_price_per_item,
            selling_total_price: product.selling_total_price,
            purchase_price_per_item: product.purchase_price_per_item,
            sale_date: new Date().toISOString().split('T')[0],
            productId: product.id,
            total_packaging_cost: 0 // Зберігаємо ID продукту для відправки на сервер
        });
        handleModalOpen("openSale")
    };

    const handleOpenHistoryModal = (product_id: number) => {
        setProductId(product_id); // Встановлюємо productId
        handleModalOpen("openHistory")
    }

    const handleOpenInventory = (product: IProduct) => {
        setInventoryProduct(product);
    };

    const handleSubmitInventory = async (actualQuantity: number, reason: string) => {
        if (!inventoryProduct) return;

        await runCrudAction(
            () => runProductInventory(inventoryProduct.id, {
                actual_quantity: actualQuantity,
                reason
            }),
            fetchProductsFunc,
            {
                onSuccess: () => {
                    setInventoryProduct(null);
                    showSnackbarMessage("Інвентаризацію успішно проведено", "success");
                },
                onError: (error) => {
                    console.error("Помилка інвентаризації товару:", error);
                    showSnackbarMessage("Не вдалося провести інвентаризацію", "error");
                },
                onRefreshError: () => showSnackbarMessage("Інвентаризацію проведено, але список товарів не вдалося оновити.", "warning")
            }
        );
    };

    const handleCategoryChange = (categoryId: number[]) => {

        setSelectedCategories(categoryId)


        setNewProduct((prevProduct) => {

            return {
                ...prevProduct,
                category_ids: categoryId // Оновлення категорій
            };
        });
    };


    // const createNewCategory = (categoryName: string) => {
    //     addNewCategory(categoryName).then(() => {
    //         fetchGetAllCategories().then(data => {
    //
    //             if (Array.isArray(data)) {
    //                 setCategories(data as ICategory[]);
    //             } else {
    //                 console.error('Fetched data is not an array:', data);
    //                 setCategories([])
    //             }
    //
    //         })
    //
    //         handleModalClose("openCategoryCreate"); // Закрити модальне вікно після додавання
    //     })
    //         .catch(error => {
    //             console.error('There was an error adding the product!', error);
    //         });
    // };

    const createNewCategory = async (categoryName: string) => {
        await runCrudAction(
            () => addNewCategory(categoryName),
            fetchCategoriesFromContext,
            {
                onSuccess: () => {
                    handleModalClose("openCategoryCreate");
                    showSnackbarMessage('Category added successfully!', 'success');
                },
                onError: (error) => {
                    console.error('There was an error adding the category!', error);
                    showSnackbarMessage('Failed to add the Category!', 'error');
                },
                onRefreshError: () => showSnackbarMessage('Category was added, but the category list could not be refreshed.', 'warning')
            }
        );
    };


    // Use this effect to set low quantity products when data changes
    // useEffect(() => {
    //     const lowQuantity = products.filter(product => product.available_quantity < 5);
    //     setLowQuantityProducts(lowQuantity);
    //     lowQuantity.length > 0 ? handleModalOpen("snackbarNotifyOpen") : handleModalClose("snackbarNotifyOpen")
    // }, [products]);

    // const resetFilters = () => {
    //     setFilters({
    //         categories: [],
    //         suppliers: [],
    //         priceRange: [0, Math.max(...products.map(product => product.selling_price_per_item)) || 1000]
    //     })
    //     // Скидаємо діапазон цін
    // }

    useEffect(() => {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        const searchedProducts = filteredProducts.filter(product =>
            (product.name ?? '').toLowerCase().includes(normalizedSearchTerm)
        );

        setFilteredAndSearchedProducts(searchedProducts);
    }, [filteredProducts, searchTerm, setFilteredAndSearchedProducts]);


    // const handleListItemClick = (productId: number) => {
    //     console.log("Натиснули на товар з ID:", productId);
    //
    //     // Спочатку скидаємо фільтри
    //     // resetFiltersAndOrderAndSearch();
    //     resetFilters()
    //     setSelectedLowProductId(productId);  // Встановлюємо ID обраного продукту
    //
    //     setSearchTerm(''); // Скидання пошуку
    //     console.log("Фільтри скинуті");
    //
    //     // Знайти рядок таблиці за ID продукту
    //     const sortedProducts = sortProducts(filteredAndSearchedProducts, getComparator(order, orderBy));
    //     const rowIndex = sortedProducts.findIndex(product => product.id === productId);
    //     console.log("Знайдений індекс продукту:", rowIndex);
    //
    //     if (rowIndex !== -1) {
    //         // Обчислити, на якій сторінці знаходиться цей продукт
    //         const targetPage = Math.floor(rowIndex / itemsPerPage);
    //         console.log("Продукт знаходиться на сторінці:", targetPage);
    //
    //         // Змінюємо сторінку
    //         setCurrentPage(targetPage);
    //
    //         // Використати setTimeout для прокрутки, щоб дати час на оновлення сторінки
    //         setTimeout(() => {
    //             const rowElement = tableRowRefs.current[rowIndex];
    //             console.log("Елемент рядка таблиці:", rowElement);
    //
    //             if (rowElement) {
    //                 handleModalClose("openNotificationDrawer")
    //                 console.log("Прокрутка до елемента:", rowElement);
    //                 rowElement.scrollIntoView({behavior: 'smooth', block: 'center'});
    //             } else {
    //                 console.log("Елемент не знайдено для індексу:", rowIndex);
    //             }
    //         }, 100);
    //
    //         setTimeout(() => {
    //             setSelectedLowProductId(null)
    //         }, 3000)
    //     } else {
    //         console.log("Продукт з ID", productId, "не знайдений");
    //     }
    // };

    const handleExportToExcel = () => {
        const productIds = filteredAndSearchedProducts.map(product => product.id);
        exportToExcel(productIds);
    };

    const {
        handleRemoveCategory,
    } = useNewProduct();



    return {
        loadingState,
        filteredProducts,
        setFilteredProducts,
        newProduct,
        setNewProduct,
        editProduct,
        setEditProduct,
        infoProduct,
        inventoryProduct,
        setInventoryProduct,
        productId,
        purchaseDetails,
        setPurchaseDetails,
        saleData,
        setSaleData,
        selectedCategories,
        selectedDeleteModalProductId,
        handleModalOpen,
        handleModalClose,
        handleDeleteModalOpen,
        handleCloseDeleteModal,
        handleDelete,
        handleAddProduct,
        handleEditSave,
        handlePurchase,
        handleSubmitPurchase,
        handleSale,
        handleAddSupplier,
        handleOpenEdit,
        handleOpenProductInfoModal,
        handleSort,
        handleOpenSale,
        handleOpenHistoryModal,
        handleOpenInventory,
        handleSubmitInventory,
        handleCategoryChange,
        createNewCategory,
        handleExportToExcel,
        handleRemoveCategory
    };
};
