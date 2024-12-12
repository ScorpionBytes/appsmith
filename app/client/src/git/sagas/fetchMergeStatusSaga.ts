import fetchMergeStatusRequest from "git/requests/fetchMergeStatusRequest";
import type {
  FetchMergeStatusRequestParams,
  FetchMergeStatusResponse,
} from "git/requests/fetchMergeStatusRequest.types";
import type { FetchMergeStatusInitPayload } from "git/store/actions/fetchMergeStatusActions";
import { gitArtifactActions } from "git/store/gitArtifactSlice";
import type { GitArtifactPayloadAction } from "git/store/types";
import { call, put } from "redux-saga/effects";
import { validateResponse } from "sagas/ErrorSagas";

export default function* fetchMergeStatusSaga(
  action: GitArtifactPayloadAction<FetchMergeStatusInitPayload>,
) {
  const { artifactId, artifactType, baseArtifactId } = action.payload;
  const basePayload = { artifactType, baseArtifactId };
  let response: FetchMergeStatusResponse | undefined;

  try {
    const params: FetchMergeStatusRequestParams = {
      destinationBranch: action.payload.destinationBranch,
      sourceBranch: action.payload.sourceBranch,
    };

    response = yield call(fetchMergeStatusRequest, artifactId, params);
    const isValidResponse: boolean = yield validateResponse(response);

    if (response && isValidResponse) {
      yield put(
        gitArtifactActions.fetchMergeStatusSuccess({
          ...basePayload,
          responseData: response.data,
        }),
      );
    }
  } catch (error) {
    yield put(
      gitArtifactActions.fetchMergeStatusError({
        ...basePayload,
        error: error as string,
      }),
    );
  }
}
