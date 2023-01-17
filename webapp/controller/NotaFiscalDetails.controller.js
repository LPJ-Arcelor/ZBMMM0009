sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BusyIndicator",
    "br/com/arcelor/zbmmm0009/util/formatter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, BusyIndicator, formatter) {
    "use strict";

    return Controller.extend(
      "br.com.arcelor.zbmmm0009.controller.NotaFiscalDetails",
      {
        formatter: formatter,

        onInit: function () {
          this.getOwnerComponent()
            .getRouter()
            .getRoute("notaFiscal")
            .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
          var oViewModel = this._createViewModel();
          this.getView().setModel(oViewModel, "mNFSaida");

          var sDocnum = oEvent.getParameter("arguments").docnum;

          if (sDocnum) {
            this._loadDetail(sDocnum);
          }
        },

        _createViewModel: function () {
          return new sap.ui.model.json.JSONModel({
            Docnum: "",
            Fornec: "",
            Nfenum: "",
            Series: "",
            Subser: "",
            Docdat: "",
            Pstdat: "",
            Nfe: {},
            Sintese: [],
          });
        },

        _loadDetail: function (sDocnum) {
          var aFilters = [];
          var oModel = this.getOwnerComponent().getModel("notaFiscalModel");
          var sPath = oModel.createKey("/NotaFiscalSet", { Docnum: sDocnum });
          //filter
          aFilters.push(
            new sap.ui.model.Filter(
              "Docnum",
              sap.ui.model.FilterOperator.EQ,
              sDocnum
            )
          );

          BusyIndicator.show();
          //read
          oModel.read(sPath, {
            urlParameters: { $expand: "ToNfe,ToItems" },
            filters: aFilters,
            success: function (oResult, oResponse) {
              BusyIndicator.hide();

              var sLifnr = oResult.Parid;
              var sName1 = oResult.Name1;
              var sStcd1 = formatter.formatCnpj(oResult.Stcd1);

              oResult.Fornec = sLifnr + " - " + sStcd1 + " - " + sName1;

              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Docnum", oResult.Docnum);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Fornec", oResult.Fornec);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Nfenum", oResult.Nfenum);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Series", oResult.Series);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Subser", oResult.Subser);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Docdat", oResult.Docdat);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Pstdat", oResult.Pstdat);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Nfe", oResult.ToNfe);
              this.getView()
                .getModel("mNFSaida")
                .setProperty("/Items", oResult.ToItems.results);
            }.bind(this),
            error: function (oError) {
              BusyIndicator.hide();
            },
          });
        },

        onNavBack: function () {
          this.getOwnerComponent().getRouter().navTo("worklist", {}, true);
        },
      }
    );
  }
);
