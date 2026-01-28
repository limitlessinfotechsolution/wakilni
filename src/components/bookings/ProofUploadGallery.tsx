import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Plus, Image, Video, Loader2, X, Upload, Trash2, ZoomIn, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/lib/i18n';
import { useProofUpload } from '@/hooks/useProofUpload';
import { cn } from '@/lib/utils';

interface ProofItem {
  id: string;
  url: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
  file_type?: 'image' | 'video';
}

interface ProofUploadGalleryProps {
  bookingId: string;
  proofs: ProofItem[];
  canUpload: boolean;
  onUpdate: () => void;
}

export function ProofUploadGallery({ 
  bookingId, 
  proofs, 
  canUpload, 
  onUpdate 
}: ProofUploadGalleryProps) {
  const { isRTL } = useLanguage();
  const { uploadProof, deleteProof, isUploading, uploadProgress } = useProofUpload(bookingId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<ProofItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) return;

    const success = await uploadProof(selectedFile, description.trim());
    if (success) {
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsDialogOpen(false);
      onUpdate();
    }
  };

  const handleDelete = async (proofId: string) => {
    const success = await deleteProof(proofId);
    if (success) {
      onUpdate();
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isVideo = (file: File | null) => file?.type.startsWith('video/');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            {isRTL ? 'معرض الإثباتات' : 'Proof Gallery'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRTL 
              ? 'صور وفيديوهات توثق إتمام الخدمة'
              : 'Photos and videos documenting service completion'}
          </p>
        </div>
        {canUpload && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {isRTL ? 'إضافة إثبات' : 'Add Proof'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  {isRTL ? 'رفع إثبات الخدمة' : 'Upload Service Proof'}
                </DialogTitle>
                <DialogDescription>
                  {isRTL 
                    ? 'أضف صورة أو فيديو كدليل على إتمام الخدمة'
                    : 'Add a photo or video as proof of service completion'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* File Upload Area */}
                <div 
                  className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all cursor-pointer',
                    selectedFile 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {previewUrl ? (
                    <div className="relative">
                      {isVideo(selectedFile) ? (
                        <video 
                          src={previewUrl} 
                          className="w-full h-48 object-cover rounded-xl"
                          controls
                        />
                      ) : (
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 end-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelection();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute bottom-2 start-2 gap-1">
                        {isVideo(selectedFile) ? (
                          <><Video className="h-3 w-3" /> Video</>
                        ) : (
                          <><Image className="h-3 w-3" /> Image</>
                        )}
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-3">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium">
                        {isRTL ? 'اضغط لاختيار ملف' : 'Click to select a file'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isRTL 
                          ? 'صور (JPG, PNG) أو فيديو (MP4) حتى 50 ميجا'
                          : 'Images (JPG, PNG) or Video (MP4) up to 50MB'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Textarea
                    placeholder={isRTL ? 'وصف الإثبات...' : 'Describe this proof...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {isRTL ? 'جاري الرفع...' : 'Uploading...'} {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || !selectedFile || !description.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isRTL ? 'رفع الإثبات' : 'Upload Proof'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Gallery Grid */}
      {proofs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Image className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">
                {isRTL 
                  ? 'لم يتم رفع أي إثباتات بعد'
                  : 'No proofs uploaded yet'}
              </p>
              <p className="text-sm mt-1">
                {isRTL 
                  ? 'ستظهر الصور والفيديوهات هنا'
                  : 'Photos and videos will appear here'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className="group relative rounded-xl overflow-hidden border bg-card aspect-square cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => setSelectedMedia(proof)}
            >
              {proof.file_type === 'video' ? (
                <div className="relative w-full h-full bg-muted">
                  <video
                    src={proof.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary ms-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={proof.url}
                  alt={proof.description}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {proof.description}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    {format(new Date(proof.uploaded_at), 'PP')}
                  </p>
                </div>
                <div className="absolute top-2 end-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMedia(proof);
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {canUpload && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {isRTL ? 'حذف الإثبات؟' : 'Delete Proof?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {isRTL 
                              ? 'هذا الإجراء لا يمكن التراجع عنه'
                              : 'This action cannot be undone'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {isRTL ? 'إلغاء' : 'Cancel'}
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(proof.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            {isRTL ? 'حذف' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              {/* Type Badge */}
              <Badge 
                variant="secondary" 
                className="absolute top-2 start-2 gap-1 text-xs"
              >
                {proof.file_type === 'video' ? (
                  <Video className="h-3 w-3" />
                ) : (
                  <Image className="h-3 w-3" />
                )}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Full Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.description}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {selectedMedia.file_type === 'video' ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  {isRTL ? 'تم الرفع في' : 'Uploaded on'}{' '}
                  {format(new Date(selectedMedia.uploaded_at), 'PPp')}
                </DialogDescription>
              </DialogHeader>
              <div className="relative overflow-hidden rounded-lg">
                {selectedMedia.file_type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    className="w-full max-h-[60vh] object-contain bg-black"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.description}
                    className="w-full max-h-[60vh] object-contain"
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
