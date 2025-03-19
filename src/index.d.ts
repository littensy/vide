type Cleanup = () => void;
type Key = string | number | symbol;

export = Vide;
export as namespace Vide;

declare namespace Vide {
	/**
	 * A reactive state container that can be read and updated. Calling the source
	 * with no arguments will return the stored value, whereas calling it with an
	 * argument (including `undefined`) will update the stored value.
	 *
	 * @param value The new value to store.
	 *
	 * @returns The current value.
	 */
	type Source<T> = (value?: T) => T;

	/**
	 * A value that can be either a reactive source property or a static value.
	 * Useful for defining component props that can be either static or dynamic.
	 */
	type Derivable<T> = T | (() => T);

	/**
	 * A function component that renders a Vide node.
	 *
	 * @param props Properties passed to the component.
	 *
	 * @returns The rendered node.
	 */
	type Component<Props = {}> = (props: Props) => Node;

	/**
	 * Utility type for a component that accepts `children` as a prop.
	 */
	type PropsWithChildren<Props = {}> = Props & { children?: Node };

	/**
	 * An object containing the custom logic to invoke when an instance is
	 * created. Created using `action()` or using the special `action` prop.
	 */
	interface Action<T extends Instance> {
		priority: number;
		callback: (instance: T) => void;
	}

	/**
	 * A value that can be animated by Vide's spring system.
	 */
	type Animatable = number | CFrame | Color3 | UDim | UDim2 | Vector2 | Vector3 | Rect;

	/**
	 * Any destructible object that can be passed to `cleanup()`.
	 */
	type Disposable =
		| Cleanup
		| Instance
		| RBXScriptConnection
		| thread
		| { disconnect(): void }
		| { destroy(): void }
		| { Disconnect(): void }
		| { Destroy(): void };

	/**
	 * A component return value that can optionally provide a delay time in
	 * seconds before being destroyed.
	 */
	type MaybeDelayed<T> = T | LuaTuple<[T, number?]>;

	/**
	 * Strict mode is designed to help the development process by adding
	 * safety checks and identifying improper usage.
	 *
	 * As well as additional safety checks, Vide will dedicate extra
	 * resources to recording and better emitting stack traces where
	 * errors occur, particularly when binding properties to sources.
	 *
	 * It is recommended to develop UI with strict mode and to disable it
	 * when pushing to production. In Roblox, production code compiles at
	 * O2 by default, so you don't need to worry about disabling strict
	 * mode unless you have manually enabled it.
	 *
	 * @see https://centau.github.io/vide/api/strict-mode
	 */
	let strict: boolean;
	let defaults: boolean;
	let defer_nested_properties: boolean;

	/**
	 * Creates a new stable scope, where creation of effects can be tracked
	 * and properly disposed of. Returns the result of the given function.
	 *
	 * A function to destroy the root is passed into the callback, which will
	 * run any cleanups and allow derived sources created to garbage collect.
	 *
	 * @param fn The function to run in a new stable scope.
	 *
	 * @returns The results of the function.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-core#root
	 */
	// overload for a tuple return
	function root<T extends unknown[]>(fn: (destroy: Cleanup) => LuaTuple<T>): LuaTuple<[Cleanup, ...T]>;
	// overload for a single return
	function root<T>(fn: (destroy: Cleanup) => T): LuaTuple<[Cleanup, T]>;
	// overload for no return
	function root(fn: (destroy: Cleanup) => void): Cleanup;

	/**
	 * Runs a function in a new stable scope and optionally applies its result
	 * to a target instance. Returns a function that, when called, will destroy
	 * the stable scope.
	 *
	 * The result of the function is applied to a target in the same way
	 * properties are using `create()`.
	 *
	 * @param component The function to run in a new stable scope.
	 * @param target The target instance to apply the result to.
	 *
	 * @returns A function to destroy the stable scope.
	 *
	 * @see https://centau.github.io/vide/api/creation#mount
	 */
	function mount<T>(component: () => T, target?: Instance): Cleanup;

