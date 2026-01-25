import { useCallback, useState } from "react";
import { Upload, FileCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export const FileUpload = ({ onFileSelect, selectedFile }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validExtensions = [".txt", ".json"];
    const fileName = file.name.toLowerCase();
    return validExtensions.some((ext) => fileName.endsWith(ext));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files[0] && validateFile(files[0])) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  if (selectedFile) {
    return (
      <div className="relative bg-secondary/50 border-2 border-primary/30 rounded-xl p-6 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer group",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-secondary/30"
      )}
    >
      <input
        type="file"
        accept=".txt,.json"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload exported network data file"
      />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "p-4 rounded-full transition-all duration-300",
          isDragging ? "bg-primary/20" : "bg-secondary group-hover:bg-primary/10"
        )}>
          <Upload className={cn(
            "w-8 h-8 transition-all duration-300",
            isDragging ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary"
          )} />
        </div>
        <div>
          <p className="font-medium text-foreground mb-1">
            {isDragging ? "Drop your file here" : "Drag & drop your exported network data"}
          </p>
          <p className="text-sm text-muted-foreground">
            or <span className="text-primary font-medium">browse</span> to select a file
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports .txt and .json files exported from Wireshark
          </p>
        </div>
      </div>
    </div>
  );
};
