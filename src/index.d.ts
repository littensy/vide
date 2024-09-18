type Destructor = () => void;
type Key = string | number | symbol;
type Table<K, V> = Map<K, V> | ReadonlyMap<K, V> | { readonly [P in Extract<K, Key>]: V };

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
	interface Source<T> {
		(value: T): T;
		(): T;
	}

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
	type PropsWithChildren<Props = {}> = Props & { children: Node };

	/**
	 * An object containing the custom logic to invoke when an instance is
	 * created. Created using `action()` or using the special `action` prop.
	 */
	interface VideAction<T extends Instance> {
		priority: number;
		callback: (instance: T) => void;
	}

	/**
	 * A value that can be animated by Vide's spring system.
	 */
	type Animatable = number | CFrame | Color3 | UDim | UDim2 | Vector2 | Vector3;

	/**
	 * Any destructible object that can be passed to `cleanup()`.
	 */
	type Disposable =
		| Destructor
		| Instance
		| RBXScriptConnection
		| { disconnect(): void }
		| { destroy(): void }
		| { Disconnect(): void }
		| { Destroy(): void };

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
	function root<T extends unknown[]>(fn: (destructor: Destructor) => LuaTuple<T>): LuaTuple<T>;
	// overload for a single retur
	function root<T>(fn: (destructor: Destructor) => T): T;

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
	function mount<T>(component: () => T, target?: Instance): Destructor;

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
	function match<T extends Key, U extends Node>(source: () => T): (map: { [P in T]?: () => U }) => () => U | undefined;

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
	function show<T, U = undefined>(source: () => any, component: () => T, fallback?: () => U): () => T | U;

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
	 * @param transform The function to transform each value in the table.
	 *
	 * @returns A source holding an array of the rendered components.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#indexes
	 */
	// overload for an array input
	function indexes<VI, VO>(input: () => readonly VI[], transform: (value: () => VI, index: number) => VO): () => VO[];
	// overload for a map or object input
	function indexes<K, VI, VO>(input: () => Table<K, VI>, transform: (value: () => VI, key: K) => VO): () => VO[];

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
	 * @param transform The function to transform each value in the table.
	 *
	 * @returns A source holding an array of the rendered components.
	 *
	 * @see https://centau.github.io/vide/api/reactivity-flow#values
	 */
	// overload for an array input
	function values<VI, VO>(input: () => readonly VI[], transform: (value: VI, index: () => number) => VO): () => VO[];
	// overload for a map or object input
	function values<K, VI, VO>(input: () => Table<K, VI>, transform: (value: VI, key: () => K) => VO): () => VO[];

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
	function untrack<T>(source: Source<T>): T;

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
	 * @returns A new source that moves towards the input source value.
	 *
	 * @see https://centau.github.io/vide/api/animation#spring
	 */
	function spring<T>(source: () => T, period?: number, dampingRatio?: number): () => T;

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
	function action<T extends Instance>(callback: (instance: T) => void, priority?: number): VideAction<T>;

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
	): VideAction<T>;

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
		children: (item: VI, index: () => number) => VO;
	}): () => VO[];
	// overload for a map or object input
	function For<K, VI, VO extends Node | void>(props: {
		each: () => Table<K, VI>;
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
		children: (item: () => VI, index: number) => VO;
	}): () => VO[];
	// overload for a map or object input
	function Index<K, VI, VO extends Node | void>(props: {
		each: () => Table<K, VI>;
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
	function Case<T>(props: { match: T; children: () => Node | void }): Node;

	/**
	 * Shows one of two components depending on an input source. Renders the
	 * first component when the source is truthy, and the second component
	 * when the source is falsey.
	 *
	 * @example
	 * ```tsx
	 * <Show when={state} fallback={() => <Loading />}>
	 *   {() => <Content />}
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
	function Show(props: { when: () => any; children: () => Node | void; fallback?: () => Node | void }): () => Node;

	// Elements

	/**
	 * A value that can be passed to a JSX element.
	 */
	type Node = Instance | InstanceAttributes<Instance> | VideAction<any> | FragmentNode | FunctionNode | undefined;

	/**
	 * A value that can be passed to the `create()` function.
	 *
	 * @template T The type of instance to create.
	 */
	type LegacyNode<T extends Instance> =
		| Instance
		| InstanceAttributes<T>
		| VideAction<T>
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
}

declare global {
	namespace JSX {
		type Element = Vide.Node;
		type ElementType = string | ((props: any) => Element | void);

		interface IntrinsicAttributes extends Vide.Attributes {}

		interface ElementChildrenAttribute {
			children: {};
		}

		interface IntrinsicElements {
			accessory: Vide.InstanceAttributes<Accessory>;
			accessorydescription: Vide.InstanceAttributes<AccessoryDescription>;
			accoutrement: Vide.InstanceAttributes<Accoutrement>;
			actor: Vide.InstanceAttributes<Actor>;
			adgui: Vide.InstanceAttributes<AdGui>;
			adportal: Vide.InstanceAttributes<AdPortal>;
			aircontroller: Vide.InstanceAttributes<AirController>;
			alignorientation: Vide.InstanceAttributes<AlignOrientation>;
			alignposition: Vide.InstanceAttributes<AlignPosition>;
			angularvelocity: Vide.InstanceAttributes<AngularVelocity>;
			animation: Vide.InstanceAttributes<Animation>;
			animationconstraint: Vide.InstanceAttributes<AnimationConstraint>;
			animationcontroller: Vide.InstanceAttributes<AnimationController>;
			animationrigdata: Vide.InstanceAttributes<AnimationRigData>;
			animator: Vide.InstanceAttributes<Animator>;
			archandles: Vide.InstanceAttributes<ArcHandles>;
			atmosphere: Vide.InstanceAttributes<Atmosphere>;
			attachment: Vide.InstanceAttributes<Attachment>;
			audioanalyzer: Vide.InstanceAttributes<AudioAnalyzer>;
			audiochorus: Vide.InstanceAttributes<AudioChorus>;
			audiocompressor: Vide.InstanceAttributes<AudioCompressor>;
			audiodeviceinput: Vide.InstanceAttributes<AudioDeviceInput>;
			audiodeviceoutput: Vide.InstanceAttributes<AudioDeviceOutput>;
			audiodistortion: Vide.InstanceAttributes<AudioDistortion>;
			audioecho: Vide.InstanceAttributes<AudioEcho>;
			audioemitter: Vide.InstanceAttributes<AudioEmitter>;
			audioequalizer: Vide.InstanceAttributes<AudioEqualizer>;
			audiofader: Vide.InstanceAttributes<AudioFader>;
			audioflanger: Vide.InstanceAttributes<AudioFlanger>;
			audiolistener: Vide.InstanceAttributes<AudioListener>;
			audiopitchshifter: Vide.InstanceAttributes<AudioPitchShifter>;
			audioplayer: Vide.InstanceAttributes<AudioPlayer>;
			audioreverb: Vide.InstanceAttributes<AudioReverb>;
			ballsocketconstraint: Vide.InstanceAttributes<BallSocketConstraint>;
			beam: Vide.InstanceAttributes<Beam>;
			billboardgui: Vide.InstanceAttributes<BillboardGui>;
			blockmesh: Vide.InstanceAttributes<BlockMesh>;
			bloomeffect: Vide.InstanceAttributes<BloomEffect>;
			blureffect: Vide.InstanceAttributes<BlurEffect>;
			bodyangularvelocity: Vide.InstanceAttributes<BodyAngularVelocity>;
			bodycolors: Vide.InstanceAttributes<BodyColors>;
			bodyforce: Vide.InstanceAttributes<BodyForce>;
			bodygyro: Vide.InstanceAttributes<BodyGyro>;
			bodyposition: Vide.InstanceAttributes<BodyPosition>;
			bodythrust: Vide.InstanceAttributes<BodyThrust>;
			bodyvelocity: Vide.InstanceAttributes<BodyVelocity>;
			bone: Vide.InstanceAttributes<Bone>;
			boolvalue: Vide.InstanceAttributes<BoolValue>;
			boxhandleadornment: Vide.InstanceAttributes<BoxHandleAdornment>;
			brickcolorvalue: Vide.InstanceAttributes<BrickColorValue>;
			buoyancysensor: Vide.InstanceAttributes<BuoyancySensor>;
			camera: Vide.InstanceAttributes<Camera>;
			canvasgroup: Vide.InstanceAttributes<CanvasGroup>;
			cframevalue: Vide.InstanceAttributes<CFrameValue>;
			charactermesh: Vide.InstanceAttributes<CharacterMesh>;
			chorussoundeffect: Vide.InstanceAttributes<ChorusSoundEffect>;
			clickdetector: Vide.InstanceAttributes<ClickDetector>;
			climbcontroller: Vide.InstanceAttributes<ClimbController>;
			clouds: Vide.InstanceAttributes<Clouds>;
			color3value: Vide.InstanceAttributes<Color3Value>;
			colorcorrectioneffect: Vide.InstanceAttributes<ColorCorrectionEffect>;
			compressorsoundeffect: Vide.InstanceAttributes<CompressorSoundEffect>;
			conehandleadornment: Vide.InstanceAttributes<ConeHandleAdornment>;
			configuration: Vide.InstanceAttributes<Configuration>;
			controllermanager: Vide.InstanceAttributes<ControllerManager>;
			controllerpartsensor: Vide.InstanceAttributes<ControllerPartSensor>;
			cornerwedgepart: Vide.InstanceAttributes<CornerWedgePart>;
			curveanimation: Vide.InstanceAttributes<CurveAnimation>;
			cylinderhandleadornment: Vide.InstanceAttributes<CylinderHandleAdornment>;
			cylindermesh: Vide.InstanceAttributes<CylinderMesh>;
			cylindricalconstraint: Vide.InstanceAttributes<CylindricalConstraint>;
			decal: Vide.InstanceAttributes<Decal>;
			depthoffieldeffect: Vide.InstanceAttributes<DepthOfFieldEffect>;
			distortionsoundeffect: Vide.InstanceAttributes<DistortionSoundEffect>;
			doubleconstrainedvalue: Vide.InstanceAttributes<DoubleConstrainedValue>;
			dragdetector: Vide.InstanceAttributes<DragDetector>;
			dragger: Vide.InstanceAttributes<Dragger>;
			echosoundeffect: Vide.InstanceAttributes<EchoSoundEffect>;
			editableimage: Vide.InstanceAttributes<EditableImage>;
			editablemesh: Vide.InstanceAttributes<EditableMesh>;
			equalizersoundeffect: Vide.InstanceAttributes<EqualizerSoundEffect>;
			eulerrotationcurve: Vide.InstanceAttributes<EulerRotationCurve>;
			facecontrols: Vide.InstanceAttributes<FaceControls>;
			fire: Vide.InstanceAttributes<Fire>;
			flangesoundeffect: Vide.InstanceAttributes<FlangeSoundEffect>;
			floatcurve: Vide.InstanceAttributes<FloatCurve>;
			floorwire: Vide.InstanceAttributes<FloorWire>;
			folder: Vide.InstanceAttributes<Folder>;
			forcefield: Vide.InstanceAttributes<ForceField>;
			frame: Vide.InstanceAttributes<Frame>;
			groundcontroller: Vide.InstanceAttributes<GroundController>;
			handles: Vide.InstanceAttributes<Handles>;
			highlight: Vide.InstanceAttributes<Highlight>;
			hingeconstraint: Vide.InstanceAttributes<HingeConstraint>;
			hole: Vide.InstanceAttributes<Hole>;
			humanoid: Vide.InstanceAttributes<Humanoid>;
			humanoidcontroller: Vide.InstanceAttributes<HumanoidController>;
			humanoiddescription: Vide.InstanceAttributes<HumanoidDescription>;
			ikcontrol: Vide.InstanceAttributes<IKControl>;
			imagebutton: Vide.InstanceAttributes<ImageButton>;
			imagehandleadornment: Vide.InstanceAttributes<ImageHandleAdornment>;
			imagelabel: Vide.InstanceAttributes<ImageLabel>;
			intconstrainedvalue: Vide.InstanceAttributes<IntConstrainedValue>;
			intvalue: Vide.InstanceAttributes<IntValue>;
			keyframe: Vide.InstanceAttributes<Keyframe>;
			keyframemarker: Vide.InstanceAttributes<KeyframeMarker>;
			keyframesequence: Vide.InstanceAttributes<KeyframeSequence>;
			linearvelocity: Vide.InstanceAttributes<LinearVelocity>;
			lineforce: Vide.InstanceAttributes<LineForce>;
			linehandleadornment: Vide.InstanceAttributes<LineHandleAdornment>;
			localizationtable: Vide.InstanceAttributes<LocalizationTable>;
			markercurve: Vide.InstanceAttributes<MarkerCurve>;
			materialvariant: Vide.InstanceAttributes<MaterialVariant>;
			model: Vide.InstanceAttributes<Model>;
			motor: Vide.InstanceAttributes<Motor>;
			motor6d: Vide.InstanceAttributes<Motor6D>;
			nocollisionconstraint: Vide.InstanceAttributes<NoCollisionConstraint>;
			numberpose: Vide.InstanceAttributes<NumberPose>;
			numbervalue: Vide.InstanceAttributes<NumberValue>;
			objectvalue: Vide.InstanceAttributes<ObjectValue>;
			pants: Vide.InstanceAttributes<Pants>;
			part: Vide.InstanceAttributes<Part>;
			particleemitter: Vide.InstanceAttributes<ParticleEmitter>;
			pitchshiftsoundeffect: Vide.InstanceAttributes<PitchShiftSoundEffect>;
			planeconstraint: Vide.InstanceAttributes<PlaneConstraint>;
			pointlight: Vide.InstanceAttributes<PointLight>;
			pose: Vide.InstanceAttributes<Pose>;
			prismaticconstraint: Vide.InstanceAttributes<PrismaticConstraint>;
			proximityprompt: Vide.InstanceAttributes<ProximityPrompt>;
			rayvalue: Vide.InstanceAttributes<RayValue>;
			reverbsoundeffect: Vide.InstanceAttributes<ReverbSoundEffect>;
			rigidconstraint: Vide.InstanceAttributes<RigidConstraint>;
			rocketpropulsion: Vide.InstanceAttributes<RocketPropulsion>;
			rodconstraint: Vide.InstanceAttributes<RodConstraint>;
			ropeconstraint: Vide.InstanceAttributes<RopeConstraint>;
			rotationcurve: Vide.InstanceAttributes<RotationCurve>;
			screengui: Vide.InstanceAttributes<ScreenGui>;
			scrollingframe: Vide.InstanceAttributes<ScrollingFrame>;
			seat: Vide.InstanceAttributes<Seat>;
			selectionbox: Vide.InstanceAttributes<SelectionBox>;
			selectionsphere: Vide.InstanceAttributes<SelectionSphere>;
			shirt: Vide.InstanceAttributes<Shirt>;
			shirtgraphic: Vide.InstanceAttributes<ShirtGraphic>;
			sky: Vide.InstanceAttributes<Sky>;
			smoke: Vide.InstanceAttributes<Smoke>;
			sound: Vide.InstanceAttributes<Sound>;
			soundgroup: Vide.InstanceAttributes<SoundGroup>;
			sparkles: Vide.InstanceAttributes<Sparkles>;
			spawnlocation: Vide.InstanceAttributes<SpawnLocation>;
			specialmesh: Vide.InstanceAttributes<SpecialMesh>;
			spherehandleadornment: Vide.InstanceAttributes<SphereHandleAdornment>;
			spotlight: Vide.InstanceAttributes<SpotLight>;
			springconstraint: Vide.InstanceAttributes<SpringConstraint>;
			stringvalue: Vide.InstanceAttributes<StringValue>;
			stylederive: Vide.InstanceAttributes<StyleDerive>;
			stylelink: Vide.InstanceAttributes<StyleLink>;
			stylerule: Vide.InstanceAttributes<StyleRule>;
			stylesheet: Vide.InstanceAttributes<StyleSheet>;
			sunrayseffect: Vide.InstanceAttributes<SunRaysEffect>;
			surfaceappearance: Vide.InstanceAttributes<SurfaceAppearance>;
			surfacegui: Vide.InstanceAttributes<SurfaceGui>;
			surfacelight: Vide.InstanceAttributes<SurfaceLight>;
			surfaceselection: Vide.InstanceAttributes<SurfaceSelection>;
			swimcontroller: Vide.InstanceAttributes<SwimController>;
			textbox: Vide.InstanceAttributes<TextBox>;
			textbutton: Vide.InstanceAttributes<TextButton>;
			textlabel: Vide.InstanceAttributes<TextLabel>;
			texture: Vide.InstanceAttributes<Texture>;
			tool: Vide.InstanceAttributes<Tool>;
			torque: Vide.InstanceAttributes<Torque>;
			torsionspringconstraint: Vide.InstanceAttributes<TorsionSpringConstraint>;
			trail: Vide.InstanceAttributes<Trail>;
			tremolosoundeffect: Vide.InstanceAttributes<TremoloSoundEffect>;
			trusspart: Vide.InstanceAttributes<TrussPart>;
			uiaspectratioconstraint: Vide.InstanceAttributes<UIAspectRatioConstraint>;
			uicorner: Vide.InstanceAttributes<UICorner>;
			uidragdetector: Vide.InstanceAttributes<UIDragDetector>;
			uiflexitem: Vide.InstanceAttributes<UIFlexItem>;
			uigradient: Vide.InstanceAttributes<UIGradient>;
			uigridlayout: Vide.InstanceAttributes<UIGridLayout>;
			uilistlayout: Vide.InstanceAttributes<UIListLayout>;
			uipadding: Vide.InstanceAttributes<UIPadding>;
			uipagelayout: Vide.InstanceAttributes<UIPageLayout>;
			uiscale: Vide.InstanceAttributes<UIScale>;
			uisizeconstraint: Vide.InstanceAttributes<UISizeConstraint>;
			uistroke: Vide.InstanceAttributes<UIStroke>;
			uitablelayout: Vide.InstanceAttributes<UITableLayout>;
			uitextsizeconstraint: Vide.InstanceAttributes<UITextSizeConstraint>;
			universalconstraint: Vide.InstanceAttributes<UniversalConstraint>;
			vector3curve: Vide.InstanceAttributes<Vector3Curve>;
			vector3value: Vide.InstanceAttributes<Vector3Value>;
			vectorforce: Vide.InstanceAttributes<VectorForce>;
			vehiclecontroller: Vide.InstanceAttributes<VehicleController>;
			vehicleseat: Vide.InstanceAttributes<VehicleSeat>;
			velocitymotor: Vide.InstanceAttributes<VelocityMotor>;
			videoframe: Vide.InstanceAttributes<VideoFrame>;
			viewportframe: Vide.InstanceAttributes<ViewportFrame>;
			wedgepart: Vide.InstanceAttributes<WedgePart>;
			weld: Vide.InstanceAttributes<Weld>;
			weldconstraint: Vide.InstanceAttributes<WeldConstraint>;
			wire: Vide.InstanceAttributes<Wire>;
			wireframehandleadornment: Vide.InstanceAttributes<WireframeHandleAdornment>;
			worldmodel: Vide.InstanceAttributes<WorldModel>;
			wraplayer: Vide.InstanceAttributes<WrapLayer>;
			wraptarget: Vide.InstanceAttributes<WrapTarget>;
		}
	}
}
