package com.inventory.management.service;

import com.inventory.management.entity.Supplier;
import com.inventory.management.repository.InventoryTransactionRepository;
import com.inventory.management.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final InventoryTransactionRepository transactionRepository;

    public SupplierService(
            SupplierRepository supplierRepository,
            InventoryTransactionRepository transactionRepository) {

        this.supplierRepository = supplierRepository;
        this.transactionRepository = transactionRepository;
    }

    // =========================
    // GET ALL SUPPLIERS
    // =========================

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    // =========================
    // ADD SUPPLIER
    // =========================

    public Supplier addSupplier(Supplier supplier) {

        if (supplier == null) {
            throw new RuntimeException(
                    "Supplier data is required"
            );
        }

        validateSupplier(supplier);

        String email = supplier.getEmail().trim();

        // Check duplicate email
        boolean emailExists =
                supplierRepository.findAll()
                        .stream()
                        .anyMatch(existingSupplier ->
                                existingSupplier.getEmail() != null &&
                                        existingSupplier.getEmail()
                                                .trim()
                                                .equalsIgnoreCase(email)
                        );

        if (emailExists) {
            throw new RuntimeException(
                    "Supplier email already exists"
            );
        }

        // Clean input data
        supplier.setName(
                supplier.getName().trim()
        );

        supplier.setCompany(
                supplier.getCompany().trim()
        );

        supplier.setContact(
                supplier.getContact().trim()
        );

        supplier.setEmail(email);

        return supplierRepository.save(supplier);
    }

    // =========================
    // UPDATE SUPPLIER
    // =========================

    public Supplier updateSupplier(
            Long id,
            Supplier updatedSupplier) {

        // Find existing supplier
        Supplier existingSupplier =
                supplierRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Supplier not found"
                                )
                        );

        if (updatedSupplier == null) {
            throw new RuntimeException(
                    "Supplier data is required"
            );
        }

        // Validate updated data
        validateSupplier(updatedSupplier);

        String name =
                updatedSupplier.getName().trim();

        String company =
                updatedSupplier.getCompany().trim();

        String contact =
                updatedSupplier.getContact().trim();

        String email =
                updatedSupplier.getEmail().trim();

        // =========================
        // CHECK DUPLICATE EMAIL
        // =========================

        boolean duplicateEmail =
                supplierRepository.findAll()
                        .stream()
                        .anyMatch(supplier ->
                                !supplier.getId().equals(id) &&
                                        supplier.getEmail() != null &&
                                        supplier.getEmail()
                                                .trim()
                                                .equalsIgnoreCase(email)
                        );

        if (duplicateEmail) {
            throw new RuntimeException(
                    "Supplier email already exists"
            );
        }

        // =========================
        // UPDATE SUPPLIER DATA
        // =========================

        existingSupplier.setName(name);
        existingSupplier.setCompany(company);
        existingSupplier.setContact(contact);
        existingSupplier.setEmail(email);

        return supplierRepository.save(
                existingSupplier
        );
    }

    // =========================
    // DELETE SUPPLIER
    // =========================

    public void deleteSupplier(Long id) {

        // Find supplier
        Supplier supplier =
                supplierRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Supplier not found"
                                )
                        );

        // =========================
        // CHECK TRANSACTION HISTORY
        // =========================

        boolean hasTransactions =
                transactionRepository.findAll()
                        .stream()
                        .anyMatch(transaction ->
                                transaction.getSupplier() != null &&
                                        transaction.getSupplier()
                                                .getId()
                                                .equals(id)
                        );

        // =========================
        // BLOCK DELETE IF HISTORY EXISTS
        // =========================

        if (hasTransactions) {
            throw new RuntimeException(
                    "Cannot delete supplier because transaction history exists"
            );
        }

        // =========================
        // DELETE SUPPLIER
        // =========================

        supplierRepository.delete(supplier);
    }

    // =========================
    // SUPPLIER VALIDATION
    // =========================

    private void validateSupplier(
            Supplier supplier) {

        // Supplier Name
        if (supplier.getName() == null ||
                supplier.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Supplier name is required"
            );
        }

        // Company
        if (supplier.getCompany() == null ||
                supplier.getCompany().trim().isEmpty()) {

            throw new RuntimeException(
                    "Company is required"
            );
        }

        // Contact
        if (supplier.getContact() == null ||
                supplier.getContact().trim().isEmpty()) {

            throw new RuntimeException(
                    "Contact is required"
            );
        }

        // Email
        if (supplier.getEmail() == null ||
                supplier.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }
    }
}