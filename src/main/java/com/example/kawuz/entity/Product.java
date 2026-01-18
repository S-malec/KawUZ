package com.example.kawuz.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String description;
    private boolean productAvailable;
    private int stockQuantity;
    private double price;
    private String map;
    private int sales = 0;
    private int roastLevel;
    private int caffeineLevel;
    private int sweetness;
    private int acidity;
    private String weight;


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isProductAvailable() {
        return productAvailable;
    }

    public void setProductAvailable(boolean productAvailable) {
        this.productAvailable = productAvailable;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
    public String getMap() {
        return map;
    }
    public void setMap(String map) {
        this.map = map;
    }
    public int getSales() {
        return sales;
    }
    public void setSales(int sales) {
        this.sales = sales;
    }

    public int getRoastLevel() { return roastLevel; }
    public void setRoastLevel(int roastLevel) { this.roastLevel = roastLevel; }

    public int getCaffeineLevel() { return caffeineLevel; }
    public void setCaffeineLevel(int caffeineLevel) { this.caffeineLevel = caffeineLevel; }

    public int getSweetness() { return sweetness; }
    public void setSweetness(int sweetness) { this.sweetness = sweetness; }

    public int getAcidity() { return acidity; }
    public void setAcidity(int acidity) { this.acidity = acidity; }

    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }
}
