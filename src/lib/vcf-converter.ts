export interface Contact {
  [key: string]: string;
}

function parseName(fullName: string): [string, string] {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return [firstName, lastName];
}

function normalizeFieldName(vcfField: string): string {
  // Extract field type and parameters
  const [fieldType, ...params] = vcfField.split(';');
  
  // Map VCF field names to human-readable names
  const fieldMapping: { [key: string]: string } = {
    'FN': 'Full Name',
    'N': 'Name',
    'ORG': 'Organization',
    'TITLE': 'Title',
    'ROLE': 'Role',
    'BDAY': 'Birthday',
    'URL': 'Website',
    'NOTE': 'Notes',
    'NICKNAME': 'Nickname',
    'CATEGORIES': 'Categories'
  };

  let baseName = fieldMapping[fieldType] || fieldType;

  // Handle phone and email types with parameters
  if (fieldType === 'TEL') {
    baseName = 'Phone';
    const typeParam = params.find(p => p.startsWith('TYPE='));
    if (typeParam) {
      const type = typeParam.split('=')[1];
      baseName += ` ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`;
    }
  } else if (fieldType === 'EMAIL') {
    baseName = 'Email';
    const typeParam = params.find(p => p.startsWith('TYPE='));
    if (typeParam) {
      const type = typeParam.split('=')[1];
      baseName += ` ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`;
    }
  } else if (fieldType === 'ADR') {
    baseName = 'Address';
    const typeParam = params.find(p => p.startsWith('TYPE='));
    if (typeParam) {
      const type = typeParam.split('=')[1];
      baseName += ` ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`;
    }
  }

  return baseName;
}

function parseVCard(vcardText: string): Contact {
  const lines = vcardText.split(/\r\n|\r|\n/);
  const contact: Contact = {};
  const fieldCounts: { [key: string]: number } = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine === 'BEGIN:VCARD' || trimmedLine === 'END:VCARD' || trimmedLine.startsWith('VERSION:')) {
      continue;
    }

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const fieldPart = trimmedLine.substring(0, colonIndex);
    const value = trimmedLine.substring(colonIndex + 1).trim();

    if (!value) continue;

    // Handle name specially
    if (fieldPart === 'FN') {
      const [firstName, lastName] = parseName(value);
      contact['First Name'] = firstName;
      contact['Last Name'] = lastName;
      continue;
    }

    // Handle structured name (N field)
    if (fieldPart === 'N') {
      const nameParts = value.split(';');
      if (nameParts[1] && !contact['First Name']) contact['First Name'] = nameParts[1];
      if (nameParts[0] && !contact['Last Name']) contact['Last Name'] = nameParts[0];
      continue;
    }

    // Handle addresses specially
    if (fieldPart.startsWith('ADR')) {
      const addrParts = value.split(';').filter(part => part.trim());
      if (addrParts.length > 0) {
        const normalizedField = normalizeFieldName(fieldPart);
        const fieldKey = normalizedField;
        
        if (!fieldCounts[fieldKey]) fieldCounts[fieldKey] = 0;
        fieldCounts[fieldKey]++;
        
        const finalFieldName = fieldCounts[fieldKey] > 1 ? `${fieldKey} ${fieldCounts[fieldKey]}` : fieldKey;
        contact[finalFieldName] = addrParts.join(', ');
      }
      continue;
    }

    // Handle all other fields
    const normalizedField = normalizeFieldName(fieldPart);
    
    if (!fieldCounts[normalizedField]) fieldCounts[normalizedField] = 0;
    fieldCounts[normalizedField]++;
    
    const finalFieldName = fieldCounts[normalizedField] > 1 ? `${normalizedField} ${fieldCounts[normalizedField]}` : normalizedField;
    contact[finalFieldName] = value;
  }

  // Ensure First Name and Last Name exist
  if (!contact['First Name']) contact['First Name'] = '';
  if (!contact['Last Name']) contact['Last Name'] = '';

  return contact;
}

export function parseVCF(vcfContent: string): Contact[] {
  const contacts: Contact[] = [];
  const vcardBlocks = vcfContent.split(/BEGIN:VCARD/i).slice(1);

  for (const block of vcardBlocks) {
    const fullVCard = 'BEGIN:VCARD' + block;
    const contact = parseVCard(fullVCard);
    contacts.push(contact);
  }

  return contacts;
}

export function convertToCSV(contacts: Contact[]): string {
  // Collect all unique field names across all contacts
  const allFields = new Set<string>();
  
  for (const contact of contacts) {
    Object.keys(contact).forEach(field => allFields.add(field));
  }
  
  // Sort fields with First Name and Last Name first, then alphabetically
  const sortedFields = Array.from(allFields).sort((a, b) => {
    if (a === 'First Name') return -1;
    if (b === 'First Name') return 1;
    if (a === 'Last Name') return -1;
    if (b === 'Last Name') return 1;
    return a.localeCompare(b);
  });

  const csvLines = [sortedFields.join(',')];

  for (const contact of contacts) {
    const row = sortedFields.map(field => {
      const value = contact[field] || '';
      // Escape quotes and wrap in quotes for CSV format
      const escapedValue = value.replace(/"/g, '""');
      return `"${escapedValue}"`;
    });
    csvLines.push(row.join(','));
  }

  return csvLines.join('\n');
}

export function downloadCSV(csvContent: string, filename: string = 'contacts.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareCSV(csvContent: string, filename: string = 'contacts.csv'): Promise<void> {
  if (navigator.share) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], filename, { type: 'text/csv' });
    
    try {
      await navigator.share({
        files: [file],
        title: 'VCF Contacts converted to CSV',
        text: 'Here are your contacts exported from VCF to CSV format'
      });
    } catch (error) {
      // Fallback to download if sharing fails
      downloadCSV(csvContent, filename);
    }
  } else {
    // Fallback to download if Web Share API is not supported
    downloadCSV(csvContent, filename);
  }
}