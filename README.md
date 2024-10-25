<br>

<div align="center">
    <img src="docs/public/full_logo.svg" width="600" />
</div>

Vide is a reactive Luau UI library inspired by [Solid](https://www.solidjs.com/).

- Fully Luau typecheckable
- Declarative and concise syntax.
- Reactively driven.

## Getting started

Read the
[crash course](https://centau.github.io/vide/tut/crash-course/1-introduction)
for a quick introduction to the library.

## Code sample

```lua
local create = vide.create
local source = vide.source

local function Counter()
    local count = source(0)

    return create "TextButton" {
        Text = function()
            return "count: " .. count()
        end,

        Activated = function()
            count(count() + 1)
        end
    }
end
```

## JSX

Vide for roblox-ts brings JSX support to the library. As a result, this extension adds a set of components and utilities to improve usage.

> [!TIP]
>
> - Vide JSX adds new components for syntax sugar, including `<Show>`, `<Switch>`/`<Case>`, `<For>`/`<Index>`, and `<Provider>`.
> - Use the `action` prop to create a Vide action that receives the new instance as an argument.
> - `switch` is a reserved keyword in TypeScript, so the `switch()` function is exposed under the alias `match()`.

### Installation

To use JSX with Vide, you need to configure the `jsx` option in your `tsconfig.json`:

```json
"compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Vide.jsx",
    "jsxFragmentFactory": "Vide.Fragment",
}
```

> [!NOTE]
> Vide JSX requires roblox-ts version 3.0 or higher.
> You can update roblox-ts by running `npm install -D roblox-ts@latest`.

### Code sample

```tsx
function Counter() {
	const count = source(0);

	return (
		<textbutton
			Text={() => `count: ${count()}`}
			TextChanged={(text) => print(text)}
			Activated={() => count(count() + 1)}
		/>
	);
}
```

### `<Show>`

A conditional rendering component that accepts a boolean value and a function that returns the element to render when the condition is true.

```tsx
const show = source(true);

<Show when={show}>
	{() => {
		return <textbutton Text="Hello, world!" />;
	}}
</Show>;
```

### `<Switch>`/`<Case>`

A conditional rendering component that accepts a value and a list of cases. Each case is denoted by a `<Case>` component, and if the `condition` matches the `match` prop of a case, the corresponding element is rendered.

```tsx
const value = source("a");

<Switch condition={value}>
	<Case match="a">{() => <textbutton Text="A" />}</Case>
	<Case match="b">{() => <textbutton Text="B" />}</Case>
	<Case match="c">{() => <textbutton Text="C" />}</Case>
</Switch>;
```

### `<For>`

A referentially keyed loop (rendered nodes are keyed to a table value). The `each` prop accepts an array or a map, and calls the `children` function for each element in the array or map.

If an entry is removed or changed, the corresponding node is updated or cleaned up.

```tsx
const items = source(["a", "b", "c"]);

<For each={items}>
	{(item: string, index: () => number) => {
		return <textbutton Text={item} />;
	}}
</For>;
```

### `<Index>`

A referentially keyed loop (rendered nodes are keyed to a table index). The `each` prop accepts an array or a map, and calls the `children` function for each element in the array or map.

If an entry is removed or changed, the corresponding node is updated or cleaned up.

```tsx
const items = source(["a", "b", "c"]);

<Index each={items}>
	{(item: () => string, index: number) => {
		return <textbutton Text={() => item()} />;
	}}
</Index>;
```

### `<Provider>`

A component that renders its children with the `value` prop assigned to the context. The value can be accessed by calling the `context` function while the `children` function is running.

`<Provider>` is syntax sugar for `context(value, () => children)`.

> [!NOTE]
> The context function must be called within the top-level of a component. Calling it within an effect or on a new thread may return the default value.

```tsx
const theme = context("light");

<Provider context={theme} value="dark">
	{() => {
		const value = theme();
		return <textbutton Text={value} />;
	}}
</Provider>;
```
