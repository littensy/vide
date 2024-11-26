local context = require(script.Parent.context)
local indexes, values = require(script.Parent.maps)()
local show = require(script.Parent.show)
local switch = require(script.Parent.switch)

type Context<T> = context.Context<T>

type Case = {
    match: any,
    children: () -> any,
}

local function Fragment(props: { children: any })
    return props.children
end

local function For<K, VI, VO>(props: {
    each: () -> { [K]: VI },
    children: (VI, () -> K) -> VO,
}): () -> { VO }
    return values(props.each, props.children)
end

local function Index<K, VI, VO>(props: {
    each: () -> { [K]: VI },
    children: (() -> VI, K) -> VO,
}): () -> { VO }
    return indexes(props.each, props.children)
end

local function Switch(props: {
    condition: () -> any,
    children: { Case },
})
    local children = props.children :: { [any]: any }
    local map = {}

    if children.match then
        map[children.match] = children.children
    else
        for _, node in children do
            map[node.match] = node.children
        end
    end

    return switch(props.condition)(map)
end

local function Case(props: Case): Case
    return props
end

local function Show(props: {
    when: any,
    children: () -> any,
    fallback: () -> any,
})
    return show(props.when, props.children, props.fallback)
end

local function Provider<T>(props: {
    context: Context<T>,
    value: T,
    children: () -> any,
})
    return props.context(props.value, props.children)
end

return {
    Fragment = Fragment,
    Switch = Switch,
    Case = Case,
    For = For,
    Index = Index,
    Show = Show,
    Provider = Provider,
}
