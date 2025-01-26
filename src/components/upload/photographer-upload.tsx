import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePhotographerUpload } from "@/hooks/use-photographer-upload";
import Image from "next/image";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UploadError } from "../../types/errors";

const possibleTags = [
  "Entrega de Kits Viernes",
  "Entrega de Kis Sabado",
  "Salida Meta",
  "Convivencia Centro de Convenciones", 
  "Entrada Lago",
  "Salida Lago",
  "Patrocinadores",
  "Rampa Centro de Convenciones",
  "Photo Opportunity 10k",
  "Entrada Laberinto",
  "Laberinto Juan Escumbia",
  "Laberinto Nido",
  "Generales",
  "Photo Opportunity 3k, 5k y 10k",
  "Rifa Ganadores"
];

export function PhotographerUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const { uploadImages, uploadProgress, clearProgress } = usePhotographerUpload();
  const { toast } = useToast();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    onDrop: (acceptedFiles) => {
      const validFiles = acceptedFiles.filter(file => 
        file.size <= 25 * 1024 * 1024 && 
        ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
      );

      if (validFiles.length !== acceptedFiles.length) {
        toast({
          title: "Archivos ignorados",
          description: "Algunos archivos fueron ignorados por ser demasiado grandes o de tipo inválido",
          variant: "destructive"
        });
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
    },
    disabled: Object.keys(uploadProgress).length > 0,
    maxSize: 25 * 1024 * 1024
  });

  const handleUpload = async () => {
    if (!selectedTag) {
      toast({
        title: "Error",
        description: "Debes seleccionar una zona/tag antes de subir las imágenes",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await uploadImages(selectedFiles, selectedTag);
      
      if (success) {
        setSelectedFiles([]);
        clearProgress();
        toast({
          title: "Éxito",
          description: "Imágenes subidas correctamente"
        });
      } else {
        toast({
          title: "Error",
          description: "Algunas imágenes no pudieron ser subidas",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      const uploadError = error as UploadError;
      toast({
        title: "Error",
        description: uploadError.message || "Error al subir las imágenes",
        variant: "destructive"
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const totalProgress = Object.values(uploadProgress).reduce((acc, curr) => {
    return acc + curr.progress;
  }, 0) / Math.max(Object.keys(uploadProgress).length, 1);

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <label className="block mb-2 font-semibold">Zona / Tag *</label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          required
        >
          <option value="">Seleccionar zona...</option>
          {possibleTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
        <input {...getInputProps()} />
        <p>Arrastra tus imágenes aquí o haz clic para seleccionarlas</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-4 bg-muted rounded-lg">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
            <span>{selectedFiles.length} archivos seleccionados</span>
            <Button 
              onClick={handleUpload}
              disabled={!selectedTag || Object.keys(uploadProgress).length > 0}
              className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white"
            >
              {Object.keys(uploadProgress).length > 0 ? 'Subiendo...' : `Subir ${selectedFiles.length} imágenes`}
            </Button>
          </div>
        </div>
      )}

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <Progress value={totalProgress} className="w-full" />
          <div className="text-sm text-center">
            Subiendo {Object.keys(uploadProgress).length} archivos ({Math.round(totalProgress)}%)
          </div>
        </div>
      )}
    </div>
  );
}