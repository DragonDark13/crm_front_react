import React, {useState, useEffect} from 'react';
import {fetchGetSupplierPurchaseHistory} from "../../api/_supplier";
import {IProduct, IProductSupplierPurchaseHistoryRecord} from "../../utils/types";

interface SupplierDetailsProps {
    supplierId: number;
}

const SupplierDetails: React.FC<SupplierDetailsProps> = ({supplierId}) => {
    const [purchaseHistory, setPurchaseHistory] = useState<IProductSupplierPurchaseHistoryRecord[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);

    useEffect(() => {
        let isActive = true;

        // Отримуємо історію закупівель і список продуктів одним запитом.
        fetchGetSupplierPurchaseHistory(supplierId)
            .then(data => {
                if (!isActive) return;

                setPurchaseHistory(data.purchase_history);
                setProducts(data.products);
            });

        return () => {
            isActive = false;
        };
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