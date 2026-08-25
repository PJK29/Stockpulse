import { Request, Response } from 'express';
import { productService } from '../services/productService.js';
import { orderService } from '../services/orderService.js';
import { ProductCategory, ProductLifecycle } from '../domain/types.js';

export class ProductController {
  public async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const {
        sku,
        name,
        category,
        currentPrice,
        stockLevel,
        reorderThreshold,
        costPrice,
        supplierId,
        marginFloor,
        competitorPrice,
      } = req.body;

      if (!sku || !name || !category || currentPrice === undefined || stockLevel === undefined || reorderThreshold === undefined) {
        res.status(400).json({ error: 'Missing required fields: sku, name, category, currentPrice, stockLevel, reorderThreshold' });
        return;
      }

      const product = await productService.createProduct({
        sku,
        name,
        category: category as ProductCategory,
        currentPrice: Number(currentPrice),
        stockLevel: Number(stockLevel),
        reorderThreshold: Number(reorderThreshold),
        costPrice: costPrice !== undefined ? Number(costPrice) : undefined,
        supplierId,
        marginFloor: marginFloor !== undefined ? Number(marginFloor) : undefined,
        competitorPrice: competitorPrice !== undefined ? Number(competitorPrice) : undefined,
      });

      res.status(201).json(product);
    } catch (err: any) {
      console.error('[ProductController.createProduct] Error:', err);
      res.status(400).json({ error: err.message || 'Failed to create product' });
    }
  }

  public async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { category, status, search } = req.query;

      const products = await productService.getProducts({
        category: category as ProductCategory,
        status: status as ProductLifecycle,
        search: search as string,
      });

      res.json(products);
    } catch (err: any) {
      console.error('[ProductController.getProducts] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to retrieve products' });
    }
  }

  public async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        res.status(404).json({ error: `Product with ID ${id} not found` });
        return;
      }

      res.json(product);
    } catch (err: any) {
      console.error('[ProductController.getProductById] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to retrieve product details' });
    }
  }

  public async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stockLevel } = req.body;

      if (stockLevel === undefined || isNaN(Number(stockLevel))) {
        res.status(400).json({ error: 'stockLevel number is required in request body' });
        return;
      }

      const updated = await productService.updateStock(id, Number(stockLevel));
      res.json(updated);
    } catch (err: any) {
      console.error('[ProductController.updateStock] Error:', err);
      res.status(400).json({ error: err.message || 'Failed to update stock' });
    }
  }

  public async simulateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const result = await orderService.simulateSale({
        productId: id,
        quantity: quantity ? Number(quantity) : 1,
      });

      res.status(201).json(result);
    } catch (err: any) {
      console.error('[ProductController.simulateOrder] Error:', err);
      res.status(400).json({ error: err.message || 'Failed to simulate sale order' });
    }
  }
}

export const productController = new ProductController();
