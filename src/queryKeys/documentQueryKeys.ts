export const documentQueryKeys = {
  default: () => ['Document'],
  getDocument: (userId?: string) => [documentQueryKeys.default(), userId],
};
