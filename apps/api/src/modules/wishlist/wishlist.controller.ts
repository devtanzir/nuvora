import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { MoveToCartDto } from './dto/move-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.wishlistService.getWishlist(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Add to wishlist' })
  async addToWishlist(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToWishlistDto,
  ) {
    const data = await this.wishlistService.addToWishlist(userId, dto);
    return { message: 'Product added to wishlist', data };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove from wishlist' })
  async removeFromWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Post(':productId/move-to-cart')
  @ApiOperation({ summary: 'Move to cart' })
  async moveToCart(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: MoveToCartDto,
  ) {
    const data = await this.wishlistService.moveToCart(userId, productId, dto);
    return { message: 'Product moved to cart', data };
  }
}
