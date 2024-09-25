import { getFormValues } from "redux-form";
import { API_EDITOR_FORM_NAME } from "ee/constants/forms";
import { getCurrentEnvironmentId } from "ee/selectors/environmentSelectors";
import get from "lodash/get";
import { useSelector } from "react-redux";
import {
  type Action,
  type ApiAction,
  isAPIAction,
  type Property,
} from "entities/Action";
import { getDatasources } from "ee/selectors/entitiesSelector";

function useGetFormActionValues() {
  const formValues = useSelector(getFormValues(API_EDITOR_FORM_NAME)) as Action;
  const datasources = useSelector(getDatasources);
  const currentEnvironment = useSelector(getCurrentEnvironmentId);

  // In an unlikely scenario where form is not initialised,
  // return empty values to avoid form ui issues
  if (!isAPIAction(formValues)) {
    return {
      actionHeaders: [],
      actionParams: [],
      autoGeneratedHeaders: [],
      datasourceParams: [],
      datasourceHeaders: [],
    };
  }

  const actionHeaders = get(
    formValues,
    "actionConfiguration.headers",
    [],
  ) as Property[];

  const autoGeneratedHeaders: ApiAction["actionConfiguration"]["autoGeneratedHeaders"] =
    get(formValues, "actionConfiguration.autoGeneratedHeaders", []);

  const actionParams = get(
    formValues,
    "actionConfiguration.queryParameters",
    [],
  ) as Property[];

  let datasourceFromAction: Action["datasource"] | undefined = get(
    formValues,
    "datasource",
  );

  if (datasourceFromAction && Object.hasOwn(datasourceFromAction, "id")) {
    datasourceFromAction = datasources.find(
      (d) => d.id === datasourceFromAction?.id,
    );
  }

  const datasourceHeaders = get(
    datasourceFromAction,
    `datasourceStorages.${currentEnvironment}.datasourceConfiguration.headers`,
    [],
  ) as Property[];

  const datasourceParams = get(
    datasourceFromAction,
    `datasourceStorages.${currentEnvironment}.datasourceConfiguration.queryParameters`,
    [],
  ) as Property[];

  return {
    actionHeaders,
    autoGeneratedHeaders,
    actionParams,
    datasourceHeaders,
    datasourceParams,
  };
}

export default useGetFormActionValues;
