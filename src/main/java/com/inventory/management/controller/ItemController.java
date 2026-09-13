package com.inventory.management.controller;

import com.inventory.management.dto.CategoryStockValueDTO;
import com.inventory.management.dto.ReorderSuggestionDTO;
import com.inventory.management.entity.InventoryTransaction;
import com.inventory.management.entity.Item;
import com.inventory.management.service.ItemService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    // =========================
    // GET ALL ITEMS API
    // =========================
    @GetMapping
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }

    // =========================
    // ADD NEW ITEM API
    // =========================
    @PostMapping
    public Item addItem(@RequestBody Item item) {
        return itemService.addItem(item);
    }

    // =========================
    // STOCK-IN API
    // =========================
    @PostMapping("/stock-in")
    public Item stockIn(
            @RequestParam String sku,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String remarks,
            @RequestParam Long supplierId) {

        return itemService.stockIn(
                sku,
                quantity,
                remarks,
                supplierId
        );
    }

    // =========================
    // UPDATE ITEM API
    // =========================
    @PutMapping("/{id}")
    public Item updateItem(
            @PathVariable Long id,
            @RequestBody Item item) {

        return itemService.updateItem(
                id,
                item
        );
    }

    // =========================
    // DELETE ITEM API
    // =========================
    @DeleteMapping("/{id}")
    public String deleteItem(
            @PathVariable Long id) {

        itemService.deleteItem(id);

        return "Item deleted successfully";
    }

    // =========================
    // STOCK-OUT API
    // =========================
    @PostMapping("/stock-out")
    public Item stockOut(
            @RequestParam String sku,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String remarks) {

        return itemService.stockOut(
                sku,
                quantity,
                remarks
        );
    }

    // =========================
    // LOW STOCK API
    // =========================
    @GetMapping("/low-stock")
    public List<Item> getLowStockItems() {
        return itemService.getLowStockItems();
    }

    // =========================
    // REORDER SUGGESTION API
    // =========================
    @GetMapping("/reorder-suggestions")
    public List<ReorderSuggestionDTO> getReorderSuggestions() {
        return itemService.getReorderSuggestions();
    }

    // =========================
    // TRANSACTION HISTORY API
    // =========================
    @GetMapping("/transactions")
    public List<InventoryTransaction> getTransactionHistory() {
        return itemService.getTransactionHistory();
    }

    // =========================
    // DELETE TRANSACTION HISTORY API
    // =========================
    @DeleteMapping("/transactions/{id}")
    public String deleteTransaction(
            @PathVariable Long id) {

        itemService.deleteTransaction(id);

        return "Transaction deleted successfully";
    }

    // =========================
    // SEARCH ITEMS BY NAME API
    // =========================
    @GetMapping("/search")
    public List<Item> searchItems(@RequestParam String name) {
        return itemService.searchItemsByName(name);
    }

    // =========================
    // FILTER ITEMS BY CATEGORY API
    // =========================
    @GetMapping("/category")
    public List<Item> filterItemsByCategory(
            @RequestParam String category) {

        return itemService.filterItemsByCategory(category);
    }

    // =========================
    // CSV EXPORT API
    // =========================
    @GetMapping("/export-csv")
    public void exportCsv(HttpServletResponse response)
            throws IOException {

        // Set response type as CSV
        response.setContentType("text/csv");

        // Set downloaded file name
        response.setHeader(
                "Content-Disposition",
                "attachment; filename=inventory.csv"
        );

        // Create CSV writer
        var writer = response.getWriter();

        // =========================
        // CSV HEADER
        // =========================
        writer.println(
                "ID,SKU,Name,Category,Quantity,Threshold,Unit Price"
        );

        // =========================
        // CSV DATA
        // =========================
        List<Item> items =
                itemService.getAllItems();

        for (Item item : items) {

            writer.println(
                    item.getId() + "," +
                            item.getSku() + "," +
                            item.getName() + "," +
                            item.getCategory() + "," +
                            item.getQuantity() + "," +
                            item.getThreshold() + "," +
                            item.getUnitPrice()
            );
        }

        // Send data to client
        writer.flush();
    }

    // =========================
    // CATEGORY-WISE STOCK VALUE API
    // =========================
    @GetMapping("/category-stock-value")
    public List<CategoryStockValueDTO> getCategoryStockValue() {

        return itemService.getCategoryStockValue();
    }
}