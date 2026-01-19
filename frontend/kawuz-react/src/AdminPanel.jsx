import React, { useState, useEffect } from 'react';
import "./css/AdminPanel.css";

const BASE = "http://localhost:8080/api";

function AdminPanel({ forceRefresh }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [refreshListKey, setRefreshListKey] = useState(0);
    const [msg, setMsg] = useState("");

    const initialFormState = {
        name: "",
        price: "",
        description: "",
        roastLevel: 1,
        acidity: 1,
        caffeineLevel: 1,
        sweetness: 1,
        weight: "500g"
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${BASE}/products`)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(e => setErr(e.message))
            .finally(() => setLoading(false));
    }, [refreshListKey]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (product) => {
        setFormData({ ...product });
        setIsEditing(true);
        setCurrentId(product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `${BASE}/product/${currentId}` : `${BASE}/product`;
        const method = isEditing ? "PUT" : "POST";
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(isEditing ? { ...formData, id: currentId } : formData),
            });
            if (res.ok) {
                resetForm();
                setRefreshListKey(k => k + 1);
                forceRefresh?.();
                setMsg("Zapisano zmiany.");
                setTimeout(() => setMsg(""), 3000);
            }
        } catch (e) { setMsg("Błąd połączenia."); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Potwierdź usunięcie produktu")) return;
        await fetch(`${BASE}/product/${id}`, { method: "DELETE", credentials: 'include' });
        setRefreshListKey(k => k + 1);
        forceRefresh?.();
    };

    return (
        <div className="admin-wrapper">
            <div className="admin-content">

                <section className="form-container">
                    <h2 className="section-title-clean">{isEditing ? "EDYCJA PRODUKTU" : "NOWY PRODUKT"}</h2>
                    <form className="product-form-grid" onSubmit={handleSubmit}>
                        <div className="input-group full-width">
                            <label>Nazwa</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Cena (PLN)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Waga</label>
                            <select name="weight" value={formData.weight} onChange={handleChange}>
                                <option value="500g">500g</option>
                                <option value="1000g">1000g</option>
                            </select>
                        </div>
                        <div className="input-group full-width">
                            <label>Opis</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" />
                        </div>

                        <div className="ranges-container full-width">
                            <div className="range-item">
                                <label>Kofeina: {formData.caffeineLevel}</label>
                                <input type="range" min="1" max="3" name="caffeineLevel" value={formData.caffeineLevel} onChange={handleChange} />
                            </div>
                            <div className="range-item">
                                <label>Kwasowość: {formData.acidity}</label>
                                <input type="range" min="1" max="3" name="acidity" value={formData.acidity} onChange={handleChange} />
                            </div>
                            <div className="range-item">
                                <label>Słodycz: {formData.sweetness}</label>
                                <input type="range" min="1" max="3" name="sweetness" value={formData.sweetness} onChange={handleChange} />
                            </div>
                            <div className="range-item">
                                <label>Stopień palenia: {formData.roastLevel}</label>
                                <input type="range" min="1" max="3" name="roastLevel" value={formData.roastLevel} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-actions full-width">
                            <button type="submit" className="btn-save">ZATWIERDŹ</button>
                            {isEditing && <button type="button" className="btn-cancel" onClick={resetForm}>ANULUJ</button>}
                        </div>
                    </form>
                    {msg && <p className="status-msg">{msg}</p>}
                </section>

                <section className="table-container">
                    <h2 className="section-title-clean">BAZA PRODUKTÓW</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nazwa</th>
                                <th>Cena</th>
                                <th>Waga</th>
                                <th className="text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td className="font-bold">{p.name}</td>
                                    <td>{p.price} zł</td>
                                    <td>{p.weight}</td>
                                    <td className="text-right">
                                        <button className="btn-edit-link" onClick={() => handleEdit(p)}>Edytuj</button>
                                        <button className="btn-delete-link" onClick={() => handleDelete(p.id)}>Usuń</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
}

export default AdminPanel;