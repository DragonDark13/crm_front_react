// utils/supplierUtils.ts

import {ISupplierType} from "../../../utils/types";
import {fetchGetSupplierPurchaseHistory} from "../../../api/_supplier";
import {fetchGetPackagingSupplierPurchaseHistory} from "../../../api/_packagingMaterials";

export const canDeleteSupplier = async (
    supplierId: number,
    type: ISupplierType
): Promise<{ canDelete: boolean; reason?: string }> => {
    try {
        if (type === 'product') {
            const data = await fetchGetSupplierPurchaseHistory(supplierId);
            if (data.purchase_history.length > 0 || data.products.length > 0) {
                return {
                    canDelete: false,
                    reason: 'Неможливо видалити постачальника: є пов’язані закупівлі або товари.'
                };
            }
        } else if (type === 'packaging') {
            const data = await fetchGetPackagingSupplierPurchaseHistory(supplierId);
            if (data.purchase_history.length > 0 || data.materials.length > 0) {
                return {
                    canDelete: false,
                    reason: 'Неможливо видалити постачальника пакування: є пов’язані закупівлі або матеріали.'
                };
            }
        }

        return {canDelete: true};
    } catch (error) {
        console.error('Помилка при перевірці постачальника:', error);
        return {
            canDelete: false,
            reason: 'Сталася помилка при перевірці. Спробуйте пізніше.'
        };
    }
};
