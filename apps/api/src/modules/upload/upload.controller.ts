import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadImage(
    @UploadedFile() file: any,
    @Query('folder') folder?: string,
  ) {
    const data = await this.uploadService.uploadImage(file, folder);
    return { message: 'Image uploaded successfully', data };
  }

  @Delete('image/:publicId')
  @ApiOperation({ summary: 'Delete image' })
  async deleteImage(@Param('publicId') publicId: string) {
    return this.uploadService.deleteImage(publicId);
  }
}
