import React, { useCallback, useEffect, useState } from "react";
import {
  DemoImage,
  ErrorCallout,
  FieldContainer,
  WellContainer,
  WellText,
  WellTitle,
  WellTitleContainer,
} from "./common";
import {
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleHeader,
  Icon,
  Link,
  Option,
  Select,
  Text,
} from "@appsmith/ads";
import styled from "styled-components";
import AnalyticsUtil from "ee/utils/AnalyticsUtil";
import {
  ADD_DEPLOY_KEY_STEP_TITLE,
  CONSENT_ADDED_DEPLOY_KEY,
  COPY_SSH_KEY,
  ERROR_SSH_KEY_MISCONF_MESSAGE,
  ERROR_SSH_KEY_MISCONF_TITLE,
  HOW_TO_ADD_DEPLOY_KEY,
  READ_DOCS,
  createMessage,
} from "ee/constants/messages";
import type { GitProvider } from "./ChooseGitProvider";
import { GIT_DEMO_GIF } from "./constants";
import noop from "lodash/noop";
import CopyButton from "./CopyButton";
import type { GitApiError } from "git/store/types";
import type { ConnectFormDataState } from "./types";

export const DeployedKeyContainer = styled.div`
  height: 36px;
  border: 1px solid var(--ads-v2-color-border);
  padding: 8px;
  box-sizing: border-box;
  border-radius: var(--ads-v2-border-radius);
  background-color: #fff;
  align-items: center;
  display: flex;
`;

export const KeyType = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  color: var(--ads-v2-color-fg);
  font-weight: 700;
`;

export const KeyText = styled.span`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex: 1;
  font-size: 10px;
  color: var(--ads-v2-color-fg);
  direction: rtl;
  margin-right: 8px;
`;

const StyledSelect = styled(Select)`
  margin-bottom: 4px;
  background-color: white;
  width: initial;

  .rc-select-selector {
    min-width: 100px;
  }

  input {
    width: 100px !important;
  }
`;

const CheckboxTextContainer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const DummyKey = styled.div`
  height: 36px;

  background: linear-gradient(
    90deg,
    var(--ads-color-black-200) 0%,
    rgba(240, 240, 240, 0) 100%
  );
`;

const StyledLink = styled(Link)`
  display: inline;
`;

const StyledIcon = styled(Icon)`
  margin-right: var(--ads-v2-spaces-2);
`;

const getRepositorySettingsUrl = (
  gitProvider?: GitProvider,
  remoteUrl?: string,
) => {
  if (!gitProvider) {
    return "";
  }

  const ownerRepo = remoteUrl?.split(":")?.[1]?.split(".git")?.[0];

  if (!ownerRepo) {
    return "";
  }

  switch (gitProvider) {
    case "github":
      return `https://github.com/${ownerRepo}/settings/keys`;
    case "gitlab":
      return `https://gitlab.com/${ownerRepo}/-/settings/repository`;
    case "bitbucket":
      return `https://bitbucket.org/${ownerRepo}/admin/access-keys/`;
    default:
      return "";
  }
};

const DEPLOY_DOCS_URL =
  "https://docs.appsmith.com/advanced-concepts/version-control-with-git/connecting-to-git-repository";

export interface AddDeployKeyProps {
  connectError: GitApiError | null;
  fetchSSHKey: () => void;
  generateSSHKey: (keyType: string) => void;
  isConnectModalOpen: boolean;
  isFetchSSHKeyLoading: boolean;
  isGenerateSSHKeyLoading: boolean;
  isImport?: boolean;
  isLoading: boolean;
  onChange: (args: Partial<ConnectFormDataState>) => void;
  sshPublicKey: string | null;
  value: Partial<ConnectFormDataState> | null;
}

