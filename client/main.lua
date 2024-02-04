local UgCore = exports['ug-core']:GetCore()

local GUI, MenuType, OpennedMenus, CurrentNameSpace = { }, 'default', 0, nil
GUI.Time = 0

local function OpenMenu(namespace, name, data)
    CurrentNameSpace = namespace
    OpennedMenus = OpennedMenus + 1
    SendNUIMessage({
        action = 'openMenu',
        namespace = namespace,
        name = name,
        data = data
    })
end

local function CloseMenu(namespace, name)
    CurrentNameSpace = namespace
    OpennedMenus = OpennedMenus - 1
    if OpennedMenus < 0 then
        OpennedMenus = 0
    end
    SendNUIMessage({
        action = 'closeMenu',
        namespace = namespace,
        name = name
    })
end

AddEventHandler('onResourceStop', function (resource)
    if GetCurrentResourceName() == resource and OpennedMenus > 0 then
        UgCore.Menus.Functions.CloseAllMenus()
    elseif CurrentNameSpace ~= nil and CurrentNameSpace == resource and OpennedMenus > 0 then
        UgCore.Menus.Functions.CloseAllMenus()
    end
end)

UgCore.Menus.Functions.RegisterType(MenuType, OpenMenu, CloseMenu)

RegisterNUICallback('menu_submit', function(data, cb)
    local menu = UgCore.Menus.Functions.GetMenuOpenned(MenuType, data._namespace, data._name)
    if menu.submit ~= nil then
        menu.submit(data, menu)
    end
    cb('OK')
end)

RegisterNUICallback('menu_cancel', function(data, cb)
    local menu = UgCore.Menus.Functions.GetMenuOpenned(MenuType, data._namespace, data._name)

    if menu.cancel ~= nil then
        menu.cancel(data, menu)
    end
    cb('OK')
end)

RegisterNUICallback('menu_change', function(data, cb)
    local menu = UgCore.Menus.Functions.GetMenuOpenned(MenuType, data._namespace, data._name)

    for i = 1, #data.elements, 1 do
        menu.Functions.SetElement(i, 'value', data.elements[i].value)

        if data.elements[i].selected then
            menu.Functions.SetElement(i, 'selected', true)
        else
            menu.Functions.SetElement(i, 'selected', false)
        end
    end

    if menu.change ~= nil then
        menu.change(data, menu)
    end
    cb('OK')
end)

UgCore.Functions.RegisterInput('menu_default_enter', 'Submit menu item', 'keyboard', 'RETURN', function()
    if OpennedMenus > 0 and (GetGameTimer() - GUI.Time) > 200 then
        SendNUIMessage({
            action = 'controlPressed',
            control = 'ENTER'
        })
        GUI.Time = GetGameTimer()
    end
end)

UgCore.Functions.RegisterInput('menu_default_backspace', 'Close menu', 'keyboard', 'BACK', function()
    if OpennedMenus > 0 then
        SendNUIMessage({
            action = 'controlPressed',
            control = 'BACKSPACE'
        })
        GUI.Time = GetGameTimer()
    end
end)

UgCore.Functions.RegisterInput('menu_default_top', 'Change menu focus to top item', 'keyboard', 'UP', function()
    if OpennedMenus > 0 then
        SendNUIMessage({
            action = 'controlPressed',
            control = 'TOP'
        })
        GUI.Time = GetGameTimer()
    end
end)

UgCore.Functions.RegisterInput('menu_default_down', 'Change menu focus to down item', 'keyboard', 'DOWN', function()
    if OpennedMenus > 0 then
        SendNUIMessage({
            action = 'controlPressed',
            control = 'DOWN'
        })
        GUI.Time = GetGameTimer()
    end
end)

UgCore.Functions.RegisterInput('menu_default_left', 'Change menu slider to left', 'keyboard', 'LEFT', function()
    if OpennedMenus > 0 then
        SendNUIMessage({
            action = 'controlPressed',
            control = 'LEFT'
        })
        GUI.Time = GetGameTimer()
    end
end)

UgCore.Functions.RegisterInput('menu_default_right', 'Change menu slider to right', 'keyboard', 'RIGHT', function()
    if OpennedMenus > 0 then
        SendNUIMessage({
            action = 'controlPressed',
            control = 'RIGHT'
        })
        GUI.Time = GetGameTimer()
    end
end)