
package ma.emsi.productsbackend.web;

import ma.emsi.productsbackend.model.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductRestController {

    private final List<Product> products =
            new CopyOnWriteArrayList<>(List.of(
                    new Product(1L, "Ordinateur Portable", 1300, true),
                    new Product(2L, "Imprimante Multifonction", 300, false),
                    new Product(3L, "Smartphone 5G", 800, true)
            ));

    private final AtomicLong nextId = new AtomicLong(4);

    @GetMapping
    public List<Product> getAllProducts() {
        return products;
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product) {

        if (product.getName() == null ||
                product.getName().isBlank() ||
                !Double.isFinite(product.getPrice()) ||
                product.getPrice() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        Product newProduct = new Product(
                nextId.getAndIncrement(),
                product.getName().trim(),
                product.getPrice(),
                product.isSelected()
        );

        products.add(newProduct);

        return ResponseEntity.status(201).body(newProduct);
    }

    @PatchMapping("/{id}/selected")
    public ResponseEntity<Product> updateSelection(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Boolean selected = body.get("selected");

        if (selected == null) {
            return ResponseEntity.badRequest().build();
        }

        for (Product product : products) {
            if (product.getId().equals(id)) {
                product.setSelected(selected);
                return ResponseEntity.ok(product);
            }
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        boolean removed = products.removeIf(
                product -> product.getId().equals(id)
        );

        return removed
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
