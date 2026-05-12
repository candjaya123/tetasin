"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { receiptService } from "@/lib/api/receiptService";
import { useToast } from "@/hooks/use-toast";

export default function ScanReceipt() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await receiptService.scanReceipt(file);
      toast({
        title: "Berhasil",
        description: "Struk sedang diproses oleh AI. Cek statusnya di dashboard.",
      });
      router.push("/tenant/receipt");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal mengunggah struk.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tenant/receipt">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Scan Struk Baru</h1>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="p-10 text-center space-y-4">
          {!preview ? (
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Camera className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Ambil Foto atau Pilih Gambar</h3>
              <p className="text-muted-foreground text-sm mb-6">Pastikan tulisan pada struk terlihat jelas.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileChange}
                    capture="environment"
                  />
                  <Camera className="mr-2 h-4 w-4" /> Gunakan Kamera
                </Button>
                <Button variant="outline" className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Upload className="mr-2 h-4 w-4" /> Pilih File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-[3/4] max-h-[400px] mx-auto overflow-hidden rounded-lg border">
                <img src={preview} alt="Preview" className="object-contain w-full h-full" />
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => { setFile(null); setPreview(null); }}>
                  Ulangi
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Proses dengan AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-4 items-start">
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Loader2 className="h-4 w-4 text-blue-600 animate-pulse" />
        </div>
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Cara kerja AI Tumbuhin:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>AI mengekstrak merchant, tanggal, total, dan item.</li>
            <li>AI merekomendasikan kategori dan akun akuntansi.</li>
            <li>Anda tetap harus review sebelum masuk ke buku besar.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
