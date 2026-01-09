import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X, Check, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  firstName: string;
  lastName: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  onClose: () => void;
}

// Helper function to convert file to canvas and crop it
const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No 2d context'));
      return;
    }

    // Validate crop dimensions
    if (crop.width <= 0 || crop.height <= 0) {
      reject(new Error('Invalid crop dimensions'));
      return;
    }

    console.log('Creating canvas for cropping...');
    console.log('Original image:', image.naturalWidth, 'x', image.naturalHeight);
    console.log('Crop area:', crop);

    // Use the crop dimensions directly
    canvas.width = Math.round(crop.width);
    canvas.height = Math.round(crop.height);

    console.log('Canvas size set to:', canvas.width, 'x', canvas.height);

    // Calculate scaling factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    console.log('Scale factors:', scaleX, scaleY);

    // Draw the cropped portion
    try {
      ctx.drawImage(
        image,
        Math.round(crop.x * scaleX),
        Math.round(crop.y * scaleY),
        Math.round(crop.width * scaleX),
        Math.round(crop.height * scaleY),
        0,
        0,
        canvas.width,
        canvas.height
      );

      console.log('Image drawn to canvas, converting to blob...');

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas toBlob returned null');
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          console.log('Successfully created blob:', blob.size, 'bytes, type:', blob.type);
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    } catch (drawError) {
      console.error('Error drawing to canvas:', drawError);
      reject(drawError);
    }
  });
};

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  firstName,
  lastName,
  onAvatarUpdate,
  onClose
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getInitials = useCallback(() => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, [firstName, lastName]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError(t('profile.validation.invalidFileType') || 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t('profile.validation.fileTooLarge') || 'File size must be less than 5MB');
      return;
    }

    console.log('File selected:', file.name, file.size, 'bytes', file.type);

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [t]);

  // Backup upload method without cropping for debugging
  const handleDirectUpload = useCallback(async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.[0]) return;

    const file = fileInput.files[0];
    console.log('Direct upload of file:', file);

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      console.log('Direct upload FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const uploadResponse = await api.post('/storage/upload/image', formData, {
        headers: {
          // Let browser set Content-Type automatically with boundary
        },
      });

      console.log('Direct upload response:', uploadResponse.data);

      if (uploadResponse.data.result === 'OK' && uploadResponse.data.data) {
        const avatarUrl = uploadResponse.data.data;
        console.log('Direct upload successful, updating profile...');
        onAvatarUpdate(avatarUrl);
        // Modal will be closed by the parent component after profile update
      } else {
        throw new Error('Upload failed: Invalid response');
      }
    } catch (error) {
      console.error('Error in direct upload:', error);
      setUploadError(t('profile.validation.uploadFailed') || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onAvatarUpdate, onClose, t]);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a circular crop
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // aspect ratio for circle
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, []);

  // Handle crop upload
  const handleUpload = useCallback(async () => {
    if (!imgRef.current || !completedCrop || !selectedImage) {
      console.error('Missing required data for upload:', {
        imgRef: !!imgRef.current,
        completedCrop: !!completedCrop,
        selectedImage: !!selectedImage
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      console.log('Starting image crop and upload...');
      console.log('Crop data:', completedCrop);
      console.log('Image element:', imgRef.current);
      console.log('Image natural dimensions:', imgRef.current.naturalWidth, 'x', imgRef.current.naturalHeight);
      console.log('Image display dimensions:', imgRef.current.width, 'x', imgRef.current.height);

      let fileToUpload: Blob;
      
      try {
        // Try to get cropped image blob
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        console.log('Cropped image blob:', croppedImageBlob);
        console.log('Blob size:', croppedImageBlob.size);
        console.log('Blob type:', croppedImageBlob.type);

        // Verify blob is valid
        if (!croppedImageBlob || croppedImageBlob.size === 0) {
          throw new Error('Generated blob is empty or invalid');
        }
        
        fileToUpload = croppedImageBlob;
      } catch (cropError) {
        console.warn('Cropping failed, using original file:', cropError);
        // Fallback to original file
        const fileInput = fileInputRef.current;
        if (!fileInput?.files?.[0]) {
          throw new Error('No original file available as fallback');
        }
        fileToUpload = fileInput.files[0];
      }

      // Create FormData for upload
      const formData = new FormData();
      
      // Try multiple ways to ensure the file is properly appended
      console.log('Appending file to FormData...');
      console.log('File to upload:', fileToUpload);
      console.log('File size:', fileToUpload.size);
      console.log('File type:', fileToUpload.type);
      
      // If we have a blob from cropping, convert it to a File object for better compatibility
      if (fileToUpload instanceof Blob && !(fileToUpload instanceof File)) {
        const file = new File([fileToUpload], 'avatar.jpg', { 
          type: fileToUpload.type || 'image/jpeg',
          lastModified: Date.now() 
        });
        formData.append('file', file);
        console.log('Appended as File object:', file);
      } else {
        formData.append('file', fileToUpload);
        console.log('Appended as is:', fileToUpload);
      }
      
      // Verify FormData was created properly
      console.log('FormData created. Checking entries...');
      const entries = Array.from(formData.entries());
      console.log('FormData entries count:', entries.length);
      
      for (const [key, value] of entries) {
        console.log(`FormData entry - ${key}:`, value);
        if (value && typeof value === 'object' && 'size' in value) {
          console.log(`  - Type: ${value.constructor.name}`);
          console.log(`  - Size: ${(value as any).size} bytes`);
          console.log(`  - MIME type: ${(value as any).type}`);
          if ('name' in value) {
            console.log(`  - Name: ${(value as any).name}`);
          }
        }
      }

      // Also check if FormData has the key
      console.log('FormData has "file" key:', formData.has('file'));
      const fileFromFormData = formData.get('file');
      console.log('File retrieved from FormData:', fileFromFormData);

      console.log('Uploading to /storage/upload/image...');

      // Upload image - don't set Content-Type manually, let browser set it with boundary
      const uploadResponse = await api.post('/storage/upload/image', formData, {
        headers: {
          // Let browser set Content-Type automatically with boundary
        },
      });

      console.log('Upload response:', uploadResponse.data);

      // Check if upload was successful
      if (uploadResponse.data.result === 'OK' && uploadResponse.data.data) {
        const avatarUrl = uploadResponse.data.data;
        console.log('Upload successful, avatar URL:', avatarUrl);
        console.log('Updating profile with new avatar...');
        onAvatarUpdate(avatarUrl);
        // Modal will be closed by the parent component after profile update
      } else {
        console.error('Upload failed - invalid response:', uploadResponse.data);
        throw new Error('Upload failed: Invalid response');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError(t('profile.validation.uploadFailed') || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [completedCrop, selectedImage, onAvatarUpdate, onClose, t]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('profile.edit.uploadAvatar')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Avatar Preview */}
          <div className="text-center">
            <div className="relative inline-block">
              {currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt="Current avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">
                    {getInitials()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {t('profile.edit.currentAvatar') || 'Current Avatar'}
            </p>
          </div>

          {/* File Upload */}
          {!selectedImage && (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t('profile.edit.selectImage') || 'Select Image'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {t('profile.edit.imageRequirements') || 'Max 5MB • JPG, PNG, GIF'}
              </p>
            </div>
          )}

          {/* Image Cropping */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t('profile.edit.cropInstruction') || 'Adjust the crop area for your avatar'}
                </p>
              </div>
              
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-full max-h-64 object-contain"
                  />
                </ReactCrop>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setCrop(undefined);
                    setCompletedCrop(undefined);
                    setUploadError(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('profile.actions.cancel')}
                </button>
                <button
                  onClick={handleDirectUpload}
                  disabled={isUploading}
                  className="px-3 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Test Direct Upload
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!completedCrop || isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('profile.actions.saving')}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('profile.actions.save')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload; 