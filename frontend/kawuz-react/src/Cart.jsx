import React from "react";
import { getProductImage } from "./helpers.js";

/**
 * @component Cart
 * @brief Komponent widoku koszyka zakupowego.
 * * Odpowiada za:
 * - Grupowanie zduplikowanych produktów i zliczanie ich ilości.
 * - Wyświetlanie listy wybranych kaw wraz z ich parametrami.
 * - Obliczanie sumy częściowej dla każdego typu produktu oraz sumy całkowitej zamówienia.
 * - Obsługę usuwania elementów oraz inicjowanie procesu finalizacji (checkout).
 * * @param {Object} props
 * @param {Array} props.cart Tablica obiektów produktów dodanych do koszyka.
 * @param {Function} props.onRemove Funkcja usuwająca pojedyncze wystąpienie produktu po ID.
 * @param {Function} props.onCheckout Funkcja wyzwalająca proces składania zamówienia.
 */
export default function Cart({ cart, onRemove, onCheckout }) {
  /**
   * @brief Grupuje produkty w koszyku według ich unikalnego identyfikatora.
   * Przekształca płaską tablicę produktów w obiekt, gdzie kluczem jest ID,
   * a wartością dane produktu rozszerzone o pole 'quantity'.
   */
  const grouped = cart.reduce((acc, item) => {
    if (!acc[item.id]) acc[item.id] = { ...item, quantity: 0 };
    acc[item.id].quantity += 1;
    return acc;
  }, {});

  /** @brief Tablica zgrupowanych produktów przygotowana do mapowania w JSX. */
  const products = Object.values(grouped);

  /** @brief Sumaryczny koszt wszystkich produktów w koszyku. */
  const total = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
      <div className="products-page-wrapper">
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Twój koszyk</h2>

        {products.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: 18 }}>Koszyk jest pusty</p>
        ) : (
            <ul className="products-ul">
              {products.map(item => (
                  <li key={item.id} className="productElement">
                    {/* Obrazek */}
                    <div className="img-container">
                      <img src={getProductImage(item.name)} alt={item.name} />
                    </div>

                    {/* Info o produkcie */}
                    <div className="product-info">
                      <h3>
                        {item.name} <span style={{ fontWeight: "normal" }}>x{item.quantity}</span>
                      </h3>
                      <p className="description">{item.description}</p>

                      <div className="coffee-stats">
                        {["roastLevel", "acidity", "caffeineLevel", "sweetness"].map((attr, idx) => (
                            <div className="stat-row" key={idx}>
                      <span className="stat-label">
                        {attr === "roastLevel" ? "Palenie" :
                            attr === "acidity" ? "Kwasowość" :
                                attr === "caffeineLevel" ? "Kofeina" : "Słodycz"}:
                      </span>
                              <div className="dots">
                                {[1, 2, 3].map(dot => (
                                    <span key={dot} className={`dot ${dot <= item[attr] ? "filled" : ""}`}></span>
                                ))}
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Akcje: cena + Usuń */}
                    <div className="actions-section">
                      <div className="price-row">
                        <b>{(item.price * item.quantity).toFixed(2)} zł</b>
                      </div>
                      <button
                          className="btnRemove"
                          onClick={() => onRemove(item.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </li>
              ))}
            </ul>
        )}

        {products.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <h3 style={{ marginBottom: 15 }}>Łącznie: {total.toFixed(2)} zł</h3>
              <button className="btnCartCheckout" onClick={onCheckout}>
                Złóż zamówienie
              </button>
            </div>
        )}
      </div>
  );
}