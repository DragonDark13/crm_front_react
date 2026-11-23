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
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ProductPurchaseImportPage = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [result, setResult] = useState<IProductPurchaseImportResult | null>(null);

    const {fetchProductsFunc} = useProducts();
    const {fetchCategoriesFunc} = useCategories();
    const {fetchSuppliersFunc} = useSuppliers();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setErrorMessage("");
        setResult(null);

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

    const handleImport = async () => {
        if (!selectedFile || isImporting) return;

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
                                Використовуйте файл zakupivli_vsi.csv з усією історією закупівель.
                                Файл повинен містити заголовки та колонки затвердженого шаблону.
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
                                Для кожного рядка створюються записи історії закупівель та руху складу.
                                Незмінений файл повторно імпортувати не можна.
                            </Alert>

                            {errorMessage && (
                                <Alert severity="error">{errorMessage}</Alert>
                            )}

                            {result && (
                                <Alert severity="success">
                                    Імпорт завершено. Оброблено рядків закупівель:{" "}
                                    <strong>{result.rows_imported}</strong>.
                                    <br/>
                                    Файл: {result.file_name}
                                </Alert>
                            )}

                            {isImporting && <LinearProgress/>}

                            <Box>
                                <Button
                                    variant="contained"
                                    onClick={handleImport}
                                    disabled={!selectedFile || isImporting}
                                >
                                    {isImporting ? "Імпорт триває..." : "Імпортувати закупівлі"}
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};

export default ProductPurchaseImportPage;
