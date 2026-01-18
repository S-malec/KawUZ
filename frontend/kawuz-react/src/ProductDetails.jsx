import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductImage } from "./helpers.js";
import "./css/ProductDetails.css";

const BASE = "http://localhost:8080/api";

// --- Komponent Kropek (ten sam co na liście) ---
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

// --- Komponent Formularza Edycji (zaktualizowany o nowe pola) ---
function UpdateProductForm({ product, onUpdate }) {
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

    const submitAsJson = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE}/product/${product.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ ...formData, id: product.id }),
            });
            if (res.ok) {
                setMsg("Zaktualizowano pomyślnie!");
                onUpdate?.();
            } else {
                setMsg("Błąd aktualizacji.");
            }
        } catch (err) { setMsg(err.message); }
    };

    return (
        <form onSubmit={submitAsJson} className="update-product-form">
            <h4>Edytuj parametry</h4>
            <div className="form-grid">
                <label>Nazwa: <input name="name" value={formData.name} onChange={handleChange} /></label>
                <label>Cena: <input name="price" value={formData.price} onChange={handleChange} /></label>
                <label>Waga:
                    <select name="weight" value={formData.weight} onChange={handleChange}>
                        <option value="500g">500g</option>
                        <option value="1000g">1000g</option>
                    </select>
                </label>
            </div>
            <label>Opis: <textarea name="description" value={formData.description} onChange={handleChange} /></label>
            <div className="status-message">{msg}</div>
            <button type="submit" className="btn-save">Zapisz zmiany</button>
        </form>
    );
}

// --- Główny Komponent ---
function ProductDetails({ id, onBack, refreshList, isEditable = false, onAddToCart }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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

    if (loading) return <div className="status-message">Ładowanie...</div>;
    if (!product) return null;

    return (
        <div className="product-details-container">
            <button onClick={onBack} className="btn-back">← Powrót do listy</button>

            <div className="product-card-main">
                <div className="product-image-section">
                    <img src={getProductImage(product.name)} alt={product.name} />
                </div>

                <div className="product-info-section">
                    <h2 className="details-name">{product.name}</h2>
                    <span className="details-weight-badge">{product.weight}</span>
                    <p className="details-description">{product.description}</p>

                    <div className="details-stats-grid">
                        <CoffeeAttribute label="Palenie" value={product.roastLevel} />
                        <CoffeeAttribute label="Kwasowość" value={product.acidity} />
                        <CoffeeAttribute label="Kofeina" value={product.caffeineLevel} />
                        <CoffeeAttribute label="Słodycz" value={product.sweetness} />
                    </div>

                    <div className="details-price-row">
                        <span className="details-price">{product.price} zł</span>
                        <div className="details-actions">
                            <button onClick={() => onAddToCart(product)} className="btnCart">
                                Dodaj do koszyka
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
                    <h3>Miejsce pochodzenia</h3>
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
                    <button onClick={() => {/* funkcja delete */}} className="btn-danger-outline">Usuń produkt całkowicie</button>
                </div>
            )}
        </div>
    );
}

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