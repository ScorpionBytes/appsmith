package com.appsmith.server.workflows.interact;

import com.appsmith.external.models.ActionConfiguration;
import com.appsmith.external.models.ActionDTO;
import com.appsmith.external.models.Datasource;
import com.appsmith.external.models.DatasourceConfiguration;
import com.appsmith.external.models.DatasourceStorageDTO;
import com.appsmith.external.models.PluginType;
import com.appsmith.external.plugins.PluginExecutor;
import com.appsmith.external.services.EncryptionService;
import com.appsmith.server.constants.FieldName;
import com.appsmith.server.datasources.base.DatasourceService;
import com.appsmith.server.domains.ActionCollection;
import com.appsmith.server.domains.NewAction;
import com.appsmith.server.domains.PermissionGroup;
import com.appsmith.server.domains.Plugin;
import com.appsmith.server.domains.QUser;
import com.appsmith.server.domains.User;
import com.appsmith.server.domains.UserApiKey;
import com.appsmith.server.domains.Workflow;
import com.appsmith.server.domains.Workspace;
import com.appsmith.server.dtos.ActionCollectionDTO;
import com.appsmith.server.featureflags.CachedFeatures;
import com.appsmith.server.featureflags.FeatureFlagEnum;
import com.appsmith.server.helpers.MockPluginExecutor;
import com.appsmith.server.helpers.PluginExecutorHelper;
import com.appsmith.server.helpers.UserUtils;
import com.appsmith.server.repositories.ActionCollectionRepository;
import com.appsmith.server.repositories.ApiKeyRepository;
import com.appsmith.server.repositories.NewActionRepository;
import com.appsmith.server.repositories.PermissionGroupRepository;
import com.appsmith.server.repositories.PluginRepository;
import com.appsmith.server.repositories.UserRepository;
import com.appsmith.server.repositories.WorkflowRepository;
import com.appsmith.server.services.FeatureFlagService;
import com.appsmith.server.services.LayoutActionService;
import com.appsmith.server.services.LayoutCollectionService;
import com.appsmith.server.services.WorkspaceService;
import com.appsmith.server.solutions.EnvironmentPermission;
import com.appsmith.server.workflows.crud.CrudWorkflowEntityService;
import com.appsmith.server.workflows.crud.CrudWorkflowService;
import com.appsmith.server.workflows.helpers.WorkflowHelper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpMethod;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import static com.appsmith.external.models.CreatorContextType.WORKFLOW;
import static com.appsmith.server.acl.AclPermission.DELETE_WORKFLOWS;
import static com.appsmith.server.acl.AclPermission.EXECUTE_WORKFLOWS;
import static com.appsmith.server.acl.AclPermission.EXPORT_WORKFLOWS;
import static com.appsmith.server.acl.AclPermission.MANAGE_WORKFLOWS;
import static com.appsmith.server.acl.AclPermission.PUBLISH_WORKFLOWS;
import static com.appsmith.server.acl.AclPermission.READ_HISTORY_WORKFLOWS;
import static com.appsmith.server.acl.AclPermission.READ_WORKFLOWS;
import static com.appsmith.server.acl.AclPermission.WORKFLOW_CREATE_ACTIONS;
import static com.appsmith.server.repositories.ce.BaseAppsmithRepositoryCEImpl.fieldName;
import static java.lang.Boolean.TRUE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Slf4j
class InteractWorkflowServiceTest {

    @SpyBean
    private FeatureFlagService featureFlagService;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CrudWorkflowService crudWorkflowService;

    @Autowired
    private InteractWorkflowService interactWorkflowService;

    @Autowired
    WorkflowHelper workflowHelper;

    @Autowired
    private PermissionGroupRepository permissionGroupRepository;

    @Autowired
    ApiKeyRepository apiKeyRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    WorkflowRepository workflowRepository;

    @MockBean
    private PluginExecutorHelper pluginExecutorHelper;

    @MockBean
    private PluginExecutor pluginExecutor;

    @Autowired
    private EnvironmentPermission environmentPermission;

    @Autowired
    private PluginRepository pluginRepository;

    @Autowired
    private DatasourceService datasourceService;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private CrudWorkflowEntityService crudWorkflowEntityService;

    @Autowired
    private NewActionRepository newActionRepository;

    @Autowired
    private ActionCollectionRepository actionCollectionRepository;

