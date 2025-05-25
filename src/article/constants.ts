type ErrorCaseKeys = 'notFoundById' | 'cantEdit' | 'cantDelete';
type ResponseCaseKeys = 'created' | 'updated' | 'deleted';

export const articleResponseMessages: Record<ResponseCaseKeys, string> = {
  created: 'Article created',
  updated: 'Article updated',
  deleted: 'Article deleted',
};

export const articleErrorMessages: Record<ErrorCaseKeys, string> = {
  notFoundById: 'Not found article by id',
  cantEdit: 'You dont have permission to edit article',
  cantDelete: 'You dont have  permission to delete article',
};
