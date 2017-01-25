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
    "dojo/html",

    "PickADayWidget/lib/pikaday",
    "PickADayWidget/lib/moment"
], function(declare, _WidgetBase, dom, dojoDom, dojoClass, dojoStyle, dojoAttr, dojoConstruct, dojoArray, lang, dojoEvent, dojoOn, dojoHtml, PickADay, moment) {
    "use strict";

    var $ = dojoConstruct.create;

    return declare("PickADayWidget.widget.PickADayWidget", [_WidgetBase], {

        // Nodes
        _inputNode: null,
        _calendarButton: false,

        // Set in Modeler
        dateAttr: "",
        showButton: true,
        buttonClass: "calendar",
        dateFormat: "MM/DD/YYYY",
        placeholderText: "MM/DD/YYYY",
        showDaysOutsideMonth: true,
        showLabel: false,
        labelText: "",
        onChangeMF: "",

        // Internal variables.
        _picker: null,
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            if (this.readOnly || this.get("disabled") || this.readonly) {
                this._readOnly = true;
            }

            this.setNative = false;         // TODO: After thorough testing, add this as an option to the modeler
            this.calendarMode = "inline";   // TODO: Add modal option

            dojoClass.add(this.domNode, "mx-dateinput pickaDay-widget form-group", true);

            this._addElements();

            this.own(dojoOn(this._inputNode, "focus", lang.hitch(this, this._onFocus)));
            this.own(dojoOn(this._inputNode, "blur", lang.hitch(this, this._onBlur)));
            this.own(dojoOn(this._inputNode, "change", lang.hitch(this, this._onChange)));
        },

        _onFocus: function () {
            dojoAttr.set(this._inputNode, "type", this.setNative ? "date" : "text");
        },

        _onBlur: function () {
            dojoAttr.set(this._inputNode, "type", "text");
        },

        _onChange: function (e) {
            logger.debug(this.id + "._onChange");
        },

        _addElements: function () {
            logger.debug(this.id + "._addElements");

            var rootNode = this.domNode;
            if (this.showLabel) {
                $("label", {
                    class: "control-label",
                    innerHTML: this.labelText
                }, this.domNode);

                rootNode = $("div", {
                    class: "form-group"
                }, this.domNode);
            }

            if (this.showButton) {
                this._calendarButton = $("button", {
                    type: "button",
                    class: "btn mx-button mx-dateinput-select-button pickaDay-button"
                }, rootNode);

                $("span", {
                    class: "glyphicon glyphicon-" + this.buttonClass
                }, this._calendarButton);
            }

            var wrapper = $("div", {
                class: "mx-dateinput-input-wrapper"
            }, rootNode);

            this._inputNode = $("input", {
                type: "text",
                class: "form-control mx-dateinput-input",
                placeHolder: this.placeholderText
            }, wrapper);

            var pickerWrapper = $("div", {
                class: "pickerCalendar"
            }, rootNode);

            if (!this._readOnly) {
                this._picker = new PickADay({
                    field: this._inputNode,
                    trigger: this._calendarButton,
                    container: pickerWrapper,
                    onOpen: lang.hitch(this, this._onOpen),
                    onSelect : lang.hitch(this, this._onSelect),
                    onClose : lang.hitch(this, this._onClose),
                    format: this.dateFormat,
                    showDaysInNextAndPreviousMonths: this.showDaysOutsideMonth,
                    theme: "mendix-pickaday"
                });

                this._picker.hide();
            }
        },

        _onSelect: function (date) {
            logger.debug(this.id + "._onSelect :: ", date);

            if (date) {
                this._contextObj.set(this.dateAttr, date);
                if (this.onChangeMF) {
                    this._execMf(this.onChangeMF, this._contextObj.getGuid());
                }
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

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: lang.hitch(this, function (validations) {
                        logger.debug(this.id + " Validation subscription fired");
                        this._handleValidation(validations, this.dateAttr);
                    })
                });
            }
        },

        // Handle validations.
        _handleValidation: function (validations, attribute) {
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();

            var validation = validations[0],
                message = validation.getReasonByAttribute(attribute);

            if (this._readOnly) {
                validation.removeAttribute(attribute);
            } else if (message) {
                this._addValidation(message);
                validation.removeAttribute(attribute);
            }
        },

        // Clear validations.
        _clearValidations: function () {
            logger.debug(this.id + "._clearValidations");
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

        // Show an error message.
        _showError: function (message) {
            logger.debug(this.id + "._showError");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this._alertDiv, this.domNode);
        },

        // Add a validation.
        _addValidation: function (message) {
            logger.debug(this.id + "._addValidation");
            this._showError(message);
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

            this._clearValidations();
            this._executeCallback(callback, "_updateRendering");
        },

        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
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
