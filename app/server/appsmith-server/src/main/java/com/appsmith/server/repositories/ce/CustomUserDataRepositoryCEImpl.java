package com.appsmith.server.repositories.ce;

import com.appsmith.server.domains.UserData;
import com.appsmith.server.dtos.RecentlyUsedEntityDTO;
import com.appsmith.server.helpers.ce.bridge.Bridge;
import com.appsmith.server.repositories.BaseAppsmithRepositoryImpl;
import com.appsmith.server.repositories.CacheableRepositoryHelper;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaUpdate;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.mongodb.core.ReactiveMongoOperations;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class CustomUserDataRepositoryCEImpl extends BaseAppsmithRepositoryImpl<UserData>
        implements CustomUserDataRepositoryCE {

    public CustomUserDataRepositoryCEImpl(
            ReactiveMongoOperations mongoOperations,
            MongoConverter mongoConverter,
            CacheableRepositoryHelper cacheableRepositoryHelper) {
        super(mongoOperations, mongoConverter, cacheableRepositoryHelper);
    }

    @Modifying
    @Transactional
    @Override
    public int saveReleaseNotesViewedVersion(String userId, String version) {
        return queryBuilder()
                .criteria(Bridge.equal(UserData.Fields.userId, userId))
                .updateFirst(Bridge.update().set(UserData.Fields.releaseNotesViewedVersion, version));
    }

    @Override
    @Transactional
    @Modifying
    public Optional<Void> removeIdFromRecentlyUsedList(String userId, String workspaceId, List<String> applicationIds) {

        var entityManager = getEntityManager();
        final CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        final CriteriaUpdate<UserData> cu = cb.createCriteriaUpdate(UserData.class);
        final Root<UserData> root = cu.getRoot();

        final Path<Expression<?>> recentlyUsedEntityIdsField = root.get(UserData.Fields.recentlyUsedEntityIds);
        cu.set(
                recentlyUsedEntityIdsField,
                cb.function(
                        "jsonb_path_query_array",
                        Object.class,
                        cb.function("coalesce", List.class, recentlyUsedEntityIdsField, cb.literal("[]")),
                        cb.literal("$[*] ? (@.workspaceId != \"" + workspaceId + "\")")));

        final Path<Expression<?>> recentlyUsedWorkspaceIdsField = root.get(UserData.Fields.recentlyUsedWorkspaceIds);
        cu.set(
                recentlyUsedWorkspaceIdsField,
                cb.function(
                        "jsonb_minus",
                        Object.class,
                        cb.function("coalesce", List.class, recentlyUsedWorkspaceIdsField, cb.literal("[]")),
                        cb.literal(workspaceId).as(String.class)));

        if (!CollectionUtils.isEmpty(applicationIds)) {
            final Path<Expression<?>> recentlyUsedAppIdsField = root.get(UserData.Fields.recentlyUsedAppIds);
            final List<String> parts = new ArrayList<>();
            for (String applicationId : applicationIds) {
                parts.add("@ != \"" + applicationId + "\"");
            }
            cu.set(
                    recentlyUsedAppIdsField,
                    cb.function(
                            "jsonb_path_query_array",
                            Object.class,
                            cb.function("coalesce", List.class, recentlyUsedAppIdsField, cb.literal("[]")),
                            cb.literal("$[*] ? (" + String.join(" && ", parts) + ")")));
        }

        cu.where(cb.equal(root.get(UserData.Fields.userId), userId));

        final int count = entityManager.createQuery(cu).executeUpdate();
        return Optional.empty();
    }

    @Override
    public Optional<String> fetchMostRecentlyUsedWorkspaceId(String userId) {
        return queryBuilder()
                .criteria(Bridge.equal(UserData.Fields.userId, userId))
                .fields(UserData.Fields.recentlyUsedEntityIds)
                .one()
                .map(userData -> {
                    final List<RecentlyUsedEntityDTO> recentlyUsedWorkspaceIds = userData.getRecentlyUsedEntityIds();
                    return CollectionUtils.isEmpty(recentlyUsedWorkspaceIds)
                            ? ""
                            : recentlyUsedWorkspaceIds.get(0).getWorkspaceId();
                });
    }

    @Modifying
    @Transactional
    @Override
    public int updateByUserId(String userId, UserData userData) {
        return queryBuilder()
                .criteria(Bridge.equal(UserData.Fields.userId, userId))
                .updateFirst(userData);
    }
}
