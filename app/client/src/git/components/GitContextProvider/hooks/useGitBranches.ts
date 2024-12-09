import type { GitArtifactType } from "git/constants/enums";
import type { FetchBranchesResponseData } from "git/requests/fetchBranchesRequest.types";
import { gitArtifactActions } from "git/store/gitArtifactSlice";
import {
  selectBranches,
  selectCheckoutBranch,
  selectCreateBranch,
  selectDeleteBranch,
} from "git/store/selectors/gitSingleArtifactSelectors";
import type { GitRootState } from "git/store/types";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

interface UseGitBranchesParams {
  artifactType: keyof typeof GitArtifactType;
  baseArtifactId: string;
}

export interface UseGitBranchesReturns {
  branches: FetchBranchesResponseData | null;
  fetchBranchesLoading: boolean;
  fetchBranchesError: string | null;
  fetchBranches: () => void;
  createBranchLoading: boolean;
  createBranchError: string | null;
  createBranch: (branchName: string) => void;
  deleteBranchLoading: boolean;
  deleteBranchError: string | null;
  deleteBranch: (branchName: string) => void;
  checkoutBranchLoading: boolean;
  checkoutBranchError: string | null;
  checkoutBranch: (branchName: string) => void;
}

export default function useGitBranches({
  artifactType,
  baseArtifactId,
}: UseGitBranchesParams): UseGitBranchesReturns {
  const basePayload = { artifactType, baseArtifactId };
  const dispatch = useDispatch();
  // fetch branches
  const branchesState = useSelector((state: GitRootState) =>
    selectBranches(state, basePayload),
  );
  const fetchBranches = useCallback(() => {
    dispatch(
      gitArtifactActions.fetchBranchesInit({
        artifactType,
        baseArtifactId,
        pruneBranches: true,
      }),
    );
  }, [artifactType, baseArtifactId, dispatch]);
  // create branch
  const createBranchState = useSelector((state: GitRootState) =>
    selectCreateBranch(state, basePayload),
  );
  const createBranch = useCallback(
    (branchName: string) => {
      dispatch(
        gitArtifactActions.createBranchInit({
          artifactType,
          baseArtifactId,
          branchName,
        }),
      );
    },
    [artifactType, baseArtifactId, dispatch],
  );
  // delete branch
  const deleteBranchState = useSelector((state: GitRootState) =>
    selectDeleteBranch(state, basePayload),
  );
  const deleteBranch = useCallback(
    (branchName: string) => {
      dispatch(
        gitArtifactActions.deleteBranchInit({
          artifactType,
          baseArtifactId,
          branchName,
        }),
      );
    },
    [artifactType, baseArtifactId, dispatch],
  );
  // checkout branch
  const checkoutBranchState = useSelector((state: GitRootState) =>
    selectCheckoutBranch(state, basePayload),
  );
  const checkoutBranch = useCallback(
    (branchName: string) => {
      dispatch(
        gitArtifactActions.checkoutBranchInit({
          artifactType,
          baseArtifactId,
          branchName,
        }),
      );
    },
    [artifactType, baseArtifactId, dispatch],
  );

  return {
    branches: branchesState?.value ?? null,
    fetchBranchesLoading: branchesState?.loading ?? false,
    fetchBranchesError: branchesState?.error ?? null,
    fetchBranches,
    createBranchLoading: createBranchState?.loading ?? false,
    createBranchError: createBranchState?.error ?? null,
    createBranch,
    deleteBranchLoading: deleteBranchState?.loading ?? false,
    deleteBranchError: deleteBranchState?.error ?? null,
    deleteBranch,
    checkoutBranchLoading: checkoutBranchState?.loading ?? false,
    checkoutBranchError: checkoutBranchState?.error ?? null,
    checkoutBranch,
  };
}
