import React, {useEffect, useState} from "react";
import {Box} from "@mui/material";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import {axiosInstance} from "../../api/api";

interface ProductImageProps {
    imageUrl?: string | null;
    alt: string;
    width?: number | string;
    height?: number | string;
}

const ProductImage: React.FC<ProductImageProps> = ({
    imageUrl,
    alt,
    width = "100%",
    height = 160
}) => {
    const [source, setSource] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let isActive = true;
        let objectUrl: string | null = null;

        setSource(null);
        setFailed(false);

        if (!imageUrl) {
            return () => {
                isActive = false;
            };
        }

        axiosInstance.get(imageUrl, {responseType: "blob"})
            .then(response => {
                objectUrl = URL.createObjectURL(response.data);
                if (isActive) {
                    setSource(objectUrl);
                } else {
                    URL.revokeObjectURL(objectUrl);
                }
            })
            .catch(() => {
                if (isActive) setFailed(true);
            });

        return () => {
            isActive = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imageUrl]);

    if (!source || failed) {
        return (
            <Box
                sx={{
                    width,
                    height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                    color: "text.disabled",
                    borderRadius: 1,
                    overflow: "hidden"
                }}
            >
                <ImageNotSupportedOutlinedIcon/>
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={source}
            alt={alt}
            loading="lazy"
            sx={{
                width,
                height,
                objectFit: "contain",
                display: "block",
                borderRadius: 1,
                bgcolor: "background.paper"
            }}
        />
    );
};

export default ProductImage;
