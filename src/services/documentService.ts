
import { supabase, PROJECT_ID } from "@/integrations/supabase/client";
import { Document, DocumentType } from "@/types/documents";
import { getBucketName } from "@/utils/documentUtils";

export const fetchDocuments = async (documentType: DocumentType, userId?: string): Promise<Document[]> => {
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No active session found');
      return [];
    }
    userId = session.user.id;
  }
  
  console.log(`Fetching ${documentType}s for user: ${userId}`);

  // Construct URL with query parameters
  const functionUrl = `https://${PROJECT_ID}.supabase.co/functions/v1/upload-file?userId=${userId}&type=${documentType}`;
  console.log('Edge Function URL:', functionUrl);

  const response = await fetch(functionUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Direct fetch error response:', errorText);
    throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`${documentType}s fetched successfully:`, data);
  return data || [];
};

export const uploadDocument = async (documentType: DocumentType, file: File, userId?: string): Promise<any> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");
  
  userId = userId || session.user.id;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', documentType);
  formData.append('userId', userId);

  console.log(`Uploading ${documentType} file:`, file.name);

  // Upload the file
  const response = await fetch(`https://${PROJECT_ID}.supabase.co/functions/v1/upload-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response from upload-file function:', errorText);
    throw new Error(`Error en la subida: ${response.status} ${errorText}`);
  }
  
  return await response.json();
};

export const deleteDocument = async (id: string): Promise<any> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");

  console.log(`Deleting document with ID:`, id);

  // Use the edge function to mark document as deleted
  const functionUrl = `https://${PROJECT_ID}.supabase.co/functions/v1/upload-file?id=${id}`;
  const response = await fetch(functionUrl, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en la eliminación: ${response.status} ${errorText}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error("Error al eliminar el documento");
  }
  
  return result;
};
