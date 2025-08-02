import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseVCF, convertToCSV, downloadCSV, shareCSV, Contact } from '@/lib/vcf-converter';
import { Upload, Download, Share2, FileText } from 'lucide-react';

const VCFConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [csvContent, setCsvContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.vcf')) {
        setSelectedFile(file);
        setContacts([]);
        setCsvContent('');
        toast({
          title: "File selected",
          description: `${file.name} is ready for conversion`
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a VCF file",
          variant: "destructive"
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a VCF file first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const fileContent = await selectedFile.text();
      const parsedContacts = parseVCF(fileContent);
      const csv = convertToCSV(parsedContacts);
      
      setContacts(parsedContacts);
      setCsvContent(csv);
      
      toast({
        title: "Conversion successful!",
        description: `Converted ${parsedContacts.length} contacts to CSV format`
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "There was an error processing your VCF file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!csvContent) {
      toast({
        title: "No CSV data",
        description: "Please convert a VCF file first",
        variant: "destructive"
      });
      return;
    }

    try {
      await shareCSV(csvContent, `${selectedFile?.name.replace('.vcf', '')}_contacts.csv`);
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share the file",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    if (!csvContent) {
      toast({
        title: "No CSV data",
        description: "Please convert a VCF file first",
        variant: "destructive"
      });
      return;
    }

    downloadCSV(csvContent, `${selectedFile?.name.replace('.vcf', '')}_contacts.csv`);
    toast({
      title: "File saved",
      description: "CSV file has been downloaded"
    });
  };

  return (
    <div className="min-h-screen converter-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-converter-text mb-2">
            VCF&CSV Converter
          </h1>
          <p className="text-converter-text-muted text-lg">
            📋 Select the VCF file to convert
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* File Selection */}
          <Button
            onClick={handleFileSelect}
            variant="converter"
            size="xl"
            className="w-full"
            disabled={isProcessing}
          >
            <Upload className="w-5 h-5" />
            {selectedFile ? selectedFile.name : 'Select VCF file'}
          </Button>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            variant="converter"
            size="xl"
            className="w-full"
            disabled={!selectedFile || isProcessing}
          >
            <FileText className="w-5 h-5" />
            {isProcessing ? 'Converting...' : 'Convert to CSV'}
          </Button>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            variant="converter"
            size="xl"
            className="w-full"
            disabled={!csvContent || isProcessing}
          >
            <Share2 className="w-5 h-5" />
            Share CSV
          </Button>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            variant="converter"
            size="xl"
            className="w-full"
            disabled={!csvContent || isProcessing}
          >
            <Download className="w-5 h-5" />
            Save CSV
          </Button>
        </div>

        {/* Status */}
        {contacts.length > 0 && (
          <div className="mt-8 p-4 bg-converter-surface/80 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-converter-text text-center">
              ✅ Successfully converted {contacts.length} contacts
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".vcf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default VCFConverter;