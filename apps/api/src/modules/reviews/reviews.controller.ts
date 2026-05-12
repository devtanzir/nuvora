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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get rating summary' })
  async getSummary(@Param('productId') productId: string) {
    const data = await this.reviewsService.getSummary(productId);
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'Get product reviews' })
  async getReviews(
    @Param('productId') productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
  ) {
    const data = await this.reviewsService.getReviews(
      productId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      sort,
    );
    return { data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit review' })
  async createReview(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const data = await this.reviewsService.createReview(userId, productId, dto);
    return { message: 'Review submitted successfully', data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Edit own review' })
  async updateReview(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const data = await this.reviewsService.updateReview(userId, productId, reviewId, dto);
    return { message: 'Review updated successfully', data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete own review' })
  async deleteReview(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Param('id') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(userId, productId, reviewId);
  }
}
