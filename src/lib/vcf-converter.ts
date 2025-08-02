export interface Contact {
  firstName: string;
  lastName: string;
  phone1: string;
  phone2: string;
  phone3: string;
  email1: string;
  email2: string;
  email3: string;
  addresses: string;
}

function parseName(fullName: string): [string, string] {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return [firstName, lastName];
}

function parseVCard(vcardText: string): Contact {
  const lines = vcardText.split(/\r\n|\r|\n/);
  let fullName = '';
  const phoneNumbers: string[] = [];
  const emails: string[] = [];
  const addresses: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('FN:')) {
      fullName = trimmedLine.substring(3);
    } else if (trimmedLine.startsWith('TEL:') || trimmedLine.includes('TEL;')) {
      const phoneMatch = trimmedLine.match(/TEL[^:]*:(.+)/);
      if (phoneMatch) {
        phoneNumbers.push(phoneMatch[1].trim());
      }
    } else if (trimmedLine.startsWith('EMAIL:') || trimmedLine.includes('EMAIL;')) {
      const emailMatch = trimmedLine.match(/EMAIL[^:]*:(.+)/);
      if (emailMatch) {
        emails.push(emailMatch[1].trim());
      }
    } else if (trimmedLine.startsWith('ADR:') || trimmedLine.includes('ADR;')) {
      const adrMatch = trimmedLine.match(/ADR[^:]*:(.+)/);
      if (adrMatch) {
        const addrParts = adrMatch[1].split(';').filter(part => part.trim());
        if (addrParts.length > 0) {
          addresses.push(addrParts.join(', '));
        }
      }
    }
  }

  const [firstName, lastName] = parseName(fullName);

  return {
    firstName,
    lastName,
    phone1: phoneNumbers[0] || '',
    phone2: phoneNumbers[1] || '',
    phone3: phoneNumbers[2] || '',
    email1: emails[0] || '',
    email2: emails[1] || '',
    email3: emails[2] || '',
    addresses: addresses.join(', ')
  };
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
  const headers = [
    'First Name',
    'Last Name', 
    'Phone 1',
    'Phone 2',
    'Phone 3',
    'Email 1',
    'Email 2',
    'Email 3',
    'Addresses'
  ];

  const csvLines = [headers.join(',')];

  for (const contact of contacts) {
    const row = [
      `"${contact.firstName}"`,
      `"${contact.lastName}"`,
      `"${contact.phone1}"`,
      `"${contact.phone2}"`,
      `"${contact.phone3}"`,
      `"${contact.email1}"`,
      `"${contact.email2}"`,
      `"${contact.email3}"`,
      `"${contact.addresses}"`
    ];
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