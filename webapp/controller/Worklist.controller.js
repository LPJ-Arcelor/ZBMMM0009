sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/MessageItem",
    "sap/m/MessageView",
    "sap/m/Dialog",
    "sap/m/Bar",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ui/core/util/File",
    "sap/ui/core/routing/History",
    "sap/m/PDFViewer",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    MessageItem,
    MessageView,
    Dialog,
    Bar,
    Text,
    Button,
    File,
    History,
    PDFViewer
  ) {
    "use strict";

    return BaseController.extend(
      "br.com.arcelor.zbmmm0009.controller.Worklist",
      {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
          var oModel = this.getOwnerComponent().getModel();

          //Definir valor default para o filtro de Centro
          oModel.read("/ShPlantSet", {
            success: function (oData) {
              if (oData.results.length == 1) {
                var osmartFilter = this.getView().byId("smartFilterBar");
                var oDefaultFilter = {
                  Werks: {
                    ranges: [
                      {
                        exclude: false,
                        operation: "EQ",
                        keyField: "Werks",
                        value1: oData.results[0].Plant,
                      },
                    ],
                  },
                };
                osmartFilter.setFilterData(oDefaultFilter);
              }
            }.bind(this),
            error: function (error) {
              console.log("Erro ShPlantSet read");
            }.bind(this),
          });
        },

        _getColTitle: function(sColId, sId){
          return sColId.includes(sId);
        },

        onDataReceived: function (oEvent) {
          var that = this;
          var oTable = this.byId("smartTable");
          var i = 0;

          oTable
            .getTable()
            .getColumns()
            .forEach(function (oLine) {
              var scolId = oLine.getId();
              var iPos = scolId.indexOf("Home--smartTable");
              iPos = iPos + 17 - scolId.length;
              var sIdsubstr = scolId.slice(iPos);
              switch (true) {
                case that._getColTitle(scolId ,"CancelDesc"):
                  oLine.setWidth("120px");
                  break;            
                case that._getColTitle(scolId ,"Cancel"):
                  oLine.setWidth("100px");
                  break; 
                case that._getColTitle(scolId ,"Docdat"):
                  oLine.setWidth("100px");
                  break;
                case that._getColTitle(scolId ,"Nfenum"):
                  oLine.setWidth("100px");
                  break;
                case that._getColTitle(scolId ,"Itmnum"):
                  oLine.setWidth("100px");
                  break;
                case that._getColTitle(scolId ,"Ebeln"):
                  oLine.setWidth("100px");
                  break;
                case that._getColTitle(scolId ,"Parid"):
                  oLine.setWidth("100px");
                  break;
                case that._getColTitle(scolId ,"Name"):
                  oLine.setWidth("300px");
                  break;
                case that._getColTitle(scolId ,"Bwart"):
                  oLine.setWidth("100px");
                  break;
                case that._getColTitle(scolId ,"Matnr"):
                  oLine.setWidth("100px");
                  break;
                case that._getColTitle(scolId ,"Maktx"):
                  oLine.setWidth("300px");
                  break;
              }
              i++;
            });
        },

        onDowDanfe: function (oEvent) {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          var oTable = this.byId("smartTable").getTable();
          var oRows = oTable.getRows();
          var oSelIndices = oTable.getSelectedIndices();
          var that = this;

          if (oSelIndices.length == 0) {
            MessageBox.warning(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem"),
              {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
              }
            );
            return;
          } else if (oSelIndices.length > 1) {
            MessageBox.warning(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxOnlyOne"),
              {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
              }
            );
            return;
          }

          //nf is ok
          if (!oTable.getContextByIndex(oSelIndices[0]).getProperty("IsNfOk")) {
            MessageBox.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgNfNaoAutorizada"),
              {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
              }
            );
            return;
          }

          //open pdf
          var sUrl =
            this.getView().getModel().sServiceUrl +
            "/FileDanfeSet(DocNum='" +
            oTable.getContextByIndex(oSelIndices[0]).getProperty("Docnum") +
            "')/$value";

          var opdfViewer = new PDFViewer();
          this.getView().addDependent(opdfViewer);
          opdfViewer.setSource(sUrl);
          opdfViewer.open();

          //var w = window.open(sUrl); "downoload pdf

          /*
         var oModel = that.getView().getModel();
        this.byId("DynamicPage").setBusy(true);
        oModel.read("/FileDanfeSet(DocNum='" + oTable.getContextByIndex(0).getProperty("Docnum") + "')/$value", {
          success: function (oData, response) {
            that.byId("DynamicPage").setBusy(false);
            //save
          },
          error: function (oError) {
            that.byId("DynamicPage").setBusy(false);
            //var sMsg = JSONModel.parse(oError.responseText).error.message.value;
            that.byId("DynamicPage").setBusy(false);
            MessageBox.error(oError.responseText);
          },
        });*/
        },

        onCancel: function (oEvent) {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          var oTable = this.byId("smartTable").getTable();
          var oRows = oTable.getRows();
          var oSelIndices = oTable.getSelectedIndices();
          var that = this;

          if (oSelIndices.length == 0) {
            MessageBox.warning(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem"),
              {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
              }
            );
            return;
          } else if (oSelIndices.length > 1) {
            MessageBox.warning(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxOnlyOne"),
              {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
              }
            );
            return;
          }

          //nf is ok
          if (!oTable.getContextByIndex(oSelIndices[0]).getProperty("IsNfOk")) {
            MessageBox.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgNfNaoAutorizada"),
              {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
              }
            );
            return;
          }

          var sDocnum = oTable
            .getContextByIndex(oSelIndices[0])
            .getProperty("Docnum");
          var oModel = that.getView().getModel();
          //confirmation
          MessageBox.warning(
            this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("msgConfirmCancelarNf", [sDocnum]),
            {
              actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.OK) {
                  that.byId("DynamicPage").setBusy(true);
                  oModel.callFunction("/CancelaNf", {
                    method: "POST",
                    urlParameters: {
                      Docnum: sDocnum,
                    },
                    success: function (oData, response) {
                      that.byId("DynamicPage").setBusy(false);
                      //get return msg
                      if (oData.Type === "E") {
                        MessageBox.error(oData.Message);
                      } else {
                        MessageBox.success(oData.Message);
                      }
                    },
                    error: function (oError) {
                      that.byId("DynamicPage").setBusy(false);
                      MessageBox.error(oError.responseText);
                    },
                  });
                }
              },
            }
          );
        },

        onDowXML: function (oEvent) {
          var bCompact = !!this.getView().$().closest(".sapUiSizeCompact")
            .length;
          var oTable = this.byId("smartTable").getTable();
          var oRows = oTable.getRows();
          var oSelIndices = oTable.getSelectedIndices();
          var that = this;

          if (oSelIndices.length == 0) {
            MessageBox.warning(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgBoxNoItem"),
              {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
              }
            );
            return;
          }

          //nf is ok
          var sNfs = "";
          for (var i of oSelIndices) {
            if(!oTable.getContextByIndex(i).getProperty("IsNfOk")){
              if(sNfs==""){
                sNfs = oTable.getContextByIndex(i).getProperty("Docnum");
              }else{
                sNfs = sNfs + ", " + oTable.getContextByIndex(i).getProperty("Docnum");
              }
            }
          }

          if(sNfs !== ""){
            MessageBox.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("msgNfNaoAutorizada2", [sNfs])
            );
          }

          var oModel = that.getView().getModel();
          var oLineItemArray = [];

          for (var i of oSelIndices) {
            var oObject = oTable.getContextByIndex(i);
            console.log(
              oObject.getProperty("Docnum") +
                " " +
                oObject.getProperty("Itmnum")
            );
            oLineItemArray.push({
              Docnum: oObject.getProperty("Docnum"),
              Itmnum: oObject.getProperty("Itmnum"),
            });
          }

          //Sort Array
          oLineItemArray.sort(function (a, b) {
            return a["Docnum"] - b["Docnum"] || a["Itmnum"] - b["Itmnum"];
          });

          //Set deferred groups and create Function Imports
          oModel.setDeferredGroups(["batchFunctionImport"]);
          for (i = 0; i < oLineItemArray.length; i++) {
            oModel.callFunction("/DownloadXML", {
              method: "GET",
              groupId: "batchFunctionImport",
              changeSetId: "batch" + i,
              refreshAfterChange: "true",
              urlParameters: {
                Docnum: oLineItemArray[i].Docnum,
                Itmnum: oLineItemArray[i].Itmnum,
                Nfenum: oLineItemArray[i].Nfenum,
              },
            });
          }

          //Submitting the function import batch call
          oModel.submitChanges({
            groupId: "batchFunctionImport",
            success: function (oData, sResponse) {
              //this.getView().byId("idUserDetTable").updateBindings();
              that.byId("DynamicPage").setBusy(false);

              var xmls = [];
              var aDown = [];

              for (i = 0; i < oData.__batchResponses.length; i++) {
                var y;
                for (
                  y = 0;
                  y < oData.__batchResponses[i].data.results.length;
                  y++
                ) {
                  if (
                    !aDown.includes(
                      oData.__batchResponses[i].data.results[y].Docnum
                    )
                  ) {
                    xmls.push({
                      nfenum: oData.__batchResponses[i].data.results[y].Nfenum,
                      docnum: oData.__batchResponses[i].data.results[y].Docnum,
                      itmnum: oData.__batchResponses[i].data.results[y].Itmnum,
                      xmltid: oData.__batchResponses[i].data.results[y].XmlTid,
                      xmlnfe: oData.__batchResponses[i].data.results[y].XmlNfe,
                    });
                    aDown.push(
                      oData.__batchResponses[i].data.results[y].Docnum
                    );
                  }
                }
              }

              that.DownloadFile(xmls);

              oModel.refresh();
            },
            error: function (oError) {
              var sMensagem = JSONModel.parse(oError.responseText).error.message
                .value;
              that.byId("DynamicPage").setBusy(false);
              MessageBox.error(sMensagem);
            },
          });
        },

        DownloadFile: function (xmls) {
          var z;
          for (z = 0; z < xmls.length; z++) {
            if (xmls[z].xmltid != "") {
              File.save(
                xmls[z].xmltid,
                "NF" + xmls[z].nfenum, //tid
                "xml",
                "application/xml"
              );
            }
            if (xmls[z].xmlnfe !== "") {
              File.save(
                xmls[z].xmlnfe,
                xmls[z].nfenum,
                "xml",
                "application/xml"
              );
            }
          }
        },

        onEnvairIndust: function (oEvent) {
          //initialize models 
          //model manual
          var oManualModel = this.getOwnerComponent().getModel(
            "ItensIndust_JSONModel"
          );
          oManualModel.setData({
            Werks: "",
            Lifnr: "",
            Itens: [],
          });
          //model pedido
          //Início - IM - DMND0019606 - 23/09/2022
          var oPedidoManual = this.getOwnerComponent().getModel("envioPedidoModel");
          //Fim - IM - DMND0019606 - 23/09/2022
          oPedidoManual.setData({
            Werks: "",
            Lifnr: "",
            Pedido: "",
            Itens: [],
          });
          //model contrato
          //Início - IM - DMND0019606 - 23/09/2022
          // var oPedidoManual = this.getOwnerComponent().getModel("envioContratoModel");
          // oPedidoManual.setData({
          //   Werks: "",
          //   Lifnr: "",
          //   Contrato: "",
          //   Itens: [],
          // });
          var oContratoManual = this.getOwnerComponent().getModel("envioContratoModel");
          oContratoManual.setData({
            Werks: "",
            Lifnr: "",
            Contrato: "",
            Itens: [],
          });
          //Fim - IM - DMND0019606 - 23/09/2022
          //model material
          var oMaterialManual =
            this.getOwnerComponent().getModel("envioMaterialModel");
          oMaterialManual.setData({
            Werks: "",
            Lifnr: "",
            Material: "",
            Deposito: "",
            Lote: "",
            Itens: [],
          });
          //model X41
          var oX41Manual =
            this.getOwnerComponent().getModel("envioX41Model");
            oX41Manual.setData({
            Werks: "",
            Lifnr: "",
            Pedido: "",
            Itens: [],
          });
          //Navegar para a Itens para enviar para a Industrialização
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteEnvioIndust");
        },

        onNavToNf: function (oEvent) {
          var sNfNum = oEvent.getSource().getText();
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("notaFiscal", {
            docnum: sNfNum,
          });
        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
          // The source is the list item that got pressed
          this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * We navigate back in the browser history
         * @public
         */
        onNavBack: function () {
          // eslint-disable-next-line sap-no-history-manipulation
          history.go(-1);
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
          this.getRouter().navTo("object", {
            objectId: oItem.getBindingContext().getProperty("Id"),
          });
        },
      }
    );
  }
);
