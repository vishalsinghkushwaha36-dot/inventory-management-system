package com.inventory.management.service;

import com.inventory.management.dto.CategoryStockValueDTO;
import com.inventory.management.dto.ReorderSuggestionDTO;
import com.inventory.management.entity.InventoryTransaction;
import com.inventory.management.entity.Item;
import com.inventory.management.entity.Supplier;
import com.inventory.management.entity.TransactionType;
import com.inventory.management.repository.InventoryTransactionRepository;
import com.inventory.management.repository.ItemRepository;
import com.inventory.management.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final SupplierRepository supplierRepository;

    public ItemService(ItemRepository itemRepository,
                       InventoryTransactionRepository transactionRepository,
                       SupplierRepository supplierRepository) {

        this.itemRepository = itemRepository;
        this.transactionRepository = transactionRepository;
        this.supplierRepository = supplierRepository;
    }

    // =========================
    // GET ALL ITEMS
    // =========================
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // =========================
    // ADD NEW ITEM
    // =========================
    public Item addItem(Item item) {

        // Validate item object
        if (item == null) {
            throw new RuntimeException("Item data is required");
        }

        // Validate SKU
        if (item.getSku() == null ||
                item.getSku().trim().isEmpty()) {

            throw new RuntimeException("SKU is required");
        }

        // Validate Item Name
        if (item.getName() == null ||
                item.getName().trim().isEmpty()) {

            throw new RuntimeException("Item name is required");
        }

        // Validate Category
        if (item.getCategory() == null ||
                item.getCategory().trim().isEmpty()) {

            throw new RuntimeException("Category is required");
        }

        // Validate Quantity
        if (item.getQuantity() == null ||
                item.getQuantity() < 0) {

            throw new RuntimeException(
                    "Quantity cannot be negative"
            );
        }

        // Validate Threshold
        if (item.getThreshold() == null ||
                item.getThreshold() < 0) {

            throw new RuntimeException(
                    "Threshold cannot be negative"
            );
        }

        // Validate Unit Price
        if (item.getUnitPrice() == null ||
                item.getUnitPrice()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Unit price cannot be negative"
            );
        }

        // Clean text values
        String sku = item.getSku().trim();
        String name = item.getName().trim();
        String category = item.getCategory().trim();

        // Check duplicate SKU
        boolean skuExists = itemRepository.findAll()
                .stream()
                .anyMatch(existingItem ->
                        existingItem.getSku() != null &&
                                existingItem.getSku()
                                        .trim()
                                        .equalsIgnoreCase(sku)
                );

        if (skuExists) {
            throw new RuntimeException(
                    "SKU already exists"
            );
        }

        // Set cleaned values
        item.setSku(sku);
        item.setName(name);
        item.setCategory(category);

        // Save item into MySQL database
        return itemRepository.save(item);
    }
    // =========================
// UPDATE EXISTING ITEM
// =========================

    public Item updateItem(Long id, Item updatedItem) {

        // Find existing item
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Item not found")
                );

        // Validate item object
        if (updatedItem == null) {
            throw new RuntimeException(
                    "Item data is required"
            );
        }

        // Validate SKU
        if (updatedItem.getSku() == null ||
                updatedItem.getSku().trim().isEmpty()) {

            throw new RuntimeException(
                    "SKU is required"
            );
        }

        // Validate Item Name
        if (updatedItem.getName() == null ||
                updatedItem.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Item name is required"
            );
        }

        // Validate Category
        if (updatedItem.getCategory() == null ||
                updatedItem.getCategory().trim().isEmpty()) {

            throw new RuntimeException(
                    "Category is required"
            );
        }

        // Validate Quantity
        if (updatedItem.getQuantity() == null ||
                updatedItem.getQuantity() < 0) {

            throw new RuntimeException(
                    "Quantity cannot be negative"
            );
        }

        // Validate Threshold
        if (updatedItem.getThreshold() == null ||
                updatedItem.getThreshold() < 0) {

            throw new RuntimeException(
                    "Threshold cannot be negative"
            );
        }

        // Validate Unit Price
        if (updatedItem.getUnitPrice() == null ||
                updatedItem.getUnitPrice()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Unit price cannot be negative"
            );
        }

        String sku =
                updatedItem.getSku().trim();

        String name =
                updatedItem.getName().trim();

        String category =
                updatedItem.getCategory().trim();

        // Check duplicate SKU
        boolean duplicateSku =
                itemRepository.findAll()
                        .stream()
                        .anyMatch(item ->
                                !item.getId().equals(id) &&
                                        item.getSku() != null &&
                                        item.getSku()
                                                .trim()
                                                .equalsIgnoreCase(sku)
                        );

        if (duplicateSku) {
            throw new RuntimeException(
                    "SKU already exists"
            );
        }

        // Update existing item
        existingItem.setSku(sku);
        existingItem.setName(name);
        existingItem.setCategory(category);
        existingItem.setQuantity(
                updatedItem.getQuantity()
        );
        existingItem.setThreshold(
                updatedItem.getThreshold()
        );
        existingItem.setUnitPrice(
                updatedItem.getUnitPrice()
        );

        // Save updated item
        return itemRepository.save(existingItem);
    }
    // =========================
