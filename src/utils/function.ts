import  {ChangeEvent} from "react";
import {INewProduct} from "./types.ts";

export function roundToDecimalPlaces(num: number, decimalPlaces: number) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}

export const formatDate = (dateString:string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Місяці нумеруються з 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDateToBack = (dateString:string) => {

// Перетворюємо рядок у об'єкт Date
    const createdDate = new Date(dateString);

// Перевіряємо, чи дата дійсна
    if (!isNaN(createdDate.getTime())) {
        // Конвертуємо дату у формат YYYY-MM-DD для відправлення на сервер
        const formattedDate = createdDate.toISOString().slice(0, 10); // Отримуємо формат YYYY-MM-DD
        console.log(formattedDate); // Ви можете використати цю дату для вашого запиту
        return formattedDate; // Використовуйте цю дату для вашого запиту
    } else {
        console.log("Неправильний формат дати.");
        return false
    }
}

export const handleQuantityChangeGlobal = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    max: number,
    setValue: (value: number) => void,
    setError: (msg: string) => void
) => {
    const value = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
    const numericValue = Number(value);

    if (numericValue <= max) {
        setValue(numericValue);
        setError('');
    } else {
        setError('Кількість не може бути більшою за доступну кількість.');
    }
};

export const handleIncrementGlobal = (
    value: number,
    max: number,
    setValue: (value: number) => void,
    setError?: (msg: string) => void
) => {
    if (value < max) {
        setValue(value + 1);
        setError && setError('');
    } else {
        setError && setError('Кількість не може бути більшою за доступну кількість.');
    }
};

export const handleDecrementGlobal = (
    value: number,
    setValue: (value: number) => void,
    setError?: (msg: string) => void
) => {
    if (value > 0) {
        setValue(value - 1);
        setError && setError('');
    }
};


export const createEmptyProduct = (): INewProduct => ({
    article: "",
    available_quantity: 1,
    sold_quantity: 0,
    total_quantity: 0,
    name: "",
    supplier_id: "",
    purchase_total_price: 0,
    purchase_price_per_item: 0,
    category_ids: [],
    created_date: new Date().toISOString().slice(0, 10),
    selling_total_price: 0,
    selling_price_per_item: 0,
    selling_quantity: 0
});
