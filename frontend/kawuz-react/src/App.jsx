import React, { useEffect, useState } from "react";
import {Routes, Route, useNavigate, Navigate, useSearchParams} from "react-router-dom";
import { slugify } from "./helpers.js"
import ProductDetailsWrapper from './ProductDetails';
import ProductsList from "./ProductsList";
import AdminPanel from './AdminPanel';
import Cart from "./Cart";
import Login from './Login';
import Register from './Register';
import Top10Products from './Top10Products';
import "./css/App.css"
import i18n from "./i18n";
import {useTranslation} from "react-i18next";

/**
 * @constant BASE
 * @brief Bazowy adres URL dla endpointów API backendu.
 */
const BASE = "http://localhost:8080/api";

/**
 * @component App
 * @brief Główny komponent aplikacji KawUZ.
 * * Zarządza globalnym stanem aplikacji, w tym:
 * - Uwierzytelnianiem użytkownika i sesją.
 * - Stanem koszyka zakupowego.
 * - Motywem graficznym (light/dark mode).
 * - Routingiem i nawigacją.
 * - Obsługą modali (Logowanie/Rejestracja) przez parametry URL.
 */
export default function App() {
    /** @brief Hook nawigacyjny react-router-dom. */
    const navigate = useNavigate();
    /** @brief Stan przechowujący dane zalogowanego użytkownika. */
    const [user, setUser] = useState(null);
    /** @brief Flaga określająca, czy trwa sprawdzanie statusu logowania. */
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    /** @brief Hook do obsługi parametrów wyszukiwania w URL (używany do modali). */
    const [searchParams, setSearchParams] = useSearchParams();
    /** @brief Pobiera aktualnie aktywny modal z parametru 'modal' w URL. */
    const activeModal = searchParams.get("modal");

    /** @brief Klucz odświeżania komponentów zależnych od bazy danych. */
    const [refreshKey, setRefreshKey] = useState(0);
    const [mode, setMode] = useState('list');
    const [isEditing, setIsEditing] = useState(false);

    /** @brief Stan przechowujący listę produktów w koszyku. */
    const [cart, setCart] = useState([]);

    /** @brief Stan motywu kolorystycznego. */
    const [theme, setTheme] = useState('light');
    /** @brief Funkcja służąca do tłumaczenia kluczy tekstowych na aktualny język. */
    const { t, i18n } = useTranslation();

    /** @brief Przełącza język aplikacji między polskim a angielskim. */
    const toggleLanguage = () => {
        const nextLang = i18n.language === "pl" ? "en" : "pl";
        i18n.changeLanguage(nextLang);
    };

    /**
     * @brief Efekt inicjalizujący motyw na podstawie danych z localStorage.
     */
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if(saved) {
            setTheme(saved);
            document.documentElement.classList.toggle('dark', saved === 'dark');
        }
    }, []);

    /**
     * @brief Przełącza motyw między jasnym a ciemnym.
     * Zapisuje preferencję w localStorage i aktualizuje klasy dokumentu.
     */
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    }

    /**
     * @brief Efekt sprawdzający status sesji użytkownika przy starcie aplikacji.
     * Komunikuje się z endpointem /auth/me.
     */
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch(`${BASE}/auth/me`, { method: "GET", credentials: "include" });
                if (res.status === 401 || res.status === 403) { setUser(null); return; }
                if (res.ok) { const userData = await res.json(); setUser(userData); }
                else setUser(null);
            } catch { setUser(null); }
            finally { setIsLoadingUser(false); }
        };
        checkLoginStatus();
    }, []);

    /**
     * @brief Obsługuje proces finalizacji zamówienia.
     * 1. Grupuje produkty z koszyka według ID.
     * 2. Wysyła żądanie POST do backendu.
     * 3. Czyści koszyk po sukcesie.
     */
    const handleCheckout = async () => {
        if (cart.length === 0) return alert(t("cart.empty"));
        if (!user) { 
            alert(t("auth.loginRequired"));
            setActiveModal('login'); 
            return; 
        }

        try {
            const orderItems = Object.values(
                cart.reduce((acc, item) => {
                    if (!acc[item.id]) acc[item.id] = { productId: item.id, quantity: 0 };
                    acc[item.id].quantity += 1;
                    return acc;
                }, {})
            );

            const res = await fetch(`${BASE}/order/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(orderItems),
            });

            const text = await res.text();

            if(res.ok) {
                alert(text);
                setCart([]);
                setRefreshKey(k => k+1);
                navigate('cart');
            } else {
                alert(text);
            }
        } catch(err) {
            alert(t("error.generic", { message: err.message }));
        }
    };


    /**
     * @brief Wylogowuje użytkownika, czyści sesję na serwerze i resetuje stan lokalny.
     */
    const handleLogout = async () => { await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" }); setUser(null); setCart([]); setMode('list'); setActiveTab('products'); };

    if (isLoadingUser) return <div style={{color: 'var(--text)'}}>Ładowanie...</div>;

    /**
     * @brief Zarządza widocznością modali poprzez aktualizację parametrów URL.
     * @param {string|null} type Typ modalu ('login', 'register') lub null aby zamknąć.
     */
    const setActiveModal = (type) => {
        if (type) {
            setSearchParams({ modal: type });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className={theme} style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>

            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
                <h1 onClick={() => navigate('/')} style={{cursor: 'pointer', color: 'var(--heading)'}}>☕ KawUZ</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {user ? (
                        <>
                            <span style={{color: 'var(--text)'}}>{t("header.welcome")}, <b>{user.username}</b>!</span>
                            {user.isAdmin && (
                                <button onClick={() => navigate('/admin')}>{t("header.adminPanel")}</button>
                            )}
                            <button onClick={handleLogout}>{t("header.logout")}</button>
                        </>
                    ) : (
                        <button onClick={() => setActiveModal('login')}>
                            {t("header.login")}
                        </button>
                    )}
                    <button onClick={() => navigate('/cart')} style={{ marginLeft: 10 }}>
                        {t("header.cart")} ({cart.length})
                    </button>
                    <button onClick={() => navigate('/top10')} style={{ fontWeight: 'bold' }}>
                        🏆 Top 10
                    </button>
                    <button onClick={toggleTheme} style={{padding: '10px 10px'}}>
                        {theme === 'light' ? t("header.darkMode") : t("header.lightMode")}
                    </button>
                    <button onClick={toggleLanguage}>
                        {i18n.language === "pl" ? "EN" : "PL"}
                    </button>
                </div>
            </div>

            {/* --- TREŚĆ ZMIENNA (ROUTES) --- */}
            <Routes>
                <Route path="/admin" element={
                    user?.isAdmin ? (
                        <div>
                            <AdminPanel
                                forceRefresh={() => setRefreshKey(k => k + 1)}
                                onEdit={(id) => navigate(`/product/${id}?edit=true`)}
                            />
                        </div>
                    ) : (
                        <Navigate to="/" replace />
                    )
                } />
                <Route path="/" element={<ProductsList
                    key={refreshKey}
                    onSelect={(p) => navigate(`/product/${p.id}-${slugify(p.name)}`)}
                    onAddToCart={(p) => setCart(prev => [...prev, p])}
                />} />

                <Route path="/top10" element={
                    <Top10Products
                        onAddToCart={(p) => setCart(prev => [...prev, p])}
                    />
                } />

                <Route path="/cart" element={<Cart
                    cart={cart}
                    onRemove={(id) => setCart(prev => {
                        const index = prev.findIndex(p => p.id === id);
                        if(index === -1) return prev;
                        const newCart = [...prev];
                        newCart.splice(index, 1);
                        return newCart;
                    })}
                    onCheckout={handleCheckout}
                />} />

                <Route path="/product/:id" element={<ProductDetailsWrapper
                    user={user}
                    onAddToCart={(p) => setCart(prev => [...prev, p])}
                    refreshList={() => setRefreshKey(k => k+1)}
                />} />
            </Routes>

            {/* --- WARSTWA MODALI (Renderowanie warunkowe) --- */}
            {activeModal === 'login' && (
                <Login
                    onLoginSuccess={(u) => { setUser(u); setActiveModal(null); }}
                    onCancel={() => setActiveModal(null)}
                    isModal={true}
                    onClose={() => setActiveModal(null)}
                    onSwitchToRegister={() => setActiveModal('register')}
                />
            )}

            {activeModal === 'register' && (
                <Register
                    onSwitchToLogin={() => setActiveModal('login')}
                    onCancel={() => setActiveModal(null)}
                    isModal={true}
                    onClose={() => setActiveModal(null)}
                />
            )}
        </div>
    );
}