	/**
	 * Creates a new instance and applies any given properties.
	 *
	 * If given a `string`, a new instance with the same class name will be
	 * created. Otherwise, if given an `Instance`, a new instance that is a
	 * clone of the given instance will be created.
	 *
	 * @param className The class name of the instance to create, or an instance to clone.
	 * @param props The properties to apply to the new instance.
	 *
	 * @returns A function that applies properties to the new instance.
	 *
	 * @see https://centau.github.io/vide/api/creation#create
	 */
	function create<K extends keyof CreatableInstances>(
		className: K,
	): (props?: LegacyInstanceProps<CreatableInstances[K]>) => CreatableInstances[K];
	// overload where a template instance is passed
	function create<T extends Instance>(instance: T): (props?: LegacyInstanceProps<T>) => T;
	// alternate syntax where properties are passed directly
	function create<K extends keyof CreatableInstances>(
		className: K,
		props: LegacyInstanceProps<CreatableInstances[K]>,
	): CreatableInstances[K];

	/**
	 * Craetes a reactive state container that can be read and updated. Calling
	 * the source with no arguments will return the stored value, whereas calling
	 * it with an argument (including `undefined`) will update the stored value.
	 *
	 * Sources can be passed directly to `create()` to create a reactive instance
	 * property.
	 *
	 * @param initialValue The initial value to store.
	 *
	 * @returns A reactive state container.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-core#source
	 */
	function source<T>(initialValue: T): Source<T>;
	// convenience overload for when the initial value is optional
	function source<T>(): Source<T | undefined>;

	/**
	 * Runs a side-effect in a new reactive scope when any of its dependencies
	 * change. Any time a source referenced in the callback is updated, the
	 * callback will be reran. The callback is ran once immediately.
	 *
	 * Optionally, the callback can return a value that will be passed during
	 * the next rerun. This can be useful for comparing values between runs.
	 *
	 * @param callback The side-effect to run when dependencies change.
	 * @param initialValue Optional initial argument to pass to the callback.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-core#effect
	 */
	function effect(callback: () => void): void;
	// overload where callback stores a value between runs
	function effect<T>(callback: (value: T) => T, initialValue: T): void;

	/**
	 * Derives a new source in a new reactive scope from existing sources. The
	 * derived source will have its value recalculated and cached when any source
	 * it derives from is updated.
	 *
	 * @param source The source to derive from.
	 *
	 * @returns A new derived source.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-core#derive
	 */
	function derive<T>(source: () => T): () => T;

	/**
	 * Shows one of a set of components depending on an input source and a
	 * mapping table. Returns a source holding an instance of the currently
	 * rendered component.
	 *
	 * When the input source changes, the new value will be used to lookup a
	 * given mapping table to get a component. During the next change, the
	 * stable scope the component was created in will be destroyed, and a new
	 * component created under a new stable scope.
	 *
	 * @param source The source to match against.
	 * @param map The mapping table of components.
	 *
	 * @returns A source holding the currently rendered component.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#switch
	 */
	// switch is a reserved keyword
	function match<Match extends Key, Result extends Node>(
		source: () => Match,
	): (map: { [P in Match]?: (show: () => boolean) => MaybeDelayed<Result> }) => () => Result | undefined;

	/**
	 * Shows one of two components depending on an input source. Returns a source
	 * holding an instance of the currently rendered component.
	 *
	 * When the input source changes from a falsey to a truthy value, the
	 * component will be reran under a new stable scope. If it changes from
	 * a truthy to falsey value, the stable scope the component was created
	 * in will be destroyed, and the returned source will output `nil`, or
	 * a fallback component if given.
	 *
	 * @param source The source to match against.
	 * @param component The component to render when the source is truthy.
	 * @param fallback The component to render when the source is falsey.
	 *
	 * @returns A source holding the currently rendered component.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#show
	 */
	function show<Condition, Result, Fallback = undefined>(
		source: () => Condition,
		component: (value: () => NonNullable<Condition>, show: () => boolean) => MaybeDelayed<Result>,
		fallback?: (show: () => boolean) => MaybeDelayed<Fallback>,
	): () => Result | Fallback;

