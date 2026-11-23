
import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Product,
  NewProduct,
  ProductService
} from '../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  products: Product[] | null = null;
  searchTerm = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  busyProductIds = new Set<number>();

  newProduct: NewProduct = {
    name: '',
    price: 0,
    selected: false
  };

  constructor(
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  get filteredProducts(): Product[] {
    return (this.products ?? []).filter(product =>
      product.name.toLowerCase().includes(
        this.searchTerm.trim().toLowerCase()
      )
    );
  }

  getProducts(): void {
    this.products = null;
    this.errorMessage = '';

    this.productService.getAllProducts().subscribe({
      next: data => {
        this.products = data;
      },
      error: err => {
        console.error(err);
        this.errorMessage =
          'Impossible de charger les produits.';
      }
    });
  }

  addProduct(): void {
    const name = this.newProduct.name.trim();

    if (!name ||
        !Number.isFinite(this.newProduct.price) ||
        this.newProduct.price <= 0 ||
        this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.addProduct({
      ...this.newProduct,
      name
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Produit ajouté avec succès.';

        this.newProduct = {
          name: '',
          price: 0,
          selected: false
        };

        this.getProducts();
      },
      error: err => {
        console.error(err);
        this.isSubmitting = false;
        this.errorMessage =
          "Erreur lors de l'ajout du produit.";
      }
    });
  }

  toggleSelection(product: Product): void {
    if (this.busyProductIds.has(product.id)) {
      return;
    }

    this.busyProductIds.add(product.id);
    this.errorMessage = '';

    this.productService.updateSelection(product).subscribe({
      next: updated => {
        this.products = (this.products ?? []).map(p =>
          p.id === updated.id ? updated : p
        );
        this.busyProductIds.delete(product.id);
      },
      error: err => {
        console.error(err);
        this.busyProductIds.delete(product.id);
        this.errorMessage =
          'Impossible de modifier la sélection.';
      }
    });
  }

  handleDelete(product: Product): void {
    const confirmation = confirm(
      'Voulez-vous vraiment supprimer ' +
      product.name + ' ?'
    );

    if (!confirmation ||
        this.busyProductIds.has(product.id)) {
      return;
    }

    this.busyProductIds.add(product.id);
    this.errorMessage = '';

    this.productService.deleteProduct(product).subscribe({
      next: () => {
        this.busyProductIds.delete(product.id);
        this.getProducts();
      },
      error: err => {
        console.error(err);
        this.busyProductIds.delete(product.id);
        this.errorMessage =
          'Erreur lors de la suppression.';
      }
    });
  }
}
