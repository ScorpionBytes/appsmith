/* eslint-disable padding-line-between-statements */
import { createSlice } from "@reduxjs/toolkit";
import type { GitArtifactReduxState } from "../types";
import { mountAction, unmountAction } from "../actions/mountActions";
import {
  connectErrorAction,
  connectInitAction,
  connectSuccessAction,
} from "../actions/connectActions";
import {
  fetchMetadataErrorAction,
  fetchMetadataInitAction,
  fetchMetadataSuccessAction,
} from "../actions/fetchMetadataActions";
import {
  fetchBranchesErrorAction,
  fetchBranchesInitAction,
  fetchBranchesSuccessAction,
} from "../actions/fetchBranchesActions";
import {
  fetchStatusErrorAction,
  fetchStatusInitAction,
  fetchStatusSuccessAction,
} from "../actions/fetchStatusActions";
import {
  commitErrorAction,
  commitInitAction,
  commitSuccessAction,
} from "../actions/commitActions";
import {
  pullErrorAction,
  pullInitAction,
  pullSuccessAction,
} from "../actions/pullActions";
import {
  fetchLocalProfileErrorAction,
  fetchLocalProfileInitAction,
  fetchLocalProfileSuccessAction,
} from "git/actions/fetchLocalProfileActions";
import {
  updateLocalProfileErrorAction,
  updateLocalProfileInitAction,
  updateLocalProfileSuccessAction,
} from "git/actions/updateLocalProfileActions";
import {
  createBranchErrorAction,
  createBranchInitAction,
  createBranchSuccessAction,
} from "git/actions/createBranchActions";
import {
  deleteBranchErrorAction,
  deleteBranchInitAction,
  deleteBranchSuccessAction,
} from "git/actions/deleteBranchActions";
import {
  toggleBranchListPopupAction,
  toggleRepoLimitErrorModalAction,
} from "git/actions/uiActions";
import {
  checkoutBranchErrorAction,
  checkoutBranchInitAction,
  checkoutBranchSuccessAction,
} from "git/actions/checkoutBranchActions";

const initialState: GitArtifactReduxState = {};

export const gitArtifactSlice = createSlice({
  name: "git/artifact",
  initialState,
  reducers: {
    mount: mountAction,
    unmount: unmountAction,
    connectInit: connectInitAction,
    connectSuccess: connectSuccessAction,
    connectError: connectErrorAction,

    // branches
    fetchBranchesInit: fetchBranchesInitAction,
    fetchBranchesSuccess: fetchBranchesSuccessAction,
    fetchBranchesError: fetchBranchesErrorAction,
    createBranchInit: createBranchInitAction,
    createBranchSuccess: createBranchSuccessAction,
    createBranchError: createBranchErrorAction,
    deleteBranchInit: deleteBranchInitAction,
    deleteBranchSuccess: deleteBranchSuccessAction,
    deleteBranchError: deleteBranchErrorAction,
    checkoutBranchInit: checkoutBranchInitAction,
    checkoutBranchSuccess: checkoutBranchSuccessAction,
    checkoutBranchError: checkoutBranchErrorAction,

    // metadata
    fetchMetadataInit: fetchMetadataInitAction,
    fetchMetadataSuccess: fetchMetadataSuccessAction,
    fetchMetadataError: fetchMetadataErrorAction,
    fetchStatusInit: fetchStatusInitAction,
    fetchStatusSuccess: fetchStatusSuccessAction,
    fetchStatusError: fetchStatusErrorAction,
    commitInit: commitInitAction,
    commitSuccess: commitSuccessAction,
    commitError: commitErrorAction,
    pullInit: pullInitAction,
    pullSuccess: pullSuccessAction,
    pullError: pullErrorAction,
    fetchLocalProfileInit: fetchLocalProfileInitAction,
    fetchLocalProfileSuccess: fetchLocalProfileSuccessAction,
    fetchLocalProfileError: fetchLocalProfileErrorAction,
    updateLocalProfileInit: updateLocalProfileInitAction,
    updateLocalProfileSuccess: updateLocalProfileSuccessAction,
    updateLocalProfileError: updateLocalProfileErrorAction,

    // ui actions
    toggleBranchListPopup: toggleBranchListPopupAction,
    toggleRepoLimitErrorModal: toggleRepoLimitErrorModalAction,
  },
});

export const gitArtifactActions = gitArtifactSlice.actions;

export const gitArtifactReducer = gitArtifactSlice.reducer;