    @Autowired
    private LayoutCollectionService layoutCollectionService;

    @Autowired
    private LayoutActionService layoutActionService;

    private Workspace workspace;
    private Workflow workflow;
    private Datasource datasource;

    @BeforeEach
    public void setup() {
        Mockito.when(pluginExecutorHelper.getPluginExecutor(Mockito.any())).thenReturn(Mono.just(pluginExecutor));
        Mockito.when(pluginExecutor.getHintMessages(Mockito.any(), Mockito.any()))
                .thenReturn(Mono.zip(Mono.just(new HashSet<>()), Mono.just(new HashSet<>())));
        User apiUser = userRepository.findByCaseInsensitiveEmail("api_user").block();
        userUtils.makeSuperUser(List.of(apiUser)).block();
        Mockito.when(featureFlagService.check(eq(FeatureFlagEnum.release_workflows_enabled)))
                .thenReturn(Mono.just(TRUE));
        Mockito.when(featureFlagService.check(eq(FeatureFlagEnum.license_gac_enabled)))
                .thenReturn(Mono.just(TRUE));
        CachedFeatures cachedFeatures = new CachedFeatures();
        cachedFeatures.setFeatures(Map.of(
                FeatureFlagEnum.license_gac_enabled.name(),
                TRUE,
                FeatureFlagEnum.release_workflows_enabled.name(),
                TRUE));
        Mockito.when(featureFlagService.getCachedTenantFeatureFlags()).thenReturn(cachedFeatures);
        Mockito.when(pluginExecutorHelper.getPluginExecutor(Mockito.any()))
                .thenReturn(Mono.just(new MockPluginExecutor()));

        Workspace workspace1 = new Workspace();
        workspace1.setName("Workspace - InteractWorkflowServiceTest");
        workspace = workspaceService.create(workspace1).block();

        String defaultEnvironmentId = workspaceService
                .getDefaultEnvironmentId(workspace.getId(), environmentPermission.getExecutePermission())
                .block();

        Workflow toCreateWorkflow = new Workflow();
        toCreateWorkflow.setName("Workflow - InteractWorkflowServiceTest");
        workflow = crudWorkflowService
                .createWorkflow(toCreateWorkflow, workspace.getId())
                .block();

        Datasource externalDatasource = new Datasource();
        externalDatasource.setName("Datasource - InteractWorkflowServiceTest");
        externalDatasource.setWorkspaceId(workspace.getId());
        Plugin installed_plugin =
                pluginRepository.findByPackageName("installed-plugin").block();
        externalDatasource.setPluginId(installed_plugin.getId());
        DatasourceConfiguration datasourceConfiguration = new DatasourceConfiguration();
        datasourceConfiguration.setUrl("some url here");

        HashMap<String, DatasourceStorageDTO> storages = new HashMap<>();
        storages.put(
                defaultEnvironmentId, new DatasourceStorageDTO(null, defaultEnvironmentId, datasourceConfiguration));
        externalDatasource.setDatasourceStorages(storages);
        datasource = datasourceService.create(externalDatasource).block();
    }

