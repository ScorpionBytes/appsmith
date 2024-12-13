import type { GitArtifactType } from "git/constants/enums";
import type { GitRootState } from "../types";

export interface GitArtifactDef {
  artifactType: keyof typeof GitArtifactType;
  baseArtifactId: string;
}

export const selectGitArtifact = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => {
  return state.git.artifacts[artifactDef.artifactType]?.[
    artifactDef.baseArtifactId
  ];
};

// metadata
export const selectGitMetadata = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses.metadata;

export const selectGitConnected = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => !!selectGitMetadata(state, artifactDef).value;

// git ops
export const selectCommit = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses?.commit;

export const selectDiscard = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses?.discard;

export const selectStatus = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses?.status;

export const selectMerge = (state: GitRootState, artifactDef: GitArtifactDef) =>
  selectGitArtifact(state, artifactDef)?.apiResponses?.merge;

export const selectMergeStatus = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses?.mergeStatus;

export const selectPull = (state: GitRootState, artifactDef: GitArtifactDef) =>
  selectGitArtifact(state, artifactDef)?.apiResponses?.pull;

export const selectOpsModalOpen = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.ui.opsModalOpen;

export const selectOpsModalTab = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.ui.opsModalTab;

export const selectConflictErrorModalOpen = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.ui.conflictErrorModalOpen;

// git branches

export const selectCurrentBranch = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => {
  const gitMetadataState = selectGitMetadata(state, artifactDef).value;

  return gitMetadataState?.branchName;
};

export const selectBranches = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses?.branches;

export const selectCreateBranch = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses?.createBranch;

export const selectDeleteBranch = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses?.deleteBranch;

export const selectCheckoutBranch = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses.checkoutBranch;

// settings
export const selectAutocommitEnabled = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => {
  const gitMetadata = selectGitMetadata(state, artifactDef).value;

  return gitMetadata?.autoCommitConfig?.enabled;
};

export const selectAutocommitPolling = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.ui.autocommitPolling;

export const selectFetchProtectedBranchesState = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.apiResponses.protectedBranches;

export const selectUpdateProtectedBranchesState = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) =>
  selectGitArtifact(state, artifactDef)?.apiResponses.updateProtectedBranches;

export const selectProtectedMode = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => {
  const currentBranch = selectCurrentBranch(state, artifactDef);
  const protectedBranches = selectFetchProtectedBranchesState(
    state,
    artifactDef,
  ).value;

  return protectedBranches?.includes(currentBranch ?? "") ?? false;
};

export const selectSettingsModalOpen = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.ui.settingsModalOpen;

export const selectSettingsModalTab = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitArtifact(state, artifactDef)?.ui.settingsModalTab;

// default branch
export const selectDefaultBranch = (
  state: GitRootState,
  artifactDef: GitArtifactDef,
) => selectGitMetadata(state, artifactDef)?.value?.defaultBranchName ?? null;
