import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ============================================================
  // Public Routes
  // ============================================================

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAll(query);
    return { data };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single product' })
  async findOne(@Param('slug') slug: string) {
    const data = await this.productsService.findOne(slug);
    return { data };
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get product variants' })
  async getVariants(@Param('id') id: string) {
    const data = await this.productsService.getVariants(id);
    return { data };
  }

  // ============================================================
  // Admin Routes
  // ============================================================

  @Get('admin/all')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Get all products including inactive - Admin only' })
async adminFindAll(@Query() query: ProductQueryDto) {
  const data = await this.productsService.adminFindAll(query);
  return { message: null, data };
}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create product - Admin only' })
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.create(dto);
    return { message: 'Product created successfully', data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product - Admin only' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.update(id, dto);
    return { message: 'Product updated successfully', data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product - Admin only' })
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Post(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add variant - Admin only' })
  async addVariant(
    @Param('id') id: string,
    @Body() dto: CreateVariantDto,
  ) {
    const data = await this.productsService.addVariant(id, dto);
    return { message: 'Variant added successfully', data };
  }

  @Patch(':id/variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update variant - Admin only' })
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    const data = await this.productsService.updateVariant(id, variantId, dto);
    return { message: 'Variant updated successfully', data };
  }

  @Delete(':id/variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete variant - Admin only' })
  async deleteVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productsService.deleteVariant(id, variantId);
  }

  @Get(':id/stock-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get stock logs - Admin only' })
  async getStockLogs(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.productsService.getStockLogs(
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return { data };
  }

  @Delete(':id/images/:imageId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Delete product image - Admin only' })
async deleteImage(
  @Param('id') productId: string,
  @Param('imageId') imageId: string,
) {
  return this.productsService.deleteImage(productId, imageId);
}

@Post(':id/images')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Add images to product - Admin only' })
async addImages(
  @Param('id') productId: string,
  @Body() body: { images: { url: string; isPrimary: boolean }[] },
) {
  const data = await this.productsService.addImages(productId, body.images);
  return { message: 'Images added', data };
}
}
