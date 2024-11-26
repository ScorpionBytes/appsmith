import { Flex, Button } from "@appsmith/ads";
import {
  DatasourceStructureContext,
  type DatasourceStructure,
} from "entities/Datasource";
import { DatasourceStructureContainer as DatasourceStructureList } from "pages/Editor/DatasourceInfo/DatasourceStructureContainer";
import React, { useCallback } from "react";
import DatasourceSelector from "./DatasourceSelector";
import { refreshDatasourceStructure } from "actions/datasourceActions";
import { useDispatch } from "react-redux";
import { SchemaTableContainer } from "./styles";

interface Props {
  datasourceId: string;
  datasourceName: string;
  currentActionId: string;
  datasourceStructure: DatasourceStructure;
  setSelectedTable: (table: string) => void;
  selectedTable: string | undefined;
}

const SchemaTables = ({
  currentActionId,
  datasourceId,
  datasourceName,
  datasourceStructure,
  selectedTable,
  setSelectedTable,
}: Props) => {
  const dispatch = useDispatch();

  const refreshStructure = useCallback(() => {
    dispatch(
      refreshDatasourceStructure(
        datasourceId,
        DatasourceStructureContext.QUERY_EDITOR,
      ),
    );
  }, [dispatch, datasourceId]);

  return (
    <SchemaTableContainer
      data-testid="t--datasource-schema-container"
      flexDirection="column"
      gap="spaces-3"
      overflow="hidden"
      padding="spaces-3"
      paddingBottom="spaces-0"
      w="400px"
    >
      <Flex
        alignItems={"center"}
        gap="spaces-2"
        justifyContent={"space-between"}
      >
        <DatasourceSelector
          datasourceId={datasourceId}
          datasourceName={datasourceName}
        />
        <Button
          className="datasourceStructure-refresh"
          isIconButton
          kind="tertiary"
          onClick={refreshStructure}
          size="sm"
          startIcon="refresh"
        />
      </Flex>
      <DatasourceStructureList
        context={DatasourceStructureContext.QUERY_EDITOR}
        currentActionId={currentActionId}
        datasourceId={datasourceId}
        datasourceName={datasourceName}
        datasourceStructure={datasourceStructure}
        onEntityTableClick={setSelectedTable}
        step={0}
        tableName={selectedTable}
      />
    </SchemaTableContainer>
  );
};

export { SchemaTables };
