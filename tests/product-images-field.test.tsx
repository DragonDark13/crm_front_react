import React from "react";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import ProductImagesField from "../src/components/ProductImage/ProductImagesField";

const mocks = vi.hoisted(() => ({
    fetchProductsFunc: vi.fn(),
    uploadProductImages: vi.fn(),
    deleteProductImage: vi.fn()
}));

vi.mock("../src/components/Provider/ProductContext", () => ({
    useProducts: () => ({fetchProductsFunc: mocks.fetchProductsFunc})
}));

vi.mock("../src/api/_product", () => ({
    uploadProductImages: mocks.uploadProductImages,
    deleteProductImage: mocks.deleteProductImage
}));

vi.mock("../src/components/ProductImage/ProductImage", () => ({
    default: ({alt}: {alt: string}) => <div>{alt}</div>
}));

describe("ProductImagesField", () => {
    beforeEach(() => {
        mocks.fetchProductsFunc.mockResolvedValue(true);
        mocks.uploadProductImages.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it("keeps successfully uploaded images visible when a later batch fails", async () => {
        const uploadedImages = Array.from({length: 5}, (_, index) => ({
            id: index + 1,
            file_name: `image-${index + 1}.png`,
            url: `/product/1/images/${index + 1}`
        }));
        const onImagesChange = vi.fn();

        mocks.uploadProductImages
            .mockResolvedValueOnce({images: uploadedImages})
            .mockRejectedValueOnce(new Error("Second batch failed"));

        render(
            <ProductImagesField
                productId={1}
                images={[]}
                onImagesChange={onImagesChange}
            />
        );

        const files = Array.from({length: 6}, (_, index) => (
            new File([new Uint8Array([1, 2, 3])], `image-${index + 1}.png`, {type: "image/png"})
        ));

        fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
            target: {files}
        });

        await waitFor(() => {
            expect(screen.getByText(/Завантажено лише частину зображень/)).toBeTruthy();
        });

        expect(mocks.uploadProductImages).toHaveBeenCalledTimes(2);
        expect(mocks.uploadProductImages.mock.calls[0][1]).toHaveLength(5);
        expect(mocks.uploadProductImages.mock.calls[1][1]).toHaveLength(1);
        expect(onImagesChange).toHaveBeenLastCalledWith(uploadedImages);
        expect(mocks.fetchProductsFunc).toHaveBeenCalledTimes(1);
    });
});
