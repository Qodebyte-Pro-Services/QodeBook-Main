import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const MAX_VARIANT_IMAGES = 4;

// Type definitions
interface ImageState {
  name: string;
  file: File | null;
  preview: string;
  url: string | null;
  id: string | null;
  error: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  isMain?: boolean;
}

interface VariantCombination {
  id: string;
  attributes: Record<string, string>;
  price: string;
  quantity: string;
  sku: string;
  weight: string;
  images: ImageState[];
}

interface ImageStateProps {
  isCreatingProduct: boolean;
}

interface ImageUploadComponentProps {
  index: number;
  image: ImageState;
  onImageStateChange: (newState: Partial<ImageState>) => void;
  onRemove: (imageId: string | null) => void;
  isSubmitting: boolean;
  isRemoving: boolean;
}

interface VariantsImageUploadProps {
  combinations: VariantCombination[];
  setCombinations: React.Dispatch<React.SetStateAction<VariantCombination[]>>;
  ImageUploadComponent: React.ComponentType<ImageUploadComponentProps>;
  imageState: ImageStateProps;
}

export default function VariantsImageUpload({
  combinations,
  setCombinations,
  ImageUploadComponent,
  imageState
}: VariantsImageUploadProps) {

  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const handleVariantImageStateChange = (variantId: string, imageIndex: number, newState: Partial<ImageState>) => {
    setCombinations(prevCombinations =>
      prevCombinations.map(combo => {
        if (combo.id === variantId) {
          const updatedImages = combo.images.map((img, i) =>
            i === imageIndex ? { ...img, ...newState } : img
          );
          return { ...combo, images: updatedImages };
        }
        return combo;
      })
    );
  };

  const handleAddVariantImageSlot = (variantId: string) => {
    setCombinations(prevCombinations =>
      prevCombinations.map(combo => {
        if (combo.id === variantId && combo.images.length < MAX_VARIANT_IMAGES) {
          const newImage: ImageState = {
            name: `variant_${variantId}_image_${combo.images.length}`,
            file: null,
            preview: '',
            url: null,
            id: null,
            error: null,
            status: 'idle',
            isMain: false
          };
          return { ...combo, images: [...combo.images, newImage] };
        }
        return combo;
      })
    );
  };

  const handleRemoveVariantImage = async (variantId: string, imageIndex: number, imageId: string | null) => {
    setIsRemoving(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      setCombinations(prevCombinations =>
        prevCombinations.map(combo => {
          if (combo.id === variantId) {
            let updatedImages;
            // For the first two slots, just clear them
            if (imageIndex < 2) {
              updatedImages = combo.images.map((img, i) =>
                i === imageIndex
                  ? { ...img, file: null, preview: '', url: null, id: null, error: null, status: 'idle' as const }
                  : img
              );
            } else {
              // For additional slots, remove them entirely
              updatedImages = combo.images.filter((_, i) => i !== imageIndex);
            }
            return { ...combo, images: updatedImages };
          }
          return combo;
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t">
      {combinations.map(combo => (
        <div key={combo.id} className="p-3 border rounded-md bg-gray-50/80">
          <h4 className="font-medium text-sm mb-2">
            {Object.values(combo.attributes).join(' / ')}
          </h4>
          <div className='grid grid-cols-2 gap-4'>
            {combo.images.map((image, index) => (
              <ImageUploadComponent
                key={image.name}
                index={index}
                image={image}
                isRemoving={isRemoving}
                onImageStateChange={(newState) => handleVariantImageStateChange(combo.id, index, newState)}
                onRemove={() => handleRemoveVariantImage(combo.id, index, image.id)}
                isSubmitting={imageState.isCreatingProduct}
              />
            ))}
          </div>
          {combo.images.length < MAX_VARIANT_IMAGES && (
            <Button
              type="button"
              variant="link"
              className="mt-2 text-sm"
              onClick={() => handleAddVariantImageSlot(combo.id)}
            >
              Add Image
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}