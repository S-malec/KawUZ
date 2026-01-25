import React from "react";
import { getProductImage } from "./helpers.js";
import { useTranslation } from "react-i18next";

export default function Cart({ cart, onRemove, onCheckout }) {
  const { t } = useTranslation();
  const grouped = cart.reduce((acc, item) => {
    if (!acc[item.id]) acc[item.id] = { ...item, quantity: 0 };
    acc[item.id].quantity += 1;
    return acc;
  }, {});

  const products = Object.values(grouped);
  const total = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="products-page-wrapper">
      <h2 style={{ textAlign: "center", marginBottom: 20 }}> {t("cart.title")}</h2>

      {products.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: 18 }}>{t("cart.empty")}</p>
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
                        {t(`product.${attr}`)}:
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
                  <b>{(item.price * item.quantity).toFixed(2)} {t("common.pln")}</b>
                </div>
                <button
                    className="btnRemove"
                    onClick={() => onRemove(item.id)}
                  >
                  {t("cart.remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {products.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <h3 style={{ marginBottom: 15 }}>{t("cart.total")}: {total.toFixed(2)} {t("common.pln")}</h3>
          <button className="btnCartCheckout" onClick={onCheckout}>
            {t("cart.checkout")}
          </button>
        </div>
      )}
    </div>
  );
}
