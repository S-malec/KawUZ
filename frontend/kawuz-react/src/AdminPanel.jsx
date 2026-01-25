import React, { useState, useEffect, useMemo } from 'react';
import "./css/AdminPanel.css";
import { useTranslation } from "react-i18next";
const BASE = "http://localhost:8080/api";

function AdminPanel({ forceRefresh }) {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [refreshListKey, setRefreshListKey] = useState(0);
    const [msg, setMsg] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const initialFormState = {
        name: "",
        price: "",
        description: "",
        roastLevel: 1,
        acidity: 1,
        caffeineLevel: 1,
        sweetness: 1,
        weight: "500g",
        stockQuantity: 0
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    useEffect(() => {
        setLoading(true);
        fetch(`${BASE}/products`)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(e => setErr(e.message))
            .finally(() => setLoading(false));
    }, [refreshListKey]);

    const sortedAndFilteredProducts = useMemo(() => {
        let items = [...products];
        if (searchTerm) {
            items = items.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toString().includes(searchTerm)
            );
        }
        if (sortConfig.key) {
            items.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [products, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return "↕";
        return sortConfig.direction === 'asc' ? "↑" : "↓";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = (e.target.type === 'number' || e.target.type === 'range') ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setSelectedFile(null);
        setPreviewUrl(null); // Czyścimy podgląd przy resecie
        setIsEditing(false);
        setCurrentId(null);
        setMsg("");
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = "";
    };

    const handleEdit = (product) => {
        setFormData({ ...product });
        setIsEditing(true);
        setCurrentId(product.id);

        // KLUCZOWA POPRAWKA:
        setSelectedFile(null); // Usuwamy nowo wybrany plik z poprzedniej akcji
        setPreviewUrl(null);   // Czyścimy podgląd, by formularz załadował obrazek z serwera

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `${BASE}/product/${currentId}` : `${BASE}/product`;
        const method = isEditing ? "PUT" : "POST";

        const data = new FormData();
        const productBlob = new Blob([JSON.stringify(isEditing ? { ...formData, id: currentId } : formData)], {
            type: 'application/json'
        });
        data.append("product", productBlob);

        if (selectedFile) {
            data.append("image", selectedFile);
        }

        try {
            const res = await fetch(url, {
                method,
                credentials: 'include',
                body: data,
            });
            if (res.ok) {
                resetForm();
                setRefreshListKey(k => k + 1);
                forceRefresh?.();
                setMsg(t("admin.saveSuccess"));
                setTimeout(() => setMsg(""), 3000);
            }
        } catch (e) { setMsg(t("common.connectionError")); }
    };

    const handleDelete = async (id) => {
        if (!confirm(t("admin.confirmDelete"))) return;
        try {
            const res = await fetch(`${BASE}/product/${id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                setRefreshListKey(k => k + 1);
                forceRefresh?.();
            }
        } catch (e) { alert(t("admin.deleteError")); }
    };

    if (loading && products.length === 0) return <div className="admin-wrapper">{t("common.loadingData")}</div>;

    return (
        <div className="admin-wrapper">
            <div className="admin-content">
                <section className="form-container">
                    <h2 className="section-title-clean">{isEditing ? t("admin.editProduct") : t("admin.newProduct")}</h2>
                    <form className="product-form-grid" onSubmit={handleSubmit}>
                        <div className="input-group full-width">
                            <label>{t("product.name")}</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-row-triple full-width">
                            <div className="input-group">
                                <label>{t("product.price")} (PLN)</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>{t("product.stock")} ({t("common.pcs")})</label>
                                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>{t("product.weight")}</label>
                                <select name="weight" value={formData.weight} onChange={handleChange}>
                                    <option value="500g">500g</option>
                                    <option value="1000g">1000g</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group full-width">
                            <label>{t("product.description")}</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" />
                        </div>

                        <div className="ranges-container full-width">
                            {['caffeineLevel', 'acidity', 'sweetness', 'roastLevel'].map(key => (
                                <div className="range-item" key={key}>
                                    <label>{key.replace('Level', '').charAt(0).toUpperCase() + key.slice(1).replace('Level', '')}: {formData[key]}</label>
                                    <input type="range" min="1" max="3" name={key} value={formData[key]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        {/* PODGLĄD ZDJĘCIA */}
                        <div className="input-group full-width">
                            <label>{t("product.image")} (.png)</label>
                            <div className="image-upload-wrapper" onClick={() => document.getElementById('image-upload').click()}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Podgląd" className="image-preview-box" />
                                ) : isEditing && formData.name ? (
                                    <img src={`/images/${formData.name}.png`} alt="Aktualne" className="image-preview-box" onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                    <div className="image-placeholder">{t("product.clickToAddImage")}</div>
                                )}
                                <input id="image-upload" type="file" accept="image/png" onChange={handleFileChange} style={{ display: 'none' }} />
                            </div>
                        </div>

                        <div className="form-actions-centered full-width">
                            <button type="submit" className="btn-save">{t("common.confirm")}</button>
                            {isEditing && <button type="button" className="btn-cancel" onClick={resetForm}>{t("common.cancel")}</button>}
                        </div>
                    </form>
                    {msg && <p className="status-msg" style={{textAlign: 'center', marginTop: '10px', color: 'var(--primary)'}}>{msg}</p>}
                </section>

                <section className="table-container">
                    <div className="table-controls">
                        <h2 className="section-title-clean">{t("admin.productDatabase")}</h2>
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder={t("admin.searchPlaceholder")}
                            style={{ maxWidth: '400px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th onClick={() => requestSort('id')} className="sortable">ID <span>{getSortIcon('id')}</span></th>
                                <th onClick={() => requestSort('name')} className="sortable">{t("product.name")} <span>{getSortIcon('name')}</span></th>
                                <th onClick={() => requestSort('price')} className="sortable">{t("product.price")} <span>{getSortIcon('price')}</span></th>
                                <th onClick={() => requestSort('weight')} className="sortable">{t("product.weight")} <span>{getSortIcon('weight')}</span></th>
                                <th onClick={() => requestSort('stockQuantity')} className="sortable">{t("product.stock")} <span>{getSortIcon('stockQuantity')}</span></th>
                                <th className="text-right">{t("common.actions")}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedAndFilteredProducts.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td className="font-bold">
                                        <img src={`/images/${p.name}.png`} alt="" style={{ width: '30px', marginRight: '10px', verticalAlign: 'middle', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                                        {p.name}
                                    </td>
                                    <td>{parseFloat(p.price).toFixed(2)} zł</td>
                                    <td>{p.weight}</td>
                                    <td style={{ color: p.stockQuantity <= 0 ? '#e53e3e' : 'inherit', fontWeight: p.stockQuantity <= 0 ? 'bold' : 'normal' }}>
                                        {p.stockQuantity > 0 ? `${p.stockQuantity} ${t("common.pcs")}` : t("common.outOfStock")}
                                    </td>
                                    <td className="text-right">
                                        <button className="btn-edit-link" onClick={() => handleEdit(p)}>{t("common.edit")}</button>
                                        <button className="btn-delete-link" onClick={() => handleDelete(p.id)}>{t("common.delete")}</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminPanel;