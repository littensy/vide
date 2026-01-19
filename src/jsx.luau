local action = require(script.Parent.action)()
local changed = require(script.Parent.changed)
local create = require(script.Parent.create)
local tags = require(script.Parent.tags)
local untrack = require(script.Parent.untrack)

type Props = { [any]: any }

local IGNORED_CHANGE_PROPS = {
    AncestryChanged = true,
    AttributeChanged = true,
    AxisChanged = true,
    ButtonChanged = true,
    ControlPointChanged = true,
    EmotesChanged = true,
    HealthChanged = true,
    InputChanged = true,
    LightingChanged = true,
    SelectionChanged = true,
    StateChanged = true,
    ThemeChanged = true,
    ViewportChanged = true,
}

local function jsx(tag: string | (Props) -> any, props: Props, ...): any
    props = props or {}

    if type(tag) == "string" then
        tag = tags[tag] or tag

        local actions = {}

        for key, value in props do
            if type(key) ~= "string" or IGNORED_CHANGE_PROPS[key] then
                continue
            end

            local property = string.match(key, "^(.+)Changed$")

            if property then
                table.insert(actions, changed(property, value))
                props[key] = nil
            end
        end

        for _, action in actions do
            table.insert(props, action)
        end

        if props.action then
            table.insert(props, action(props.action))
            props.action = nil
        end

        for index = 1, select("#", ...) do
            local child = select(index, ...)
            table.insert(props, child)
        end

        return create(tag)(props)
    end

    local count = select("#", ...)

    if count > 1 then
        props.children = { ... }
    elseif count == 1 then
        props.children = ...
    end

    return untrack(function()
        return tag(props)
    end)
end

return jsx
