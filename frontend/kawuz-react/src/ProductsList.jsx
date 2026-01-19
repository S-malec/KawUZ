import React, { useEffect, useState } from "react";
import { getProductImage } from "./helpers.js";
import { useNavigate } from "react-router-dom";
import "./css/ProductsList.css";

const BASE = "http://localhost:8080/api";

const initialFilters = {
    roastLevel: [],
    caffeineLevel: [],
    sweetness: [],
    acidity: [],
    weight: []
};

function ProductsList({ onSelect, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState(""); // Nowy stan dla sortowania
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        fetch(`${BASE}/products`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleFilterChange = (category, value) => {
        setFilters(prev => ({
            ...prev,
            [category]: value === "" ? [] : [value.includes('g') ? value : parseInt(value)]
        }));
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setSortOrder(""); // Resetowanie sortowania przy resetowaniu filtrów
    };

    // 1. Najpierw filtrujemy
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesRoast = filters.roastLevel.length === 0 || filters.roastLevel.includes(p.roastLevel);
        const matchesCaffeine = filters.caffeineLevel.length === 0 || filters.caffeineLevel.includes(p.caffeineLevel);
        const matchesSweetness = filters.sweetness.length === 0 || filters.sweetness.includes(p.sweetness);
        const matchesAcidity = filters.acidity.length === 0 || filters.acidity.includes(p.acidity);
        const matchesWeight = filters.weight.length === 0 || filters.weight.includes(p.weight);

        return matchesSearch && matchesRoast && matchesCaffeine && matchesSweetness && matchesAcidity && matchesWeight;
    });

    // 2. Potem sortujemy przefiltrowaną listę
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.price - b.price;
        } else if (sortOrder === "desc") {
            return b.price - a.price;
        }
        return 0; // Brak sortowania
    });

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

    if (loading) return <div>Ładowanie...</div>;

    return (
        <div className="products-page-wrapper">
            {/* Wyszukiwarka i Sortowanie obok siebie */}
            <div className="search-wrapper">
                {/* Pusty element po lewej, żeby input był idealnie na środku */}
                <div className="search-side-space"></div>

                <input
                    type="text"
                    placeholder="Szukaj kawy..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-input"
                />

                <div className="search-side-space right">
                    <select
                        className="sort-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="">Sortuj: Domyślnie</option>
                        <option value="asc">Cena: Rosnąco</option>
                        <option value="desc">Cena: Malejąco</option>
                    </select>
                </div>
            </div>

            <div className="main-layout">
                {/* SIDEBAR Z FILTRAMI */}
                <aside className="sidebar">
                    <h3>Filtry</h3>
                    <div className="filter-section">
                        <label>Stopień palenia</label>
                        <select className="filter-select" onChange={(e) => handleFilterChange('roastLevel', e.target.value)} value={filters.roastLevel[0] || ""}>
                            <option value="">Wszystkie</option>
                            <option value="1">Jasne</option>
                            <option value="2">Średnie</option>
                            <option value="3">Ciemne</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <label>Kwasowość</label>
                        <select className="filter-select" onChange={(e) => handleFilterChange('acidity', e.target.value)} value={filters.acidity[0] || ""}>
                            <option value="">Wszystkie</option>
                            <option value="1">Niska</option>
                            <option value="2">Zrównoważona</option>
                            <option value="3">Wysoka</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <label>Kofeina</label>
                        <select className="filter-select" onChange={(e) => handleFilterChange('caffeineLevel', e.target.value)} value={filters.caffeineLevel[0] || ""}>
                            <option value="">Wszystkie</option>
                            <option value="1">Niska</option>
                            <option value="2">Średnia</option>
                            <option value="3">Wysoka</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <label>Słodycz</label>
                        <select className="filter-select" onChange={(e) => handleFilterChange('sweetness', e.target.value)} value={filters.sweetness[0] || ""}>
                            <option value="">Wszystkie</option>
                            <option value="1">Wytrawna</option>
                            <option value="2">Zrównoważona</option>
                            <option value="3">Słodka</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <label>Waga opakowania</label>
                        <select className="filter-select" onChange={(e) => handleFilterChange('weight', e.target.value)} value={filters.weight[0] || ""}>
                            <option value="">Wszystkie</option>
                            <option value="500g">500g</option>
                            <option value="1000g">1000g</option>
                        </select>
                    </div>

                    <button className="reset-filters-btn" onClick={resetFilters}>
                        Resetuj filtry
                    </button>
                </aside>

                {/* LISTA PRODUKTÓW */}
                <div className="products-container">
                    <ul className="products-ul">
                        {sortedProducts.map(p => (
                            <li key={p.id} className="productElement" onClick={() => navigate(`/product/${p.id}`)}>
                                <div className="img-container">
                                    <img src={getProductImage(p.name)} alt={p.name} />
                                </div>

                                <div className="product-info">
                                    <h3 className="name" style={{color: 'var(--color-name)'}}>{p.name}</h3>
                                    <p className="description">{p.description}</p>

                                    <div className="coffee-stats">
                                        <CoffeeAttribute label="Palenie" value={p.roastLevel} />
                                        <CoffeeAttribute label="Kwasowość" value={p.acidity} />
                                        <CoffeeAttribute label="Kofeina" value={p.caffeineLevel} />
                                        <CoffeeAttribute label="Słodycz" value={p.sweetness} />
                                    </div>
                                </div>

                                <div className="actions-section">
                                    <h5>{p.stockQuantity >= 1 ? "DOSTĘPNY" : "BRAK"}</h5>
                                    <div className="weight-info">
                                        Opakowanie: <strong>{p.weight}</strong>
                                    </div>
                                    <div className="price-row">
                                        <b className="price">{p.price} zł</b>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToCart(p);
                                        }}
                                        className="btnCart"
                                        disabled={Number(p.stockQuantity) <= 0}
                                    >
                                        {Number(p.stockQuantity) > 0 ? "Dodaj do koszyka" : "Brak na stanie"}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {sortedProducts.length === 0 && <p>Nie znaleziono kawy spełniającej te kryteria.</p>}
                </div>
            </div>
        </div>
    );
}

export default ProductsList;