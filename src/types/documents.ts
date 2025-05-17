
export interface Document {
  id: string;
  filename: string;
  file_path: string;
}

export type DocumentType = 'invoice' | 'contract' | 'report';