// DELETE ITEM
// =========================

    public void deleteItem(Long id) {

        // Find item
        Item item = itemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Item not found")
                );

        // Check transaction history
        boolean hasTransactions =
                transactionRepository.findAll()
                        .stream()
                        .anyMatch(transaction ->
                                transaction.getItem() != null &&
                                        transaction.getItem()
                                                .getId()
                                                .equals(id)
                        );

        // Prevent deletion if transaction history exists
        if (hasTransactions) {
            throw new RuntimeException(
                    "Cannot delete item because transaction history exists"
            );
        }

        // Delete item
        itemRepository.delete(item);
    }

    // =========================
    // STOCK-IN
    // =========================
    public Item stockIn(String sku,
                        Integer quantity,
                        String remarks,
                        Long supplierId) {

        // Find item by SKU
        Item item = itemRepository.findAll()
                .stream()
                .filter(i -> i.getSku().equals(sku))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Item not found")
                );

        // Validate quantity
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Stock-IN quantity must be greater than 0"
            );
        }

        // Find supplier
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() ->
                        new RuntimeException("Supplier not found")
                );

        // Increase stock
        item.setQuantity(
                item.getQuantity() + quantity
        );

        // Save updated item
        itemRepository.save(item);

        // Create transaction record
        InventoryTransaction transaction =
                new InventoryTransaction();

        transaction.setItem(item);
        transaction.setSupplier(supplier);
        transaction.setType(TransactionType.STOCK_IN);
        transaction.setQuantity(quantity);
        transaction.setTransactionDate(
                LocalDateTime.now()
        );
        transaction.setRemarks(remarks);

        // Save transaction
        transactionRepository.save(transaction);

        return item;
    }

    // =========================
    // STOCK-OUT
    // =========================
    public Item stockOut(String sku,
                         Integer quantity,
                         String remarks) {

        // Find item by SKU
        Item item = itemRepository.findAll()
                .stream()
                .filter(i -> i.getSku().equals(sku))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Item not found")
                );

        // Validate quantity
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Stock-OUT quantity must be greater than 0"
            );
        }

        // Prevent negative stock
        if (quantity > item.getQuantity()) {
            throw new RuntimeException(
                    "Insufficient stock"
            );
        }

        // Decrease stock
        item.setQuantity(
                item.getQuantity() - quantity
        );

        // Save updated item
        itemRepository.save(item);

        // Create transaction record
        InventoryTransaction transaction =
                new InventoryTransaction();

        transaction.setItem(item);
        transaction.setType(TransactionType.STOCK_OUT);
        transaction.setQuantity(quantity);
        transaction.setTransactionDate(
                LocalDateTime.now()
        );
        transaction.setRemarks(remarks);

        // Save transaction
        transactionRepository.save(transaction);

        return item;
    }

    // =========================
    // LOW STOCK ITEMS
    // =========================
    public List<Item> getLowStockItems() {

        return itemRepository.findAll()
                .stream()
                .filter(item ->
                        item.getQuantity() <=
                                item.getThreshold()
                )
                .toList();
    }

    // =========================
    // REORDER QUANTITY SUGGESTION
    // =========================
    public List<ReorderSuggestionDTO> getReorderSuggestions() {

        List<ReorderSuggestionDTO> suggestions =
                new ArrayList<>();

        for (Item item : itemRepository.findAll()) {

            // Target stock = Threshold × 2
            int targetStock =
                    item.getThreshold() * 2;

            // Generate suggestion only when
            // current stock is below target stock
            if (item.getQuantity() < targetStock) {

                // Required quantity to reach target stock
                int reorderQuantity =
                        targetStock - item.getQuantity();

                ReorderSuggestionDTO dto =
                        new ReorderSuggestionDTO(
                                item.getSku(),
                                item.getName(),
                                item.getQuantity(),
                                item.getThreshold(),
                                reorderQuantity
                        );

                suggestions.add(dto);
            }
        }

        return suggestions;
    }

    // =========================
    // GET TRANSACTION HISTORY
    // =========================
    public List<InventoryTransaction> getTransactionHistory() {
        return transactionRepository.findAll();
    }

    // =========================
    // SEARCH ITEMS BY NAME
    // =========================
    public List<Item> searchItemsByName(String name) {
        return itemRepository.findByNameContainingIgnoreCase(name);
    }

    // =========================
    // FILTER ITEMS BY CATEGORY
    // =========================
    public List<Item> filterItemsByCategory(String category) {
        return itemRepository.findByCategoryIgnoreCase(category);
    }

    // =========================
    // CATEGORY-WISE STOCK VALUE
    // =========================
    public List<CategoryStockValueDTO> getCategoryStockValue() {

        List<CategoryStockValueDTO> result =
                new ArrayList<>();

        // Get all items from database
        List<Item> items =
                itemRepository.findAll();

        for (Item item : items) {

            // Stock Value = Quantity × Unit Price
            BigDecimal stockValue =
                    item.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            // Check whether category already exists
            CategoryStockValueDTO existingCategory =
                    result.stream()
                            .filter(dto ->
                                    dto.getCategory()
                                            .equalsIgnoreCase(
                                                    item.getCategory()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (existingCategory != null) {

                // Add current item's value
                // to category total
                existingCategory.setTotalStockValue(
                        existingCategory
                                .getTotalStockValue()
                                .add(stockValue)
                );

            } else {

                // Create new category entry
                result.add(
                        new CategoryStockValueDTO(
                                item.getCategory(),
                                stockValue
                        )
                );
            }
        }

        return result;
    }
}