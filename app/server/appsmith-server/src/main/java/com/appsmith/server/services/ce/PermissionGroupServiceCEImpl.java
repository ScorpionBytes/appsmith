package com.appsmith.server.services.ce;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.PermissionGroup;
import com.appsmith.server.domains.User;
import com.appsmith.server.exceptions.AppsmithError;
import com.appsmith.server.exceptions.AppsmithException;
import com.appsmith.server.repositories.PermissionGroupRepository;
import com.appsmith.server.services.AnalyticsService;
import com.appsmith.server.services.BaseService;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.convert.MongoConverter;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;

import javax.validation.Validator;
import java.util.HashSet;
import java.util.Set;


public class PermissionGroupServiceCEImpl extends BaseService<PermissionGroupRepository, PermissionGroup, String>
        implements PermissionGroupServiceCE {

    public PermissionGroupServiceCEImpl(Scheduler scheduler,
                                        Validator validator,
                                        MongoConverter mongoConverter,
                                        ReactiveMongoTemplate reactiveMongoTemplate,
                                        PermissionGroupRepository repository,
                                        AnalyticsService analyticsService) {

        super(scheduler, validator, mongoConverter, reactiveMongoTemplate, repository, analyticsService);
    }

    @Override
    public Flux<PermissionGroup> findAllByIds(Set<String> ids) {
        return repository.findAllById(ids);
    }

    @Override
    public Mono<PermissionGroup> save(PermissionGroup permissionGroup) {
        return repository.save(permissionGroup);
    }

    @Override
    public Mono<Void> delete(String id) {
        return repository.deleteById(id);
    }

    @Override
    public Mono<PermissionGroup> findById(String permissionGroupId) {
        return repository.findById(permissionGroupId);
    }

    public Mono<PermissionGroup> assignToUser(PermissionGroup permissionGroup, User user) {
        return repository.findById(permissionGroup.getId(), AclPermission.ASSIGN_PERMISSION_GROUPS)
                .flatMap(pg -> {

                    Set<String> assignedToUserIds = pg.getAssignedToUserIds();
                    if (assignedToUserIds == null) {
                        assignedToUserIds = new HashSet<>();
                    }
                    assignedToUserIds.add(user.getId());
                    pg.setAssignedToUserIds(assignedToUserIds);

                    return repository.updateById(pg.getId(), pg, AclPermission.ASSIGN_PERMISSION_GROUPS);
                })
                .switchIfEmpty(Mono.error(new AppsmithException(AppsmithError.ACL_NO_RESOURCE_FOUND)));
    }
}
