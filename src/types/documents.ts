
export interface Document {
  id: string;
  filename: string;
  file_path: string;
  created_at: string; // Add the missing created_at field
}

export type DocumentType = 'invoice' | 'contract' | 'report';
