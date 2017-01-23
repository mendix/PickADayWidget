define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/on",

    "PickADayWidget/lib/pikaday",
    "PickADayWidget/lib/moment"
], function(declare, _WidgetBase, dom, dojoDom, dojoClass, dojoStyle, dojoAttr, dojoConstruct, dojoArray, lang, dojoEvent, dojoOn, PickADay, moment) {
    "use strict";

    var $ = dojoConstruct.create;

    return declare("PickADayWidget.widget.PickADayWidget", [_WidgetBase], {

        // Nodes
        _inputNode: null,
        _calendarButton: false,

        // Set in Modeler
        dateAttr: "",

        // Internal variables.
        _picker: null,
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            // These are set in the Modeler later
            this.calendarButton = true;
            this.calendarButtonClass = "calendar";
            this.format = "MM/DD/YYYY";
            this.placeHolder = "MM/DD/YYYY";
            this.setNative = false; // not sure if this works yet
            this.calendarMode = "inline"; // should include 'modal' in the future

            dojoClass.add(this.domNode, "mx-dateinput pickaDay-widget", true);

            this._addElements();

            this.own(dojoOn(this._inputNode, "focus", lang.hitch(this, this._onFocus)));
            this.own(dojoOn(this._inputNode, "blur", lang.hitch(this, this._onBlur)));
        },

        _onFocus: function () {
            dojoAttr.set(this._inputNode, "type", this.setNative ? "date" : "text");
        },

        _onBlur: function () {
            dojoAttr.set(this._inputNode, "type", "text");
        },

        _addElements: function () {
            logger.debug(this.id + "._addElements");
            if (this.calendarButton) {
                this._calendarButton = $("button", {
                    type: "button",
                    class: "btn mx-button mx-dateinput-select-button pickaDay-button"
                }, this.domNode);

                $("span", {
                    class: "glyphicon glyphicon-" + this.calendarButtonClass
                }, this._calendarButton);
            }

            var wrapper = $("div", {
                class: "mx-dateinput-input-wrapper"
            }, this.domNode);

            this._inputNode = $("input", {
                type: "text",
                class: "form-control mx-dateinput-input",
                placeHolder: this.placeHolder
            }, wrapper);

            var pickerWrapper = $("div", {
                class: "pickerCalendar"
            }, this.domNode);

            this._picker = new PickADay({
                field: this._inputNode,
                trigger: this._calendarButton,
                container: pickerWrapper,
                onOpen: lang.hitch(this, this._onOpen),
                onSelect : lang.hitch(this, this._onSelect),
                onClose : lang.hitch(this, this._onClose),
                format: this.format,
                showDaysInNextAndPreviousMonths: true,
                theme: "mendix-pickaday"
            });

            this._picker.hide();
        },

        _onSelect: function (date) {
            logger.debug(this.id + "._onSelect :: ", date);

            if (date) {
                this._contextObj.set(this.dateAttr, date);
            }
        },

        _onOpen: function () {
            logger.debug(this.id + "._onOpen");
            dojoClass.toggle(this.domNode, "open", true);
        },

        _onClose: function () {
            logger.debug(this.id + "._onClose");
            dojoClass.toggle(this.domNode, "open", false);
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;

            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
            this._picker.destroy();
        },

        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");

            this.unsubscribeAll();

            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        logger.debug(this.id + " Object subscription fired, guid: " + guid);
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.dateAttr,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        logger.debug(this.id + " Attr subscription fired");
                        this._updateRendering();
                    })
                });
            }
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");

                var date = new Date(this._contextObj.get(this.dateAttr));
                this._picker.setDate(date, true);
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },

        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["PickADayWidget/widget/PickADayWidget"]);
