import React, {useState, useEffect} from 'react';
import {fetchGetSupplierProducts, fetchGetSupplierPurchaseHistory} from "../../api/api";

const SupplierDetails = ({supplierId}) => {
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Отримуємо історію закупівель постачальника
        fetchGetSupplierPurchaseHistory(supplierId)
            .then(data => {
                setPurchaseHistory(data.purchase_history);
                setProducts(data.products);
            });

        // Отримуємо список продуктів постачальника
        fetchGetSupplierProducts(supplierId)
            .then(data => setProducts(data.products));
    }, [supplierId]);

    return (
        <div>
            <h2>Історія закупівель постачальника</h2>
            <ul>
                {purchaseHistory.map((purchase, index) => (
                    <li key={index}>
                        {purchase.product} - {purchase.quantity_purchase} шт - {purchase.purchase_date}
                    </li>
                ))}
            </ul>

            <h3>Продукти постачальника</h3>
            <ul>
                {products.map(product => (
                    <li key={product.id}>{product.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default SupplierDetails