    @Test
    @WithUserDetails(value = "api_user")
    void testGenerateBearerTokenForWebhook() {
        String workflowBearerToken = interactWorkflowService
                .generateBearerTokenForWebhook(workflow.getId())
                .block();
        String userEmail = workflowHelper.generateWorkflowBotUserEmail(workflow).toLowerCase();
        User workflowBotUser =
                userRepository.findByCaseInsensitiveEmail(userEmail).block();
        assertThat(workflowBotUser).isNotNull();
        List<PermissionGroup> workflowBotRoles = permissionGroupRepository
                .findByDefaultDomainIdAndDefaultDomainType(workflow.getId(), Workflow.class.getSimpleName())
                .collectList()
                .block();
        assertThat(workflowBotRoles).hasSize(1);
        PermissionGroup workflowBotRole = workflowBotRoles.get(0);
        assertThat(workflowBotRole.getName()).isEqualTo(workflowHelper.generateWorkflowBotRoleName(workflow));
        assertThat(workflowBotRole.getAssignedToUserIds()).containsOnly(workflowBotUser.getId());

        String actualWorkflowBearerToken = Arrays.stream(
                        encryptionService.decryptString(workflowBearerToken).split(FieldName.APIKEY_USERID_DELIMITER))
                .toList()
                .get(0);

        List<UserApiKey> userApiKeys = apiKeyRepository
                .getByUserIdWithoutPermission(workflowBotUser.getId())
                .collectList()
                .block();
        assertThat(userApiKeys).hasSize(1);
        assertThat(userApiKeys.get(0).getApiKey()).isEqualTo(actualWorkflowBearerToken);

        Workflow workflowFromDB = workflowRepository.findById(workflow.getId()).block();
        workflowFromDB.getPolicies().forEach(policy -> {
            if (MANAGE_WORKFLOWS.getValue().equals(policy.getPermission())
                    || READ_WORKFLOWS.getValue().equals(policy.getPermission())
                    || PUBLISH_WORKFLOWS.getValue().equals(policy.getPermission())
                    || DELETE_WORKFLOWS.getValue().equals(policy.getPermission())
                    || EXPORT_WORKFLOWS.getValue().equals(policy.getPermission())
                    || WORKFLOW_CREATE_ACTIONS.getValue().equals(policy.getPermission())
                    || READ_HISTORY_WORKFLOWS.getValue().equals(policy.getPermission())) {
                assertThat(policy.getPermissionGroups()).doesNotContain(workflowBotRole.getId());
            } else if (EXECUTE_WORKFLOWS.getValue().equals(policy.getPermission())) {
                assertThat(policy.getPermissionGroups().contains(workflowBotRole.getId()));
            }
        });
        assertThat(workflowFromDB.getTokenGenerated()).isTrue();
    }

    @Test
    @WithUserDetails(value = "api_user")
    void testArchiveBearerTokenForWebhook() {
        interactWorkflowService.generateBearerTokenForWebhook(workflow.getId()).block();
        String userEmail = workflowHelper.generateWorkflowBotUserEmail(workflow).toLowerCase();
        User workflowBotUser =
                userRepository.findByCaseInsensitiveEmail(userEmail).block();
        Criteria userEmailCriteria = Criteria.where(fieldName(QUser.user.email)).is(userEmail);
        Query userEmailQuery = Query.query(userEmailCriteria);

        Boolean archived = interactWorkflowService
                .archiveBearerTokenForWebhook(workflow.getId())
                .block();
        assertThat(archived).isTrue();
        List<UserApiKey> workflowBearerTokens = apiKeyRepository
                .getByUserIdWithoutPermission(workflowBotUser.getId())
                .collectList()
                .block();
        assertThat(workflowBearerTokens).hasSize(0);
        Workflow workflowPostArchivingToken =
                workflowRepository.findById(workflow.getId()).block();
        assertThat(workflowPostArchivingToken.getTokenGenerated()).isFalse();
    }

