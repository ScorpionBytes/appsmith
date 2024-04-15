package com.appsmith.external.models;

import com.appsmith.external.helpers.CustomJsonType;
import com.appsmith.external.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldNameConstants;
import org.hibernate.annotations.Type;

import static com.appsmith.external.helpers.StringUtils.dotted;

@Setter
@Getter
@MappedSuperclass
@FieldNameConstants
public abstract class BranchAwareDomain extends BaseDomain {
    // This field will be used to store the default/root resource IDs for branched resources generated for git
    // connected applications and will be used to connect resources across the branches
    @JsonView(Views.Internal.class)
    @Type(CustomJsonType.class)
    @Column(columnDefinition = "jsonb")
    DefaultResources defaultResources;

    @Override
    public void sanitiseToExportDBObject() {
        this.setDefaultResources(null);
        super.sanitiseToExportDBObject();
    }

    public static class Fields extends BaseDomain.Fields {
        public static final String defaultResources_applicationId =
                dotted(defaultResources, DefaultResources.Fields.applicationId);
        public static final String defaultResources_branchName =
                dotted(defaultResources, DefaultResources.Fields.branchName);
        public static final String defaultResources_pageId = dotted(defaultResources, DefaultResources.Fields.pageId);
        public static final String defaultResources_actionId =
                dotted(defaultResources, DefaultResources.Fields.actionId);
    }
}
