import { createAction, props } from '@ngrx/store';
import { SearchResult, FullDetails, SearchResponse } from '../../services/ombd/ombd.interface';

export const search = createAction('[Main] Search', props<{ searchTerm: string }>());
export const searchSuccess = createAction('[Main] Search success', props<{ searchResponse: SearchResponse }>());
export const loadMore = createAction('[Main] Load more');
export const selectResult = createAction('[Main] Select result', props<{ selectedResult: SearchResult }>());
export const resultDetailsSuccess = createAction('[Main] Result details success', props<{ resultDetails: FullDetails }>());
export const reset = createAction('[Main] Reset');
