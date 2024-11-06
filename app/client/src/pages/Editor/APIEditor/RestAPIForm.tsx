import React from "react";
import { connect } from "react-redux";
import type { InjectedFormProps } from "redux-form";
import { formValueSelector, reduxForm } from "redux-form";
import { API_EDITOR_FORM_NAME } from "ee/constants/forms";
import type { Action } from "entities/Action";
import PostBodyData from "PluginActionEditor/components/PluginActionForm/components/ApiEditor/PostBodyData";
import type { AppState } from "ee/reducers";
import { getApiName } from "selectors/formSelectors";
import { EditorTheme } from "components/editorComponents/CodeEditor/EditorConfig";
import get from "lodash/get";
import { getAction, getActionResponses } from "ee/selectors/entitiesSelector";
import type { CommonFormProps } from "./CommonEditorForm";
import CommonEditorForm from "./CommonEditorForm";
import Pagination from "PluginActionEditor/components/PluginActionForm/components/ApiEditor/Pagination";
import { getCurrentEnvironmentId } from "ee/selectors/environmentSelectors";
import { HTTP_METHOD_OPTIONS } from "PluginActionEditor/constants/CommonApiConstants";

type APIFormProps = {
  httpMethodFromForm: string;
} & CommonFormProps;

type Props = APIFormProps & InjectedFormProps<Action, APIFormProps>;

function ApiEditorForm(props: Props) {
  const { actionName } = props;
  const theme = EditorTheme.LIGHT;

  return (
    <CommonEditorForm
      {...props}
      bodyUIComponent={
        <PostBodyData dataTreePath={`${actionName}.config`} theme={theme} />
      }
      formName={API_EDITOR_FORM_NAME}
      httpsMethods={HTTP_METHOD_OPTIONS}
      paginationUIComponent={
        <Pagination
          actionName={actionName}
          onTestClick={props.onRunClick}
          paginationType={props.paginationType}
          theme={theme}
        />
      }
    />
  );
}

const selector = formValueSelector(API_EDITOR_FORM_NAME);

export default connect((state: AppState) => {
  const httpMethodFromForm = selector(state, "actionConfiguration.httpMethod");
  const actionConfigurationHeaders =
    selector(state, "actionConfiguration.headers") || [];
  const autoGeneratedActionConfigHeaders =
    selector(state, "actionConfiguration.autoGeneratedHeaders") || [];
  const actionConfigurationParams =
    selector(state, "actionConfiguration.queryParameters") || [];
  let datasourceFromAction = selector(state, "datasource");

  if (datasourceFromAction && datasourceFromAction.hasOwnProperty("id")) {
    datasourceFromAction = state.entities.datasources.list.find(
      (d) => d.id === datasourceFromAction.id,
    );
  }

  // get messages from action itself
  const actionId = selector(state, "id");
  const action = getAction(state, actionId);
  const currentEnvironment = getCurrentEnvironmentId(state);
  const hintMessages = action?.messages;

  const datasourceHeaders =
    get(
      datasourceFromAction,
      `datasourceStorages.${currentEnvironment}.datasourceConfiguration.headers`,
    ) || [];
  const datasourceParams =
    get(
      datasourceFromAction,
      `datasourceStorages.${currentEnvironment}.datasourceConfiguration.queryParameters`,
    ) || [];

  const apiId = selector(state, "id");
  const currentActionDatasourceId = selector(state, "datasource.id");

  const actionName = getApiName(state, apiId) || "";

  const responses = getActionResponses(state);
  const actionResponse = responses[apiId];

  return {
    actionName,
    actionResponse,
    apiId,
    httpMethodFromForm,
    actionConfigurationHeaders,
    actionConfigurationParams,
    autoGeneratedActionConfigHeaders,
    currentActionDatasourceId,
    datasourceHeaders,
    datasourceParams,
    hintMessages,
  };
})(
  reduxForm<Action, APIFormProps>({
    form: API_EDITOR_FORM_NAME,
    enableReinitialize: true,
  })(ApiEditorForm),
);
