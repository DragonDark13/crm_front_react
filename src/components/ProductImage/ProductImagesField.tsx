import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Grid,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {IProductImage} from "../../utils/types";
import {deleteProductImage, uploadProductImages} from "../../api/_product";
import ProductImage from "./ProductImage";
import {useProducts} from "../Provider/ProductContext";

interface ProductImagesFieldProps {
    productId?: number;
    images: IProductImage[];
    onImagesChange?: (images: IProductImage[]) => void;
    selectedFiles?: File[];
    onSelectedFilesChange?: (files: File[]) => void;
    disabled?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_UPLOAD_COUNT = 5;
const MAX_PRODUCT_IMAGES = 10;
const EMPTY_FILES: File[] = [];

const ProductImagesField: React.FC<ProductImagesFieldProps> = ({
    productId,
    images,
    onImagesChange,
    selectedFiles: selectedFilesProp,
    onSelectedFilesChange,
    disabled = false
}) => {
    const selectedFiles = selectedFilesProp ?? EMPTY_FILES;
    const {fetchProductsFunc} = useProducts();
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [previews, setPreviews] = useState<Array<{file: File; url: string}>>([]);

    useEffect(() => {
        const nextPreviews = selectedFiles.map(file => ({file, url: URL.createObjectURL(file)}));
        setPreviews(nextPreviews);
        return () => nextPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    }, [selectedFiles]);

    const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (!files.length) return;

        const invalidFile = files.find(file => ![
            "image/jpeg", "image/png", "image/gif", "image/webp"
        ].includes(file.type));
        if (invalidFile) {
            setError("Підтримуються лише JPEG, PNG, GIF та WEBP.");
            return;
        }

        if (files.some(file => file.size > MAX_IMAGE_SIZE)) {
            setError("Розмір одного зображення не може перевищувати 5 МБ.");
            return;
        }

        setError("");

        if (productId) {
            if (images.length + files.length > MAX_PRODUCT_IMAGES) {
                setError("Для одного товару можна зберегти не більше 10 зображень.");
                return;
            }

            setIsUploading(true);
            const uploadedImages: IProductImage[] = [];
            try {
                for (let index = 0; index < files.length; index += MAX_UPLOAD_COUNT) {
                    const batch = files.slice(index, index + MAX_UPLOAD_COUNT);
                    const response = await uploadProductImages(productId, batch);
                    uploadedImages.push(...response.images);
                    onImagesChange?.([...images, ...uploadedImages]);
                }
                await fetchProductsFunc();
            } catch {
                if (uploadedImages.length) {
                    onImagesChange?.([...images, ...uploadedImages]);
                    await fetchProductsFunc();
                    setError(`Завантажено лише частину зображень (${uploadedImages.length}). Решту можна додати повторно.`);
                } else {
                    setError("Не вдалося завантажити зображення.");
                }
            } finally {
                setIsUploading(false);
            }
            return;
        }

        if (selectedFiles.length + files.length > MAX_PRODUCT_IMAGES) {
            setError("Для нового товару можна вибрати не більше 10 зображень.");
            return;
        }

        onSelectedFilesChange?.([...selectedFiles, ...files]);
    };

    const handleDelete = async (image: IProductImage) => {
        if (!productId) return;
        setIsUploading(true);
        setError("");
        try {
            await deleteProductImage(productId, image.id);
            onImagesChange?.(images.filter(item => item.id !== image.id));
            await fetchProductsFunc();
        } catch {
            setError("Не вдалося видалити зображення.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight={600}>Зображення товару</Typography>
                <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<AddPhotoAlternateOutlinedIcon/>}
                    disabled={disabled || isUploading}
                >
                    Додати фото
                    <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleFilesSelected}
                    />
                </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                JPEG, PNG, GIF або WEBP. До 5 МБ на файл; максимум 10 зображень на товар.
            </Typography>

            {error && <Alert severity="error" sx={{mb: 1}}>{error}</Alert>}

            <Grid container spacing={1}>
                {images.map(image => (
                    <Grid item xs={4} sm={3} md={2} key={image.id}>
                        <Box position="relative">
                            <ProductImage imageUrl={image.url} alt={image.file_name} height={100}/>
                            {productId && (
                                <Tooltip title="Видалити зображення">
                                    <span>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            disabled={disabled || isUploading}
                                            onClick={() => handleDelete(image)}
                                            sx={{
                                                position: "absolute",
                                                top: 2,
                                                right: 2,
                                                bgcolor: "background.paper",
                                                "&:hover": {bgcolor: "background.paper"}
                                            }}
                                        >
                                            <DeleteOutlineIcon fontSize="small"/>
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Box>
                        <Typography variant="caption" display="block" noWrap title={image.file_name}>
                            {image.file_name}
                        </Typography>
                    </Grid>
                ))}

                {previews.map(({file, url}, index) => (
                    <Grid item xs={4} sm={3} md={2} key={`${file.name}-${file.lastModified}-${index}`}>
                        <Box position="relative">
                            <Box
                                component="img"
                                src={url}
                                alt={file.name}
                                sx={{
                                    width: "100%",
                                    height: 100,
                                    objectFit: "contain",
                                    bgcolor: "action.hover",
                                    borderRadius: 1
                                }}
                            />
                            <Tooltip title="Прибрати зображення">
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={disabled}
                                    onClick={() => onSelectedFilesChange?.(
                                        selectedFiles.filter((_, fileIndex) => fileIndex !== index)
                                    )}
                                    sx={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        bgcolor: "background.paper",
                                        "&:hover": {bgcolor: "background.paper"}
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography variant="caption" display="block" noWrap title={file.name}>
                            {file.name}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ProductImagesField;
