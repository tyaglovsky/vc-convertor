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
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors group"
              aria-label="Website"
            >
              <svg className="w-5 h-5 text-converter-text group-hover:text-converter-text-muted transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="m2 12c0-2.3 2.3-4.5 6-6l8 12c-3.7 1.5-6-.7-6-3"/>
                <path d="m22 12c0 2.3-2.3 4.5-6 6l-8-12c3.7-1.5 6 .7 6 3"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/tyaglovsky/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors group"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5 text-converter-text group-hover:text-converter-text-muted transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/tyaglovsky/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors group"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5 text-converter-text group-hover:text-converter-text-muted transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a 
              href="https://www.threads.com/@tyaglovsky" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors group"
              aria-label="Threads"
            >
              <svg className="w-5 h-5 text-converter-text group-hover:text-converter-text-muted transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
                <path d="M8.5 12.5c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5"/>
                <path d="M12 9v6"/>
                <circle cx="12" cy="15.5" r="1.5"/>
              </svg>
            </a>
            <a 
              href="https://github.com/tyaglovsky" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors group"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5 text-converter-text group-hover:text-converter-text-muted transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </a>
            <a 
              href="https://apps.apple.com/us/app/vcf-csv-converter/id6743118383" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors group"
              aria-label="App Store"
            >
              <svg className="w-5 h-5 text-converter-text group-hover:text-converter-text-muted transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
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