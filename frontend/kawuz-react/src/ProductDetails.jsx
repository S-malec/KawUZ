import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductImage } from "./helpers.js";
import "./css/ProductDetails.css";
import { useTranslation } from "react-i18next";

/** @constant BASE
 * @brief Adres URL punktu końcowego API.
 */
const BASE = "http://localhost:8080/api";

/**
 * @component CoffeeAttribute
 * @brief Prezentuje wizualną skalę (kropki) dla konkretnej cechy kawy.
 * @param {Object} props
 * @param {number} props.value Wartość cechy w skali 1-3.
 * @param {string} props.label Nazwa cechy (np. "Kofeina").
 */
const CoffeeAttribute = ({ value, label }) => {
    return (
        <div className="stat-row">
            <span className="stat-label">{label}:</span>
            <div className="dots">
                {[1, 2, 3].map(dot => (
                    <span key={dot} className={`dot ${dot <= value ? "filled" : ""}`}></span>
                ))}
            </div>
        </div>
    );
};

/**
 * @component UpdateProductForm
 * @brief Formularz edycji parametrów produktu dostępny dla administratora.
 * * Wykorzystuje format JSON do wysyłania aktualizacji i dba o zachowanie
 * stałych danych produktu (ID, sales) przy jednoczesnej modyfikacji cech opisowych.
 * @param {Object} props
 * @param {Object} props.product Obiekt produktu do edycji.
 * @param {Function} props.onUpdate Callback wywoływany po pomyślnym zapisie zmian.
 */
function UpdateProductForm({ product, onUpdate }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: product?.name ?? "",
        price: product?.price ?? "",
        description: product?.description ?? "",
        roastLevel: product?.roastLevel ?? 1,
        acidity: product?.acidity ?? 1,
        caffeineLevel: product?.caffeineLevel ?? 1,
        sweetness: product?.sweetness ?? 1,
        weight: product?.weight ?? "500g"
    });
    const [msg, setMsg] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * @brief Wysyła zaktualizowane dane produktu do backendu metodą PUT.
     * @param {Event} e Obiekt zdarzenia formularza.
     */
    const submitAsJson = async (e) => {
        e.preventDefault();
        try {
            const updatedProduct = {
                ...product,
                ...formData,
                id: product.id
            };

            const res = await fetch(`${BASE}/product/${product.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(updatedProduct),
            });

            if (res.ok) {
                setMsg(t("admin.updateSuccess"));
                onUpdate?.();
            } else {
                setMsg(t("admin.updateError"));
            }
        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
        <form onSubmit={submitAsJson} className="update-product-form">
            <h4>{t("admin.editParams")}</h4>
            <div className="form-grid">
                <label>{t("product.name")}: <input name="name" value={formData.name} onChange={handleChange} /></label>
                <label>{t("product.price")}: <input name="price" value={formData.price} onChange={handleChange} /></label>
                <label>{t("product.weight")}:
                    <select name="weight" value={formData.weight} onChange={handleChange}>
                        <option value="500g">500g</option>
                        <option value="1000g">1000g</option>
                    </select>
                </label>
            </div>
            <label>{t("product.description")}: <textarea name="description" value={formData.description} onChange={handleChange} /></label>
            <div className="status-message">{msg}</div>
            <button type="submit" className="btn-save">{t("common.save")}</button>
        </form>
    );
}

/**
 * @component ProductDetails
 * @brief Prezentuje szczegółowe informacje o wybranej kawie.
 * * Zawiera sekcje: galeria, atrybuty smakowe, mapę pochodzenia oraz
 * opcjonalny panel administratora do edycji produktu.
 * @param {Object} props
 * @param {string} props.id Numeryczny identyfikator produktu.
 * @param {Function} props.onBack Powrót do listy.
 * @param {boolean} props.isEditable Czy użytkownik ma uprawnienia do edycji.
 */
function ProductDetails({ id, onBack, refreshList, isEditable = false, onAddToCart }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { t } = useTranslation();

    /**
     * @brief Pobiera dane produktu z serwera na podstawie ID.
     */
    const fetchProduct = () => {
        if (!id) return;
        setLoading(true);
        fetch(`${BASE}/product/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(p => setProduct(p))
            .catch(e => setMessage(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(fetchProduct, [id]);

    if (loading) return <div className="status-message">{t("common.loading")}</div>;
    if (!product) return null;

    return (
        <div className="product-details-container">
            <button onClick={onBack} className="btn-back">← {t("common.backToList")}</button>

            <div className="product-card-main">
                <div className="product-image-section">
                    <img src={getProductImage(product.name)} alt={product.name} />
                </div>

                <div className="product-info-section">
                    <h2 className="details-name">{product.name}</h2>
                    <span className="details-weight-badge">{product.weight}</span>
                    <p className="details-description">{product.description}</p>

                    <div className="details-stats-grid">
                        <CoffeeAttribute label={t("product.roastLevel")} value={product.roastLevel} />
                        <CoffeeAttribute label={t("product.acidity")} value={product.acidity} />
                        <CoffeeAttribute label={t("product.caffeineLevel")} value={product.caffeineLevel} />
                        <CoffeeAttribute label={t("product.sweetness")} value={product.sweetness} />
                    </div>

                    <div className="details-price-row">
                        <span className="details-price">{product.price} zł</span>
                        <div className="details-actions">
                            <button onClick={() => onAddToCart(product)} className="btnCart">
                                {t("cart.add")}
                            </button>
                            <button onClick={() => window.location.href=`${BASE}/product/${product.id}/pdf`} className="btn-pdf">
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {product.map && (
                <div className="details-map-section">
                    <h3>{t("product.origin")}</h3>
                    <iframe
                        src={`https://maps.google.com/maps?q=${product.map}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="300px"
                        className="details-map"
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </div>
            )}

            {isEditable && (
                <div className="admin-controls">
                    <UpdateProductForm product={product} onUpdate={fetchProduct} />
                    <button onClick={() => {/* funkcja delete */}} className="btn-danger-outline">{t("admin.deleteProduct")}</button>
                </div>
            )}
        </div>
    );
}

/**
 * @component ProductDetailsWrapper
 * @brief Opakowanie komponentu szczegółów obsługujące routing.
 * * Odpowiada za sparsowanie ID ze ścieżki URL (np. "1-kawa-brazylia" -> "1").
 */
export default function ProductDetailsWrapper({ user, onAddToCart, refreshList }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const realId = id ? id.split('-')[0] : null;

    return (
        <ProductDetails
            id={realId}
            onBack={() => navigate("/")}
            onAddToCart={onAddToCart}
            refreshList={refreshList}
            isEditable={user?.isAdmin}
        />
    );
}