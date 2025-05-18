import axios from "axios";
import {axiosInstance} from "./api";

axiosInstance.interceptors.request.use(request => {
    if (import.meta.env.DEV) {
        // Мокаємо лише певний endpoint
        if (request.url === '/products') {
            request.adapter = async () => {
                return {
                    data: [
                        {
                            "available_quantity": 7,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 10,
                            "name": "Крем від укусів комах 999",
                            "purchase_price_per_item": 80,
                            "purchase_total_price": 560,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 10,
                                "name": "https://epicentrk.ua/ua/shop/sredstva-ot-komarov/"
                            },
                            "supplier_id": 10,
                            "total_quantity": 7
                        },
                        {
                            "available_quantity": 5,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 2,
                            "name": "Термокружка туристична",
                            "purchase_price_per_item": 125,
                            "purchase_total_price": 625,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 2,
                                "name": "https://epicentrk.ua/ua/shop/termokruzhka.html"
                            },
                            "supplier_id": 2,
                            "total_quantity": 5
                        },
                        {
                            "available_quantity": 3,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 5,
                            "name": "Компактна газова плита",
                            "purchase_price_per_item": 900,
                            "purchase_total_price": 2700,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 5,
                                "name": "https://rozetka.com.ua/ua/gas_burners/c80163/"
                            },
                            "supplier_id": 5,
                            "total_quantity": 3
                        },
                        {
                            "available_quantity": 3,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 8,
                            "name": "Туристичний рюкзак 60л",
                            "purchase_price_per_item": 1800,
                            "purchase_total_price": 5400,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 8,
                                "name": "https://decathlon.ua/ruckzaki"
                            },
                            "supplier_id": 8,
                            "total_quantity": 3
                        },
                        {
                            "available_quantity": 6,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 6,
                            "name": "Ліхтар налобний",
                            "purchase_price_per_item": 250,
                            "purchase_total_price": 1500,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 6,
                                "name": "https://epicentrk.ua/ua/shop/nalochnye-fonari/"
                            },
                            "supplier_id": 6,
                            "total_quantity": 6
                        },
                        {
                            "available_quantity": 8,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 4,
                            "name": "Каремат пінка",
                            "purchase_price_per_item": 120,
                            "purchase_total_price": 960,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 4,
                                "name": "https://decathlon.ua/karimaty"
                            },
                            "supplier_id": 4,
                            "total_quantity": 8
                        },
                        {
                            "available_quantity": 10,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 1,
                            "name": "Пляшка для води 1л",
                            "purchase_price_per_item": 70,
                            "purchase_total_price": 700,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 1,
                                "name": "https://rozetka.com.ua/ua/tourist_water_bottles/c80161/"
                            },
                            "supplier_id": 1,
                            "total_quantity": 10
                        },
                        {
                            "available_quantity": 2,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 3,
                            "name": "Намет 2-місний",
                            "purchase_price_per_item": 1600,
                            "purchase_total_price": 3200,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 3,
                                "name": "https://allo.ua/ua/palatki/"
                            },
                            "supplier_id": 3,
                            "total_quantity": 2
                        },
                        {
                            "available_quantity": 5,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 9,
                            "name": "Аптечка туристична",
                            "purchase_price_per_item": 200,
                            "purchase_total_price": 1000,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 9,
                                "name": "https://rozetka.com.ua/ua/tourist_first_aid_kits/c80159/"
                            },
                            "supplier_id": 9,
                            "total_quantity": 5
                        },
                        {
                            "available_quantity": 4,
                            "category_ids": [],
                            "created_date": "2024-09-15T00:00:00",
                            "id": 7,
                            "name": "Портативний душ",
                            "purchase_price_per_item": 450,
                            "purchase_total_price": 1800,
                            "selling_price_per_item": 0,
                            "selling_total_price": 0,
                            "sold_quantity": 0,
                            "supplier": {
                                "contact_info": null,
                                "id": 7,
                                "name": "https://allo.ua/ua/portativnye-dushi/"
                            },
                            "supplier_id": 7,
                            "total_quantity": 4
                        }
                    ],
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
                    data: [
                        {
                            "id": 1,
                            "name": "Туристичні сувеніри"
                        },
                        {
                            "id": 2,
                            "name": "Кемпінгове спорядження"
                        },
                        {
                            "id": 3,
                            "name": "Трекинг і похідне спорядження"
                        },
                        {
                            "id": 4,
                            "name": "Спорядження для виживання"
                        },
                        {
                            "id": 6,
                            "name": "Брелоки з туристичною тематикою"
                        },
                        {
                            "id": 7,
                            "name": "Мапи"
                        },
                        {
                            "id": 8,
                            "name": "Компаси та кулони з символікою"
                        },
                        {
                            "id": 9,
                            "name": "Похідна канцелярія"
                        },
                        {
                            "id": 10,
                            "name": "Одяг для туризму"
                        },
                        {
                            "id": 11,
                            "name": "Ліхтарі та світильники"
                        },
                        {
                            "id": 12,
                            "name": "Туристичні свічки"
                        },
                        {
                            "id": 13,
                            "name": "Дорожні напої та термогорнятка"
                        }
                    ],
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
                    data: [
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 1,
                            "name": "https://rozetka.com.ua/ua/tourist_water_bottles/c80161/",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 2,
                            "name": "https://epicentrk.ua/ua/shop/termokruzhka.html",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 3,
                            "name": "https://allo.ua/ua/palatki/",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 4,
                            "name": "https://decathlon.ua/karimaty",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 5,
                            "name": "https://rozetka.com.ua/ua/gas_burners/c80163/",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 6,
                            "name": "https://epicentrk.ua/ua/shop/nalochnye-fonari/",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 7,
                            "name": "https://allo.ua/ua/portativnye-dushi/",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 8,
                            "name": "https://decathlon.ua/ruckzaki",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 9,
                            "name": "https://rozetka.com.ua/ua/tourist_first_aid_kits/c80159/",
                            "phone_number": null
                        },
                        {
                            "address": null,
                            "contact_info": null,
                            "email": null,
                            "id": 10,
                            "name": "https://epicentrk.ua/ua/shop/sredstva-ot-komarov/",
                            "phone_number": null
                        }
                    ]
                    ,
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
                        "materials": [
                            {
                                "available_quantity": 10.0,
                                "available_stock_cost": 99.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 1,
                                "name": "\u0422\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u043d\u0456 \u043c\u0456\u0448\u0435\u0447\u043a\u0438 7\u04459 \u0441\u043c",
                                "packaging_material_supplier_id": 1,
                                "purchase_price_per_unit": 9.9,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://prom.ua/ua/p2380296884-podarochnyj-meshochek-meshkoviny.html?adjust_campaign=share&adjust_adgroup=android&adjust_creative=product&utm_campaign=share_button&utm_medium=referral_link&utm_source=b2c_app_android",
                                    "contact_info": "https://prom.ua/ua/p2380296884-podarochnyj-meshochek-meshkoviny.html?adjust_campaign=share&adjust_adgroup=android&adjust_creative=product&utm_campaign=share_button&utm_medium=referral_link&utm_source=b2c_app_android",
                                    "email": null,
                                    "id": 1,
                                    "name": "https://prom.ua/ua/p2380296884",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 99.0,
                                "total_quantity": 10.0
                            },
                            {
                                "available_quantity": 20.0,
                                "available_stock_cost": 180.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 2,
                                "name": "\u041a\u0430\u0440\u0442\u043e\u043d\u043d\u0430 \u043a\u043e\u0440\u043e\u0431\u043a\u0430 15\u044510\u04455 \u0441\u043c",
                                "packaging_material_supplier_id": 2,
                                "purchase_price_per_unit": 9.0,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/kartonka15x10x5",
                                    "contact_info": "https://paket.kh.ua/product/kartonka15x10x5",
                                    "email": null,
                                    "id": 2,
                                    "name": "https://paket.kh.ua/product/ka",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 180.0,
                                "total_quantity": 20.0
                            },
                            {
                                "available_quantity": 15.0,
                                "available_stock_cost": 135.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 3,
                                "name": "\u041f\u043e\u0434\u0430\u0440\u0443\u043d\u043a\u043e\u0432\u0438\u0439 \u043f\u0430\u043a\u0435\u0442 \u0437 \u0432\u0456\u0437\u0435\u0440\u0443\u043d\u043a\u043e\u043c",
                                "packaging_material_supplier_id": 3,
                                "purchase_price_per_unit": 9.0,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/podarunkoviy-paket-decor",
                                    "contact_info": "https://paket.kh.ua/product/podarunkoviy-paket-decor",
                                    "email": null,
                                    "id": 3,
                                    "name": "https://paket.kh.ua/product/po",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 135.0,
                                "total_quantity": 15.0
                            },
                            {
                                "available_quantity": 100.0,
                                "available_stock_cost": 120.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 5,
                                "name": "\u0417\u0456\u043f-\u043f\u0430\u043a\u0435\u0442 7\u044510 \u0441\u043c",
                                "packaging_material_supplier_id": 4,
                                "purchase_price_per_unit": 1.2,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/zip10x15",
                                    "contact_info": "https://paket.kh.ua/product/zip10x15",
                                    "email": null,
                                    "id": 4,
                                    "name": "https://paket.kh.ua/product/zi",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 120.0,
                                "total_quantity": 100.0
                            },
                            {
                                "available_quantity": 51.0,
                                "available_stock_cost": 102.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 4,
                                "name": "\u0417\u0456\u043f-\u043f\u0430\u043a\u0435\u0442 10\u044515 \u0441\u043c",
                                "packaging_material_supplier_id": 4,
                                "purchase_price_per_unit": 2.0,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/zip10x15",
                                    "contact_info": "https://paket.kh.ua/product/zip10x15",
                                    "email": null,
                                    "id": 4,
                                    "name": "https://paket.kh.ua/product/zi",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 102.0,
                                "total_quantity": 51.0
                            }
                        ]
                    }
                    ,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: request,
                };
            };
        }


        if (request.url === '/get_all_packaging_materialsrrrr') {
            request.adapter = async () => {
                return {
                    data: [{
                        "materials": [
                            {
                                "available_quantity": 10.0,
                                "available_stock_cost": 99.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 1,
                                "name": "\u0422\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u043d\u0456 \u043c\u0456\u0448\u0435\u0447\u043a\u0438 7\u04459 \u0441\u043c",
                                "packaging_material_supplier_id": 1,
                                "purchase_price_per_unit": 9.9,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://prom.ua/ua/p2380296884-podarochnyj-meshochek-meshkoviny.html?adjust_campaign=share&adjust_adgroup=android&adjust_creative=product&utm_campaign=share_button&utm_medium=referral_link&utm_source=b2c_app_android",
                                    "contact_info": "https://prom.ua/ua/p2380296884-podarochnyj-meshochek-meshkoviny.html?adjust_campaign=share&adjust_adgroup=android&adjust_creative=product&utm_campaign=share_button&utm_medium=referral_link&utm_source=b2c_app_android",
                                    "email": null,
                                    "id": 1,
                                    "name": "https://prom.ua/ua/p2380296884",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 99.0,
                                "total_quantity": 10.0
                            },
                            {
                                "available_quantity": 20.0,
                                "available_stock_cost": 180.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 2,
                                "name": "\u041a\u0430\u0440\u0442\u043e\u043d\u043d\u0430 \u043a\u043e\u0440\u043e\u0431\u043a\u0430 15\u044510\u04455 \u0441\u043c",
                                "packaging_material_supplier_id": 2,
                                "purchase_price_per_unit": 9.0,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/kartonka15x10x5",
                                    "contact_info": "https://paket.kh.ua/product/kartonka15x10x5",
                                    "email": null,
                                    "id": 2,
                                    "name": "https://paket.kh.ua/product/ka",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 180.0,
                                "total_quantity": 20.0
                            },
                            {
                                "available_quantity": 15.0,
                                "available_stock_cost": 135.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 3,
                                "name": "\u041f\u043e\u0434\u0430\u0440\u0443\u043d\u043a\u043e\u0432\u0438\u0439 \u043f\u0430\u043a\u0435\u0442 \u0437 \u0432\u0456\u0437\u0435\u0440\u0443\u043d\u043a\u043e\u043c",
                                "packaging_material_supplier_id": 3,
                                "purchase_price_per_unit": 9.0,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/podarunkoviy-paket-decor",
                                    "contact_info": "https://paket.kh.ua/product/podarunkoviy-paket-decor",
                                    "email": null,
                                    "id": 3,
                                    "name": "https://paket.kh.ua/product/po",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 135.0,
                                "total_quantity": 15.0
                            },
                            {
                                "available_quantity": 100.0,
                                "available_stock_cost": 120.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 5,
                                "name": "\u0417\u0456\u043f-\u043f\u0430\u043a\u0435\u0442 7\u044510 \u0441\u043c",
                                "packaging_material_supplier_id": 4,
                                "purchase_price_per_unit": 1.2,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/zip10x15",
                                    "contact_info": "https://paket.kh.ua/product/zip10x15",
                                    "email": null,
                                    "id": 4,
                                    "name": "https://paket.kh.ua/product/zi",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 120.0,
                                "total_quantity": 100.0
                            },
                            {
                                "available_quantity": 51.0,
                                "available_stock_cost": 102.0,
                                "created_date": "2025-01-15T00:00:00",
                                "id": 4,
                                "name": "\u0417\u0456\u043f-\u043f\u0430\u043a\u0435\u0442 10\u044515 \u0441\u043c",
                                "packaging_material_supplier_id": 4,
                                "purchase_price_per_unit": 2.0,
                                "reorder_level": 0.0,
                                "supplier": {
                                    "address": "https://paket.kh.ua/product/zip10x15",
                                    "contact_info": "https://paket.kh.ua/product/zip10x15",
                                    "email": null,
                                    "id": 4,
                                    "name": "https://paket.kh.ua/product/zi",
                                    "phone_number": null
                                },
                                "total_purchase_cost": 102.0,
                                "total_quantity": 51.0
                            }
                        ]
                    }
                    ]
                    ,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: request,
                };
            };
        }
    }
    if (request.url === '/get_all_purchase_history') {
        {
            request.adapter = async () => {
                return {
                    data: [
                        {
                            "categories": [],
                            "date": "2025-05-18",
                            "id": 7,
                            "name": "hjghjhgj",
                            "price_per_item": null,
                            "quantity": null,
                            "supplier_id": null,
                            "supplier_name": "ytututu",
                            "total_price": 200.0,
                            "type": "Other Investment"
                        },
                        {
                            "categories": [],
                            "date": "2025-05-16",
                            "id": 6,
                            "name": "\u0417\u0456\u043f-\u043f\u0430\u043a\u0435\u0442 10\u044515 \u0441\u043c",
                            "price_per_item": "2.00",
                            "quantity": 1.0,
                            "supplier_name": "https://paket.kh.ua/product/zi",
                            "total_price": "2.00",
                            "type": "Packaging"
                        },
                        {
                            "categories": [],
                            "date": "2025-01-15",
                            "id": 5,
                            "name": "\u0417\u0456\u043f-\u043f\u0430\u043a\u0435\u0442 7\u044510 \u0441\u043c",
                            "price_per_item": "1.20",
                            "quantity": 100.0,
                            "supplier_name": "https://paket.kh.ua/product/zi",
                            "total_price": "120.00",
                            "type": "Packaging"
                        },
                        {
                            "categories": [],
                            "date": "2025-01-15",
                            "id": 1,
                            "name": "\u0422\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u043d\u0456 \u043c\u0456\u0448\u0435\u0447\u043a\u0438 7\u04459 \u0441\u043c",
                            "price_per_item": "9.90",
                            "quantity": 10.0,
                            "supplier_name": "https://prom.ua/ua/p2380296884",
                            "total_price": "99.00",
                            "type": "Packaging"
                        },
                        {
                            "categories": [],
                            "date": "2025-01-15",
                            "id": 3,
                            "name": "\u041f\u043e\u0434\u0430\u0440\u0443\u043d\u043a\u043e\u0432\u0438\u0439 \u043f\u0430\u043a\u0435\u0442 \u0437 \u0432\u0456\u0437\u0435\u0440\u0443\u043d\u043a\u043e\u043c",
                            "price_per_item": "9.00",
                            "quantity": 15.0,
                            "supplier_name": "https://paket.kh.ua/product/po",
                            "total_price": "135.00",
                            "type": "Packaging"
                        },
                        {
                            "categories": [],
                            "date": "2025-01-15",
                            "id": 2,
                            "name": "\u041a\u0430\u0440\u0442\u043e\u043d\u043d\u0430 \u043a\u043e\u0440\u043e\u0431\u043a\u0430 15\u044510\u04455 \u0441\u043c",
                            "price_per_item": "9.00",
                            "quantity": 20.0,
                            "supplier_name": "https://paket.kh.ua/product/ka",
                            "total_price": "180.00",
                            "type": "Packaging"
                        },
                        {
                            "categories": [],
                            "date": "2025-01-15",
                            "id": 4,
                            "name": "\u0417\u0456\u043f-\u043f\u0430\u043a\u0435\u0442 10\u044515 \u0441\u043c",
                            "price_per_item": "2.00",
                            "quantity": 50.0,
                            "supplier_name": "https://paket.kh.ua/product/zi",
                            "total_price": "100.00",
                            "type": "Packaging"
                        },
                        {
                            "categories": [],
                            "date": "2025-01-15",
                            "id": 2,
                            "name": "\u041a\u043e\u043c\u0456\u0441\u0456\u044f \u0431\u0430\u043d\u043a\u0443",
                            "price_per_item": null,
                            "quantity": null,
                            "supplier_id": null,
                            "supplier_name": "N/A",
                            "total_price": 6.03,
                            "type": "Other Investment"
                        },
                        {
                            "categories": [],
                            "date": "2025-01-15",
                            "id": 1,
                            "name": "\u041f\u043e\u0448\u0442\u043e\u0432\u0430 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430",
                            "price_per_item": null,
                            "quantity": null,
                            "supplier_id": null,
                            "supplier_name": "N/A",
                            "total_price": 35.0,
                            "type": "Other Investment"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 1,
                            "name": "\u041f\u043b\u044f\u0448\u043a\u0430 \u0434\u043b\u044f \u0432\u043e\u0434\u0438 1\u043b",
                            "price_per_item": "70.00",
                            "quantity": 10.0,
                            "supplier_id": 1,
                            "supplier_name": "https://rozetka.com.ua/ua/tourist_water_bottles/c80161/",
                            "total_price": "700.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 2,
                            "name": "\u0422\u0435\u0440\u043c\u043e\u043a\u0440\u0443\u0436\u043a\u0430 \u0442\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u043d\u0430",
                            "price_per_item": "125.00",
                            "quantity": 5.0,
                            "supplier_id": 2,
                            "supplier_name": "https://epicentrk.ua/ua/shop/termokruzhka.html",
                            "total_price": "625.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 3,
                            "name": "\u041d\u0430\u043c\u0435\u0442 2-\u043c\u0456\u0441\u043d\u0438\u0439",
                            "price_per_item": "1600.00",
                            "quantity": 2.0,
                            "supplier_id": 3,
                            "supplier_name": "https://allo.ua/ua/palatki/",
                            "total_price": "3200.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 4,
                            "name": "\u041a\u0430\u0440\u0435\u043c\u0430\u0442 \u043f\u0456\u043d\u043a\u0430",
                            "price_per_item": "120.00",
                            "quantity": 8.0,
                            "supplier_id": 4,
                            "supplier_name": "https://decathlon.ua/karimaty",
                            "total_price": "960.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 5,
                            "name": "\u041a\u043e\u043c\u043f\u0430\u043a\u0442\u043d\u0430 \u0433\u0430\u0437\u043e\u0432\u0430 \u043f\u043b\u0438\u0442\u0430",
                            "price_per_item": "900.00",
                            "quantity": 3.0,
                            "supplier_id": 5,
                            "supplier_name": "https://rozetka.com.ua/ua/gas_burners/c80163/",
                            "total_price": "2700.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 6,
                            "name": "\u041b\u0456\u0445\u0442\u0430\u0440 \u043d\u0430\u043b\u043e\u0431\u043d\u0438\u0439",
                            "price_per_item": "250.00",
                            "quantity": 6.0,
                            "supplier_id": 6,
                            "supplier_name": "https://epicentrk.ua/ua/shop/nalochnye-fonari/",
                            "total_price": "1500.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 7,
                            "name": "\u041f\u043e\u0440\u0442\u0430\u0442\u0438\u0432\u043d\u0438\u0439 \u0434\u0443\u0448",
                            "price_per_item": "450.00",
                            "quantity": 4.0,
                            "supplier_id": 7,
                            "supplier_name": "https://allo.ua/ua/portativnye-dushi/",
                            "total_price": "1800.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 8,
                            "name": "\u0422\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u043d\u0438\u0439 \u0440\u044e\u043a\u0437\u0430\u043a 60\u043b",
                            "price_per_item": "1800.00",
                            "quantity": 3.0,
                            "supplier_id": 8,
                            "supplier_name": "https://decathlon.ua/ruckzaki",
                            "total_price": "5400.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 9,
                            "name": "\u0410\u043f\u0442\u0435\u0447\u043a\u0430 \u0442\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u043d\u0430",
                            "price_per_item": "200.00",
                            "quantity": 5.0,
                            "supplier_id": 9,
                            "supplier_name": "https://rozetka.com.ua/ua/tourist_first_aid_kits/c80159/",
                            "total_price": "1000.00",
                            "type": "Product"
                        },
                        {
                            "categories": [],
                            "date": "2024-09-15",
                            "id": 10,
                            "name": "\u041a\u0440\u0435\u043c \u0432\u0456\u0434 \u0443\u043a\u0443\u0441\u0456\u0432 \u043a\u043e\u043c\u0430\u0445",
                            "price_per_item": "80.00",
                            "quantity": 7.0,
                            "supplier_id": 10,
                            "supplier_name": "https://epicentrk.ua/ua/shop/sredstva-ot-komarov/",
                            "total_price": "560.00",
                            "type": "Product"
                        }

                    ]
                    ,
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
                    data: [
                        {
                            "cost": 35,
                            "date": "2025-01-15",
                            "id": 1,
                            "supplier": "N/A",
                            "type_name": "Поштова доставка"
                        },
                        {
                            "cost": 6.03,
                            "date": "2025-01-15",
                            "id": 2,
                            "supplier": "N/A",
                            "type_name": "Комісія банку"
                        },
                        {
                            "cost": 200,
                            "date": "2025-05-18",
                            "id": 7,
                            "supplier": "ytututu",
                            "type_name": "hjghjhgj"
                        }
                    ],
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
                    data: [
                        {
                            "cost": 35,
                            "date": "2025-01-15",
                            "id": 1,
                            "supplier": "N/A",
                            "type_name": "Поштова доставка"
                        },
                        {
                            "cost": 6.03,
                            "date": "2025-01-15",
                            "id": 2,
                            "supplier": "N/A",
                            "type_name": "Комісія банку"
                        },
                        {
                            "cost": 200,
                            "date": "2025-05-18",
                            "id": 7,
                            "supplier": "ytututu",
                            "type_name": "hjghjhgj"
                        }
                    ],
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