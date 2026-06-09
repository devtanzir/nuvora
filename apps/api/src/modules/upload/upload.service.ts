import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import 'multer';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow('CLOUDINARY_API_SECRET'),
    });
  }

  // ============================================================
  // Upload Single Image
  // ============================================================

  async uploadImage(file: Express.Multer.File, folder: string = 'nuvora') {
    if (!file) throw new BadRequestException('No file provided');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(new BadRequestException(error.message));
            else
              resolve({
                url: result!.secure_url,
                publicId: result!.public_id,
              });
          },
        )
        .end(file.buffer);
    });
  }

  // ============================================================
  // Delete Image
  // ============================================================

  async deleteImage(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
    return { message: 'Image deleted successfully' };
  }
}
