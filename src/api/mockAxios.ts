import axios from "axios";
import {axiosInstance} from "./api";
import fakeDate from "./fakeDate";


if (import.meta.env.VITE_USE_MOCKS === 'true') {

    axiosInstance.interceptors.request.use(request => {
        console.log("Mock enabled:", request.url);

        // Мокаємо лише певний endpoint
        if (request.url === '/products') {
            request.adapter = async () => {
                return {
                    data: fakeDate.productsFake,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: request,
                };
            };
        }

        if (request.url === '/categories') {
            request.adapter = async () => {
                return {
                    data: fakeDate.categoriesFake,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: request,
                };
            };
        }


        if (request.url === '/suppliers/list') {
            request.adapter = async () => {
                return {
                    data: fakeDate.suppliersListFake,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: request,
                };
            };
        }

        if (request.url === '/get_all_packaging_materials') {
            request.adapter = async () => {
                return {
                    data: {
                        "materials": fakeDate.packagingMaterialsFake
                    }
                    ,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: request,
                };
            };
        }

        if (request.url === '/get_all_purchase_history') {
            {
                request.adapter = async () => {
                    return {
                        data: fakeDate.purchaseHistoryFake,
                        status: 200,
                        statusText: "OK",
                        headers: {},
                        config: request,
                    };
                };
            }

        }

        if (request.url === '/gel_all_investments') {
            {
                request.adapter = async () => {
                    return {
                        data: fakeDate.investmentsFake,
                        status: 200,
                        statusText: "OK",
                        headers: {},
                        config: request,
                    };
                };
            }

        }



        const match = request.url.match(/^\/product\/(\d+)\/history$/);

        if (match) {
            const productId = match[1]; // ← тут буде '9', '12' і т.д.

            request.adapter = async () => {
                return {
                    data: {
                        "purchase_history": [
                            {
                                "id": productId,
                                "product_id": productId,
                                "purchase_date": "2024-09-15",
                                "purchase_price_per_item": 200,
                                "purchase_total_price": 1000,
                                "quantity_purchase": 5,
                                "supplier": {
                                    "contact_info": null,
                                    "id": productId,
                                    "name": "https://rozetka.com.ua/ua/tourist_first_aid_kits/c80159/"
                                },
                                "supplier_id": productId
                            }
                        ],
                        "sale_history": [],
                        "stock_history": [
                            {
                                "change_amount": 5,
                                "change_type": "create",
                                "id": productId,
                                "product_id": productId,
                                "timestamp": "2024-09-15 00:00:00"
                            }
                        ]
                    },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: request,
                };
            };
        }

        const material_history = request.url.match(/^\/materials\/(\d+)\/history$/);
        if (material_history) {
            const productId = material_history[1]; // ← тут буде '9', '12' і т.д.

            request.adapter = async () => {
                return {
                    data: {
                        "purchase_history": [
                            {
                                "id": productId,
                                "product_id": productId,
                                "purchase_date": "2024-09-15",
                                "purchase_price_per_item": 200,
                                "purchase_total_price": 1000,
                                "quantity_purchase": 5,
                                "supplier": {
                                    "contact_info": null,
                                    "id": productId,
                                    "name": "https://rozetka.com.ua/ua/tourist_first_aid_kits/c80159/"
                                },
                                "supplier_id": productId
                            }
                        ],
                        "sale_history": [],
                        "stock_history": [
                            {
                                "change_amount": 5,
                                "change_type": "create",
                                "id": productId,
                                "product_id": productId,
                                "timestamp": "2024-09-15 00:00:00"
                            }
                        ]
                    },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: request,
                };
            };
        }

        return request;
    });
}