/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.solutions;

import com.appsmith.server.solutions.ce.PermissionGroupPermissionCEImpl;
import org.springframework.stereotype.Component;

@Component
public class PermissionGroupPermissionImpl extends PermissionGroupPermissionCEImpl
    implements PermissionGroupPermission {}