    @Test
    @WithUserDetails(value = "api_user")
    public void testPublishWorkflows() {
        String name = "testPublishWorkflows";
        ActionDTO actionDTO = new ActionDTO();
        actionDTO.setName(name);
        actionDTO.setWorkflowId(workflow.getId());
        actionDTO.setDatasource(datasource);
        ActionConfiguration actionConfiguration = new ActionConfiguration();
        actionConfiguration.setHttpMethod(HttpMethod.GET);
        actionDTO.setActionConfiguration(actionConfiguration);
        actionDTO.setWorkspaceId(workspace.getId());
        actionDTO.setContextType(WORKFLOW);

        ActionDTO workflowActionDTO = layoutActionService
                .createSingleActionWithBranch(actionDTO, null)
                .block();

        ActionCollectionDTO actionCollectionDTO = new ActionCollectionDTO();
        actionCollectionDTO.setName(name);
        actionCollectionDTO.setWorkflowId(workflow.getId());
        actionCollectionDTO.setPluginId(datasource.getPluginId());
        actionCollectionDTO.setPluginType(PluginType.JS);
        actionCollectionDTO.setWorkspaceId(workspace.getId());
        actionCollectionDTO.setContextType(WORKFLOW);
        ActionDTO action1 = new ActionDTO();
        action1.setName("testPublishWorkflows");
        action1.setActionConfiguration(new ActionConfiguration());
        action1.getActionConfiguration().setBody("testPublishWorkflows");
        actionCollectionDTO.setActions(List.of(action1));

        ActionCollectionDTO workflowActionCollectionDTO = layoutCollectionService
                .createCollection(actionCollectionDTO, null)
                .block();

        NewAction beforePublishingWorkflowAction =
                newActionRepository.findById(workflowActionDTO.getId()).block();
        ActionDTO beforePublishingPublishedAction = beforePublishingWorkflowAction.getPublishedAction();
        assertThat(beforePublishingPublishedAction.getWorkflowId()).isNullOrEmpty();
        assertThat(beforePublishingPublishedAction.getName()).isNullOrEmpty();
        assertThat(beforePublishingPublishedAction.getContextType()).isNull();
        assertThat(beforePublishingPublishedAction.getActionConfiguration()).isNull();

        ActionCollection beforePublishingMainJsObject = actionCollectionRepository
                .findById(workflow.getMainJsObjectId())
                .block();

        ActionCollectionDTO beforePublishingPublishedCollectionMainJSObject =
                beforePublishingMainJsObject.getPublishedCollection();
        assertThat(beforePublishingPublishedCollectionMainJSObject.getWorkflowId())
                .isNullOrEmpty();
        assertThat(beforePublishingPublishedCollectionMainJSObject.getName()).isNullOrEmpty();
        assertThat(beforePublishingPublishedCollectionMainJSObject.getContextType())
                .isNull();

        ActionCollection beforePublishingAdditionalJsObject = actionCollectionRepository
                .findById(workflowActionCollectionDTO.getId())
                .block();
        ActionCollectionDTO beforePublishingPublishedCollectionAdditionalJSObject =
                beforePublishingAdditionalJsObject.getPublishedCollection();
        assertThat(beforePublishingPublishedCollectionAdditionalJSObject.getWorkflowId())
                .isNullOrEmpty();
        assertThat(beforePublishingPublishedCollectionAdditionalJSObject.getName())
                .isNullOrEmpty();
        assertThat(beforePublishingPublishedCollectionAdditionalJSObject.getContextType())
                .isNull();

        List<NewAction> beforePublishingActionsInsideMainJsObject = newActionRepository
                .findAllByActionCollectionIdWithoutPermissions(List.of(workflow.getMainJsObjectId()), List.of())
                .collectList()
                .block();
        assertThat(beforePublishingActionsInsideMainJsObject).hasSize(1);
        NewAction beforePublishingActionInsideMainJsObject = beforePublishingActionsInsideMainJsObject.get(0);
        ActionDTO beforePublishingPublishedActionInsideMainJsObject =
                beforePublishingActionInsideMainJsObject.getPublishedAction();
        assertThat(beforePublishingPublishedActionInsideMainJsObject.getWorkflowId())
                .isNullOrEmpty();
        assertThat(beforePublishingPublishedActionInsideMainJsObject.getName()).isNullOrEmpty();
        assertThat(beforePublishingPublishedActionInsideMainJsObject.getContextType())
                .isNull();
        assertThat(beforePublishingPublishedActionInsideMainJsObject.getActionConfiguration())
                .isNull();

        List<NewAction> beforePublishingActionsInsideAdditionalJsObject = newActionRepository
                .findAllByActionCollectionIdWithoutPermissions(List.of(workflowActionCollectionDTO.getId()), List.of())
                .collectList()
                .block();
        assertThat(beforePublishingActionsInsideAdditionalJsObject).hasSize(1);
        NewAction beforePublishingActionInsideAdditionalJsObject =
                beforePublishingActionsInsideAdditionalJsObject.get(0);
        ActionDTO beforePublishingPublishedActionInsideAdditionalJsObject =
                beforePublishingActionInsideAdditionalJsObject.getPublishedAction();
        assertThat(beforePublishingPublishedActionInsideAdditionalJsObject.getWorkflowId())
                .isNullOrEmpty();
        assertThat(beforePublishingPublishedActionInsideAdditionalJsObject.getName())
                .isNullOrEmpty();
        assertThat(beforePublishingPublishedActionInsideAdditionalJsObject.getContextType())
                .isNull();
        assertThat(beforePublishingPublishedActionInsideAdditionalJsObject.getActionConfiguration())
                .isNull();

        Workflow publishedWorkflow =
                interactWorkflowService.publishWorkflow(workflow.getId()).block();
        assertThat(publishedWorkflow.getLastDeployedAt()).isNotEmpty();
        assertThat(Instant.parse(publishedWorkflow.getLastDeployedAt())).isBefore(Instant.now());

        NewAction afterPublishingWorkflowAction =
                newActionRepository.findById(workflowActionDTO.getId()).block();
        ActionDTO afterPublishingPublishedAction = afterPublishingWorkflowAction.getPublishedAction();
        assertThat(afterPublishingPublishedAction.getWorkflowId()).isEqualTo(workflow.getId());
        assertThat(afterPublishingPublishedAction.getName()).isEqualTo(name);
        assertThat(afterPublishingPublishedAction.getContextType()).isEqualTo(WORKFLOW);
        assertThat(afterPublishingPublishedAction.getActionConfiguration()).isNotNull();

        ActionCollection afterPublishingMainJsObject = actionCollectionRepository
                .findById(workflow.getMainJsObjectId())
                .block();
        ActionCollectionDTO afterPublishingPublishedCollectionMainJSObject =
                afterPublishingMainJsObject.getPublishedCollection();
        assertThat(afterPublishingPublishedCollectionMainJSObject.getWorkflowId())
                .isEqualTo(workflow.getId());
        assertThat(afterPublishingPublishedCollectionMainJSObject.getName()).isEqualTo("Main");
        assertThat(afterPublishingPublishedCollectionMainJSObject.getContextType())
                .isEqualTo(WORKFLOW);

        ActionCollection afterPublishingAdditionalJsObject = actionCollectionRepository
                .findById(workflowActionCollectionDTO.getId())
                .block();
        ActionCollectionDTO afterPublishingPublishedCollectionAdditionalJSObject =
                afterPublishingAdditionalJsObject.getPublishedCollection();
        assertThat(afterPublishingPublishedCollectionAdditionalJSObject.getWorkflowId())
                .isEqualTo(workflow.getId());
        assertThat(afterPublishingPublishedCollectionAdditionalJSObject.getName())
                .isEqualTo(name);
        assertThat(afterPublishingPublishedCollectionAdditionalJSObject.getContextType())
                .isEqualTo(WORKFLOW);

        List<NewAction> afterPublishingActionsInsideMainJsObject = newActionRepository
                .findAllByActionCollectionIdWithoutPermissions(List.of(workflow.getMainJsObjectId()), List.of())
                .collectList()
                .block();
        assertThat(afterPublishingActionsInsideMainJsObject).hasSize(1);
        NewAction afterPublishingActionInsideMainJsObject = afterPublishingActionsInsideMainJsObject.get(0);
        ActionDTO afterPublishingPublishedActionInsideMainJsObject =
                afterPublishingActionInsideMainJsObject.getPublishedAction();
        assertThat(afterPublishingPublishedActionInsideMainJsObject.getWorkflowId())
                .isEqualTo(workflow.getId());
        assertThat(afterPublishingPublishedActionInsideMainJsObject.getName()).isEqualTo("executeWorkflow");
        assertThat(afterPublishingPublishedActionInsideMainJsObject.getContextType())
                .isEqualTo(WORKFLOW);
        assertThat(afterPublishingPublishedActionInsideMainJsObject.getActionConfiguration())
                .isNotNull();

        List<NewAction> afterPublishingActionsInsideAdditionalJsObject = newActionRepository
                .findAllByActionCollectionIdWithoutPermissions(List.of(workflowActionCollectionDTO.getId()), List.of())
                .collectList()
                .block();
        assertThat(afterPublishingActionsInsideAdditionalJsObject).hasSize(1);
        NewAction afterPublishingActionInsideAdditionalJsObject = afterPublishingActionsInsideAdditionalJsObject.get(0);
        ActionDTO afterPublishingPublishedActionInsideAdditionalJsObject =
                afterPublishingActionInsideAdditionalJsObject.getPublishedAction();
        assertThat(afterPublishingPublishedActionInsideAdditionalJsObject.getWorkflowId())
                .isEqualTo(workflow.getId());
        assertThat(afterPublishingPublishedActionInsideAdditionalJsObject.getName())
                .isEqualTo(name);
        assertThat(afterPublishingPublishedActionInsideAdditionalJsObject.getContextType())
                .isEqualTo(WORKFLOW);
        assertThat(afterPublishingPublishedActionInsideAdditionalJsObject.getActionConfiguration())
                .isNotNull();
    }
}
