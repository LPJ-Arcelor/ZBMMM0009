/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"br/com/arcelor/zbmmm0009/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});