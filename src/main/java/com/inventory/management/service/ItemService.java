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
 
        if (item == null) { 
            throw new RuntimeException("Item data is required"); 
        } 
 
        if (item.getSku() == null || 
                item.getSku().trim().isEmpty()) { 
 
            throw new RuntimeException("SKU is required"); 
        } 
 
        if (item.getName() == null || 
                item.getName().trim().isEmpty()) { 
 
            throw new RuntimeException("Item name is required"); 
        } 
 
        if (item.getCategory() == null || 
                item.getCategory().trim().isEmpty()) { 
 
            throw new RuntimeException("Category is required"); 
        } 
 
        if (item.getQuantity() == null || 
                item.getQuantity() < 0) { 
 
            throw new RuntimeException( 
                    "Quantity cannot be negative" 
            ); 
        } 
 
        if (item.getThreshold() == null || 
                item.getThreshold() < 0) { 
 
            throw new RuntimeException( 
                    "Threshold cannot be negative" 
            ); 
        } 
 
        if (item.getUnitPrice() == null || 
                item.getUnitPrice() 
                        .compareTo(BigDecimal.ZERO) < 0) { 
 
            throw new RuntimeException( 
                    "Unit price cannot be negative" 
            ); 
        } 
 
        String sku = item.getSku().trim(); 
        String name = item.getName().trim(); 
        String category = item.getCategory().trim(); 
 
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
 
        item.setSku(sku); 
        item.setName(name); 
        item.setCategory(category); 
 
        return itemRepository.save(item); 
    } 
 
    // ========================= 
    // UPDATE EXISTING ITEM 
    // ========================= 
    public Item updateItem(Long id, Item updatedItem) { 
 
        Item existingItem = itemRepository.findById(id) 
                .orElseThrow(() -> 
                        new RuntimeException("Item not found") 
                ); 
 
        if (updatedItem == null) { 
            throw new RuntimeException( 
                    "Item data is required" 
            ); 
        } 
 
        if (updatedItem.getSku() == null || 
                updatedItem.getSku().trim().isEmpty()) { 
 
            throw new RuntimeException( 
                    "SKU is required" 
            ); 
        } 
 
        if (updatedItem.getName() == null || 
                updatedItem.getName().trim().isEmpty()) { 
 
            throw new RuntimeException( 
                    "Item name is required" 
            ); 
        } 
 
        if (updatedItem.getCategory() == null || 
                updatedItem.getCategory().trim().isEmpty()) { 
 
            throw new RuntimeException( 
                    "Category is required" 
            ); 
        } 
 
        if (updatedItem.getQuantity() == null || 
                updatedItem.getQuantity() < 0) { 
 
            throw new RuntimeException( 
                    "Quantity cannot be negative" 
            ); 
        } 
 
        if (updatedItem.getThreshold() == null || 
                updatedItem.getThreshold() < 0) { 
 
            throw new RuntimeException( 
                    "Threshold cannot be negative" 
            ); 
        } 
 
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
 
        return itemRepository.save(existingItem); 
    } 
 
    // ========================= 
    // DELETE ITEM 
    // ========================= 
    public void deleteItem(Long id) { 
 
        Item item = itemRepository.findById(id) 
                .orElseThrow(() -> 
                        new RuntimeException("Item not found") 
                ); 
 
        boolean hasTransactions = 
                transactionRepository.findAll() 
                        .stream() 
                        .anyMatch(transaction -> 
                                transaction.getItem() != null && 
                                        transaction.getItem() 
                                                .getId() 
                                                .equals(id) 
                        ); 
 
        if (hasTransactions) { 
            throw new RuntimeException( 
                    "Cannot delete item because transaction history exists" 
            ); 
        } 
 
        itemRepository.delete(item); 
    } 
 
    // ========================= 
    // STOCK-IN 
    // ========================= 
    public Item stockIn(String sku, 
                        Integer quantity, 
                        String remarks, 
                        Long supplierId) { 
 
        Item item = itemRepository.findAll() 
                .stream() 
                .filter(i -> i.getSku().equals(sku)) 
                .findFirst() 
                .orElseThrow(() -> 
                        new RuntimeException("Item not found") 
                ); 
 
        if (quantity == null || quantity <= 0) { 
            throw new RuntimeException( 
                    "Stock-IN quantity must be greater than 0" 
            ); 
        } 
 
        Supplier supplier = supplierRepository.findById(supplierId) 
                .orElseThrow(() -> 
                        new RuntimeException("Supplier not found") 
                ); 
 
        item.setQuantity( 
                item.getQuantity() + quantity 
        ); 
 
        itemRepository.save(item); 
 
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
 
        transactionRepository.save(transaction); 
 
        return item; 
    } 
 
    // ========================= 
    // STOCK-OUT 
    // ========================= 
    public Item stockOut(String sku, 
                         Integer quantity, 
                         String remarks) { 
 
        Item item = itemRepository.findAll() 
                .stream() 
                .filter(i -> i.getSku().equals(sku)) 
                .findFirst() 
                .orElseThrow(() -> 
                        new RuntimeException("Item not found") 
                ); 
 
        if (quantity == null || quantity <= 0) { 
            throw new RuntimeException( 
                    "Stock-OUT quantity must be greater than 0" 
            ); 
        } 
 
        if (quantity > item.getQuantity()) { 
            throw new RuntimeException( 
                    "Insufficient stock" 
            ); 
        } 
 
        item.setQuantity( 
                item.getQuantity() - quantity 
        ); 
 
        itemRepository.save(item); 
 
        InventoryTransaction transaction = 
                new InventoryTransaction(); 
 
        transaction.setItem(item); 
        transaction.setType(TransactionType.STOCK_OUT); 
        transaction.setQuantity(quantity); 
        transaction.setTransactionDate( 
                LocalDateTime.now() 
        ); 
        transaction.setRemarks(remarks); 
 
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
 
            int targetStock = 
                    item.getThreshold() * 2; 
 
            if (item.getQuantity() < targetStock) { 
 
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
    // DELETE TRANSACTION HISTORY 
    // ========================= 
    public void deleteTransaction(Long id) { 
 
        InventoryTransaction transaction = 
                transactionRepository.findById(id) 
                        .orElseThrow(() -> 
                                new RuntimeException( 
                                        "Transaction not found" 
                                ) 
                        ); 
 
        /* 
         * IMPORTANT: 
         * Deleting a transaction history record does NOT 
         * change the item's current stock quantity. 
         * 
         * This operation only removes the old history record. 
         */ 
 
        transactionRepository.delete(transaction); 
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
 
        List<Item> items = 
                itemRepository.findAll(); 
 
        for (Item item : items) { 
 
            BigDecimal stockValue = 
                    item.getUnitPrice() 
                            .multiply( 
                                    BigDecimal.valueOf( 
                                            item.getQuantity() 
                                    ) 
                            ); 
 
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
 
                existingCategory.setTotalStockValue( 
                        existingCategory 
                                .getTotalStockValue() 
                                .add(stockValue) 
                ); 
 
            } else { 
 
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