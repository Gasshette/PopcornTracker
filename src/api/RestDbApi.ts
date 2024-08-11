import { RESTDB_URL } from '../const';
import { DocumentResponse } from '../types/Document';

export async function getDocument(
  userId: string,
  apiKey: string
): Promise<Array<DocumentResponse> | undefined> {
  const response: Response = await fetch(
    `${RESTDB_URL}?q={"userId":"${userId}"}`,
    {
      headers: {
        'x-apikey': `${apiKey}`,
      },
    }
  );

  if (response.ok) {
    return await response.json();
  }
}
