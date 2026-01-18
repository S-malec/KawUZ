import React, { useEffect, useState } from "react";
import { getProductImage } from "./helpers";
import "./css/ProductsList.css"; 
import { useNavigate } from "react-router-dom";

const BASE = "http://localhost:8080/api";

const CoffeeAttribute = ({ value, label }) => (
    <div className="stat-row">
        <span className="stat-label">{label}:</span>
        <div className="dots">
            {[1, 2, 3].map(dot => (
                <span key={dot} className={`dot ${dot <= value ? "filled" : ""}`}></span>
            ))}
        </div>
    </div>
);

export default function Top10Products({ onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${BASE}/product/top10`, { credentials: "include" })
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Ładowanie Top 10…</div>;

    return (
        <div className="products-container">
            <ul className="products-ul">
                {products.map(p => (
                    <li key={p.id} className="productElement">
                        <div className="img-container" onClick={() => navigate(`/product/${p.id}`)}>
                            <img src={getProductImage(p.name)} alt={p.name} />
                        </div>

                        <div className="product-info">
                            <h3 className="name">{p.name}</h3>
                            <p className="description">{p.description}</p>
                            <div className="coffee-stats">
                                <CoffeeAttribute label="Palenie" value={p.roastLevel} />
                                <CoffeeAttribute label="Kwasowość" value={p.acidity} />
                                <CoffeeAttribute label="Kofeina" value={p.caffeineLevel} />
                                <CoffeeAttribute label="Słodycz" value={p.sweetness} />
                            </div>
                        </div>

                        <div className="actions-section">
                            <span className="weight-info">Opakowanie: <strong>{p.weight}</strong></span>
                            <span className="price">{p.price} zł</span>
                            <button
                                onClick={() => onAddToCart(p)}
                                className="btnCart"
                                disabled={Number(p.stockQuantity) <= 0}
                            >
                                Dodaj do koszyka
                            </button>
                            <p style={{ color: "#aaa", marginTop: 5 }}>Kupiono {p.sales} razy</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
