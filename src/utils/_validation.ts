// utils/validation.ts

/**
 * Перевіряє та конвертує рядок у валідне десяткове число (заміна , на .)
 * Дозволяє до 2 знаків після десяткової крапки.
 * @param input рядок з введеним значенням
 * @returns {number | null} число або null, якщо невалідне
 */
export function parseDecimalInput(input: string): number | null {
    const value = input.replace(',', '.');

    // Дозволяє тільки до 2 знаків після крапки, або просто крапку в кінці
    const regex = /^\d*\.?\d{0,2}$/;

    if (regex.test(value) || value.endsWith('.')) {
        return Number(value);
    }

    return null;
}
