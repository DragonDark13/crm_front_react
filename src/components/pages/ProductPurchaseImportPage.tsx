import React, {ChangeEvent, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {axiosInstance, getApiErrorMessage} from "../../api/api";
import {useProducts} from "../Provider/ProductContext";
import {useCategories} from "../Provider/CategoryContext";
import {useSuppliers} from "../Provider/SupplierContext";

interface IProductPurchaseImportResult {
    status: "imported";
    file_name: string;
    rows_imported: number;
    duplicate_rows_skipped: number;
}

interface IProductPurchaseImportPreview {
    status: "preview";
    file_name: string;
    rows_total: number;
    rows_to_import: number;
    duplicate_rows: number;
    existing_product_rows: number;
    new_product_rows: number;
    existing_products_count: number;
    existing_product_names: string[];
    new_products_count: number;
    new_product_names: string[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ProductPurchaseImportPage = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [preview, setPreview] = useState<IProductPurchaseImportPreview | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [result, setResult] = useState<IProductPurchaseImportResult | null>(null);

    const {fetchProductsFunc} = useProducts();
    const {fetchCategoriesFunc} = useCategories();
    const {fetchSuppliersFunc} = useSuppliers();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setErrorMessage("");
        setResult(null);
        setPreview(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setSelectedFile(null);
            setErrorMessage("Потрібно вибрати файл із розширенням .csv.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setSelectedFile(null);
            setErrorMessage("Розмір файлу не повинен перевищувати 10 МБ.");
            event.target.value = "";
            return;
        }

        if (file.size === 0) {
            setSelectedFile(null);
            setErrorMessage("Обраний файл порожній.");
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const handlePreview = async () => {
        if (!selectedFile || isPreviewing || isImporting) return;

        setIsPreviewing(true);
        setErrorMessage("");
        setPreview(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axiosInstance.post<IProductPurchaseImportPreview>(
                "/imports/products/purchases/preview",
                formData,
                {headers: {"Content-Type": "multipart/form-data"}}
            );
            setPreview(response.data);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Не вдалося перевірити файл."));
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleImport = async () => {
        if (!selectedFile || !preview || isImporting || isPreviewing) return;

        setIsImporting(true);
        setErrorMessage("");
        setResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axiosInstance.post<IProductPurchaseImportResult>(
                "/imports/products/purchases",
                formData,
                {headers: {"Content-Type": "multipart/form-data"}}
            );

            setResult(response.data);
            setSelectedFile(null);
            setPreview(null);
            await Promise.all([
                fetchProductsFunc(),
                fetchCategoriesFunc(),
                fetchSuppliersFunc(),
            ]);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Не вдалося імпортувати закупівлі."));
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Box maxWidth={900} mx="auto">
            <Stack spacing={3}>
                <Box>
                    <Typography className="crm-page-title" variant="h4" component="h1" gutterBottom>
                        Імпорт закупівель
                    </Typography>
                    <Typography color="text.secondary">
                        Завантаження історії закупівель товарів з одного CSV-файлу.
                    </Typography>
                </Box>

                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">
                                Оберіть файл із закупівлями
                            </Typography>
                            <Typography color="text.secondary">
                                Виберіть CSV-файл з історією закупівель. Назва файлу може бути довільною —
                                важливі формат CSV та правильні заголовки затвердженого шаблону.
                                Для додавання нових товарів достатньо вказати їхні найменування у файлі.
                            </Typography>

                            <Box>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon/>}
                                    disabled={isImporting}
                                >
                                    Вибрати CSV-файл
                                    <input
                                        hidden
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            </Box>

                            {selectedFile && (
                                <Alert severity="info">
                                    Обрано: <strong>{selectedFile.name}</strong>
                                    {" "}({(selectedFile.size / 1024).toFixed(1)} КБ)
                                </Alert>
                            )}

                            <Alert severity="warning">
                                Імпорт додає закупівлі до наявних товарів і збільшує складські залишки.
                                Якщо товару з таким найменуванням ще немає, він буде створений автоматично.
                                Для кожного імпортованого рядка створюються записи історії закупівель та руху складу.
                                Точну копію вже імпортованого файлу повторно завантажити не можна.
                            </Alert>
                            <Alert severity="info">
                                Система звіряє кожен рядок із раніше збереженою історією закупівель.
                                Уже імпортовані рядки будуть пропущені, а нові — додані.
                                Якщо однакові за всіма реквізитами закупівлі справді відбувалися кілька разів,
                                система врахує кількість таких рядків і дозволить імпортувати нові додаткові екземпляри.
                            </Alert>

                            {preview && (
                                <Alert severity="info">
                                    <strong>Результат перевірки файлу</strong>
                                    <br/>
                                    Рядків у файлі: <strong>{preview.rows_total}</strong>
                                    <br/>
                                    Буде імпортовано: <strong>{preview.rows_to_import}</strong>
                                    <br/>
                                    Буде пропущено як уже імпортовані: <strong>{preview.duplicate_rows}</strong>
                                    <br/>
                                    Рядків для наявних товарів: <strong>{preview.existing_product_rows}</strong>
                                    {" "}({preview.existing_products_count} товарів)
                                    {preview.existing_product_names.length > 0 && (
                                        <>
                                            <br/>
                                            До наявних товарів буде додано закупівлі:
                                            <ul>
                                                {preview.existing_product_names.map((name) => (
                                                    <li key={name}>{name}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    <br/>
                                    Рядків для нових товарів: <strong>{preview.new_product_rows}</strong>
                                    {" "}({preview.new_products_count} нових товарів)
                                    {preview.new_product_names.length > 0 && (
                                        <>
                                            <br/>
                                            Нові товари: {preview.new_product_names.join(", ")}
                                        </>
                                    )}
                                </Alert>
                            )}

                            {errorMessage && (
                                <Alert severity="error">{errorMessage}</Alert>
                            )}

                            {result && (
                                <Alert severity="success">
                                    Імпорт завершено. Додано нових рядків закупівель:{" "}
                                    <strong>{result.rows_imported}</strong>.
                                    <br/>
                                    Пропущено повторних рядків: <strong>{result.duplicate_rows_skipped}</strong>.
                                    <br/>
                                    Файл: {result.file_name}
                                </Alert>
                            )}

                            {(isImporting || isPreviewing) && <LinearProgress/>}

                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    onClick={handlePreview}
                                    disabled={!selectedFile || isImporting || isPreviewing}
                                >
                                    {isPreviewing ? "Перевірка..." : "Перевірити файл"}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleImport}
                                    disabled={!selectedFile || !preview || isImporting || isPreviewing}
                                >
                                    {isImporting ? "Імпорт триває..." : "Підтвердити імпорт"}
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};

export default ProductPurchaseImportPage;
