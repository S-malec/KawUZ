/**
 * @file helpers.js
 * @brief Zbiór funkcji pomocniczych (utility functions) wykorzystywanych w części frontendowej aplikacji.
 */

/**
 * @function debounce
 * @brief Optymalizuje wywołania funkcji poprzez opóźnienie ich egzekucji.
 * * Funkcja ta zapobiega wielokrotnemu uruchamianiu kosztownych operacji
 * (np. zapytań do API podczas pisania) w krótkim odstępie czasu.
 * * @param {Function} func Funkcja, której wywołanie ma zostać opóźnione.
 * @param {number} delay Czas opóźnienia w milisekundach.
 * @return {Function} Zwraca nową funkcję z zaimplementowanym mechanizmem debounce.
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

/**
 * @function slugify
 * @brief Przekształca tekst na format przyjazny dla adresów URL (tzw. slug).
 * * Usuwa znaki specjalne, zamienia spacje na myślniki i konwertuje litery na małe.
 * Wykorzystywane do generowania czytelnych linków do szczegółów produktów.
 * * @param {string} text Tekst wejściowy (np. nazwa produktu).
 * @return {string} Przetworzony tekst gotowy do użycia w ścieżce URL.
 */
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

/**
 * @function getProductImage
 * @brief Generuje ścieżkę do zdjęcia produktu na podstawie jego nazwy.
 * * Koduje nazwę produktu, aby była bezpieczna w ścieżce pliku i zapewnia
 * adres rezerwowy (placeholder) w przypadku braku zasobu.
 * * @param {string} productName Nazwa produktu, dla której szukane jest zdjęcie.
 * @return {string} Adres URL do pliku graficznego.
 */
export const getProductImage = (productName) => {
    const encodedName = encodeURIComponent(productName);
    const imageUrl = `/images/${encodedName}.png`;
    const mockImageUrl = "https://via.placeholder.com/80x80?text=Kawa";
    return imageUrl || mockImageUrl;
};