	/**
	 * Maps each _key_ in a table source to a component. Returns a source holding
	 * an array of the rendered components.
	 *
	 * When the input source changes, each key in the new table is compared with
	 * the last input table.
	 * - For any new key, the transform function is ran under a new stable scope
	 *   to produce a new instance.
	 * - For any removed key, the stable scope for that key is destroyed.
	 * - Keys whose values have changed will be untouched.
	 *
	 * @param input The table source to map over.
	 * @param component The function to transform each value in the table.
	 *
	 * @returns A source holding an array of the rendered components.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#indexes
	 */
	// overload for an array input
	function indexes<VI, VO>(
		input: () => readonly VI[],
		component: (value: () => VI, index: number, show: () => boolean) => MaybeDelayed<VO>,
	): () => VO[];
	// overload for a map input
	function indexes<K, VI, VO>(
		input: () => Map<K, VI> | ReadonlyMap<K, VI>,
		component: (value: () => VI, key: K, show: () => boolean) => MaybeDelayed<VO>,
	): () => VO[];
	// overload for an object input
	function indexes<K extends Key, VI, VO>(
		input: () => { readonly [P in K]: VI },
		component: (value: () => VI, key: K, show: () => boolean) => MaybeDelayed<VO>,
	): () => VO[];

	/**
	 * Maps each _value_ in a table source to a component. Returns a source
	 * holding an array of the rendered components.
	 *
	 * When the input source changes, each value in the new table is compared
	 * with the last input table.
	 * - For any new value, the transform function is ran under a new stable
	 *   scope to produce a new instance.
	 * - For any removed value, the stable scope for that value is destroyed.
	 * - Values whose keys have changed will be untouched.
	 *
	 * **CAUTION:** Having primitive values in the input source table can cause
	 * unexpected behavior, as duplicate values can result in multiple tranforms
	 * being ran for a single value. It is recommended to use a table with unique
	 * values to avoid this issue.
	 *
	 * @param input The table source to map over.
	 * @param component The function to transform each value in the table.
	 *
	 * @returns A source holding an array of the rendered components.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#values
	 */
	// overload for an array input
	function values<VI, VO>(
		input: () => readonly VI[],
		component: (value: VI, index: () => number, show: () => boolean) => MaybeDelayed<VO>,
	): () => VO[];
	// overload for a map input
	function values<K, VI, VO>(
		input: () => Map<K, VI> | ReadonlyMap<K, VI>,
		component: (value: VI, key: () => K, show: () => boolean) => MaybeDelayed<VO>,
	): () => VO[];
	// overload for an object input
	function values<K extends Key, VI, VO>(
		input: () => { readonly [P in K]: VI },
		component: (value: VI, key: () => K, show: () => boolean) => MaybeDelayed<VO>,
	): () => VO[];

	/**
	 * Runs the callback function when the scope reruns or is destroyed. Should
	 * be used to clean up instances and connections created in the scope.
	 *
	 * @param value The disposable object to clean up.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-utility#cleanup
	 */
	function cleanup(value: Disposable): void;

	/**
	 * Runs a function without tracking any reactive sources. Can be used inside
	 * a reactive scope to read from sources you do not want tracked by the scope.
	 *
	 * @param source The source to read from.
	 *
	 * @returns The value of the source.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-utility#untrack
	 */
	function untrack<T>(source: () => T): T;

	/**
	 * Reads the source and returns its value. Non-source values are returned
	 * as-is, making this useful for component props that can be either static
	 * or dynamic.
	 *
	 * @param source The source to read from.
	 *
	 * @returns The value of the source.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-utility#read
	 */
	function read<T>(source: Derivable<T>): T;

	/**
	 * Runs a given function where any source updates made within the function
	 * do not trigger effects until after the function finishes running.
	 *
	 * @param setter The function to run.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-utility#batch
	 */
	function batch(setter: () => void): void;

