package com.inventory.management.controller;

import com.inventory.management.entity.Supplier;
import com.inventory.management.service.SupplierService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(
            SupplierService supplierService) {

        this.supplierService = supplierService;
    }

    // =========================
    // GET ALL SUPPLIERS
    // =========================

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    // =========================
    // ADD SUPPLIER
    // =========================

    @PostMapping
    public Supplier addSupplier(
            @RequestBody Supplier supplier) {

        return supplierService.addSupplier(
                supplier
        );
    }

    // =========================
    // UPDATE SUPPLIER
    // =========================

    @PutMapping("/{id}")
    public Supplier updateSupplier(
            @PathVariable Long id,
            @RequestBody Supplier supplier) {

        return supplierService.updateSupplier(
                id,
                supplier
        );
    }

    // =========================
    // DELETE SUPPLIER
    // =========================

    @DeleteMapping("/{id}")
    public String deleteSupplier(
            @PathVariable Long id) {

        supplierService.deleteSupplier(id);

        return "Supplier deleted successfully";
    }
}