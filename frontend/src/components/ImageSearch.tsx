import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ProductCard } from './ProductCard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

interface Product {
  _id: string;
  nameEn: string;
  nameTa?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryId?: {
    nameEn: string;
    nameTa?: string;
  };
}

interface ImageSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImageSearch({ open, onOpenChange }: ImageSearchProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    setSearching(true);
    setSearchPerformed(false);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE}/api/image-search/search`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search');
      }

      setResults(data.products || []);
      setAnalysis(data.analysis || null);
      setSearchPerformed(true);

      if (data.products?.length === 0) {
        toast.info(data.message || 'No matching products found');
      } else {
        toast.success(`Found ${data.products.length} matching products`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to search for products');
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setResults([]);
    setAnalysis(null);
    setSearchPerformed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            Image Search
          </DialogTitle>
          <DialogDescription>
            Upload an image or take a photo to search for similar products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload Section */}
          {!selectedImage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload from device */}
              <Card 
                className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Upload className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Upload Image</h3>
                  <p className="text-sm text-gray-600">
                    Choose an image from your device
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Take photo */}
              <Card 
                className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg"
                onClick={() => cameraInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Camera className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Take Photo</h3>
                  <p className="text-sm text-gray-600">
                    Use your camera to capture an image
                  </p>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Image Preview */}
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {searching ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search Products
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                >
                  Choose Another
                </Button>
              </div>

              {/* Analysis Results */}
              {analysis && searchPerformed && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-blue-900 mb-3">
                      Image Analysis
                    </h4>
                    <div className="space-y-3">
                      {analysis.primaryTerm && (
                        <div>
                          <p className="text-xs text-blue-700 font-medium mb-1">
                            Primary Detection:
                          </p>
                          <Badge className="bg-blue-600 text-white">
                            {analysis.primaryTerm}
                          </Badge>
                        </div>
                      )}
                      {analysis.searchTerms && analysis.searchTerms.length > 0 && (
                        <div>
                          <p className="text-xs text-blue-700 font-medium mb-2">
                            Detected Terms:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.searchTerms.slice(0, 8).map((term: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Search Results */}
          {searchPerformed && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Search Results ({results.length})
                </h3>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <div key={product._id} className="transform hover:scale-105 transition-transform">
                      <Card className="h-full">
                        <CardContent className="p-4">
                          <img
                            src={product.imageUrl}
                            alt={product.nameEn}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                          <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                            {product.nameEn}
                          </h4>
                          {product.categoryId && (
                            <p className="text-xs text-gray-500 mb-2">
                              {product.categoryId.nameEn}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600">
                              Rs.{product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">
                                Rs.{product.originalPrice}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Products Found
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Try uploading a different image or adjust your search
                    </p>
                    <Button onClick={handleReset} variant="outline">
                      Try Another Image
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}






