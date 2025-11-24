import type { EmailMessage } from '@/constants/types';

export function getFilteredSearchResults(
  filteredEmails: EmailMessage[],
  searchQuery: string,
  appliedLabelFilter: string | null,
  appliedAttachmentFilter: string | null,
  appliedContactFilter: { name: string; email: string } | null
): EmailMessage[] {
  let results = filteredEmails;

  // Apply label filter
  if (appliedLabelFilter) {
    switch (appliedLabelFilter) {
      case 'starred':
        results = results.filter(e => e.isStarred);
        break;
      case 'important':
        results = results.filter(e => e.priority === 'action' || e.subject.toLowerCase().includes('important'));
        break;
      case 'sent':
        // For demo, show empty or some sent-like emails
        results = [];
        break;
      case 'drafts':
        results = [];
        break;
      case 'purchases':
        results = results.filter(e => 
          e.subject.toLowerCase().includes('order') ||
          e.subject.toLowerCase().includes('receipt') ||
          e.subject.toLowerCase().includes('purchase')
        );
        break;
      case 'all':
        // Show all
        break;
      default:
        break;
    }
  }

  // Apply attachment filter
  if (appliedAttachmentFilter) {
    switch (appliedAttachmentFilter) {
      case 'any':
        results = results.filter(e => e.hasAttachments);
        break;
      case 'documents':
        results = results.filter(e => 
          e.hasAttachments && e.attachments?.some(a => 
            a.filename.match(/\.(doc|docx)$/i) ||
            a.mimeType.includes('msword') ||
            a.mimeType.includes('wordprocessingml')
          )
        );
        break;
      case 'images':
        results = results.filter(e => 
          e.hasAttachments && e.attachments?.some(a => 
            a.filename.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i) ||
            a.mimeType.startsWith('image/')
          )
        );
        break;
      case 'pdfs':
        results = results.filter(e => 
          e.hasAttachments && e.attachments?.some(a => 
            a.filename.match(/\.pdf$/i) ||
            a.mimeType === 'application/pdf'
          )
        );
        break;
      case 'videos':
        results = results.filter(e => 
          e.hasAttachments && e.attachments?.some(a => 
            a.filename.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i) ||
            a.mimeType.startsWith('video/')
          )
        );
        break;
      case 'slides':
        results = results.filter(e => 
          e.hasAttachments && e.attachments?.some(a => 
            a.filename.match(/\.(ppt|pptx)$/i) ||
            a.mimeType.includes('presentation')
          )
        );
        break;
      case 'sheets':
        results = results.filter(e => 
          e.hasAttachments && e.attachments?.some(a => 
            a.filename.match(/\.(xls|xlsx|csv)$/i) ||
            a.mimeType.includes('spreadsheet')
          )
        );
        break;
      default:
        results = results.filter(e => e.hasAttachments);
        break;
    }
  }

  // Apply contact filter (From/To)
  if (appliedContactFilter) {
    results = results.filter(e => 
      e.from.toLowerCase().includes(appliedContactFilter.email.toLowerCase()) ||
      e.from.toLowerCase().includes(appliedContactFilter.name.toLowerCase())
    );
  }

  // Apply text search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    results = results.filter(e =>
      e.subject.toLowerCase().includes(query) ||
      e.from.toLowerCase().includes(query) ||
      e.snippet.toLowerCase().includes(query)
    );
  }

  return results;
}

