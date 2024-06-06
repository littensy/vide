local action = require(script.Parent.action)()
local changed = require(script.Parent.changed)
local create = require(script.Parent.create)
local tags = require(script.Parent.tags)

type Props = { [any]: any }

local function jsx(tag: string | (Props) -> any, props: Props, ...): any
    props = props or {}

    if type(tag) == "string" then
        tag = tags[tag] or tag

        for key, value in props do
            if type(key) ~= "string" then
                continue
            end

            if string.match(key, ".Changed$") then
                local property = string.sub(key, 1, -8)
                table.insert(props, changed(property, value))
                props[key] = nil
            end
        end

        if props.action then
            table.insert(props, action(props.action))
            props.action = nil
        end

        table.insert(props, { ... })

        return create(tag)(props)
    end

    if select("#", ...) > 0 then
        props.children = { ... }
    end

    return tag(props)
end

return jsx