	/**
	 * Returns a new source with a value always moving towards the input source
	 * value. The spring will oscillate around the input value until it reaches
	 * equilibrium.
	 *
	 * @param period The time in seconds it takes for the spring to complete one
	 * full cycle if undamped.
	 * @param dampingRatio The amount of resistance applied to the spring.
	 *
	 * @returns A tuple containing the spring value source and a configuration
	 * function to set the spring's position, velocity, and apply impulses.
	 *
	 * @see https://centau.github.io/vide/api/animation#spring
	 */
	function spring<T extends Animatable>(
		source: () => T,
		period?: number,
		dampingRatio?: number,
	): LuaTuple<[value: () => T, config: (config: { position?: T; velocity?: T; impulse?: T }) => void]>;

	/**
	 * Creates a callback that can be passed to `create()` to invoke custom
	 * actions on instances. The callback will be invoked when the instance is
	 * created, before any properties are applied.
	 *
	 * @param callback The function to run when the instance is created.
	 * @param priority The priority of the action. Higher priorities run first.
	 *
	 * @returns An action object.
	 *
	 * @see https://centau.github.io/vide/api/creation#action
	 */
	function action<T extends Instance>(callback: (instance: T) => void, priority?: number): Action<T>;

	/**
	 * Creates an action that runs the callback when a property changes on an
	 * instance. The callback will be invoked once initially and every time the
	 * property changes.
	 *
	 * @param key The property to watch for changes.
	 * @param callback The function to run when the property changes.
	 *
	 * @returns An action object.
	 *
	 * @see https://centau.github.io/vide/api/creation#changed
	 */
	function changed<T extends Instance, K extends keyof WritableInstanceProperties<T>>(
		key: K,
		callback: (value: WritableInstanceProperties<T>[K]) => void,
	): Action<T>;

	/**
	 * Applies properties to an existing instance. Similarly to `create()`, the
	 * properties can be either static values or reactive sources.
	 *
	 * @param instance The instance to apply properties to.
	 * @param props The properties to apply to the instance.
	 *
	 * @returns The instance with the properties applied.
	 */
	function apply<T extends Instance>(instance: T): (props: LegacyInstanceProps<T>) => T;

	/**
	 * By default, springs run at 120 Hz in the `Heartbeat` event. Calling this
	 * function can change when the solver runs, which will advance the simulation
	 * time by `deltaTime` seconds.
	 *
	 * Once called, the internal solver will disconnect to allow the user to
	 * advance the simulation time manually.
	 *
	 * @param deltaTime The time in seconds to advance the simulation.
	 *
	 * @see https://centau.github.io/vide/api/animation#spring
	 */
	function step(deltaTime: number): void;

	// Components

	/**
	 * A blank element that can be used to group multiple elements together.
	 * Identical to passing an array of instances to `create()`.
	 */
	function Fragment<T>(props: T): T;

	/**
	 * Maps each _value_ in a table source to a component. Returns a source
	 * holding an array of the rendered components.
	 *
	 * When the input source changes, each value in the new table is compared
	 * with the last input table.
	 * - For any new value, the function is ran under a new stable scope to
	 *   produce a new instance.
	 * - For any removed value, the stable scope for that value is destroyed.
	 * - Values whose keys have changed will be untouched.
	 *
	 * @example
	 * ```tsx
	 * <For each={() => ["a", "b", "c"]}>
	 *   {(id: string, index: () => number) => <Entry id={id} />}
	 * </For>
	 * ```
	 *
	 * @param each The table source to map over.
	 * @param children The function to transform each value in the table.
	 *
	 * @returns A function that returns an array of the rendered components.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#values
	 */
	// overload for an array input
	function For<VI, VO extends Node | void>(props: {
		each: () => readonly VI[];
		children: (item: VI, index: () => number, show: () => boolean) => MaybeDelayed<VO>;
	}): () => VO[];
	// overload for a map input
	function For<K, VI, VO extends Node | void>(props: {
		each: () => Map<K, VI> | ReadonlyMap<K, VI>;
		children: (value: VI, key: () => K) => VO;
	}): () => VO[];
	// overload for an object input
	function For<K extends Key, VI, VO extends Node | void>(props: {
		each: () => { readonly [P in K]: VI };
		children: (value: VI, key: () => K) => VO;
	}): () => VO[];

