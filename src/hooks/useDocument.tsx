import { useQuery } from '@tanstack/react-query';
import { getDocument } from '../api/RestDbApi';
import { RESTDB_APIKEY } from '../const';
import { documentQueryKeys } from '../queryKeys/documentQueryKeys';

export const useDocument = (userId?: string) => {
  return useQuery({
    queryKey: documentQueryKeys.getDocument(userId),
    queryFn: () => getDocument(userId as string, RESTDB_APIKEY),
    enabled: !!userId,
  });
};
