import * as _ from "../../../support/Objects/ObjectsCore";

describe("Validate generate CRUD operation by creating a datasource from generate CRUD form", () => {
  it(
    "excludeForAirgap",
    "1. Generated CRUD app should work when there are no entities in the page & when there are entities in the current page",
    () => {
      _.dataSources.GeneratePageWithMockDB();
      //when there are entities in the current page
      _.entityExplorer.AddNewPage();
      _.apiPage.CreateApi();
      _.dataSources.GeneratePageWithMockDB();
      cy.matchImageSnapshot("crudpage");
    },
  );
  it(
    "airgap",
    "1. Generated CRUD app should work when there are no entities in the page & when there are entities in the current page - airgap",
    () => {
      _.dataSources.CreateDataSource("Postgres");
      cy.get("@dsName").then(($dsName) => {
        _.dataSources.GeneratePageWithDB($dsName, "public.city");

        //when there are entities in the current page
        _.entityExplorer.AddNewPage();
        _.apiPage.CreateApi();
        _.dataSources.GeneratePageWithDB($dsName, "public.city");
      });
    },
  );
});
