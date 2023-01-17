sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./WorklistJourney",
	"./NavigationJourney",
	"./NotFoundJourney",
	"./ObjectJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "br.com.arcelor.zbmmm0009.view.",
		autoWait: true
	});

});