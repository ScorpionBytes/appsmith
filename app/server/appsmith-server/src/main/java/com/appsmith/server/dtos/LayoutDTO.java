/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.dtos;

import com.appsmith.external.exceptions.ErrorDTO;
import com.appsmith.server.domains.ScreenType;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import net.minidev.json.JSONObject;
import org.springframework.data.annotation.Transient;

@Getter
@Setter
public class LayoutDTO {

  public Set<String> userPermissions = new HashSet<>();
  ScreenType screen;

  JSONObject dsl;

  List<Set<DslActionDTO>> layoutOnLoadActions;

  // this attribute will be used to display errors caused white calculating allOnLoadAction
  // PageLoadActionsUtilCEImpl.java
  @Transient
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  List<ErrorDTO> layoutOnLoadActionErrors;

  // All the actions which have been updated as part of updateLayout function call
  List<LayoutActionUpdateDTO> actionUpdates;

  // All the toast messages that the developer user should be displayed to inform about the
  // consequences of update layout.
  List<String> messages;
  private String id;
}
