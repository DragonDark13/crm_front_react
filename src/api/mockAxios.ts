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
            const productId = Number(match[1]);

            request.adapter = async () => {
                return {
                    data: fakeDate.getProductHistory(productId),
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: request,
                };
            };
        }

        const material_history = request.url.match(/^\/materials\/(\d+)\/history$/);
        if (material_history) {
            const materialId = Number(material_history[1]); // ← тут буде '9', '12' і т.д.

            request.adapter = async () => {
                return {
                    data: fakeDate.getMaterialHistory(materialId),
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