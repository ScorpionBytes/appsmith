package com.appsmith.server.configurations;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * Properties in this configuration object are loaded from the `pom.properties` file that is generated by Maven
 * automatically. This file is included in the final JAR file at
 * `META-INF/maven/{project.group}/{project.name}/pom.properties`. Outside the JAR file, it can be accessed from
 * `target/maven-archiver/pom.properties`.
 */
@Configuration
@PropertySource(value = "classpath:META-INF/maven/com.appsmith/server/pom.properties", ignoreResourceNotFound = true)
@Getter
public class ProjectProperties {

    public static final String EDITION = "EE";

    @Value("${version:UNKNOWN}")
    private String version;

}
