/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.repositories.ce;

import com.appsmith.external.models.Datasource;
import com.appsmith.server.repositories.BaseRepository;
import com.appsmith.server.repositories.CustomDatasourceRepository;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DatasourceRepositoryCE
    extends BaseRepository<Datasource, String>, CustomDatasourceRepository {

  Flux<Datasource> findByIdIn(List<String> ids);

  Flux<Datasource> findAllByWorkspaceId(String workspaceId);

  Mono<Long> countByDeletedAtNull();
}
