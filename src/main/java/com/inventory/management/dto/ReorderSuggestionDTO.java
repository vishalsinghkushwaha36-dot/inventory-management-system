package com.inventory.management.dto;

public class ReorderSuggestionDTO {

    private String sku;
    private String name;
    private Integer currentQuantity;
    private Integer threshold;
    private Integer suggestedReorderQuantity;

    // Default constructor
    public ReorderSuggestionDTO() {
    }

    // Parameterized constructor
    public ReorderSuggestionDTO(String sku,
                                String name,
                                Integer currentQuantity,
                                Integer threshold,
                                Integer suggestedReorderQuantity) {

        this.sku = sku;
        this.name = name;
        this.currentQuantity = currentQuantity;
        this.threshold = threshold;
        this.suggestedReorderQuantity = suggestedReorderQuantity;
    }

    // Getters and Setters

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCurrentQuantity() {
        return currentQuantity;
    }

    public void setCurrentQuantity(Integer currentQuantity) {
        this.currentQuantity = currentQuantity;
    }

    public Integer getThreshold() {
        return threshold;
    }

    public void setThreshold(Integer threshold) {
        this.threshold = threshold;
    }

    public Integer getSuggestedReorderQuantity() {
        return suggestedReorderQuantity;
    }

    public void setSuggestedReorderQuantity(Integer suggestedReorderQuantity) {
        this.suggestedReorderQuantity = suggestedReorderQuantity;
    }
}