local show = require(script.Parent.show)
local switch = require(script.Parent.switch)
local indexes, values = require(script.Parent.maps)()

type Case = {
    match: any,
    children: { () -> any },
}

local function Fragment(props: { children: any })
    return props.children
end

local function For<K, VI, VO>(props: {
    each: () -> { [K]: VI },
    children: { (VI, () -> K) -> VO },
}): () -> { VO }
    return values(props.each, props.children[1])
end

local function Index<K, VI, VO>(props: {
    each: () -> { [K]: VI },
    children: { (() -> VI, K) -> VO },
}): () -> { VO }
    return indexes(props.each, props.children[1])
end

local function Switch(props: {
    condition: () -> any,
    children: { Case },
})
    local map = {}

    for _, node in props.children do
        map[node.match] = node.children[1]
    end

    return switch(props.condition)(map)
end

local function Case(props: Case): Case
    return props
end

local function Show(props: {
    when: any,
    children: { () -> any },
    fallback: () -> any,
})
    return show(props.when, props.children[1], props.fallback)
end

return {
    Fragment = Fragment,
    Switch = Switch,
    Case = Case,
    For = For,
    Index = Index,
    Show = Show,
}
