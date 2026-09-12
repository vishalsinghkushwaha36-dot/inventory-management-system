package com.inventory.management.dto;

import java.math.BigDecimal;

public class CategoryStockValueDTO {

    private String category;
    private BigDecimal totalStockValue;

    // =========================
    // DEFAULT CONSTRUCTOR
    // =========================
    public CategoryStockValueDTO() {
    }

    // =========================
    // PARAMETERIZED CONSTRUCTOR
    // =========================
    public CategoryStockValueDTO(
            String category,
            BigDecimal totalStockValue) {

        this.category = category;
        this.totalStockValue = totalStockValue;
    }

    // =========================
    // GETTER & SETTER
    // =========================
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getTotalStockValue() {
        return totalStockValue;
    }

    public void setTotalStockValue(BigDecimal totalStockValue) {
        this.totalStockValue = totalStockValue;
    }
}