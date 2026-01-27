import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Image, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

interface ProofItem {
  id: string;
  url: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface ProofGalleryProps {
  proofs: ProofItem[];
  canUpload: boolean;
  onUpload: (url: string, description: string) => Promise<boolean>;
}

export function ProofGallery({ proofs, canUpload, onUpload }: ProofGalleryProps) {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<ProofItem | null>(null);

  const handleUpload = async () => {
    if (!description.trim()) return;

    setIsUploading(true);
    // Demo: Using placeholder image URL
    const demoUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
    const success = await onUpload(demoUrl, description.trim());
    if (success) {
      setDescription('');
      setIsDialogOpen(false);
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {isRTL ? 'معرض الإثباتات' : 'Proof Gallery'}
        </h3>
        {canUpload && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة إثبات' : 'Add Proof'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isRTL ? 'رفع إثبات الخدمة' : 'Upload Service Proof'}
                </DialogTitle>
                <DialogDescription>
                  {isRTL 
                    ? 'أضف صورة أو وثيقة كدليل على إتمام الخدمة'
                    : 'Add an image or document as proof of service completion'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Image className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? '(تجريبي) سيتم استخدام صورة عشوائية'
                      : '(Demo) A random image will be used'}
                  </p>
                </div>
                <Textarea
                  placeholder={isRTL ? 'وصف الإثبات...' : 'Proof description...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || !description.trim()}
                  className="w-full"
                >
                  {isUploading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                  {isRTL ? 'رفع الإثبات' : 'Upload Proof'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {proofs.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>
                {isRTL 
                  ? 'لم يتم رفع أي إثباتات بعد'
                  : 'No proofs uploaded yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden border"
              onClick={() => setSelectedImage(proof)}
            >
              <img
                src={proof.url}
                alt={proof.description}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="p-3 text-white w-full">
                  <p className="text-sm font-medium line-clamp-2">{proof.description}</p>
                  <p className="text-xs opacity-75">
                    {format(new Date(proof.uploaded_at), 'PP')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedImage.description}</DialogTitle>
                <DialogDescription>
                  {isRTL ? 'تم الرفع في' : 'Uploaded on'}{' '}
                  {format(new Date(selectedImage.uploaded_at), 'PPp')}
                </DialogDescription>
              </DialogHeader>
              <img
                src={selectedImage.url}
                alt={selectedImage.description}
                className="w-full rounded-lg"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
