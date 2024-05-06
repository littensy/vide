type Destructor = () => void;
type Key = string | number | symbol;
type Table<K, V> = Map<K, V> | ReadonlyMap<K, V> | { readonly [P in Extract<K, Key>]: V };

export = Vide;
export as namespace Vide;

declare namespace Vide {
	interface Source<T> {
		(value: T): T;
		(): T;
	}

	type Derivable<T> = T | (() => T);

	type Component<Props = {}> = (props: Props) => Node;

	type PropsWithChildren<Props = {}> = Props & { children: Node };

	interface VideAction<T extends Instance> {
		priority: number;
		callback: (instance: T) => void;
	}

	type Animatable = number | CFrame | Color3 | UDim | UDim2 | Vector2 | Vector3;

	let strict: boolean;

	function root<T extends unknown[]>(fn: (destructor: Destructor) => LuaTuple<T>): LuaTuple<T>;

	function root<T>(fn: (destructor: Destructor) => T): T;

	function mount<T>(component: () => T, target: Instance): Destructor;

	function mount(component: () => void): Destructor;

	function create<K extends keyof CreatableInstances>(
		className: K,
	): (props?: LegacyInstanceProps<CreatableInstances[K]>) => CreatableInstances[K];

	function create<T extends Instance>(className: string): (props?: LegacyInstanceProps<T>) => T;

	function source<T>(initialValue: T): Source<T>;

	function source<T>(): Source<T | undefined>;

	function effect<T>(callback: (value: T) => T, initialValue: T): void;

	function effect(callback: () => void): void;

	function derive<T>(source: () => T): () => T;

	// [FIXME] 'switch' is a reserved keyword in TypeScript
	function match<T extends Key, U extends Node>(source: () => T): (map: { [P in T]?: () => U }) => () => U | undefined;

	function show<T, U = undefined>(source: () => any, component: () => T, fallback?: () => U): () => T | U;

	function indexes<VI, VO>(input: () => readonly VI[], transform: (value: () => VI, index: number) => VO): () => VO[];

	function indexes<K, VI, VO>(input: () => Table<K, VI>, transform: (value: () => VI, key: K) => VO): () => Map<K, VO>;

	function values<VI, VO>(input: () => readonly VI[], transform: (value: VI, index: () => number) => VO): () => VO[];

	function values<K, VI, VO>(input: () => Table<K, VI>, transform: (value: VI, key: () => K) => VO): () => Map<K, VO>;

	function cleanup(destructor: Destructor): void;

	function untrack<T>(source: Source<T>): T;

	function read<T>(source: Derivable<T>): T;

	function batch(setter: () => void): void;

	function spring<T>(source: () => T, period?: number, dampingRatio?: number): () => T;

	function action<T extends Instance>(callback: (instance: T) => void, priority?: number): VideAction<T>;

	function changed<T extends Instance, K extends keyof WritableInstanceProperties<T>>(
		key: K,
		callback: (value: WritableInstanceProperties<T>[K]) => void,
	): VideAction<T>;

	function apply<T extends Instance>(instance: T): (props: LegacyInstanceProps<T>) => T;

	function step(deltaTime: number): void;

	// Components

	function Fragment<T>(props: T): T;

	function For<VI, VO extends Node>(props: {
		each: () => readonly VI[];
		children: (item: VI, index: () => number) => VO;
	}): () => VO[];

	function For<K, VI, VO extends Node>(props: {
		each: () => Table<K, VI>;
		children: (value: VI, key: () => K) => VO;
	}): () => VO[];

	function Index<VI, VO extends Node>(props: {
		each: () => readonly VI[];
		children: (item: () => VI, index: number) => VO;
	}): () => VO[];

	function Index<K, VI, VO extends Node>(props: {
		each: () => Table<K, VI>;
		children: (value: () => VI, key: K) => VO;
	}): () => VO[];

	function Switch(props: { condition: () => any; children: Node }): () => Node;

	function Case<T>(props: { match: T; children: () => Node }): Node;

	function Show(props: { when: () => any; children: () => Node; fallback?: () => Node }): () => Node;

	// Elements

	type Node =
		| Instance
		| InstanceAttributes<Instance>
		| VideAction<any>
		| FragmentNode
		| FunctionNode
		| string
		| number
		| boolean
		| undefined;

	type LegacyNode<T extends Instance> =
		| Instance
		| InstanceAttributes<T>
		| VideAction<T>
		| FragmentNode
		| FunctionNode
		| undefined;

	type FragmentNode = Map<any, Node> | ReadonlyMap<any, Node> | readonly Node[] | { readonly [key: Key]: Node };

	type FunctionNode = () => Node;

	interface Attributes {
		children?: Node;
	}

	interface RefAttributes<T> extends Attributes {
		ref?: (instance: T) => void;
	}

	type InferEnumNames<T> = T extends EnumItem ? T | T["Name"] : T;

	type InstancePropertySources<T extends Instance> = {
		[K in keyof WritableInstanceProperties<T>]?: Derivable<InferEnumNames<WritableInstanceProperties<T>[K]>>;
	};

	type InstanceEventCallbacks<T extends Instance> = {
		[K in InstanceEventNames<T>]?: T[K] extends RBXScriptSignal<(...args: infer A) => void>
			? (...args: A) => void
			: never;
	};

	type InstanceChangedCallbacks<T extends Instance> = {
		[K in `${Extract<InstancePropertyNames<T>, string>}Changed`]?: K extends `${infer P extends Extract<InstancePropertyNames<T>, string>}Changed`
			? (value: T[P]) => void
			: never;
	};

	type InstanceEventAttributes<T extends Instance> = InstanceEventCallbacks<T> & InstanceChangedCallbacks<T>;

	type InstanceAttributes<T extends Instance> = RefAttributes<T> &
		InstancePropertySources<T> &
		InstanceEventAttributes<T>;

	type LegacyInstanceProps<T extends Instance> = { [K in number]?: LegacyNode<T> } & InstancePropertySources<T> &
		InstanceEventCallbacks<T>;
}

declare global {
	namespace JSX {
		type Element = Vide.Node;
		type ElementType = string | ((props: any) => Element | void);
		type IntrinsicAttributes = Vide.Attributes;

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
			localscript: Vide.InstanceAttributes<LocalScript>;
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
			script: Vide.InstanceAttributes<Script>;
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
