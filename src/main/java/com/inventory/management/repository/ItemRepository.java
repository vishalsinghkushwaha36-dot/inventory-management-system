package com.inventory.management.repository;

import com.inventory.management.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    // Find items where quantity is less than or equal to threshold
    List<Item> findByQuantityLessThanEqual(Integer threshold);

    // Search items by name
    List<Item> findByNameContainingIgnoreCase(String name);

    // Filter items by category
    List<Item> findByCategoryIgnoreCase(String category);
}