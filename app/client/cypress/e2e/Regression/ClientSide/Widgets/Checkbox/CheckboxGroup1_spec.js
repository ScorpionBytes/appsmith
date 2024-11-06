import * as _ from "../../../../../support/Objects/ObjectsCore";

describe(
  "checkboxgroupwidget Widget Functionality",
  { tags: ["@tag.Widget", "@tag.Checkbox", "@tag.Binding"] },
  function () {
    before(() => {
      _.agHelper.AddDsl("emptyDSL");
    });

    it("Add new widget", () => {
      cy.dragAndDropToCanvas("checkboxgroupwidget", { x: 300, y: 300 });
      cy.get(".t--widget-checkboxgroupwidget").should("exist");
    });

    it("should check that prefilled option is added and empty value is allowed in options", () => {
      cy.openPropertyPane("checkboxgroupwidget");
      cy.get(".t--property-control-options-add").click({ force: true });
      cy.get(".t--property-control-options")
        .find(".t--js-toggle")
        .click({ force: true });
      cy.updateCodeInput(
        ".t--property-control-options",
        `[
        {
          "label": "Blue",
          "value": ""
        },
        {
          "label": "Green",
          "value": "GREEN"
        },
        {
          "label": "Red",
          "value": "RED"
        }
      ]`,
      );
      cy.get(".t--property-control-options .t--codemirror-has-error").should(
        "not.exist",
      );
    });

    it("should check that more thatn empty value is not allowed in options", () => {
      cy.openPropertyPane("checkboxgroupwidget");
      cy.updateCodeInput(
        ".t--property-control-options",
        `[
        {
          "label": "Blue",
          "value": ""
        },
        {
          "label": "Green",
          "value": ""
        },
        {
          "label": "Red",
          "value": "RED"
        }
      ]`,
      );
      cy.get(".t--property-control-options .t--codemirror-has-error").should(
        "exist",
      );
    });
  },
);
