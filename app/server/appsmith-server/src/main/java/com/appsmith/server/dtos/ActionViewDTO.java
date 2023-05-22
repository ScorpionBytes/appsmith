/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.dtos;

import static com.appsmith.external.constants.ActionConstants.DEFAULT_ACTION_EXECUTION_TIMEOUT_MS;

import com.appsmith.external.models.DefaultResources;
import com.appsmith.external.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ActionViewDTO {

  @JsonView(Views.Public.class)
  String id;

  @JsonView(Views.Public.class)
  String name;

  @JsonView(Views.Public.class)
  String pageId;

  @JsonView(Views.Public.class)
  Integer timeoutInMillisecond;

  @JsonView(Views.Public.class)
  Boolean confirmBeforeExecute;

  @JsonView(Views.Public.class)
  Set<String> jsonPathKeys;

  @JsonView(Views.Internal.class)
  DefaultResources defaultResources;

  // Overriding the getter to ensure that for actions missing action configuration, the timeout is
  // still set for the client to use as a guideline (even though this would be an invalid action
  // and hence would return an action execution error.
  @JsonView(Views.Public.class)
  public Integer getTimeoutInMillisecond() {
    return (timeoutInMillisecond == null || timeoutInMillisecond <= 0)
        ? DEFAULT_ACTION_EXECUTION_TIMEOUT_MS
        : timeoutInMillisecond;
  }
}
