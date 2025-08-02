import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseVCF, convertToCSV, downloadCSV, Contact } from '@/lib/vcf-converter';
import { Upload, Download, FileText, Mail, Linkedin, Instagram, Github, Smartphone, Globe } from 'lucide-react';

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
    <div className="min-h-screen liquid-glass flex items-center justify-center p-4">
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

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="mb-4">
            <p className="text-converter-text-muted text-sm mb-2">Contact Email:</p>
            <a 
              href="mailto:work@tyaglovsky.com" 
              className="inline-flex items-center gap-2 text-converter-text hover:text-converter-text-muted transition-colors"
            >
              <Mail className="w-4 h-4" />
              work@tyaglovsky.com
            </a>
          </div>
          
          
          <div className="flex justify-center items-center gap-3 mb-4">
            <a 
              href="https://tyaglovsky.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Website"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/tyaglovsky/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="https://www.instagram.com/tyaglovsky/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://www.threads.com/@tyaglovsky" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Threads"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.5c0-3.086.85-5.94 2.495-8.491C5.852 1.205 8.605.024 12.186 0h.007c3.581.024 6.334 1.205 8.184 3.509C21.65 5.56 22.5 8.414 22.5 11.5c0 3.086-.85 5.94-2.495 8.491C18.148 22.795 15.395 23.976 12.186 24zM12 2.047c-2.9.024-5.201.906-6.836 2.626C4.008 6.25 3.5 8.514 3.5 11.5s.508 5.25 1.664 6.827c1.635 1.72 3.936 2.602 6.836 2.626 2.9-.024 5.201-.906 6.836-2.626C19.992 16.75 20.5 14.486 20.5 11.5s-.508-5.25-1.664-6.827C17.201 2.953 14.9 2.071 12 2.047z"/>
              </svg>
            </a>
            <a 
              href="https://github.com/tyaglovsky" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://apps.apple.com/us/app/vcf-csv-converter/id6743118383" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="App Store"
            >
              <Smartphone className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-converter-text-muted text-xs">
            VCF&CSV Converter
          </p>
        </div>
      </div>
    </div>
  );
};

export default VCFConverter;