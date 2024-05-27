import { createReducer } from "utils/ReducerUtils";
import type { ReduxAction } from "@appsmith/constants/ReduxActionConstants";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import type { DependencyMap } from "utils/DynamicBindingUtils";

export interface EvaluationDependencyState {
  inverseDependencyMap: DependencyMap;
  cachedDependencyMap?: DependencyMap;
}

const initialState: EvaluationDependencyState = {
  inverseDependencyMap: {},
};

const evaluationDependencyReducer = createReducer(initialState, {
  [ReduxActionTypes.SET_EVALUATION_INVERSE_DEPENDENCY_MAP]: (
    state: EvaluationDependencyState,
    action: ReduxAction<{
      inverseDependencyMap: DependencyMap;
    }>,
  ): EvaluationDependencyState => ({
    ...state,
    inverseDependencyMap: action.payload.inverseDependencyMap,
  }),
  [ReduxActionTypes.SET_DEPENDENCY_MAP_CACHE]: (
    state: EvaluationDependencyState,
    action: ReduxAction<{ dependencyMap?: DependencyMap }>,
  ): EvaluationDependencyState => ({
    ...state,
    cachedDependencyMap: action.payload.dependencyMap,
  }),
  [ReduxActionTypes.FETCH_PUBLISHED_PAGE_INIT]: (
    state: EvaluationDependencyState,
  ) => {
    return { ...state, cachedDependencyMap: undefined };
  },
});

export default evaluationDependencyReducer;
