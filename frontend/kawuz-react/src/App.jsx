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

const BASE = "http://localhost:8080/api";

export default function App() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeModal = searchParams.get("modal");

    const [refreshKey, setRefreshKey] = useState(0);
    const [mode, setMode] = useState('list');
    const [isEditing, setIsEditing] = useState(false);

    const [cart, setCart] = useState([]);

    const [theme, setTheme] = useState('light');
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = i18n.language === "pl" ? "en" : "pl";
        i18n.changeLanguage(nextLang);
    };

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if(saved) {
            setTheme(saved);
            document.documentElement.classList.toggle('dark', saved === 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    }

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

            const text = await res.text(); // <-- odczytujemy body odpowiedzi

            if(res.ok) { 
                alert(text); // wyświetlamy dokładny komunikat z backendu
                setCart([]);
                setRefreshKey(k => k+1);
                navigate('cart');
            } else {
                alert(text); // wyświetlamy dokładny komunikat błędu
            }
        } catch(err) {
            alert(t("error.generic", { message: err.message }));
        }
    };


    const handleLogout = async () => { await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" }); setUser(null); setCart([]); setMode('list'); setActiveTab('products'); };

    if (isLoadingUser) return <div style={{color: 'var(--text)'}}>Ładowanie...</div>;

    const setActiveModal = (type) => {
        if (type) {
            setSearchParams({ modal: type }); // Ustawia ?modal=login
        } else {
            setSearchParams({}); // Usuwa parametry, co zamknie modal
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
                        // Jeśli nie jest adminem, przekieruj na stronę główną
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
                        // usuwa tylko pierwsze wystąpienie produktu o danym id
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