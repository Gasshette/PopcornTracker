import { useQuery } from '@tanstack/react-query';
import { getDocument } from '../api/RestDbApi';
import { RESTDB_APIKEY } from '../const';

export const useDocument = (userId?: string) => {
  const getDocuments = () => {
    return useQuery({
      queryKey: ['document', userId],
      queryFn: () => getDocument(userId as string, RESTDB_APIKEY),
      enabled: !!userId,
    });
  };

  return { getDocuments };
};