	/**
	 * Maps each _key_ in a table source to a component. Returns a source holding
	 * an array of the rendered components.
	 *
	 * When the input source changes, each key in the new table is compared with
	 * the last input table.
	 * - For any new key, the function is ran under a new stable scope to produce
	 *   a new instance.
	 * - For any removed key, the stable scope for that key is destroyed.
	 * - Keys whose values have changed will be untouched.
	 *
	 * @example
	 * ```tsx
	 * <Index each={() => new Map<string, Data>()}>
	 *   {(data: () => Data, id: string) => <Entry data={data} />}
	 * </Index>
	 * ```
	 *
	 * @param each The table source to map over.
	 * @param children The function to transform each value in the table.
	 *
	 * @returns A function that returns an array of the rendered components.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#indexes
	 */
	// overload for an array input
	function Index<VI, VO extends Node | void>(props: {
		each: () => readonly VI[];
		children: (item: () => VI, index: number, show: () => boolean) => MaybeDelayed<VO>;
	}): () => VO[];
	// overload for a map input
	function Index<K, VI, VO extends Node | void>(props: {
		each: () => Map<K, VI> | ReadonlyMap<K, VI>;
		children: (value: () => VI, key: K) => VO;
	}): () => VO[];
	// overload for an object input
	function Index<K extends Key, VI, VO extends Node | void>(props: {
		each: () => { readonly [P in K]: VI };
		children: (value: () => VI, key: K) => VO;
	}): () => VO[];

	/**
	 * Shows one of a set of components depending on an input source and a
	 * set of `Case` components. Renders the `Case` component that matches
	 * the input source.
	 *
	 * @example
	 * ```tsx
	 * <Switch condition={state}>
	 *   <Case<State> match="loading">{() => <Loading }/></Case>
	 *   <Case<State> match="error">{() => <Error />}</Case>
	 *   <Case<State> match="success">{() => <Success }/></Case>
	 * </Switch>
	 * ```
	 *
	 * @param condition The source to match against.
	 * @param children The `Case` components to render.
	 *
	 * @returns The currently rendered component.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#switch
	 */
	function Switch(props: { condition: () => any; children: Node }): () => Node;

	/**
	 * Declares a component that will be rendered when the `condition` prop
	 * of the `Switch` component matches this component's `match` prop.
	 *
	 * @template T The type of the value to match against.
	 *
	 * @param match The value to match against.
	 * @param children The component to render when the value matches.
	 *
	 * @returns The rendered component.
	 *
	 * @see Switch
	 */
	function Case<T>(props: { match: T; children: (show: () => boolean) => MaybeDelayed<Node> | void }): Node;

	/**
	 * Shows one of two components depending on an input source. Renders the
	 * first component when the source is truthy, and the second component
	 * when the source is falsey.
	 *
	 * @example
	 * ```tsx
	 * <Show when={state} fallback={() => <Loading />}>
	 *   {(show) => <Content />}
	 * </Show>
	 * ```
	 *
	 * @param when The source to match against.
	 * @param children The component to render when the source is truthy.
	 * @param fallback The component to render when the source is falsey.
	 *
	 * @returns The rendered component.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#show
	 */
	function Show(props: {
		when: () => any;
		children: (show: () => boolean) => MaybeDelayed<Node> | void;
		fallback?: (show: () => boolean) => MaybeDelayed<Node> | void;
	}): () => Node;

	// Context

	interface Context<T> {
		(): T;
		<U extends Node | void>(value: T, component: () => U): U;
	}

	/**
	 * Creates a new context that can be used to share state between components.
	 *
	 * @example
	 * ```tsx
	 * const theme = context("light");
	 *
	 * <frame>
	 *   {theme("dark", () => {
	 *     return <textlabel Text={theme()} />;
	 *   })}
	 * </frame>
	 * ```
	 *
	 * @template T The type of value to store in the context.
	 *
	 * @param defaultValue The default value to store in the context.
	 *
	 * @returns A new context function.
	 */
	function context<T>(defaultValue?: T): Context<T>;

