import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from "react-i18next";
const API_URL = 'http://localhost:8080/api/product';

function ProductForm({ initialProduct = {}, onProductSaved }) {
    const { t } = useTranslation();
    const [productData, setProductData] = useState({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        price: initialProduct.price || 0,
        stockQuantity: initialProduct.stockQuantity || 0,
    });

    const [selectedFile, setSelectedFile] = useState(null);

    const isEditMode = initialProduct.id != null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // TWORZENIE FORM DATA
        const formData = new FormData();

        // Dodajemy plik (jeśli został wybrany)
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price);
        formData.append('stockQuantity', productData.stockQuantity);

        try {
            let response;
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (isEditMode) {
                response = await axios.put(`${API_URL}/${initialProduct.id}`, formData, config);
            } else {
                response = await axios.post(API_URL, formData, config);
            }

            console.log('Sukces:', response.data);
            setProductData({ name: '', description: '', price: 0, stockQuantity: 0 });
            setSelectedFile(null); // Reset pliku
            if (onProductSaved) onProductSaved();

        } catch (error) {
            console.error('Błąd zapisu:', error);
            alert(t("admin.saveError"));
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '20px' }}>
            <h2>{isEditMode ? t("admin.editProduct") : t("admin.addProduct")}</h2>

            <div>
                <label>{t("product.name")}:</label>
                <input type="text" name="name" value={productData.name} onChange={handleChange} required />
            </div>

            <div>
                <label>{t("product.description")}:</label>
                <textarea name="description" value={productData.description} onChange={handleChange}></textarea>
            </div>

            <div>
                <label>{t("product.price")}:</label>
                <input type="number" name="price" value={productData.price} onChange={handleChange} required min="0" step="0.01" />
            </div>

            <div>
                <label>{t("product.stock")}:</label>
                <input
                    type="number"
                    name="stockQuantity"
                    value={productData.stockQuantity}
                    onChange={handleChange}
                    required min="0"
                />
            </div>

            <div style={{ margin: '10px 0' }}>
                <label>{t("product.image")}:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <button type="submit">
                {isEditMode ? t("common.save") : t("admin.addProductBtn")}
            </button>
        </form>
    );
}

export default ProductForm;