import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active products' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getProducts(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getProducts(category, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get product statistics' })
  async getProductStats() {
    return this.productsService.getProductStats();
  }
}