	/**
	 * Renders a component with a new value in the context. The value will be
	 * passed to any components that read from the context within the component.
	 *
	 * **Note:** The context function must be called within the top-level of a
	 * component. Calling it within an effect or on a new thread will return the
	 * default value.
	 *
	 * @example
	 * ```tsx
	 * const theme = context("light");
	 *
	 * <Provider context={theme} value="dark">
	 *   {() => <textlabel Text={theme()} />}
	 * </Provider>
	 * ```
	 *
	 * @param context The context to pass `children` to.
	 * @param value The new value to store in the context.
	 * @param children The component to render with the new context value.
	 *
	 * @returns The rendered component.
	 */
	function Provider<T>(props: { context: Context<T>; value: T; children: () => Node | void }): () => Node;

	// Elements

	/**
	 * A value that can be passed to a JSX element.
	 */
	type Node = Instance | InstanceAttributes<Instance> | Action<any> | FragmentNode | FunctionNode | undefined;

	/**
	 * A value that can be passed to the `create()` function.
	 *
	 * @template T The type of instance to create.
	 */
	type LegacyNode<T extends Instance> =
		| Instance
		| InstanceAttributes<T>
		| Action<T>
		| FragmentNode
		| FunctionNode
		| undefined;

	/**
	 * A value that contains a collection of nodes. Vide unwraps these values
	 * when rendering, allowing for nested arrays to be passed as children.
	 */
	type FragmentNode =
		| Map<number, Node>
		| ReadonlyMap<number, Node>
		| readonly Node[]
		| { readonly [key: number]: Node };

	/**
	 * A function that returns a node.
	 */
	type FunctionNode = () => Node;

	/**
	 * Attributes intrinsic to all JSX elements.
	 */
	interface Attributes {
		children?: Node;
	}

	/**
	 * Attributes including the `action` macro. Intrinsic to all JSX instances.
	 */
	interface ActionAttributes<T> extends Attributes {
		action?: (instance: T) => void;
	}

	/**
	 * Infers the names of the enum values from an enum item. Resolves to a union
	 * of the enum items and their respective names.
	 */
	type InferEnumNames<T> = T extends EnumItem ? T | T["Name"] : T;

	/**
	 * Instance properties that can be written to or assigned Vide sources.
	 */
	type InstancePropertySources<T extends Instance> = {
		[K in keyof WritableInstanceProperties<T>]?: Derivable<InferEnumNames<WritableInstanceProperties<T>[K]>>;
	};

	/**
	 * Instance event properties that can be passed a callback function.
	 */
	type InstanceEventCallbacks<T extends Instance> = {
		[K in InstanceEventNames<T>]?: T[K] extends RBXScriptSignal<(...args: infer A) => void>
			? (...args: A) => void
			: never;
	};

	/**
	 * Instance property change events that can be passed a callback function.
	 * Internally, these are resolved to `changed()` actions.
	 */
	type InstanceChangedCallbacks<T extends Instance> = {
		[K in `${Extract<InstancePropertyNames<T>, string>}Changed`]?: K extends `${infer P extends Extract<InstancePropertyNames<T>, string>}Changed`
			? (value: T[P]) => void
			: never;
	};

	/**
	 * Instance events and property change events that can be passed a callback
	 * function. Property change events are a macro for `changed()` actions.
	 */
	type InstanceEventAttributes<T extends Instance> = InstanceEventCallbacks<T> & InstanceChangedCallbacks<T>;

	/**
	 * Instance properties and events that can be used with JSX syntax.
	 */
	type InstanceAttributes<T extends Instance> = ActionAttributes<T> &
		InstancePropertySources<T> &
		InstanceEventAttributes<T>;

	/**
	 * Instance properties and events that can be used with the
	 * legacy `create()` function.
	 */
	type LegacyInstanceProps<T extends Instance> = { [K in number]?: LegacyNode<T> } & InstancePropertySources<T> &
		InstanceEventCallbacks<T>;

	namespace JSX {
		type Element = Vide.Node;
		type ElementType = string | ((props: any) => Element | void);

		interface IntrinsicAttributes extends Vide.Attributes {}

		interface ElementChildrenAttribute {
			children: {};
		}

		type IntrinsicElements = {
			[K in keyof CreatableInstances as Lowercase<K>]: Vide.InstanceAttributes<CreatableInstances[K]>;
		};
	}
}
