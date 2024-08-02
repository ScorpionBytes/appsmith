package com.appsmith.external.models;

import com.appsmith.external.helpers.CustomJsonType;
import com.appsmith.external.views.Git;
import com.appsmith.external.views.Views;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldNameConstants;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.Where;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static com.appsmith.external.constants.PluginConstants.DEFAULT_APPSMITH_AI_DATASOURCE;
import static com.appsmith.external.constants.PluginConstants.DEFAULT_REST_DATASOURCE;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Where(clause = "deleted_at IS NULL")
@FieldNameConstants
public class DatasourceStorage extends GitSyncedDomain {

    @JsonView(Views.Public.class)
    String datasourceId;

    @JsonView(Views.Public.class)
    String environmentId;

    @Type(CustomJsonType.class)
    @Column(columnDefinition = "jsonb")
    @JsonView(Views.Public.class)
    DatasourceConfiguration datasourceConfiguration;

    /*
     * This field is introduced as part of git sync feature, for the git import we will need to identify the datasource's
     * which are not configured. This way user can configure those datasource, which may have been introduced as part of git import.
     */
    @JsonView(Views.Public.class)
    Boolean isConfigured;

    @Type(CustomJsonType.class)
    @Column(columnDefinition = "jsonb")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonView(Views.Public.class)
    Set<String> invalids = new HashSet<>();

    @Transient
    @JsonView({Views.Public.class, Git.class})
    String name;

    @Transient
    @JsonView({Views.Public.class, Git.class})
    String pluginId;

    /*
     * - To return useful hints to the user.
     * - These messages are generated by the API server based on the other datasource attributes.
     */
    @Transient
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonView(Views.Public.class)
    Set<String> messages = new HashSet<>();

    @Transient
    String pluginName;

    @Transient
    String workspaceId;

    @Transient
    @JsonView({Views.Public.class, Git.class})
    String templateName;

    @Transient
    @JsonView({Views.Public.class, Git.class})
    Boolean isAutoGenerated;

    @Transient
    Boolean isRecentlyCreated;

    @Transient
    Boolean isTemplate;

    @Transient
    Boolean isMock;

    public DatasourceStorage(
            String datasourceId,
            String environmentId,
            DatasourceConfiguration datasourceConfiguration,
            Boolean isConfigured,
            Set<String> invalids,
            Set<String> messages) {

        this.datasourceId = datasourceId;
        this.environmentId = environmentId;
        this.datasourceConfiguration = datasourceConfiguration;
        this.isConfigured = isConfigured;
        this.invalids = new HashSet<>();
        if (invalids != null) {
            this.invalids.addAll(invalids);
        }
        if (messages != null) {
            this.messages = messages;
        }
    }

    public void prepareTransientFields(Datasource datasource) {
        this.datasourceId = datasource.getId();
        this.name = datasource.getName();
        this.pluginId = datasource.getPluginId();
        this.pluginName = datasource.getPluginName();
        this.workspaceId = datasource.getWorkspaceId();
        this.templateName = datasource.getTemplateName();
        this.isAutoGenerated = datasource.getIsAutoGenerated();
        this.isRecentlyCreated = datasource.getIsRecentlyCreated();
        this.isTemplate = datasource.getIsTemplate();
        this.isMock = datasource.getIsMock();

        if (datasource.getInvalids() != null) {
            this.invalids.addAll(datasource.getInvalids());
        }
        this.gitSyncId = datasource.getGitSyncId();
    }

    @JsonView(Views.Public.class)
    public boolean getIsValid() {
        return CollectionUtils.isEmpty(invalids);
    }

    public void sanitiseToExportResource(Map<String, String> pluginMap) {
        this.setDatasourceId(null);
        this.setEnvironmentId(null);
        this.setPolicies(null);
        this.setUpdatedAt(null);
        this.setCreatedAt(null);
        this.setUserPermissions(null);
        this.setIsConfigured(null);
        this.setInvalids(null);
        this.setId(null);
        this.setWorkspaceId(null);
        this.setPluginId(pluginMap.get(this.getPluginId()));
        this.setIsRecentlyCreated(null);
    }

    @JsonView({Views.Internal.class})
    public boolean isEmbedded() {
        /**
         * We cannot just rely on datasourceId == null check because it will always be true for all cases when the
         * user clicks on `test datasource` button.
         * DEFAULT_REST_DATASOURCE is the embedded datasource name for both REST API plugin and GraphQL plugin.
         */
        return (DEFAULT_REST_DATASOURCE.equals(this.name) || DEFAULT_APPSMITH_AI_DATASOURCE.equals(this.name))
                && !StringUtils.hasText(this.datasourceId);
    }

    public static class Fields extends BaseDomain.Fields {}
}
