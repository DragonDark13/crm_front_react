import {MenuProps} from "@mui/material";

export function roundToDecimalPlaces(num: number, decimalPlaces: number) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Місяці нумеруються з 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDateToBack = (dateString) => {

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