function AddDeployKey({
  connectError = null,
  fetchSSHKey = noop,
  generateSSHKey = noop,
  isConnectModalOpen = false,
  isFetchSSHKeyLoading = false,
  isGenerateSSHKeyLoading = false,
  isImport = false,
  isLoading = false,
  onChange = noop,
  sshPublicKey = null,
  value = null,
}: AddDeployKeyProps) {
  const [fetched, setFetched] = useState(false);
  const [sshKeyType, setSshKeyType] = useState<string>();

  useEffect(
    function fetchKeyPairOnInitEffect() {
      if (isConnectModalOpen && !isImport) {
        if (!fetched) {
          fetchSSHKey();
          setFetched(true);
          // doesn't support callback anymore
          // fetchSSHKey({
          //   onSuccessCallback: () => {
          //     setFetched(true);
          //   },
          //   onErrorCallback: () => {
          //     setFetched(true);
          //   },
          // });
        }
      } else {
        if (!fetched) {
          setFetched(true);
        }
      }
    },
    [isImport, isConnectModalOpen, fetched, fetchSSHKey],
  );

  useEffect(
    function setSSHKeyTypeonInitEffect() {
      if (isConnectModalOpen && fetched && !isFetchSSHKeyLoading) {
        if (sshPublicKey && sshPublicKey.includes("rsa")) {
          setSshKeyType("RSA");
        } else if (
          !sshPublicKey &&
          value?.remoteUrl &&
          value.remoteUrl.toString().toLocaleLowerCase().includes("azure")
        ) {
          setSshKeyType("RSA");
        } else {
          setSshKeyType("ECDSA");
        }
      }
    },
    [
      isConnectModalOpen,
      fetched,
      sshPublicKey,
      isFetchSSHKeyLoading,
      value?.remoteUrl,
    ],
  );

  useEffect(
    function generateSSHOnInitEffect() {
      if (
        isConnectModalOpen &&
        ((sshKeyType && !sshPublicKey) ||
          (sshKeyType && !sshPublicKey?.includes(sshKeyType.toLowerCase())))
      ) {
        generateSSHKey(sshKeyType);
        // doesn't support callback anymore
        // generateSSHKey(sshKeyType, {
        //   onSuccessCallback: () => {
        //     toast.show("SSH Key generated successfully", { kind: "success" });
        //   },
        // });
      }
    },
    [sshKeyType, sshPublicKey, isConnectModalOpen, generateSSHKey],
  );

  const repositorySettingsUrl = getRepositorySettingsUrl(
    value?.gitProvider,
    value?.remoteUrl,
  );

  const loading = isFetchSSHKeyLoading || isGenerateSSHKeyLoading;

  const onCopy = useCallback(() => {
    AnalyticsUtil.logEvent("GS_COPY_SSH_KEY_BUTTON_CLICK");
  }, []);

  const handleAddedKeyCheck = useCallback(
    (isAddedDeployKey: boolean) => {
      onChange({ isAddedDeployKey });
    },
    [onChange],
  );

  return (
    <>
      {connectError &&
        connectError.code !== "AE-GIT-4033" &&
        connectError.code !== "AE-GIT-4032" && (
          <ErrorCallout kind="error">
            <Text kind="heading-xs" renderAs="h3">
              {connectError.errorType}
            </Text>
            <Text renderAs="p">{connectError.message}</Text>
          </ErrorCallout>
        )}

      {/* hardcoding message because server doesn't support feature flag. Will change this later */}
      {connectError && connectError.code === "AE-GIT-4032" && (
        <ErrorCallout kind="error">
          <Text kind="heading-xs" renderAs="h3">
            {createMessage(ERROR_SSH_KEY_MISCONF_TITLE)}
          </Text>
          <Text renderAs="p">
            {createMessage(ERROR_SSH_KEY_MISCONF_MESSAGE)}
          </Text>
        </ErrorCallout>
      )}

      <WellContainer>
        <WellTitleContainer>
          <WellTitle kind="heading-s" renderAs="h3">
            {createMessage(ADD_DEPLOY_KEY_STEP_TITLE)}
          </WellTitle>
          <Button
            href={DEPLOY_DOCS_URL}
            kind="tertiary"
            renderAs="a"
            size="sm"
            startIcon="book-line"
            target="_blank"
          >
            {" "}
            {createMessage(READ_DOCS)}
          </Button>
        </WellTitleContainer>

        <WellText renderAs="p">
          Copy below SSH key and paste it in your{" "}
          {!!repositorySettingsUrl && value?.gitProvider !== "others" ? (
            <StyledLink
              rel="noreferrer"
              target="_blank"
              to={repositorySettingsUrl}
            >
              repository settings.
            </StyledLink>
          ) : (
            "repository settings."
          )}{" "}
          Now, give write access to it.
        </WellText>
        <FieldContainer>
          <StyledSelect onChange={setSshKeyType} size="sm" value={sshKeyType}>
            <Option value="ECDSA">ECDSA 256</Option>
            <Option value="RSA">RSA 4096</Option>
          </StyledSelect>
          {!loading ? (
            <DeployedKeyContainer>
              <StyledIcon
                color="var(--ads-v2-color-fg)"
                name="key-2-line"
                size="md"
              />
              <KeyType>{sshKeyType}</KeyType>
              <KeyText>{sshPublicKey}</KeyText>
              {!isLoading && (
                <CopyButton
                  onCopy={onCopy}
                  tooltipMessage={createMessage(COPY_SSH_KEY)}
                  value={sshPublicKey ?? ""}
                />
              )}
            </DeployedKeyContainer>
          ) : (
            <DummyKey />
          )}
        </FieldContainer>
        {value?.gitProvider !== "others" && (
          <Collapsible isOpen>
            <CollapsibleHeader arrowPosition="end">
              <Icon name="play-circle-line" size="md" />
              <Text>{createMessage(HOW_TO_ADD_DEPLOY_KEY)}</Text>
            </CollapsibleHeader>
            <CollapsibleContent>
              <DemoImage
                alt={`Add deploy key in ${value?.gitProvider}`}
                src={GIT_DEMO_GIF.add_deploykey[value?.gitProvider || "github"]}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </WellContainer>
      <Checkbox
        data-testid="t--added-deploy-key-checkbox"
        isSelected={value?.isAddedDeployKey}
        onChange={handleAddedKeyCheck}
      >
        <CheckboxTextContainer>
          <Text renderAs="p">{createMessage(CONSENT_ADDED_DEPLOY_KEY)}</Text>
          <Text color="var(--ads-v2-color-red-600)" renderAs="p">
            &nbsp;*
          </Text>
        </CheckboxTextContainer>
      </Checkbox>
    </>
  );
}

export default AddDeployKey;
