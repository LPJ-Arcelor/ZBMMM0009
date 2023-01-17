sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/MessagePopover",
    "sap/ui/core/message/Message",
    "sap/m/MessageItem",
    "sap/ui/core/library",
    "sap/ui/core/Core",
    "sap/m/Text",
    "sap/ui/core/Element",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "br/com/arcelor/zbmmm0009/util/formatter",
    "sap/m/Token",
    "sap/ui/core/library",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV",
  ],
  function (
    Controller,
    MessageToast,
    MessageBox,
    MessagePopover,
    Message,
    MessageItem,
    coreLibrary,
    Core,
    Text,
    Element,
    JSONModel,
    History,
    Fragment,
    Filter,
    FilterOperator,
    formatter,
    Token,
    library,
    Export, 
    ExportTypeCSV
  ) {
    "use strict";

    var ValueState = library.ValueState;
    var MessageType = coreLibrary.MessageType;

    return Controller.extend(
      "br.com.arcelor.zbmmm0009.controller.EnvioIndust",
      {
        formatter: formatter,

        onInit: function () {
          this.oView = this.getView();
          this._MessageManager = Core.getMessageManager();
          this._MessageManager.registerObject(this.oView.byId("page"), true);
          this.oView.setModel(
            this._MessageManager.getMessageModel(),
            "message"
          );
          this.createMessagePopover();

          // Clear the old messages
          this._MessageManager.removeAllMessages();

          this.getOwnerComponent()
            .getRouter()
            .getRoute("RouteEnvioIndust")
            .attachPatternMatched(this._onObjectMatched, this);

          // add validator
          var fnValidator = function (args) {
            var text = args.text;
            return new Token({ key: text, text: text });
          };

          var oPedidoMulti = this.getView().byId("fldPedidoMulti");
          oPedidoMulti.addValidator(fnValidator);

          var oItemContratoMulti = this.getView().byId("fldContratoItemMulti");
          oItemContratoMulti.addValidator(fnValidator);
        },

        _onObjectMatched: function (oEvent) {
          var oMulti = this.getView().byId("fldPedidoMulti");
          oMulti.removeAllTokens();
          oMulti.setValueState(ValueState.None);
          var oItemContratoMulti = this.getView().byId("fldContratoItemMulti");
          oItemContratoMulti.removeAllTokens();
          oItemContratoMulti.setValueState(ValueState.None);
          var oLifnrContrato = this.getView().byId("inLifnrContrato");
          oLifnrContrato.setValue("");
          var oLifnrPedido = this.getView().byId("inLifnrPedido");
          oLifnrPedido.setValue("");
          var oLifnrMaterial = this.getView().byId("inLifnrMaterial");
          oLifnrMaterial.setValue("");
        },

        onNovo: function (oEvent) {
          let sItem = 0;
          var aItens =
            this.getView()
              .getModel("ItensIndust_JSONModel")
              .getProperty("/Itens") || [];

          if (aItens.length > 0) {
            sItem = aItens[aItens.length - 1].Item;
          }

          sItem += 10;

          var aNewItem = {
            IdHeader: "",
            Item: sItem,
            Matnr: "",
            Maktx: "",
            Lgort: "",
            Menge: "",
            Meins: "",
            Charg: "",
            Ebeln: "",
            Ebelp: "",
            MaterialAcabado: "",
            MaterialAcabadoDescricao: "",
          };

          aItens.push(aNewItem);
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty("/Itens", aItens);
        },

        _createViewModel: function () {
          return new JSONModel({
            Werks: "",
            Lifnr: "",
            Itens: [],
          });
        },

        onDel: function (oEvent) {
          var aIndices = this.byId("ItensEnvIndustTable").getSelectedIndices();
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem")
            );
          } else {
            this.byId("ItensEnvIndustTable").clearSelection();
            var oItensIndust_JSONModel = this.getView().getModel(
              "ItensIndust_JSONModel"
            );
            if (typeof oItensIndust_JSONModel != "undefined") {
              var aItens = oItensIndust_JSONModel.getData().Itens;
              let iCont = 0;
              aIndices.reverse();
              aIndices.forEach(function (oResult) {
                aItens.splice(oResult, 1);
                iCont++;
              });
              //oItensIndust_JSONModel.setData({Itens:aItens});
              this.getView()
                .getModel("ItensIndust_JSONModel")
                .setProperty("/Itens", aItens);
              MessageToast.show(
                iCont +
                  " " +
                  this.getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("msgBoxItemDeleted")
              );
            }
          }
        },

        onDelX41: function (oEvent) {
          var aIndices = this.byId("ItensX41Table").getSelectedIndices();
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem")
            );
          } else {
            this.byId("ItensX41Table").clearSelection();
            var oItensIndust_JSONModel =
              this.getView().getModel("envioX41Model");
            if (typeof oItensIndust_JSONModel != "undefined") {
              var aItens = oItensIndust_JSONModel.getData().Itens;
              let iCont = 0;
              aIndices.reverse();
              aIndices.forEach(function (oResult) {
                aItens.splice(oResult, 1);
                iCont++;
              });
              this.getView()
                .getModel("envioX41Model")
                .setProperty("/Itens", aItens);
              MessageToast.show(
                iCont +
                  " " +
                  this.getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("msgBoxItemDeleted")
              );
            }
          }
        },

        onDelPedido: function (oEvent) {
          var aIndices = this.byId("ItensPedidoTable").getSelectedIndices();
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem")
            );
          } else {
            this.byId("ItensPedidoTable").clearSelection();
            var oItensIndust_JSONModel =
              this.getView().getModel("envioPedidoModel");
            if (typeof oItensIndust_JSONModel != "undefined") {
              var aItens = oItensIndust_JSONModel.getData().Itens;
              let iCont = 0;
              aIndices.reverse();
              aIndices.forEach(function (oResult) {
                aItens.splice(oResult, 1);
                iCont++;
              });
              //oItensIndust_JSONModel.setData({Itens:aItens});
              this.getView()
                .getModel("envioPedidoModel")
                .setProperty("/Itens", aItens);
              MessageToast.show(
                iCont +
                  " " +
                  this.getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("msgBoxItemDeleted")
              );
            }
          }
        },

        onDelContrato: function (oEvent) {
          var aIndices = this.byId("ItensContratoTable").getSelectedIndices();
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem")
            );
          } else {
            this.byId("ItensContratoTable").clearSelection();
            var oItensIndust_JSONModel =
              this.getView().getModel("envioContratoModel");
            if (typeof oItensIndust_JSONModel != "undefined") {
              var aItens = oItensIndust_JSONModel.getData().Itens;
              let iCont = 0;
              aIndices.reverse();
              aIndices.forEach(function (oResult) {
                aItens.splice(oResult, 1);
                iCont++;
              });
              this.getView()
                .getModel("envioContratoModel")
                .setProperty("/Itens", aItens);
              MessageToast.show(
                iCont +
                  " " +
                  this.getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("msgBoxItemDeleted")
              );
            }
          }
        },

        onDelMaterial: function (oEvent) {
          var aIndices = this.byId("ItensMaterialTable").getSelectedIndices();
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem")
            );
          } else {
            this.byId("ItensMaterialTable").clearSelection();
            var oMaterialModel = this.getView().getModel("envioMaterialModel");
            if (typeof oMaterialModel != "undefined") {
              var aItens = oMaterialModel.getData().Itens;
              let iCont = 0;
              aIndices.reverse();
              aIndices.forEach(function (oResult) {
                aItens.splice(oResult, 1);
                iCont++;
              });
              this.getView()
                .getModel("envioMaterialModel")
                .setProperty("/Itens", aItens);
              MessageToast.show(
                iCont +
                  " " +
                  this.getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("msgBoxItemDeleted")
              );
            }
          }
        },

        goBack: function () {
          //this.getView().getModel("ItensIndust_JSONModel").resetChanges();

          var aItens = [];
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty("/Itens", aItens);

          this.getView().byId("inLifnr").setValue("");
          this.getView().byId("lblDescFornecedor").setText("");
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty("/Lifnr", "");

          this.getView().byId("inWerks").setSelectedKey("");
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty("/Werks", "");

          var sPreviousHash = History.getInstance().getPreviousHash();

          this._MessageManager.removeAllMessages();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("worklist", true);
          }
        },

        onCancelar: function (oEvent) {
          var oMulti = this.getView().byId("fldPedidoMulti");
          oMulti.removeAllTokens();
          oMulti.setValueState(ValueState.None);
          var oItemContratoMulti = this.getView().byId("fldContratoItemMulti");
          oItemContratoMulti.removeAllTokens();
          oItemContratoMulti.setValueState(ValueState.None);
          this.goBack();
        },

        onExit: function (oEvent) {
          //this.goBack();
        },

        onValueHelpRequest: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue(),
            oView = this.getView();
          this.selectedValueHelp = oEvent.getSource();

          if (!this._pValueHelpDialog) {
            this._pValueHelpDialog = Fragment.load({
              id: oView.getId(),
              name: "br.com.arcelor.zbmmm0009.ValueHelpDialog",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }
          var sLifnr = this.getView().byId("inLifnr").getValue();
          this._pValueHelpDialog.then(function (oDialog) {
            var vWerks = oView.getModel("ItensIndust_JSONModel").oData["Werks"];
            var oFilter = new Filter({
              filters: [
                new Filter({
                  path: "Lifnr",
                  operator: FilterOperator.EQ,
                  value1: sLifnr,
                }),
                new Filter({
                  path: "Werks",
                  operator: FilterOperator.EQ,
                  value1: vWerks,
                }),
                new Filter({
                  path: "Matnr",
                  operator: FilterOperator.Contains,
                  value1: sInputValue,
                }),
              ],
              and: true,
            });
            // Create a filter for the binding
            //oDialog.getBinding("items").filter([new Filter("Matnr", FilterOperator.Contains, sInputValue)]);
            oDialog.getBinding("items").filter(oFilter);
            // Open ValueHelpDialog filtered by the input's value
            oDialog.open(sInputValue);
          });
        },

        onvhMatnrChange: function (oEvent) {
          var that = this,
            sInputValue = oEvent.getSource().getValue(),
            oView = this.getView(),
            oSelInput = oEvent.getSource();

          var sLifnr = this.getView().byId("inLifnr").getValue();
          var sWerks = oView.getModel("ItensIndust_JSONModel").oData["Werks"];

          var oFilter = [
            new sap.ui.model.Filter(
              "Lifnr",
              sap.ui.model.FilterOperator.EQ,
              sLifnr
            ),
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              sWerks
            ),
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              sInputValue
            ),
          ];
          //clear messages
          this._MessageManager.removeAllMessages();
          //clear description
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty(
              oSelInput.getBindingContext("ItensIndust_JSONModel").getPath() +
                "/Maktx",
              ""
            );
          //clear meins
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty(
              oSelInput.getBindingContext("ItensIndust_JSONModel").getPath() +
                "/Meins",
              ""
            );
          this.byId("page").setBusy(true);
          var oModel = this.getOwnerComponent().getModel();
          oModel.read("/ShMatnrWerksSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              if (oData.results.length === 0) {
                //add message - invalid matnr
                that._MessageManager.addMessages(
                  new Message({
                    message: "Material: " + sInputValue + " inválido",
                    type: MessageType.Error,
                    //target: "/Items/" + parseInt(msg.Id) + "/" + msg.Field,
                    processor: that.getView().getModel("ItensIndust_JSONModel"),
                  })
                );
                that._setmessagePopoverBtn();
              } else {
                oData.results.forEach((result, i) => {
                  //set material description
                  that
                    .getView()
                    .getModel("ItensIndust_JSONModel")
                    .setProperty(
                      oSelInput
                        .getBindingContext("ItensIndust_JSONModel")
                        .getPath() + "/Maktx",
                      result.Maktx
                    );
                  that
                    .getView()
                    .getModel("ItensIndust_JSONModel")
                    .setProperty(
                      oSelInput
                        .getBindingContext("ItensIndust_JSONModel")
                        .getPath() + "/Meins",
                      result.Meins
                    );
                });
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
          //clear deposito
          that
            .getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty(
              oSelInput.getBindingContext("ItensIndust_JSONModel").getPath() +
                "/Lgort",
              ""
            );
          //set deposito
          var oFilterDeposito = [
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              sWerks
            ),
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              sInputValue
            ),
          ];
          this.byId("page").setBusy(true);
          var oModel = this.getOwnerComponent().getModel();
          oModel.read("/ShMatnrLgortSet", {
            filters: oFilterDeposito,
            success: function (oData, oResponse) {
              if (oData.results.length === 0) {
                //clear deposito
                that
                  .getView()
                  .getModel("ItensIndust_JSONModel")
                  .setProperty(
                    oSelInput
                      .getBindingContext("ItensIndust_JSONModel")
                      .getPath() + "/Lgort",
                    ""
                  );
              } else {
                //set deposito
                that
                  .getView()
                  .getModel("ItensIndust_JSONModel")
                  .setProperty(
                    oSelInput
                      .getBindingContext("ItensIndust_JSONModel")
                      .getPath() + "/Lgort",
                    oData.results[0].Lgort
                  );
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        onValueHelpSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var vWerks = this.getView().getModel("ItensIndust_JSONModel").oData[
            "Werks"
          ];
          var oView = this.getView();
          /*
          var andFilter = [];
          var orFilter = [];
          orFilter.push(new Filter("Matnr", FilterOperator.Contains, sValue));
          orFilter.push(
            new Filter("Maktg", FilterOperator.Contains, sValue.toUpperCase())
          );
          orFilter.push(new Filter("Maktx", FilterOperator.Contains, sValue));
          andFilter.push(new Filter(orFilter, false));
          orFilter = [];
          orFilter.push(new Filter("Werks", FilterOperator.EQ, vWerks));
          andFilter.push(new Filter(orFilter, false));
          oEvent
            .getSource()
            .getBinding("items")
            .filter(new Filter(andFilter, true));
						*/

          var sLifnr = this.getView().byId("inLifnr").getValue();
          var sWerks = oView.getModel("ItensIndust_JSONModel").oData["Werks"];
          var oFilter = [
            new sap.ui.model.Filter(
              "Lifnr",
              sap.ui.model.FilterOperator.EQ,
              sLifnr
            ),
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              sWerks
            ),
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
            new sap.ui.model.Filter(
              "Maktx",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
          ];
          oEvent.getSource().getBinding("items").filter(oFilter);
        },

        onValueHelpClose: function (oEvent) {
          var that = this;
          var oView = this.getView();
          var oSelectedItem = oEvent.getParameter("selectedItem");
          var oSel = this.selectedValueHelp;
          oEvent.getSource().getBinding("items").filter([]);
          if (!oSelectedItem) {
            return;
          }
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty(
              this.selectedValueHelp
                .getBindingContext("ItensIndust_JSONModel")
                .getPath() + "/Matnr",
              oSelectedItem.getTitle()
            );
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty(
              this.selectedValueHelp
                .getBindingContext("ItensIndust_JSONModel")
                .getPath() + "/Maktx",
              oSelectedItem.getDescription()
            );
          //set meins
          var sMeins = oEvent
            .getParameter("selectedItem")
            .getModel()
            .getProperty(
              oEvent
                .getParameter("selectedItem")
                .getBindingContext()
                .getPath() + "/Meins"
            );
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty(
              this.selectedValueHelp
                .getBindingContext("ItensIndust_JSONModel")
                .getPath() + "/Meins",
              sMeins
            );
          //set deposito
          var sWerks = oView.getModel("ItensIndust_JSONModel").oData["Werks"];
          var oFilter = [
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              sWerks
            ),
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              oSelectedItem.getTitle()
            ),
          ];
          this.byId("page").setBusy(true);
          var oModel = this.getOwnerComponent().getModel();
          oModel.read("/ShMatnrLgortSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              if (oData.results.length === 0) {
                //clear deposito
                that
                  .getView()
                  .getModel("ItensIndust_JSONModel")
                  .setProperty(
                    oSel.getBindingContext("ItensIndust_JSONModel").getPath() +
                      "/Lgort",
                    ""
                  );
              } else {
                //set deposito
                that
                  .getView()
                  .getModel("ItensIndust_JSONModel")
                  .setProperty(
                    oSel.getBindingContext("ItensIndust_JSONModel").getPath() +
                      "/Lgort",
                    oData.results[0].Lgort
                  );
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        _setmessagePopoverBtn: function () {
          var oButton = this.getView().byId("messagePopoverBtn");

          if (typeof oButton != "undefined") {
            oButton.setVisible(true);

            oButton.setType(this.buttonTypeFormatter());
            oButton.setIcon(this.buttonIconFormatter());
            oButton.setText(this.highestSeverityMessages());

            this.oMP.getBinding("items").attachChange(
              function (oEvent) {
                // this.oMP.navigateBack(); Não disponível na versão 1.71
                oButton.setType(this.buttonTypeFormatter());
                oButton.setIcon(this.buttonIconFormatter());
                oButton.setText(this.highestSeverityMessages());
              }.bind(this)
            );

            setTimeout(
              function () {
                this.oMP.openBy(oButton);
              }.bind(this),
              100
            );
          }
        },

        handleMessagePopoverPress: function (oEvent) {
          if (!this.oMP) {
            this.createMessagePopover();
          }
          this.oMP.toggle(oEvent.getSource());
        },

        createMessagePopover: function () {
          var that = this;

          this.oMP = new MessagePopover({
            activeTitlePress: function (oEvent) {
              var oItem = oEvent.getParameter("item"),
                oPage = that.getView().byId("page"),
                oMessage = oItem.getBindingContext("message").getObject(),
                oControl = Element.registry.get(oMessage.getControlId());

              if (oControl) {
                oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
                setTimeout(function () {
                  oControl.focus();
                }, 300);
              }
            },
            items: {
              path: "message>/",
              template: new MessageItem({
                title: "{message>message}",
                subtitle: "{message>additionalText}",
                groupName: {
                  parts: [{ path: "message>controlIds" }],
                  formatter: this.getGroupName,
                },
                activeTitle: {
                  parts: [{ path: "message>controlIds" }],
                  formatter: this.isPositionable,
                },
                type: "{message>type}",
                description: "{message>message}",
              }),
            },
          });

          this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
        },

        getGroupName: function (sControlId) {
          // the group name is generated based on the current layout
          // and is specific for each use case
          var oControl = Element.registry.get(sControlId);

          if (oControl) {
            var sFormSubtitle = oControl
                .getParent()
                .getParent()
                .getTitle()
                .getText(),
              sFormTitle = oControl
                .getParent()
                .getParent()
                .getParent()
                .getTitle();

            return sFormTitle + ", " + sFormSubtitle;
          }
        },

        isPositionable: function (sControlId) {
          // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
          return sControlId ? true : true;
        },

        // Display the button type according to the message with the highest severity
        // The priority of the message types are as follows: Error > Warning > Success > Info
        buttonTypeFormatter: function () {
          var sHighestSeverity;
          var aMessages = this._MessageManager.getMessageModel().oData;
          aMessages.forEach(function (sMessage) {
            switch (sMessage.type) {
              case "Error":
                sHighestSeverity = "Reject";
                break;
              case "Warning":
                sHighestSeverity =
                  sHighestSeverity !== "Reject" ? "Default" : sHighestSeverity;
                break;
              case "Success":
                sHighestSeverity =
                  sHighestSeverity !== "Reject" &&
                  sHighestSeverity !== "Default"
                    ? "Accept"
                    : sHighestSeverity;
                break;
              default:
                sHighestSeverity = !sHighestSeverity
                  ? "Default"
                  : sHighestSeverity;
                break;
            }
          });
          return sHighestSeverity;
        },

        // Display the number of messages with the highest severity
        highestSeverityMessages: function () {
          var sHighestSeverityIconType = this.buttonTypeFormatter();
          var sHighestSeverityMessageType;

          switch (sHighestSeverityIconType) {
            case "Negative":
              sHighestSeverityMessageType = "Error";
              break;
            case "Critical":
              sHighestSeverityMessageType = "Warning";
              break;
            case "Success":
              sHighestSeverityMessageType = "Success";
              break;
            default:
              sHighestSeverityMessageType = !sHighestSeverityMessageType
                ? "Information"
                : sHighestSeverityMessageType;
              break;
          }

          return (
            this._MessageManager
              .getMessageModel()
              .oData.reduce(function (iNumberOfMessages, oMessageItem) {
                return oMessageItem.type === sHighestSeverityMessageType
                  ? ++iNumberOfMessages
                  : iNumberOfMessages;
              }, 0) || ""
          );
        },

        // Set the button icon according to the message with the highest severity
        buttonIconFormatter: function () {
          var sIcon;
          var aMessages = this._MessageManager.getMessageModel().oData;

          aMessages.forEach(function (sMessage) {
            switch (sMessage.type) {
              case "Error":
                sIcon = "sap-icon://error";
                break;
              case "Warning":
                sIcon =
                  sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                break;
              case "Success":
                sIcon =
                  "sap-icon://error" && sIcon !== "sap-icon://alert"
                    ? "sap-icon://sys-enter-2"
                    : sIcon;
                break;
              default:
                sIcon = !sIcon ? "sap-icon://information" : sIcon;
                break;
            }
          });

          return sIcon;
        },

        onValueHelpRequestLifnr: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue();
          var sCentro;
          var oView = this.getView();
          this.selectedValueHelp = oEvent.getSource();

          //check selected tab
          var sSelTab = this.getView().byId("page").getSelectedSection();
          if (sSelTab.includes("pageSectionManual")) {
            sCentro = this.getView().byId("inWerks").getSelectedKey();
          } else if (sSelTab.includes("pageSectionPedido")) {
            //pedido
            sCentro = this.getView().byId("inWerksPedido").getSelectedKey();
          } else if (sSelTab.includes("pageSectionContrato")) {
            //contrato
            sCentro = this.getView().byId("inWerksContrato").getSelectedKey();
          } else if (sSelTab.includes("pageSectionMaterial")) {
            //material
            sCentro = this.getView().byId("inWerksMaterial").getSelectedKey();
          }

          if (!this._pValueHelpDialogLifnr) {
            this._pValueHelpDialogLifnr = Fragment.load({
              id: oView.getId(),
              name: "br.com.arcelor.zbmmm0009.ValueHelpDialogLifnr",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._pValueHelpDialogLifnr.then(function (oDialog) {
            oDialog
              .getBinding("items")
              .filter([new Filter("Centro", FilterOperator.Contains, sCentro)]);
            oDialog.open(sInputValue);
          });
        },

        onValueHelpSearchLifnr: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          //var oFilter = new Filter("Name1", FilterOperator.Contains, sValue);
          var oFilter = new Filter({
            filters: [
              new Filter({
                path: "Fornecedor",
                operator: FilterOperator.Contains,
                value1: sValue,
              }),
              /*
          new Filter({
            path: "Fornecedor",
            operator: FilterOperator.Contains,
            value1: sValue,
          }),
          new Filter({
            path: "Name1",
            operator: FilterOperator.Contains,
            value1: sValue,
          }),
					
          new Filter({
            path: "Mcod1",
            operator: FilterOperator.Contains,
            value1: sValue.toUpperCase(),
          }),
					*/
            ],
            and: false,
          });
          oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpCloseLifnr: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem");
          oEvent.getSource().getBinding("items").filter([]);
          if (!oSelectedItem) {
            return;
          }
          //check selected tab
          var sSelTab = this.getView().byId("page").getSelectedSection();
          if (sSelTab.includes("pageSectionManual")) {
            this.getView().byId("inLifnr").setValue(oSelectedItem.getTitle());
            this.getView()
              .getModel("ItensIndust_JSONModel")
              .setProperty("/Lifnr", oSelectedItem.getTitle());
            this.getView()
              .byId("lblDescFornecedor")
              .setText(oSelectedItem.getDescription());
          } else if (sSelTab.includes("pageSectionPedido")) {
            this.getView()
              .byId("inLifnrPedido")
              .setValue(oSelectedItem.getTitle());
            this.getView()
              .getModel("envioPedidoModel")
              .setProperty("/Lifnr", oSelectedItem.getTitle());
            this.getView()
              .byId("lblDescFornecedorPedido")
              .setText(oSelectedItem.getDescription());
          } else if (sSelTab.includes("pageSectionMaterial")) {
            this.getView()
              .byId("inLifnrMaterial")
              .setValue(oSelectedItem.getTitle());
            this.getView()
              .getModel("envioMaterialModel")
              .setProperty("/Lifnr", oSelectedItem.getTitle());
            this.getView()
              .byId("lblDescFornecedorMaterial")
              .setText(oSelectedItem.getDescription());
          }
        },

        onValueHelpRequestLgort: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue(),
            oView = this.getView();
          this.selectedValueHelp = oEvent.getSource();

          var aItens = this.getView().getModel("ItensIndust_JSONModel").oData[
            "Itens"
          ];
          var vIndex = this.selectedValueHelp
            .getBindingContext("ItensIndust_JSONModel")
            .getPath()
            .substring(7);
          var vMatnt = aItens[vIndex].Matnr;
          var vWerks = this.getView().getModel("ItensIndust_JSONModel").oData[
            "Werks"
          ];

          if (!this._pValueHelpDialogLgort) {
            this._pValueHelpDialogLgort = Fragment.load({
              id: oView.getId(),
              name: "br.com.arcelor.zbmmm0009.ValueHelpDialogLgort",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._pValueHelpDialogLgort.then(function (oDialog) {
            var oFilter = new Filter({
              filters: [
                new Filter({
                  path: "Matnr",
                  operator: FilterOperator.EQ,
                  value1: vMatnt,
                }),
                new Filter({
                  path: "Werks",
                  operator: FilterOperator.EQ,
                  value1: vWerks,
                }),
                new Filter({
                  path: "Lgort",
                  operator: FilterOperator.Contains,
                  value1: sInputValue,
                }),
              ],
              and: true,
            });
            //oDialog.getBinding("items").filter([new Filter("Lgort", FilterOperator.Contains, sInputValue)]);
            oDialog.getBinding("items").filter(oFilter);
            oDialog.open(sInputValue);
          });
        },

        onValueHelpSearchLgort: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var aItens = this.getView().getModel("ItensIndust_JSONModel").oData[
            "Itens"
          ];
          var vIndex = this.selectedValueHelp
            .getBindingContext("ItensIndust_JSONModel")
            .getPath()
            .substring(7);
          var vMatnt = aItens[vIndex].Matnr;
          var vWerks = this.getView().getModel("ItensIndust_JSONModel").oData[
            "Werks"
          ];
          //var oFilter = new Filter("Lgort", FilterOperator.Contains, sValue);
          var oFilter = new Filter({
            filters: [
              new Filter({
                path: "Matnr",
                operator: FilterOperator.EQ,
                value1: vMatnt,
              }),
              new Filter({
                path: "Werks",
                operator: FilterOperator.EQ,
                value1: vWerks,
              }),
              new Filter({
                path: "Lgort",
                operator: FilterOperator.Contains,
                value1: sValue,
              }),
            ],
            and: true,
          });
          oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpCloseLgort: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem");
          oEvent.getSource().getBinding("items").filter([]);
          if (!oSelectedItem) {
            return;
          }
          this.getView()
            .getModel("ItensIndust_JSONModel")
            .setProperty(
              this.selectedValueHelp
                .getBindingContext("ItensIndust_JSONModel")
                .getPath() + "/Lgort",
              oSelectedItem.getTitle()
            );
        },

        onValueHelpRequestCharg: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue(),
            oView = this.getView();
          this.selectedValueHelp = oEvent.getSource();

          var aItens;
          var vIndex;
          var vWerks;
          var vMatnt;
          var vLgort;
          //check selected tab
          var sSelTab = this.getView().byId("page").getSelectedSection();
          if (sSelTab.includes("pageSectionManual")) {
            aItens = this.getView().getModel("ItensIndust_JSONModel").oData[
              "Itens"
            ];
            vIndex = this.selectedValueHelp
              .getBindingContext("ItensIndust_JSONModel")
              .getPath()
              .substring(7);
            vWerks = this.getView().getModel("ItensIndust_JSONModel").oData[
              "Werks"
            ];
            vMatnt = aItens[vIndex].Matnr;
            vLgort = aItens[vIndex].Lgort;
          } else if (sSelTab.includes("pageSectionPedido")) {
            aItens = this.getView().getModel("envioPedidoModel").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioPedidoModel")
              .getPath()
              .substring(7);
            vWerks = this.getView().getModel("envioPedidoModel").oData["Werks"];
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          } else if (sSelTab.includes("pageSectionContrato")) {
            aItens =
              this.getView().getModel("envioContratoModel").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioContratoModel")
              .getPath()
              .substring(7);
            vWerks =
              this.getView().getModel("envioContratoModel").oData["Werks"];
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          } else if (sSelTab.includes("pageSectionMaterial")) {
            aItens =
              this.getView().getModel("envioMaterialModel").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioMaterialModel")
              .getPath()
              .substring(7);
            vWerks =
              this.getView().getModel("envioMaterialModel").oData["Werks"];
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          } else if (sSelTab.includes("pageSectionX41")) {
            aItens = this.getView().getModel("envioX41Model").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioX41Model")
              .getPath()
              .substring(7);
            vWerks = aItens[vIndex].Centro;
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          }

          if (!this._pValueHelpDialogCharg) {
            this._pValueHelpDialogCharg = Fragment.load({
              id: oView.getId(),
              name: "br.com.arcelor.zbmmm0009.ValueHelpDialogCharg",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._pValueHelpDialogCharg.then(function (oDialog) {
            var oFilter = new Filter({
              filters: [
                new Filter({
                  path: "Matnr",
                  operator: FilterOperator.EQ,
                  value1: vMatnt,
                }),
                new Filter({
                  path: "Werks",
                  operator: FilterOperator.EQ,
                  value1: vWerks,
                }),
                new Filter({
                  path: "Lgort",
                  operator: FilterOperator.EQ,
                  value1: vLgort,
                }),
                new Filter({
                  path: "Charg",
                  operator: FilterOperator.Contains,
                  value1: sInputValue,
                }),
              ],
              and: true,
            });
            //oDialog.getBinding("items").filter([new Filter("Charg", FilterOperator.Contains, sInputValue)]);
            oDialog.getBinding("items").filter(oFilter);
            oDialog.open(sInputValue);
          });
        },

        onValueHelpSearchCharg: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var aItens;
          var vIndex;
          var vWerks;
          var vMatnt;
          var vLgort;
          //check selected tab
          var sSelTab = this.getView().byId("page").getSelectedSection();
          if (sSelTab.includes("pageSectionManual")) {
            aItens = this.getView().getModel("ItensIndust_JSONModel").oData[
              "Itens"
            ];
            vIndex = this.selectedValueHelp
              .getBindingContext("ItensIndust_JSONModel")
              .getPath()
              .substring(7);
            vWerks = this.getView().getModel("ItensIndust_JSONModel").oData[
              "Werks"
            ];
            vMatnt = aItens[vIndex].Matnr;
            vLgort = aItens[vIndex].Lgort;
          } else if (sSelTab.includes("pageSectionPedido")) {
            aItens = this.getView().getModel("envioPedidoModel").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioPedidoModel")
              .getPath()
              .substring(7);
            vWerks = this.getView().getModel("envioPedidoModel").oData["Werks"];
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          } else if (sSelTab.includes("pageSectionContrato")) {
            aItens =
              this.getView().getModel("envioContratoModel").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioContratoModel")
              .getPath()
              .substring(7);
            vWerks =
              this.getView().getModel("envioContratoModel").oData["Werks"];
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          } else if (sSelTab.includes("pageSectionMaterial")) {
            aItens =
              this.getView().getModel("envioMaterialModel").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioMaterialModel")
              .getPath()
              .substring(7);
            vWerks =
              this.getView().getModel("envioMaterialModel").oData["Werks"];
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          } else if (sSelTab.includes("pageSectionX41")) {
            aItens = this.getView().getModel("envioX41Model").oData["Itens"];
            vIndex = this.selectedValueHelp
              .getBindingContext("envioX41Model")
              .getPath()
              .substring(7);
            vWerks = aItens[vIndex].Centro;
            vMatnt = aItens[vIndex].MaterialComp;
            vLgort = aItens[vIndex].Deposito;
          }

          /*
          var aItens = this.getView().getModel("ItensIndust_JSONModel").oData[
            "Itens"
          ];
          var vIndex = this.selectedValueHelp
            .getBindingContext("ItensIndust_JSONModel")
            .getPath()
            .substring(7);
          var vMatnt = aItens[vIndex].Matnr;
          var vLgort = aItens[vIndex].Lgort;
          var vWerks = this.getView().getModel("ItensIndust_JSONModel").oData[
            "Werks"
          ];
          */

          //var oFilter = new Filter("Charg", FilterOperator.Contains, sValue);
          var oFilter = new Filter({
            filters: [
              new Filter({
                path: "Matnr",
                operator: FilterOperator.EQ,
                value1: vMatnt,
              }),
              new Filter({
                path: "Werks",
                operator: FilterOperator.EQ,
                value1: vWerks,
              }),
              new Filter({
                path: "Lgort",
                operator: FilterOperator.EQ,
                value1: vLgort,
              }),
              new Filter({
                path: "Charg",
                operator: FilterOperator.Contains,
                value1: sValue,
              }),
            ],
            and: true,
          });
          oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpCloseCharg: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem");
          oEvent.getSource().getBinding("items").filter([]);
          if (!oSelectedItem) {
            return;
          }

          var sSelTab = this.getView().byId("page").getSelectedSection();

          var sSelCharg = oSelectedItem.getTitle();
          if (sSelCharg !== "SALDO") {
            //check selected tab
            if (sSelTab.includes("pageSectionManual")) {
              this.getView()
                .getModel("ItensIndust_JSONModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("ItensIndust_JSONModel")
                    .getPath() + "/Charg",
                  oSelectedItem.getTitle()
                );
            } else if (sSelTab.includes("pageSectionPedido")) {
              this.getView()
                .getModel("envioPedidoModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioPedidoModel")
                    .getPath() + "/Lote",
                  oSelectedItem.getTitle()
                );
            } else if (sSelTab.includes("pageSectionContrato")) {
              this.getView()
                .getModel("envioContratoModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioContratoModel")
                    .getPath() + "/Lote",
                  oSelectedItem.getTitle()
                );
            } else if (sSelTab.includes("pageSectionMaterial")) {
              this.getView()
                .getModel("envioMaterialModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioMaterialModel")
                    .getPath() + "/Lote",
                  oSelectedItem.getTitle()
                );
            } else if (sSelTab.includes("pageSectionX41")) {
              this.getView()
                .getModel("envioX41Model")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioX41Model")
                    .getPath() + "/Lote",
                  oSelectedItem.getTitle()
                );
            }
          } else {
            //check selected tab
            if (sSelTab.includes("pageSectionManual")) {
              this.getView()
                .getModel("ItensIndust_JSONModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("ItensIndust_JSONModel")
                    .getPath() + "/Charg",
                  ""
                );
            } else if (sSelTab.includes("pageSectionPedido")) {
              this.getView()
                .getModel("envioPedidoModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioPedidoModel")
                    .getPath() + "/Lote",
                  ""
                );
            } else if (sSelTab.includes("pageSectionContrato")) {
              this.getView()
                .getModel("envioContratoModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioContratoModel")
                    .getPath() + "/Lote",
                  ""
                );
            } else if (sSelTab.includes("pageSectionMaterial")) {
              this.getView()
                .getModel("envioMaterialModel")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioMaterialModel")
                    .getPath() + "/Lote",
                  ""
                );
            } else if (sSelTab.includes("pageSectionX41")) {
              this.getView()
                .getModel("envioX41Model")
                .setProperty(
                  this.selectedValueHelp
                    .getBindingContext("envioX41Model")
                    .getPath() + "/Lote",
                  ""
                );
            }

            /*
            this.getView()
              .getModel("ItensIndust_JSONModel")
              .setProperty(
                this.selectedValueHelp
                  .getBindingContext("ItensIndust_JSONModel")
                  .getPath() + "/Charg",
                ""
              );
            */
          }
        },

        onChangePedidoItem: function (oEvent) {
          var that = this,
            sInputValue = oEvent.getSource().getValue(),
            oView = this.getView(),
            oSelInput = oEvent.getSource(),
            sPedido = "",
            sItem = "";

          //check selected tab
          var sSelTab = this.getView().byId("page").getSelectedSection();
          if (sSelTab.includes("pageSectionManual")) {
            //manual
            sPedido = this.getView()
              .getModel("ItensIndust_JSONModel")
              .getProperty(
                oSelInput.getBindingContext("ItensIndust_JSONModel").getPath() +
                  "/Ebeln"
              );
            sItem = this.getView()
              .getModel("ItensIndust_JSONModel")
              .getProperty(
                oSelInput.getBindingContext("ItensIndust_JSONModel").getPath() +
                  "/Ebelp"
              );
          } else if (sSelTab.includes("pageSectionPedido")) {
            //pedido
            sPedido = "";
            sItem = "";
          } else if (sSelTab.includes("pageSectionMaterial")) {
            //material
            sPedido = this.getView()
              .getModel("envioMaterialModel")
              .getProperty(
                oSelInput.getBindingContext("envioMaterialModel").getPath() +
                  "/Pedido"
              );
            sItem = this.getView()
              .getModel("envioMaterialModel")
              .getProperty(
                oSelInput.getBindingContext("envioMaterialModel").getPath() +
                  "/Item"
              );
          }

          //clear messages
          this._MessageManager.removeAllMessages();

          //clear material/description
          if (sSelTab.includes("pageSectionManual")) {
            this.getView()
              .getModel("ItensIndust_JSONModel")
              .setProperty(
                oSelInput.getBindingContext("ItensIndust_JSONModel").getPath() +
                  "/MaterialAcabado",
                ""
              );
            this.getView()
              .getModel("ItensIndust_JSONModel")
              .setProperty(
                oSelInput.getBindingContext("ItensIndust_JSONModel").getPath() +
                  "/MaterialAcabadoDesc",
                ""
              );
          } else if (sSelTab.includes("pageSectionMaterial")) {
            this.getView()
              .getModel("envioMaterialModel")
              .setProperty(
                oSelInput.getBindingContext("envioMaterialModel").getPath() +
                  "/Componente",
                ""
              );
          }

          if (
            sPedido === null ||
            sPedido === "" ||
            sItem === null ||
            sItem === "" ||
            sItem === "00000"
          ) {
            return;
          }

          this.byId("page").setBusy(true);
          var oModel = this.getOwnerComponent().getModel();

          var sPath = oModel.createKey("/MaterialAcabadoSet", {
            Ebeln: sPedido,
            Ebelp: sItem,
          });

          oModel.read(sPath, {
            success: function (oData, oResponse) {
              if (oData !== undefined && oData !== null) {
                //set material
                if (sSelTab.includes("pageSectionManual")) {
                  that
                    .getView()
                    .getModel("ItensIndust_JSONModel")
                    .setProperty(
                      oSelInput
                        .getBindingContext("ItensIndust_JSONModel")
                        .getPath() + "/MaterialAcabado",
                      oData.Material
                    );
                  that
                    .getView()
                    .getModel("ItensIndust_JSONModel")
                    .setProperty(
                      oSelInput
                        .getBindingContext("ItensIndust_JSONModel")
                        .getPath() + "/MaterialAcabadoDesc",
                      oData.Descricao
                    );
                } else if (sSelTab.includes("pageSectionMaterial")) {
                  that
                    .getView()
                    .getModel("envioMaterialModel")
                    .setProperty(
                      oSelInput
                        .getBindingContext("envioMaterialModel")
                        .getPath() + "/Componente",
                      oData.Material
                    );
                }
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        onSearchMaterial: function () {
          var that = this;
          var bError = false;
          var oModel = this.getOwnerComponent().getModel();
          var oMaterialModel =
            this.getOwnerComponent().getModel("envioMaterialModel");
          var aItems = oMaterialModel.getData().Items || [];
          //Clear messages
          this._MessageManager.removeAllMessages();
          //validate obligatory
          var sCentro = this.getView().byId("inWerksMaterial").getSelectedKey();
          var sMaterial = this.getView().byId("fldMaterialSearch").getValue();
          var sLote = this.getView().byId("fldLoteSearch").getValue();
          var sDeposito = this.getView().byId("fldDepositoSearch").getValue();
          //material
          if (sMaterial === undefined || sMaterial === "") {
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgMaterialRequired"),
                type: MessageType.Error,
                target: "/Material",
                processor: that.getView().getModel("envioMaterialModel"),
              })
            );
            bError = true;
          }
          /*
          //lote
          if (sLote === undefined || sLote === "") {
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgLoteRequired"),
                type: MessageType.Error,
                target: "/Lote",
                processor: that.getView().getModel("envioMaterialModel"),
              })
            );
            bError = true;
          }
          //deposito
          if (sDeposito === undefined || sDeposito === "") {
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgDepositoRequired"),
                type: MessageType.Error,
                target: "/Deposito",
                processor: that.getView().getModel("envioMaterialModel"),
              })
            );
            bError = true;
          }
          */
          //check errors
          if (bError) {
            this._setmessagePopoverBtn();
            return;
          }
          //filter
          var oFilter = [
            new sap.ui.model.Filter(
              "Material",
              sap.ui.model.FilterOperator.EQ,
              sMaterial
            ),
            new sap.ui.model.Filter(
              "Centro",
              sap.ui.model.FilterOperator.EQ,
              sCentro
            ),
          ];
          //check other filters
          if (sDeposito !== undefined && sDeposito !== "") {
            oFilter.push(
              new sap.ui.model.Filter(
                "Deposito",
                sap.ui.model.FilterOperator.EQ,
                sDeposito
              )
            );
          }
          if (sLote !== undefined && sLote !== "") {
            oFilter.push(
              new sap.ui.model.Filter(
                "Lote",
                sap.ui.model.FilterOperator.EQ,
                sLote
              )
            );
          }
          //busy indicator
          that.byId("page").setBusy(true);
          //get material/lote data
          oModel.read("/MateriaPrimaItemSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              oData.results.forEach((result, i) => {
                var oRowData = {
                  Centro: result.Centro,
                  Deposito: result.Deposito,
                  Lote: result.Lote,
                  Material: result.Material,
                  MaterialDesc: result.MaterialDesc,
                  QtdDisp: result.QtdDisp,
                  QtdDispUn: result.QtdDispUn,
                  QtdEnvio: result.QtdEnvio,
                  QtdEnvioUn: result.QtdEnvioUn,
                  Pedido: result.Pedido,
                  Item: result.Item,
                  Componente: result.Componente,
                };
                aItems.push(oRowData);
              });
              oMaterialModel.setProperty("/Itens", aItems);
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        onSearchPedido: function () {
          var that = this;
          var bError = false;
          var oModel = this.getOwnerComponent().getModel();
          var oPedidoModel =
            this.getOwnerComponent().getModel("envioPedidoModel");
          var aItems = oPedidoModel.getData().Items || [];
          //Clear messages
          this._MessageManager.removeAllMessages();
          //validate
          var sPedido = this.getView().byId("fldPedidoSearch").getValue();
          if (sPedido === undefined || sPedido === "") {
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgPedidoRequired"),
                type: MessageType.Error,
                target: "/Pedido",
                processor: that.getView().getModel("envioPedidoModel"),
              })
            );
            this._setmessagePopoverBtn();
            return;
          }
          //validate duplicate
          if (aItems.some((item) => item.Pedido === sPedido)) {
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgPedidoDuplicated"),
                type: MessageType.Error,
                target: "/Pedido",
                processor: that.getView().getModel("envioPedidoModel"),
              })
            );
            this._setmessagePopoverBtn();
            return;
          }
          //filter
          var oFilter = [
            new sap.ui.model.Filter(
              "Pedido",
              sap.ui.model.FilterOperator.EQ,
              sPedido
            ),
          ];
          //busy indicator
          that.byId("page").setBusy(true);
          //get pedido data
          oModel.read("/orderDataSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              oData.results.forEach((result, i) => {
                var oRowData = {
                  Pedido: result.Pedido,
                  Item: result.Item,
                  MaterialComp: result.MaterialComp,
                  MaterialCompDesc: result.MaterialCompDesc,
                  MaterialAcab: result.MaterialAcab,
                  MaterialAcabDesc: result.MaterialAcabDesc,
                  Deposito: result.Deposito,
                  QtdPedido: result.QtdSaida,
                  Lote: "",
                  QtdLote: "",
                  UmBasica: result.UmBasica,
                };
                aItems.push(oRowData);
              });
              oPedidoModel.setProperty("/Itens", aItems);
              //set centro/fornecedor field
              if (oData.results.length > 0) {
                that
                  .getView()
                  .byId("inWerksPedido")
                  .setSelectedKey(oData.results[0].Centro);
                that
                  .getView()
                  .byId("inLifnrPedido")
                  .setValue(oData.results[0].Fornecedor);
                //-->>>>>--DMND0029225-16.01.2023
                that
                  .getView()
                  .byId("lblDescFornecedorPedido")
                  .setText(oData.results[0].FornecedorDesc);   
                //--<<<<<--DMND0029225-16.01.2023                 
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        onSearchContrato: function () {
          var that = this;
          var bError = false;
          var oModel = this.getOwnerComponent().getModel();
          var oContratoModel =
            this.getOwnerComponent().getModel("envioContratoModel");
          var aItems = oContratoModel.getData().Items || [];
          //Clear messages
          this._MessageManager.removeAllMessages();
          //validate
          var sContrato = this.getView().byId("fldContratoSearch").getValue();
          //var sItem = this.getView().byId("fldContratoItemSearch").getValue();
          if (sContrato === undefined || sContrato === "") {
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgContratoRequired"),
                type: MessageType.Error,
                target: "/Contrato",
                processor: that.getView().getModel("envioContratoModel"),
              })
            );
            this._setmessagePopoverBtn();
            return;
          }
          //validate duplicate
          if (aItems.some((item) => item.Contrato === sContrato)) {
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgContratoDuplicated"),
                type: MessageType.Error,
                target: "/Contrato",
                processor: that.getView().getModel("envioContratoModel"),
              })
            );
            this._setmessagePopoverBtn();
            return;
          }
          //item contrato
          var oItemContratoMulti = this.getView().byId("fldContratoItemMulti");
          var oItemContratoToken = oItemContratoMulti.getTokens();
          //filter
          var oFilter = [
            new sap.ui.model.Filter(
              "Contrato",
              sap.ui.model.FilterOperator.EQ,
              sContrato
            )
          ];
          for (var i = 0; i < oItemContratoToken.length; i++) {
            oFilter.push(
              new sap.ui.model.Filter(
                "Item",
                sap.ui.model.FilterOperator.EQ,
                oItemContratoToken[i].getProperty("key")
              )
            );
          }
          /*
          if(sItem !== "" && sItem !== undefined){
            oFilter.push(
              new sap.ui.model.Filter(
                "Item",
                sap.ui.model.FilterOperator.EQ,
                sItem
              ),
            );
          }
          */
          //busy indicator
          that.byId("page").setBusy(true);
          //get pedido data
          var aPromises = [];
          var aPOItem = [];
          oModel.read("/contratoDataSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              oData.results.forEach((result, i) => {
                var oRowData = {
                  Contrato: result.Contrato,
                  Item: result.Item,
                  MaterialComp: result.MaterialComp,
                  MaterialCompDesc: result.MaterialCompDesc,
                  MaterialAcab: result.MaterialAcab,
                  MaterialAcabDesc: result.MaterialAcabDesc,
                  Deposito: result.Deposito,
                  QtdContrato: result.QtdSaida,
                  Lote: "",
                  QtdLote: "",
                  UmBasica: result.UmBasica,
                  Components: []
                };
                //set centro/fornecedor field
                if (oData.results.length > 0) {
                  that
                    .getView()
                    .byId("inWerksContrato")
                    .setSelectedKey(oData.results[0].Centro);
                  that
                    .getView()
                    .byId("inLifnrContrato")
                    .setValue(oData.results[0].Fornecedor);
                  //-->>>>>--DMND0029225-16.01.2023
                  that
                    .getView()
                    .byId("lblDescFornecedorContrato")
                    .setText(oData.results[0].FornecedorDesc);   
                //--<<<<<--DMND0029225-16.01.2023                      
                }
                //Selecionar componentes do material
                aPromises.push(
                  that._selecionarComponentes(
                    oModel,
                    oRowData,
                    that.getView().byId("inWerksContrato").getSelectedKey()
                  ).then(
                    function (aValues) {
                      aPOItem.push(aValues);
                    }.bind(this)
                  )
                );
              });
              //get components
              Promise.all(aPromises).then(
                function (values) {
                  oContratoModel.setProperty("/Itens", aPOItem);
                  that.byId("page").setBusy(false);
                }.bind(this)
              );
              //busy indicator
              //that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        onSearchPedidoX41: function () {
          var that = this;
          var bError = false;
          var oModel = this.getOwnerComponent().getModel();
          var oX41Model = this.getOwnerComponent().getModel("envioX41Model");
          var aItems = oX41Model.getData().Items || [];
          //Clear messages
          this._MessageManager.removeAllMessages();
          //validate
          var oPedidoFld = this.getView().byId("fldPedidoMulti");
          oPedidoFld.setValueState(ValueState.None);
          var oPedidoToken = oPedidoFld.getTokens();
          if (oPedidoToken.length <= 0) {
            oPedidoFld.setValueState(ValueState.Error);
            //add message
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgPedidoRequired"),
                type: MessageType.Error,
                target: "/Pedido",
                processor: that.getView().getModel("envioX41Model"),
              })
            );
            this._setmessagePopoverBtn();
            bError = true;
          }
          if (bError) {
            return;
          }
          //filter
          var oFilter = [];
          for (var i = 0; i < oPedidoToken.length; i++) {
            oFilter.push(
              new sap.ui.model.Filter(
                "Pedido",
                sap.ui.model.FilterOperator.EQ,
                oPedidoToken[i].getProperty("key")
              )
            );
          }
          oFilter.push(
            new sap.ui.model.Filter(
              "IsX41",
              sap.ui.model.FilterOperator.EQ,
              true
            )
          );
          //busy indicator
          that.byId("page").setBusy(true);
          //get pedido data
          oModel.read("/orderDataSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              oData.results.forEach((result, i) => {
                var oRowData = {
                  Pedido: result.Pedido,
                  Item: result.Item,
                  MaterialComp: result.MaterialComp,
                  MaterialCompDesc: result.MaterialCompDesc,
                  MaterialAcab: result.MaterialAcab,
                  MaterialAcabDesc: result.MaterialAcabDesc,
                  Deposito: result.Deposito,
                  QtdPedido: result.QtdSaida,
                  Lote: "",
                  QtdLote: "",
                  UmBasica: result.UmBasica,
                  Centro: result.Centro,
                  Fornecedor: result.Fornecedor,
                };
                aItems.push(oRowData);
              });
              oX41Model.setProperty("/Itens", aItems);

              //-->>>>>--DMND0029225-16.01.2023
                //set centro/fornecedor field
                if (oData.results.length > 0) {
                  that
                    .getView()
                    .byId("inWerksx41")
                    .setSelectedKey(oData.results[0].Centro);
                  that
                    .getView()
                    .byId("inLifnrx41")
                    .setValue(oData.results[0].Fornecedor);

                  that
                    .getView()
                    .byId("lblDescFornecedorx41")
                    .setText(oData.results[0].FornecedorDesc);                  
                }
              //--<<<<<--DMND0029225-16.01.2023      


              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        onSave: function () {
          //clear messages
          this._MessageManager.removeAllMessages();
          //check selected tab
          var sSelTab = this.getView().byId("page").getSelectedSection();
          if (sSelTab.includes("pageSectionManual")) {
            this._saveManual();
          } else if (sSelTab.includes("pageSectionPedido")) {
            this._savePedido();
          } else if (sSelTab.includes("pageSectionContrato")) {
            this._saveContrato();
          } else if (sSelTab.includes("pageSectionMaterial")) {
            this._saveMaterial();
          } else if (sSelTab.includes("pageSectionX41")) {
            this._saveX41();
          }
        },

        _savePedido: function () {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          let sError = false;

          //clear messages
          this._MessageManager.removeAllMessages();

          // Acessar Item model
          var oItensIndust_JSONModel =
            this.getView().getModel("envioPedidoModel");
          if (typeof oItensIndust_JSONModel != "undefined") {
            var oItens = oItensIndust_JSONModel.getData().Itens;
          }
          if (typeof oItens == "undefined") {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          } else if (oItens.length == 0) {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          }

          if (!sError) {
            //Callback Success
            var that = this;
            var fnSuccess = function (oData, oResponse) {
              that.byId("page").setBusy(false);

              let sMsg = that
                .getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxCreated");

              //Mensagem de sucesso
              MessageBox.success(sMsg, {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (sAction) {
                  that.goBack();
                },
              });
            };

            //Callback Error
            var fnError = function (oError) {
              console.log("Create error!");
              that._setmessagePopoverBtn();
              that.byId("page").setBusy(false);
            };

            var mParameters = {
              success: fnSuccess,
              error: fnError,
            };

            //Chamar criação da Remessa
            if (typeof oItens != "undefined") {
              var aData = {
                Id: 1,
                Werks: this.getView().byId("inWerksPedido").getSelectedKey(),
                Lifnr: this.getView().byId("inLifnrPedido").getValue(),
                HeaderIndustToItensIndust: [],
              };

              if (aData.Werks == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxWerks"),
                    type: MessageType.Error,
                    processor: this.getView().getModel("message"),
                  })
                );
              }

              if (aData.Lifnr == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxLifnr"),
                    type: MessageType.Error,
                    target: "",
                    processor: that.getView().getModel("envioPedidoModel"),
                  })
                );
              }

              for (var i = 0; i < oItens.length; i++) {
                var aItem = {
                  IdHeader: 1,
                  //Item: oItens[i].Item,
                  Matnr: oItens[i].MaterialComp,
                  Lgort: oItens[i].Deposito,
                  Menge: oItens[i].QtdLote + "",
                  Charg: oItens[i].Lote,
                  Ebeln: oItens[i].Pedido,
                  Ebelp: oItens[i].Item,
                  Meins: oItens[i].UmBasica,
                };

                if (parseFloat(aItem.Menge) == 0 || aItem.Menge == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMengePedido") +
                        " " +
                        aItem.Ebeln +
                        "/" +
                        aItem.Ebelp,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                if (aItem.Matnr == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMatnrPedido") +
                        " " +
                        aItem.Ebeln +
                        "/" +
                        aItem.Ebelp,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                if (aItem.Lgort == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxLgortPedido") +
                        " " +
                        aItem.Ebeln +
                        "/" +
                        aItem.Ebelp,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                aData.HeaderIndustToItensIndust.push(aItem);
              }

              if (!sError) {
                this._MessageManager.removeAllMessages();
                this.byId("page").setBusy(true);
                var that = this;
                var oDefaultModel = this.getOwnerComponent().getModel();
                oDefaultModel.create("/HeaderIndustSet", aData, mParameters);
              }
            }
          }

          //Verificar se ocorreu erro e gerar mensagens
          if (sError) {
            this._setmessagePopoverBtn();
          }
        },

        _saveContrato: function () {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          let sError = false;

          //clear messages
          this._MessageManager.removeAllMessages();

          // Acessar Item model
          var oItensIndust_JSONModel =
            this.getView().getModel("envioContratoModel");
          if (typeof oItensIndust_JSONModel != "undefined") {
            var oItens = oItensIndust_JSONModel.getData().Itens;
          }
          if (typeof oItens == "undefined") {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          } else if (oItens.length == 0) {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          }

          if (!sError) {
            //Callback Success
            var that = this;
            var fnSuccess = function (oData, oResponse) {
              that.byId("page").setBusy(false);

              let sMsg = that
                .getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxCreated");

              //Mensagem de sucesso
              MessageBox.success(sMsg, {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (sAction) {
                  that.goBack();
                },
              });
            };

            //Callback Error
            var fnError = function (oError) {
              console.log("Create error!");
              that._setmessagePopoverBtn();
              that.byId("page").setBusy(false);
            };

            var mParameters = {
              success: fnSuccess,
              error: fnError,
            };

            //Chamar criação da Remessa
            if (typeof oItens != "undefined") {
              var aData = {
                Id: 1,
                Werks: this.getView().byId("inWerksContrato").getSelectedKey(),
                Lifnr: this.getView().byId("inLifnrContrato").getValue(),
                HeaderIndustToItensIndust: [],
              };

              if (aData.Werks == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxWerks"),
                    type: MessageType.Error,
                    processor: this.getView().getModel("message"),
                  })
                );
              }

              if (aData.Lifnr == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxLifnr"),
                    type: MessageType.Error,
                    target: "",
                    processor: that.getView().getModel("envioContratoModel"),
                  })
                );
              }

              for (var i = 0; i < oItens.length; i++) {
                var aItem = {
                  IdHeader: 1,
                  //Item: oItens[i].Item,
                  Matnr: oItens[i].MaterialComp,
                  Lgort: oItens[i].Deposito,
                  Menge: oItens[i].QtdLote + "",
                  Charg: oItens[i].Lote,
                  Ebeln: oItens[i].Contrato,
                  Ebelp: oItens[i].Item,
                  Meins: oItens[i].UmBasica,
                };

                if (parseFloat(aItem.Menge) == 0 || aItem.Menge == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMengeContrato") +
                        " " +
                        aItem.Ebeln +
                        "/" +
                        aItem.Ebelp,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                if (aItem.Matnr == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMatnrContrato") +
                        " " +
                        aItem.Ebeln +
                        "/" +
                        aItem.Ebelp,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                if (aItem.Lgort == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxLgortContrato") +
                        " " +
                        aItem.Ebeln +
                        "/" +
                        aItem.Ebelp,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                aData.HeaderIndustToItensIndust.push(aItem);
              }

              if (!sError) {
                this._MessageManager.removeAllMessages();
                this.byId("page").setBusy(true);
                var that = this;
                var oDefaultModel = this.getOwnerComponent().getModel();
                oDefaultModel.create("/HeaderIndustSet", aData, mParameters);
              }
            }
          }

          //Verificar se ocorreu erro e gerar mensagens
          if (sError) {
            this._setmessagePopoverBtn();
          }
        },

        _saveMaterial: function () {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          let sError = false;

          //clear messages
          this._MessageManager.removeAllMessages();

          // Acessar Item model
          var oMaterialModel = this.getView().getModel("envioMaterialModel");

          //validate selected itens
          var aIndices = this.byId("ItensMaterialTable").getSelectedIndices();
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem")
            );
            return;
          }

          //validate if has items
          if (typeof oMaterialModel != "undefined") {
            var oItens = oMaterialModel.getData().Itens;
          }
          if (typeof oItens == "undefined") {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          } else if (oItens.length == 0) {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          }

          if (!sError) {
            //Callback Success
            var that = this;
            var fnSuccess = function (oData, oResponse) {
              that.byId("page").setBusy(false);

              let sMsg = that
                .getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxCreated");

              //Mensagem de sucesso
              MessageBox.success(sMsg, {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (sAction) {
                  that.goBack();
                },
              });
            };

            //Callback Error
            var fnError = function (oError) {
              console.log("Create error!");
              that._setmessagePopoverBtn();
              that.byId("page").setBusy(false);
            };

            var mParameters = {
              success: fnSuccess,
              error: fnError,
            };

            //Chamar criação da Remessa
            if (typeof oItens != "undefined") {
              var aData = {
                Id: 1,
                Werks: this.getView().byId("inWerksMaterial").getSelectedKey(),
                Lifnr: this.getView().byId("inLifnrMaterial").getValue(),
                HeaderIndustToItensIndust: [],
              };

              if (aData.Werks == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxWerks"),
                    type: MessageType.Error,
                    processor: this.getView().getModel("message"),
                  })
                );
              }

              if (aData.Lifnr == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxLifnr"),
                    type: MessageType.Error,
                    target: "",
                    processor: that.getView().getModel("envioPedidoModel"),
                  })
                );
              }

              //for (var i = 0; i < oItens.length; i++) {
              for (var i = 0; i < aIndices.length; i++) {
                var aItem = {
                  IdHeader: 1,
                  //Item: oItens[i].Item,
                  Matnr: oItens[aIndices[i]].Material,
                  Lgort: oItens[aIndices[i]].Deposito,
                  Menge: oItens[aIndices[i]].QtdEnvio + "",
                  Charg: oItens[aIndices[i]].Lote,
                  Ebeln: oItens[aIndices[i]].Pedido,
                  Ebelp: oItens[aIndices[i]].Item,
                  Meins: oItens[aIndices[i]].QtdEnvioUn,
                  //Ebelp: oItens[i].Item,
                };

                if (parseFloat(aItem.Menge) == 0 || aItem.Menge == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMengeMaterial") +
                        " material " +
                        aItem.Matnr +
                        " e lote " +
                        aItem.Charg,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }
                aData.HeaderIndustToItensIndust.push(aItem);
              }

              if (!sError) {
                this._MessageManager.removeAllMessages();
                this.byId("page").setBusy(true);
                var that = this;
                var oDefaultModel = this.getOwnerComponent().getModel();
                oDefaultModel.create("/HeaderIndustSet", aData, mParameters);
              }
            }
          }

          //Verificar se ocorreu erro e gerar mensagens
          if (sError) {
            this._setmessagePopoverBtn();
          }
        },

        _saveManual: function () {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          let sError = false;

          // Acessar Item model
          var oItensIndust_JSONModel = this.getView().getModel(
            "ItensIndust_JSONModel"
          );
          if (typeof oItensIndust_JSONModel != "undefined") {
            var oItens = oItensIndust_JSONModel.getData().Itens;
          }
          if (typeof oItens == "undefined") {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          } else if (oItens.length == 0) {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          }

          if (!sError) {
            //Callback Success
            var that = this;
            var fnSuccess = function (oData, oResponse) {
              that.byId("page").setBusy(false);

              let sMsg = that
                .getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxCreated");

              //Mensagem de sucesso
              MessageBox.success(sMsg, {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (sAction) {
                  that.goBack();
                },
              });
            };

            //Callback Error
            var fnError = function (oError) {
              console.log("Create error!");
              that._setmessagePopoverBtn();
              that.byId("page").setBusy(false);
            };

            var mParameters = {
              success: fnSuccess,
              error: fnError,
            };

            //Chamar criação da Remessa
            if (typeof oItens != "undefined") {
              var aData = {
                Id: 1,
                Werks: this.getView().byId("inWerks").getSelectedKey(),
                Lifnr: this.getView().byId("inLifnr").getValue(),
                HeaderIndustToItensIndust: [],
              };

              if (aData.Werks == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxWerks"),
                    type: MessageType.Error,
                    processor: this.getView().getModel("message"),
                  })
                );
              }

              if (aData.Lifnr == "") {
                sError = true;
                this._MessageManager.addMessages(
                  new Message({
                    message: this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("msgBoxLifnr"),
                    type: MessageType.Error,
                    processor: this.getView().getModel("message"),
                  })
                );
              }

              for (var i = 0; i < oItens.length; i++) {
                var aItem = {
                  IdHeader: 1,
                  Item: oItens[i].Item,
                  Matnr: oItens[i].Matnr,
                  Lgort: oItens[i].Lgort,
                  Menge: oItens[i].Menge + "",
                  Charg: oItens[i].Charg,
                  Ebeln: oItens[i].Ebeln,
                  Ebelp: oItens[i].Ebelp,
                  Meins: oItens[i].Meins,
                };

                if (parseFloat(aItem.Menge) == 0 || aItem.Menge == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMenge") +
                        " " +
                        aItem.Item,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                if (aItem.Matnr == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMatnr") +
                        " " +
                        aItem.Item,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                if (aItem.Lgort == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxLgort") +
                        " " +
                        aItem.Item,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }

                aData.HeaderIndustToItensIndust.push(aItem);
              }

              if (!sError) {
                this._MessageManager.removeAllMessages();
                this.byId("page").setBusy(true);
                var that = this;
                var oDefaultModel = this.getOwnerComponent().getModel();
                oDefaultModel.create("/HeaderIndustSet", aData, mParameters);
              }
            }
          }

          //Verificar se ocorreu erro e gerar mensagens
          if (sError) {
            this._setmessagePopoverBtn();
          }
        },

        onVhForDeposito: function (oEvent) {
          var that = this;
          var oColModel = new sap.ui.model.json.JSONModel();
          var aCols = this._vhDepositoCreateColumns();
          oColModel.setData({
            cols: aCols,
          });
          this._oValueHelpDialog = sap.ui.xmlfragment(
            "br.com.arcelor.zbmmm0009.fragment.vhDeposito",
            this
          );
          this.getView().addDependent(this._oValueHelpDialog);
          //filter
          var scentro = this.getView().byId("inWerksMaterial").getSelectedKey();
          var oFilter = [
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              scentro
            ),
          ];
          this._oValueHelpDialog.getTableAsync().then(
            function (oTable) {
              oTable.setNoData(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgVhNoReturn")
              );
              oTable.setModel(that.getView().getModel());
              oTable.setModel(oColModel, "columns");
              if (oTable.bindRows) {
                oTable.bindAggregation("rows", {
                  path: "/HT001lOldSet",
                  filters: oFilter,
                });
              }
              this._oValueHelpDialog.update();
            }.bind(this)
          );
          this._oValueHelpDialog.open();
        },

        onVhDepositoOk: function (oEvent) {
          var oTable = this._oValueHelpDialog.getTable();
          //get selected row
          var oContext = oTable
            .getContextByIndex(oTable.getSelectedIndex())
            .getObject();
          //set value
          this.getView()
            .getModel("envioMaterialModel")
            .setProperty("/Deposito", oContext.Lgort.trim());
          this._oValueHelpDialog.close();
        },

        onVhDepositoCancel: function (oEvent) {
          this._oValueHelpDialog.close();
        },

        onVhDepositoAfterClose: function (oEvent) {
          this._oValueHelpDialog.destroy();
        },

        _vhDepositoCreateColumns: function () {
          return [
            {
              label: this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("lblCentro"),
              template: "Werks",
            },
            {
              label: this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("lblDeposito"),
              template: "Lgort",
            },
            {
              label: this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("lblDenominacao"),
              template: "Lgobe",
            },
          ];
        },

        onValueHelpRequestMaterial: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue();
          var oView = this.getView();
          this.selectedValueHelp = oEvent.getSource();

          var sLifnr = this.getView().byId("inLifnrMaterial").getValue();
          var sWerks = this.getView().byId("inWerksMaterial").getSelectedKey();

          var oFilter = [
            new sap.ui.model.Filter(
              "Lifnr",
              sap.ui.model.FilterOperator.EQ,
              sLifnr
            ),
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              sWerks
            ),
          ];

          if (!this._pValueHelpDialogMaterial) {
            this._pValueHelpDialogMaterial = Fragment.load({
              id: oView.getId(),
              name: "br.com.arcelor.zbmmm0009.ValueHelpDialogMaterial",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._pValueHelpDialogMaterial.then(function (oDialog) {
            oDialog.getBinding("items").filter(oFilter);
            //.filter([new Filter("Werks", FilterOperator.Contains, sWerks)]);
            oDialog.open(sInputValue);
          });
        },

        onValueHelpSearchMaterial: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var sLifnr = this.getView().byId("inLifnrMaterial").getValue();
          var sWerks = this.getView().byId("inWerksMaterial").getSelectedKey();

          var oFilter = [
            new sap.ui.model.Filter(
              "Lifnr",
              sap.ui.model.FilterOperator.EQ,
              sLifnr
            ),
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              sWerks
            ),
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
          ];

          oEvent.getSource().getBinding("items").filter(oFilter);
        },

        onValueHelpCloseMaterial: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem");
          oEvent.getSource().getBinding("items").filter([]);
          if (!oSelectedItem) {
            return;
          }
          this.getView()
            .getModel("envioMaterialModel")
            .setProperty("/Material", oSelectedItem.getTitle());

          this.onChangeMaterial();
          //this.getView()
          //  .byId("lblDescFornecedorMaterial")
          //  .setText(oSelectedItem.getDescription());
        },

        onvhMatnrMaterial: function (oEvent) {
          var that = this,
            oView = this.getView(),
            oSelInput = oEvent.getSource();

          var sLifnr = this.getView().byId("inLifnrMaterial").getValue();
          var sWerks = oView.getModel("envioMaterialModel").oData["Werks"];

          var oFilter = [
            new sap.ui.model.Filter(
              "Lifnr",
              sap.ui.model.FilterOperator.EQ,
              sLifnr
            ),
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              sWerks
            ),
          ];
          //clear messages
          this._MessageManager.removeAllMessages();

          this.byId("page").setBusy(true);
          var oModel = this.getOwnerComponent().getModel();
          oModel.read("/ShMatnrWerksSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              if (oData.results.length === 0) {
                //add message - invalid matnr
                that._MessageManager.addMessages(
                  new Message({
                    message: "Material: " + sInputValue + " inválido",
                    type: MessageType.Error,
                    processor: that.getView().getModel("envioMaterialModel"),
                  })
                );
                that._setmessagePopoverBtn();
              } else {
                oData.results.forEach((result, i) => {
                  //set material description
                  that
                    .getView()
                    .getModel("ItensIndust_JSONModel")
                    .setProperty(
                      oSelInput
                        .getBindingContext("ItensIndust_JSONModel")
                        .getPath() + "/Maktx",
                      result.Maktx
                    );
                });
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        openX41LogDialog: function (oEvent) {
          if (!this._oDialogX41Log) {
            this._oDialogX41Log = sap.ui.xmlfragment(
              "br.com.arcelor.zbmmm0009.x41LogDialog",
              this
            );
            this.getView().addDependent(this._oDialogX41Log);
          }
          this._oDialogX41Log.open();

          /*
          var oView = this.getView();
          if (!this._oDialogX41Log) {
            oView.setBusy(true);
            this._oDialogX41Log = Fragment.load({
              id: oView.getId(),
              name: "br.com.arcelor.zbmmm0009.x41LogDialog",
              controller: this,
            }).then(function (oDialog) {
              oView.setBusy(false);
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this._oDialogX41Log.open();
          }
          */
        },

        onCloseDialogX41: function () {
          this._oDialogX41Log.close();
        },

        onParcelItem: function () {
          var oModel = this.getOwnerComponent().getModel("envioPedidoModel");
          var aIndices = this.byId("ItensPedidoTable").getSelectedIndices();
          var aItems = oModel.getData().Itens;
          //clear messages
          this._MessageManager.removeAllMessages();
          this._isValidated = false;
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgNoItemSelected")
            );
          } else if (aIndices.length > 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgSelectOnlyOneItem")
            );
          } else {
            this.byId("ItensPedidoTable").clearSelection();
            if (typeof oModel != "undefined") {
              var oCloneSel = Object.assign(
                {},
                oModel.getData().Itens[aIndices[0]]
              );
              oCloneSel.Lote = "";
              oCloneSel.QtdLote = "";
              aItems.splice(aIndices[0], 0, oCloneSel);
              oModel.setProperty("/Itens", aItems);
              MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgItemParceled")
              );
            }
          }
        },

        onParcelItemContrato: function () {
          var oModel = this.getOwnerComponent().getModel("envioContratoModel");
          var aIndices = this.byId("ItensContratoTable").getSelectedIndices();
          var aItems = oModel.getData().Itens;
          //clear messages
          this._MessageManager.removeAllMessages();
          this._isValidated = false;
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgNoItemSelected")
            );
          } else if (aIndices.length > 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgSelectOnlyOneItem")
            );
          } else {
            this.byId("ItensContratoTable").clearSelection();
            if (typeof oModel != "undefined") {
              var oCloneSel = Object.assign(
                {},
                oModel.getData().Itens[aIndices[0]]
              );
              oCloneSel.Lote = "";
              oCloneSel.QtdLote = "";
              aItems.splice(aIndices[0], 0, oCloneSel);
              oModel.setProperty("/Itens", aItems);
              MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgItemParceled")
              );
            }
          }
        },

        onParcelItemX41: function () {
          var oModel = this.getOwnerComponent().getModel("envioX41Model");
          var aIndices = this.byId("ItensX41Table").getSelectedIndices();
          var aItems = oModel.getData().Itens;
          //clear messages
          this._MessageManager.removeAllMessages();
          this._isValidated = false;
          if (aIndices.length < 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgNoItemSelected")
            );
          } else if (aIndices.length > 1) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgSelectOnlyOneItem")
            );
          } else {
            this.byId("ItensX41Table").clearSelection();
            if (typeof oModel != "undefined") {
              var oCloneSel = Object.assign(
                {},
                oModel.getData().Itens[aIndices[0]]
              );
              oCloneSel.Lote = "";
              oCloneSel.QtdLote = "";
              aItems.splice(aIndices[0], 0, oCloneSel);
              oModel.setProperty("/Itens", aItems);
              MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgItemParceled")
              );
            }
          }
        },

        initCentroValue: function () {
          this._getFornecedorFromCentro("pageSectionManual");
          this._getFornecedorFromCentro("pageSectionMaterial");
        },

        onChangeCentro: function () {
          var sSelTab = (sSelTab = this.getView()
            .byId("page")
            .getSelectedSection());
          this._getFornecedorFromCentro(sSelTab);
        },

        _getFornecedorFromCentro: function (sSelTab) {
          var that = this;
          var oInputLifnr;
          var oLabelLifnr;
          var sCentro;
          //check selected tab
          if (sSelTab.includes("pageSectionManual")) {
            sCentro = this.getView().byId("inWerks").getSelectedKey();
            oInputLifnr = this.getView().byId("inLifnr");
            oLabelLifnr = this.getView().byId("lblDescFornecedor");
          } else if (sSelTab.includes("pageSectionPedido")) {
            //pedido
            sCentro = this.getView().byId("inWerksPedido").getSelectedKey();
            oInputLifnr = this.getView().byId("inLifnrPedido");
            oLabelLifnr = this.getView().byId("lblDescFornecedorPedido");
          } else if (sSelTab.includes("pageSectionContrato")) {
            //contrato
            sCentro = this.getView().byId("inWerksContrato").getSelectedKey();
            oInputLifnr = this.getView().byId("inLifnrContrato");
            oLabelLifnr = this.getView().byId("lblDescFornecedorContrato");
          } else if (sSelTab.includes("pageSectionMaterial")) {
            //material
            sCentro = this.getView().byId("inWerksMaterial").getSelectedKey();
            oInputLifnr = this.getView().byId("inLifnrMaterial");
            oLabelLifnr = this.getView().byId("lblDescFornecedorMaterial");
          }
          //filter
          var oFilter = [
            new sap.ui.model.Filter(
              "Centro",
              sap.ui.model.FilterOperator.EQ,
              sCentro
            ),
          ];
          //clear messages
          this._MessageManager.removeAllMessages();

          this.byId("page").setBusy(true);
          var oModel = this.getOwnerComponent().getModel();
          oModel.read("/ShFornecedorSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              if (oData.results.length === 0) {
                //clear input fornecedor value
                oInputLifnr.setValue("");
                oLabelLifnr.setText("");
              } else {
                //set input fornecedor value
                oInputLifnr.setValue(oData.results[0].Fornecedor);
                oLabelLifnr.setText(oData.results[0].Name1);
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        onChangeMaterial: function () {
          var that = this;
          var oInput = this.getView().byId("fldDepositoSearch");
          //filter
          var scentro = this.getView().byId("inWerksMaterial").getSelectedKey();
          var oFilter = [
            new sap.ui.model.Filter(
              "Werks",
              sap.ui.model.FilterOperator.EQ,
              scentro
            ),
          ];
          //read
          this.byId("page").setBusy(true);
          var oModel = this.getOwnerComponent().getModel();
          oModel.read("/HT001lOldSet", {
            filters: oFilter,
            success: function (oData, oResponse) {
              if (oData.results.length === 0) {
                //clear input deposito value
                oInput.setValue("");
              } else {
                //set input deposito value
                oInput.setValue(oData.results[0].Lgort);
              }
              //busy indicator
              that.byId("page").setBusy(false);
            },
            error: function (error) {
              //busy indicator
              that.byId("page").setBusy(false);
              that._setmessagePopoverBtn();
            },
          });
        },

        _saveX41: function () {
          //confirmation
          MessageBox.warning(
            this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("msgConfirmX41"),
            {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              onClose: this.fnCallbackMovX41.bind(this),
            }
          );
        },

        fnCallbackMovX41: function (sResult) {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          let sError = false;
          var bAgrupaTransp = false;
          if (sResult === MessageBox.Action.YES) {
            bAgrupaTransp = true;
          } else {
            bAgrupaTransp = false;
          }
          //clear messages
          this._MessageManager.removeAllMessages();
          //get model
          var oItensIndust_JSONModel = this.getView().getModel("envioX41Model");
          if (typeof oItensIndust_JSONModel != "undefined") {
            var oItens = oItensIndust_JSONModel.getData().Itens;
          }
          if (typeof oItens == "undefined") {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          } else if (oItens.length == 0) {
            sError = true;
            this._MessageManager.addMessages(
              new Message({
                message: this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgBoxNoItem"),
                type: MessageType.Error,
                processor: this.getView().getModel("message"),
              })
            );
          }

          if (!sError) {
            //Callback Success
            var that = this;
            var fnSuccess = function (oData, oResponse) {
              that.byId("page").setBusy(false);
              //open log messages popup
              //TODO: create fragment to show log messages
              var oX41Model = that.getView().getModel("envioX41Model");
              var oX41Data = oX41Model.getData();
              //Set log data back to model
              oX41Data.ToLog = oData.ToLog.results;
              oX41Model.setData(oX41Data);
              that.openX41LogDialog();
            };
            //Callback Error
            var fnError = function (oError) {
              console.log("Create error!");
              that._setmessagePopoverBtn();
              that.byId("page").setBusy(false);
            };
            //Chamar criação da Remessa
            var mParameters = {
              success: fnSuccess,
              error: fnError,
            };
            if (typeof oItens != "undefined") {
              var aData = {
                Id: 1,
                Werks: "",
                Lifnr: "",
                isX41: true,
                isX41Agrup: bAgrupaTransp,
                HeaderIndustToItensIndust: [],
                ToLog: [],
              };
              //items
              for (var i = 0; i < oItens.length; i++) {
                var aItem = {
                  IdHeader: 1,
                  //Item: oItens[i].Item,
                  Matnr: oItens[i].MaterialComp,
                  Lgort: oItens[i].Deposito,
                  Menge: oItens[i].QtdLote + "",
                  Charg: oItens[i].Lote,
                  Ebeln: oItens[i].Pedido,
                  Ebelp: oItens[i].Item,
                  Meins: oItens[i].UmBasica,
                  Centro: oItens[i].Centro,
                  Fornecedor: oItens[i].Fornecedor,
                };
                if (parseFloat(aItem.Menge) == 0 || aItem.Menge == "") {
                  sError = true;
                  this._MessageManager.addMessages(
                    new Message({
                      message:
                        this.getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("msgBoxMengePedido") +
                        " " +
                        aItem.Ebeln +
                        "/" +
                        aItem.Ebelp,
                      type: MessageType.Error,
                      processor: this.getView().getModel("message"),
                    })
                  );
                }
                aData.HeaderIndustToItensIndust.push(aItem);
              }
              if (!sError) {
                this._MessageManager.removeAllMessages();
                this.byId("page").setBusy(true);
                var that = this;
                var oDefaultModel = this.getOwnerComponent().getModel();
                oDefaultModel.create("/HeaderIndustSet", aData, mParameters);
              }
            }
          }
          //Verificar se ocorreu erro e gerar mensagens
          if (sError) {
            this._setmessagePopoverBtn();
          }
        },

        _selecionarComponentes: function (oModel, aNewItem, sCentro) {
          return new Promise(
            function (fnResolve, fnReject) {
              var aFilters = [];
              aFilters.push(
                new Filter(
                  "Matnr",
                  sap.ui.model.FilterOperator.EQ,
                  aNewItem.MaterialAcab
                )
              );
              aFilters.push(
                new Filter(
                  "Werks",
                  sap.ui.model.FilterOperator.EQ,
                  sCentro
                )
              );

              oModel.read("/ComponenteSet", {
                filters: aFilters,
                success: function (oData) {
                  oData.results.forEach(function (oResult) {
                    aNewItem.Components.push({
                      Idnrk: oResult.Idnrk,
                      Maktx: oResult.Maktx,
                      Kmpmg: parseFloat(oResult.Kmpmg, 2),
                      Kmpme: oResult.Kmpme,
                    });
                  });
                  fnResolve(aNewItem);
                },
                error: function (oError) {
                  fnReject(oError);
                },
              });
            }.bind(this)
          );
        },

        onDataExport : function(oEvent) {
          var oExport = new Export({ 
            exportType : new ExportTypeCSV({
              separatorChar : ";"
            }),    
            models : this.getView().getModel("envioContratoModel"),    
            rows : {
              path : "/Itens"
            },    
            columns : [{
              name : "Contrato",
              template : {
                content : "{Contrato}"
              }
            }, {
              name : "Item contrato",
              template : {
                content : "{Item}"
              }
            }, {
              name : "Material acabado",
              template : {
                content : "{MaterialAcab}"
              }
            },{
              name : "Descrição material acabado",
              template : {
                content : "{MaterialAcabDesc}"
              }
            },{
              name : "Componente",
              template : {
                content : "{MaterialComp}"
              }
            },{
              name : "Depósito",
              template : {
                content : "{Deposito}"
              }
            },{
              name : "Qtde disponível",
              template : {
                content : "{QtdLote}"
              }
            },{
              name : "Lote",
              template : {
                content : "{Lote}"
              }
            }]
          });    
          // download exported file
          oExport.saveFile().catch(function(oError) {
            MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
          }).then(function() {
            oExport.destroy();
          });
        }

      }
    );
  }
);
