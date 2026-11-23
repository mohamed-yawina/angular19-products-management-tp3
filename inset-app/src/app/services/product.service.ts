
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
  selected: boolean;
}

export type NewProduct = Omit<Product, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private host = 'http://localhost:8083';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.host}/products`
    );
  }

  addProduct(product: NewProduct): Observable<Product> {
    return this.http.post<Product>(
      `${this.host}/products`,
      product
    );
  }

  updateSelection(
    product: Product
  ): Observable<Product> {
    return this.http.patch<Product>(
      `${this.host}/products/${product.id}/selected`,
      { selected: !product.selected }
    );
  }

  deleteProduct(product: Product): Observable<void> {
    return this.http.delete<void>(
      `${this.host}/products/${product.id}`
    );
  }
}
