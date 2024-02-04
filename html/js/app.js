(function () {
    let MenuTpl =
        '<div id="menu_{{_namespace}}_{{_name}}" class="menu{{#align}} align-{{align}}{{/align}}">' +
        '<div class="head"><span>{{{title}}}</span></div>' +
        '<div class="menu-items">' +
        "{{#elements}}" +
        '<div class="menu-item {{#selected}}selected{{/selected}}">' +
        "{{{label}}}{{#isSlider}} : &lt;{{{sliderLabel}}}&gt;{{/isSlider}}" +
        "</div>" +
        "{{/elements}}" +
        "</div>" +
        "</div>" +
        "</div>";
    window.UgCore = { };
    UgCore.ResourceName = "ug-menu";
    UgCore.Openned = { };
    UgCore.Focus = [ ];
    UgCore.Pos = { };

    UgCore.open = function (namespace, name, data) {
        if (typeof UgCore.Openned[namespace] === "undefined") {
            UgCore.Openned[namespace] = {};
        }

        if (typeof UgCore.Openned[namespace][name] != "undefined") {
            UgCore.close(namespace, name);
        }

        if (typeof UgCore.Pos[namespace] === "undefined") {
            UgCore.Pos[namespace] = {};
        }

        for (let i = 0; i < data.elements.length; i++) {
            if (typeof data.elements[i].type === "undefined") {
                data.elements[i].type = "default";
            }
        }

        data._index = UgCore.Focus.length;
        data._namespace = namespace;
        data._name = name;

        for (let i = 0; i < data.elements.length; i++) {
            data.elements[i]._namespace = namespace;
            data.elements[i]._name = name;
        }

        UgCore.Openned[namespace][name] = data;
        UgCore.Pos[namespace][name] = 0;

        for (let i = 0; i < data.elements.length; i++) {
            if (data.elements[i].selected) {
                UgCore.Pos[namespace][name] = i;
            } else {
                data.elements[i].selected = false;
            }
        }

        UgCore.Focus.push({
            namespace: namespace,
            name: name,
        });

        UgCore.render();
        $("#menu_" + namespace + "_" + name)
            .find(".menu-item.selected")[0]
            .scrollIntoView();
    };

    UgCore.close = function (namespace, name) {
        delete UgCore.Openned[namespace][name];

        for (let i = 0; i < UgCore.Focus.length; i++) {
            if (UgCore.Focus[i].namespace === namespace && UgCore.Focus[i].name === name) {
                UgCore.Focus.splice(i, 1);
                break;
            }
        }

        UgCore.render();
    };

    UgCore.render = function () {
        let menuContainer = document.getElementById("menus");
        let focused = UgCore.getFocused();
        menuContainer.innerHTML = "";
        $(menuContainer).hide();

        for (let namespace in UgCore.Openned) {
            for (let name in UgCore.Openned[namespace]) {
                let menuData = UgCore.Openned[namespace][name];
                let view = JSON.parse(JSON.stringify(menuData));

                for (let i = 0; i < menuData.elements.length; i++) {
                    let element = view.elements[i];

                    switch (element.type) {
                        case "default":
                            break;

                        case "slider": {
                            element.isSlider = true;
                            element.sliderLabel = typeof element.options === "undefined" ? element.value : element.options[element.value];

                            break;
                        }

                        default:
                            break;
                    }

                    if (i === UgCore.Pos[namespace][name]) {
                        element.selected = true;
                    }
                }

                let menu = $(Mustache.render(MenuTpl, view))[0];
                $(menu).hide();
                menuContainer.appendChild(menu);
            }
        }

        if (typeof focused != "undefined") {
            $("#menu_" + focused.namespace + "_" + focused.name).show();
        }

        $(menuContainer).show();
    };

    UgCore.submit = function (namespace, name, data) {
        $.post(`https://${UgCore.ResourceName}/menu_submit`,
            JSON.stringify({
                _namespace: namespace,
                _name: name,
                current: data,
                elements: UgCore.Openned[namespace][name].elements,
            })
        );
    };

    UgCore.cancel = function (namespace, name) {
        $.post(`https://${UgCore.ResourceName}/menu_cancel`,
            JSON.stringify({
                _namespace: namespace,
                _name: name,
            })
        );
    };

    UgCore.change = function (namespace, name, data) {
        $.post(`https://${UgCore.ResourceName}/menu_change`,
            JSON.stringify({
                _namespace: namespace,
                _name: name,
                current: data,
                elements: UgCore.Openned[namespace][name].elements,
            })
        );
    };

    UgCore.getFocused = function () {
        return UgCore.Focus[UgCore.Focus.length - 1];
    };

    window.onData = (data) => {
        switch (data.action) {
            case "openMenu": {
                UgCore.open(data.namespace, data.name, data.data);
                break;
            }

            case "closeMenu": {
                UgCore.close(data.namespace, data.name);
                break;
            }

            case "controlPressed": {
                switch (data.control) {
                    case "ENTER": {
                        let focused = UgCore.getFocused();

                        if (typeof focused != "undefined") {
                            let menu = UgCore.Openned[focused.namespace][focused.name];
                            let pos = UgCore.Pos[focused.namespace][focused.name];
                            let elem = menu.elements[pos];

                            if (menu.elements.length > 0) {
                                UgCore.submit(focused.namespace, focused.name, elem);
                            }
                        }

                        break;
                    }

                    case "BACKSPACE": {
                        let focused = UgCore.getFocused();

                        if (typeof focused != "undefined") {
                            UgCore.cancel(focused.namespace, focused.name);
                        }

                        break;
                    }

                    case "TOP": {
                        let focused = UgCore.getFocused();

                        if (typeof focused != "undefined") {
                            let menu = UgCore.Openned[focused.namespace][focused.name];
                            let pos = UgCore.Pos[focused.namespace][focused.name];

                            if (pos > 0) {
                                UgCore.Pos[focused.namespace][focused.name]--;
                            } else {
                                UgCore.Pos[focused.namespace][focused.name] = menu.elements.length - 1;
                            }

                            let elem = menu.elements[UgCore.Pos[focused.namespace][focused.name]];

                            for (let i = 0; i < menu.elements.length; i++) {
                                if (i === UgCore.Pos[focused.namespace][focused.name]) {
                                    menu.elements[i].selected = true;
                                } else {
                                    menu.elements[i].selected = false;
                                }
                            }

                            UgCore.change(focused.namespace, focused.name, elem);
                            UgCore.render();

                            $("#menu_" + focused.namespace + "_" + focused.name)
                                .find(".menu-item.selected")[0]
                                .scrollIntoView();
                        }

                        break;
                    }

                    case "DOWN": {
                        let focused = UgCore.getFocused();

                        if (typeof focused != "undefined") {
                            let menu = UgCore.Openned[focused.namespace][focused.name];
                            let pos = UgCore.Pos[focused.namespace][focused.name];
                            let length = menu.elements.length;

                            if (pos < length - 1) {
                                UgCore.Pos[focused.namespace][focused.name]++;
                            } else {
                                UgCore.Pos[focused.namespace][focused.name] = 0;
                            }

                            let elem = menu.elements[UgCore.Pos[focused.namespace][focused.name]];

                            for (let i = 0; i < menu.elements.length; i++) {
                                if (i === UgCore.Pos[focused.namespace][focused.name]) {
                                    menu.elements[i].selected = true;
                                } else {
                                    menu.elements[i].selected = false;
                                }
                            }

                            UgCore.change(focused.namespace, focused.name, elem);
                            UgCore.render();

                            $("#menu_" + focused.namespace + "_" + focused.name)
                                .find(".menu-item.selected")[0]
                                .scrollIntoView();
                        }

                        break;
                    }

                    case "LEFT": {
                        let focused = UgCore.getFocused();

                        if (typeof focused != "undefined") {
                            let menu = UgCore.Openned[focused.namespace][focused.name];
                            let pos = UgCore.Pos[focused.namespace][focused.name];
                            let elem = menu.elements[pos];

                            switch (elem.type) {
                                case "default":
                                    break;

                                case "slider": {
                                    let min = typeof elem.min === "undefined" ? 0 : elem.min;

                                    if (elem.value > min) {
                                        elem.value--;
                                        UgCore.change(focused.namespace, focused.name, elem);
                                    }

                                    UgCore.render();
                                    break;
                                }

                                default:
                                    break;
                            }

                            $("#menu_" + focused.namespace + "_" + focused.name)
                                .find(".menu-item.selected")[0]
                                .scrollIntoView();
                        }

                        break;
                    }

                    case "RIGHT": {
                        let focused = UgCore.getFocused();

                        if (typeof focused != "undefined") {
                            let menu = UgCore.Openned[focused.namespace][focused.name];
                            let pos = UgCore.Pos[focused.namespace][focused.name];
                            let elem = menu.elements[pos];

                            switch (elem.type) {
                                case "default":
                                    break;

                                case "slider": {
                                    if (typeof elem.options != "undefined" && elem.value < elem.options.length - 1) {
                                        elem.value++;
                                        UgCore.change(focused.namespace, focused.name, elem);
                                    }

                                    if (typeof elem.max != "undefined" && elem.value < elem.max) {
                                        elem.value++;
                                        UgCore.change(focused.namespace, focused.name, elem);
                                    }

                                    UgCore.render();
                                    break;
                                }

                                default:
                                    break;
                            }

                            $("#menu_" + focused.namespace + "_" + focused.name)
                                .find(".menu-item.selected")[0]
                                .scrollIntoView();
                        }

                        break;
                    }

                    default:
                        break;
                }

                break;
            }
        }
    };

    window.onload = function (e) {
        window.addEventListener("message", (event) => {
            onData(event.data);
        });
    };
})();