import React, { useState } from 'react';
import axios from 'axios';

/** * @constant API_URL
 * @brief Adres bazowy API dla operacji na produktach.
 */
const API_URL = 'http://localhost:8080/api/product';

/**
 * @component ProductForm
 * @brief Komponent formularza służący do dodawania nowych produktów lub edycji istniejących.
 * * Formularz obsługuje przesyłanie danych tekstowych oraz plików graficznych przy użyciu
 * obiektu FormData, co pozwala na integrację z backendem obsługującym 'multipart/form-data'.
 * * @param {Object} props
 * @param {Object} [props.initialProduct={}] Obiekt z danymi produktu w przypadku edycji.
 * @param {Function} [props.onProductSaved] Callback wywoływany po pomyślnym zapisaniu danych.
 */
function ProductForm({ initialProduct = {}, onProductSaved }) {
    /** @brief Stan przechowujący dane tekstowe i liczbowe produktu. */
    const [productData, setProductData] = useState({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        price: initialProduct.price || 0,
        stockQuantity: initialProduct.stockQuantity || 0,
    });

    /** @brief Stan przechowujący wybrany plik binarny (zdjęcie). */
    const [selectedFile, setSelectedFile] = useState(null);

    /** @brief Flaga logiczna określająca, czy formularz działa w trybie edycji (na podstawie obecności ID). */
    const isEditMode = initialProduct.id != null;

    /**
     * @brief Uniwersalny hander dla pól tekstowych, liczbowych i checkboxów.
     * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e Zdarzenie zmiany pola.
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * @brief Obsługuje wybór pliku z dysku użytkownika.
     * @param {React.ChangeEvent<HTMLInputElement>} e Zdarzenie zmiany inputu typu file.
     */
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    /**
     * @brief Przetwarza dane i wysyła żądanie do API.
     * * Pakuje dane do obiektu FormData, aby umożliwić przesyłanie pliku wraz z polami tekstowymi.
     * Wykorzystuje axios.post dla nowych produktów lub axios.put dla aktualizacji.
     * * @param {React.FormEvent} e Zdarzenie wysłania formularza.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // TWORZENIE FORM DATA - niezbędne do przesyłania plików
        const formData = new FormData();

        // Dodajemy plik (jeśli został wybrany)
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        // Dodawanie pozostałych pól produktu
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

            // Resetowanie formularza po sukcesie
            setProductData({ name: '', description: '', price: 0, stockQuantity: 0 });
            setSelectedFile(null);

            if (onProductSaved) onProductSaved();

        } catch (error) {
            console.error('Błąd zapisu:', error);
            alert('Wystąpił błąd podczas zapisywania produktu.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '20px' }}>
            <h2>{isEditMode ? 'Edytuj Produkt' : 'Dodaj Nowy Produkt'}</h2>

            <div>
                <label>Nazwa:</label>
                <input type="text" name="name" value={productData.name} onChange={handleChange} required />
            </div>

            <div>
                <label>Opis:</label>
                <textarea name="description" value={productData.description} onChange={handleChange}></textarea>
            </div>

            <div>
                <label>Cena:</label>
                <input type="number" name="price" value={productData.price} onChange={handleChange} required min="0" step="0.01" />
            </div>

            <div>
                <label>Ilość na magazynie:</label>
                <input
                    type="number"
                    name="stockQuantity"
                    value={productData.stockQuantity}
                    onChange={handleChange}
                    required min="0"
                />
            </div>

            <div style={{ margin: '10px 0' }}>
                <label>Zdjęcie produktu:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <button type="submit">
                {isEditMode ? 'Zapisz Zmiany' : 'Dodaj Produkt'}
            </button>
        </form>
    );
}

export default ProductForm;