package com.example.kawuz.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * @class Product
 * @brief Encja bazodanowa reprezentująca produkt (kawę) w systemie.
 * * Klasa mapuje tabelę produktów w bazie danych i zawiera wszystkie parametry
 * fizyczne oraz smakowe oferowanych kaw.
 */
@Entity
public class Product {
    /** @brief Unikalny identyfikator produktu (Klucz podstawowy). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    /** @brief Nazwa handlowa produktu. */
    private String name;
    /** @brief Szczegółowy opis produktu. */
    private String description;
    /** @brief Flaga określająca dostępność produktu w sprzedaży. */
    private boolean productAvailable;
    /** @brief Aktualny stan magazynowy (liczba sztuk). */
    private int stockQuantity;
    /** @brief Cena jednostkowa produktu. */
    private double price;
    /** @brief Mapa/ścieżka do zasobów powiązanych z produktem. */
    private String map;
    /** @brief Licznik sprzedanych jednostek (używany do rankingu Top 10). */
    private int sales = 0;
    /** @brief Poziom palenia kawy. */
    private int roastLevel;
    /** @brief Zawartość kofeiny. */
    private int caffeineLevel;
    /** @brief Poziom słodyczy. */
    private int sweetness;
    /** @brief Poziom kwasowości. */
    private int acidity;
    /** @brief Gramatura lub waga opakowania. */
    private String weight;


    /** @return ID produktu. */
    public int getId() {
        return id;
    }

    /** @param id Nowe ID produktu. */
    public void setId(int id) {
        this.id = id;
    }

    /** @return Nazwa produktu. */
    public String getName() {
        return name;
    }

    /** @param name Nowa nazwa produktu. */
    public void setName(String name) {
        this.name = name;
    }

    /** @return Opis produktu. */
    public String getDescription() {
        return description;
    }

    /** @param description Nowy opis produktu. */
    public void setDescription(String description) {
        this.description = description;
    }

    /** @return Status dostępności produktu. */
    public boolean isProductAvailable() {
        return productAvailable;
    }

    /** @param productAvailable Nowy status dostępności. */
    public void setProductAvailable(boolean productAvailable) {
        this.productAvailable = productAvailable;
    }

    /** @return Stan magazynowy. */
    public int getStockQuantity() {
        return stockQuantity;
    }

    /** @param stockQuantity Nowa liczba sztuk w magazynie. */
    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    /** @return Cena produktu. */
    public double getPrice() {
        return price;
    }

    /** @param price Nowa cena produktu. */
    public void setPrice(double price) {
        this.price = price;
    }
    /** @return Mapa zasobów. */
    public String getMap() {
        return map;
    }
    /** @param map Nowa ścieżka mapy. */
    public void setMap(String map) {
        this.map = map;
    }
    /** @return Liczba sprzedanych sztuk. */
    public int getSales() {
        return sales;
    }
    /** @param sales Nowa wartość licznika sprzedaży. */
    public void setSales(int sales) {
        this.sales = sales;
    }

    /** @return Poziom palenia. */
    public int getRoastLevel() { return roastLevel; }
    /** @param roastLevel Nowy poziom palenia. */
    public void setRoastLevel(int roastLevel) { this.roastLevel = roastLevel; }

    /** @return Poziom kofeiny. */
    public int getCaffeineLevel() { return caffeineLevel; }
    /** @param caffeineLevel Nowy poziom kofeiny. */
    public void setCaffeineLevel(int caffeineLevel) { this.caffeineLevel = caffeineLevel; }

    /** @return Poziom słodyczy. */
    public int getSweetness() { return sweetness; }
    /** @param sweetness Nowy poziom słodyczy. */
    public void setSweetness(int sweetness) { this.sweetness = sweetness; }

    /** @return Poziom kwasowości. */
    public int getAcidity() { return acidity; }
    /** @param acidity Nowy poziom kwasowości. */
    public void setAcidity(int acidity) { this.acidity = acidity; }

    /** @return Waga opakowania. */
    public String getWeight() { return weight; }
    /** @param weight Nowa waga. */
    public void setWeight(String weight) { this.weight = weight; }
}