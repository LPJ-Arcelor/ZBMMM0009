sap.ui.define([], function () {
  "use strict";

  return {
    getimage: function (sImgName) {
      let sPath = "images/purchaseorder.jpg";
      let sRootPath = jQuery.sap.getModulePath("br.com.arcelor.zbmmm0009");
      sRootPath = sRootPath != "." ? sRootPath + "/" : "";
      return sRootPath + sPath;
    },

    currencyValue: function (sValue) {
      if (!sValue) {
        return "";
      }

      return parseFloat(sValue).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    qtyValue: function (sValue) {
      if (!sValue) {
        return "";
      }

      return parseFloat(sValue).toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    },

    intValue: function (sValue) {
      sValue = parseInt(sValue);

      if (!sValue || isNaN(sValue)) return "";

      return sValue;
    },

    statusIcon: function (value) {
      if (!value) {
        return "";
      } else {
        return "sap-icon://circle-task-2";
      }
    },

    statusColor: function (value) {
      if (!value) {
        return "";
      } else if (value === "@0A@") {
        return "Negative";
      } else if (value === "@08@") {
        return "Positive";
      } else if (value === "@09@") {
        return "Critical";
      }
    },

    formatCnpj: function (sValue) {
      if (!sValue) return;

      return sValue.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    },

    sumQtdEnvio: function (dados) {
      var total = 0;

      dados.forEach(function (e) {
        total += parseFloat(e.QtdEnvio);
      });

      return parseFloat(total).toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    },

    sumQtdRet: function (dados) {
      var total = 0;

      dados.forEach(function (e) {
        total += parseFloat(e.QtdRet);
      });

      return parseFloat(total).toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    },

    sumQtdSaldo: function (dados) {
      var total = 0;

      dados.forEach(function (e) {
        total += parseFloat(e.QtdSaldo);
      });

      return parseFloat(total).toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    },

    sumVlrSaldo: function (dados) {
      var total = 0;

      dados.forEach(function (e) {
        total += parseFloat(e.VlrSaldo);
      });

      return parseFloat(total).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    sumNetpr: function (dados) {
      var total = 0;

      dados.forEach(function (e) {
        total += parseFloat(e.Netpr);
      });

      return parseFloat(total).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    sumNetwr: function (dados) {
      var total = 0;

      dados.forEach(function (e) {
        total += parseFloat(e.Netwr);
      });

      return parseFloat(total).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  };
});
