var Elm = Elm || { Native: {} };
Elm.Native.Basics = {};
Elm.Native.Basics.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Basics = localRuntime.Native.Basics || {};
	if (localRuntime.Native.Basics.values)
	{
		return localRuntime.Native.Basics.values;
	}

	var Utils = Elm.Native.Utils.make(localRuntime);

	function div(a, b)
	{
		return (a / b) | 0;
	}
	function rem(a, b)
	{
		return a % b;
	}
	function mod(a, b)
	{
		if (b === 0)
		{
			throw new Error('Cannot perform mod 0. Division by zero error.');
		}
		var r = a % b;
		var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

		return m === b ? 0 : m;
	}
	function logBase(base, n)
	{
		return Math.log(n) / Math.log(base);
	}
	function negate(n)
	{
		return -n;
	}
	function abs(n)
	{
		return n < 0 ? -n : n;
	}

	function min(a, b)
	{
		return Utils.cmp(a, b) < 0 ? a : b;
	}
	function max(a, b)
	{
		return Utils.cmp(a, b) > 0 ? a : b;
	}
	function clamp(lo, hi, n)
	{
		return Utils.cmp(n, lo) < 0 ? lo : Utils.cmp(n, hi) > 0 ? hi : n;
	}

	function xor(a, b)
	{
		return a !== b;
	}
	function not(b)
	{
		return !b;
	}
	function isInfinite(n)
	{
		return n === Infinity || n === -Infinity;
	}

	function truncate(n)
	{
		return n | 0;
	}

	function degrees(d)
	{
		return d * Math.PI / 180;
	}
	function turns(t)
	{
		return 2 * Math.PI * t;
	}
	function fromPolar(point)
	{
		var r = point._0;
		var t = point._1;
		return Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
	}
	function toPolar(point)
	{
		var x = point._0;
		var y = point._1;
		return Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
	}

	return localRuntime.Native.Basics.values = {
		div: F2(div),
		rem: F2(rem),
		mod: F2(mod),

		pi: Math.PI,
		e: Math.E,
		cos: Math.cos,
		sin: Math.sin,
		tan: Math.tan,
		acos: Math.acos,
		asin: Math.asin,
		atan: Math.atan,
		atan2: F2(Math.atan2),

		degrees: degrees,
		turns: turns,
		fromPolar: fromPolar,
		toPolar: toPolar,

		sqrt: Math.sqrt,
		logBase: F2(logBase),
		negate: negate,
		abs: abs,
		min: F2(min),
		max: F2(max),
		clamp: F3(clamp),
		compare: Utils.compare,

		xor: F2(xor),
		not: not,

		truncate: truncate,
		ceiling: Math.ceil,
		floor: Math.floor,
		round: Math.round,
		toFloat: function(x) { return x; },
		isNaN: isNaN,
		isInfinite: isInfinite
	};
};

Elm.Native.Port = {};

Elm.Native.Port.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Port = localRuntime.Native.Port || {};
	if (localRuntime.Native.Port.values)
	{
		return localRuntime.Native.Port.values;
	}

	var NS;

	// INBOUND

	function inbound(name, type, converter)
	{
		if (!localRuntime.argsTracker[name])
		{
			throw new Error(
				'Port Error:\n' +
				'No argument was given for the port named \'' + name + '\' with type:\n\n' +
				'    ' + type.split('\n').join('\n        ') + '\n\n' +
				'You need to provide an initial value!\n\n' +
				'Find out more about ports here <http://elm-lang.org/learn/Ports.elm>'
			);
		}
		var arg = localRuntime.argsTracker[name];
		arg.used = true;

		return jsToElm(name, type, converter, arg.value);
	}


	function inboundSignal(name, type, converter)
	{
		var initialValue = inbound(name, type, converter);

		if (!NS)
		{
			NS = Elm.Native.Signal.make(localRuntime);
		}
		var signal = NS.input('inbound-port-' + name, initialValue);

		function send(jsValue)
		{
			var elmValue = jsToElm(name, type, converter, jsValue);
			setTimeout(function() {
				localRuntime.notify(signal.id, elmValue);
			}, 0);
		}

		localRuntime.ports[name] = { send: send };

		return signal;
	}


	function jsToElm(name, type, converter, value)
	{
		try
		{
			return converter(value);
		}
		catch(e)
		{
			throw new Error(
				'Port Error:\n' +
				'Regarding the port named \'' + name + '\' with type:\n\n' +
				'    ' + type.split('\n').join('\n        ') + '\n\n' +
				'You just sent the value:\n\n' +
				'    ' + JSON.stringify(value) + '\n\n' +
				'but it cannot be converted to the necessary type.\n' +
				e.message
			);
		}
	}


	// OUTBOUND

	function outbound(name, converter, elmValue)
	{
		localRuntime.ports[name] = converter(elmValue);
	}


	function outboundSignal(name, converter, signal)
	{
		var subscribers = [];

		function subscribe(handler)
		{
			subscribers.push(handler);
		}
		function unsubscribe(handler)
		{
			subscribers.pop(subscribers.indexOf(handler));
		}

		function notify(elmValue)
		{
			var jsValue = converter(elmValue);
			var len = subscribers.length;
			for (var i = 0; i < len; ++i)
			{
				subscribers[i](jsValue);
			}
		}

		if (!NS)
		{
			NS = Elm.Native.Signal.make(localRuntime);
		}
		NS.output('outbound-port-' + name, notify, signal);

		localRuntime.ports[name] = {
			subscribe: subscribe,
			unsubscribe: unsubscribe
		};

		return signal;
	}


	return localRuntime.Native.Port.values = {
		inbound: inbound,
		outbound: outbound,
		inboundSignal: inboundSignal,
		outboundSignal: outboundSignal
	};
};

if (!Elm.fullscreen) {
	(function() {
		'use strict';

		var Display = {
			FULLSCREEN: 0,
			COMPONENT: 1,
			NONE: 2
		};

		Elm.fullscreen = function(module, args)
		{
			var container = document.createElement('div');
			document.body.appendChild(container);
			return init(Display.FULLSCREEN, container, module, args || {});
		};

		Elm.embed = function(module, container, args)
		{
			var tag = container.tagName;
			if (tag !== 'DIV')
			{
				throw new Error('Elm.node must be given a DIV, not a ' + tag + '.');
			}
			return init(Display.COMPONENT, container, module, args || {});
		};

		Elm.worker = function(module, args)
		{
			return init(Display.NONE, {}, module, args || {});
		};

		function init(display, container, module, args, moduleToReplace)
		{
			// defining state needed for an instance of the Elm RTS
			var inputs = [];

			/* OFFSET
			 * Elm's time traveling debugger lets you pause time. This means
			 * "now" may be shifted a bit into the past. By wrapping Date.now()
			 * we can manage this.
			 */
			var timer = {
				programStart: Date.now(),
				now: function()
				{
					return Date.now();
				}
			};

			var updateInProgress = false;
			function notify(id, v)
			{
				if (updateInProgress)
				{
					throw new Error(
						'The notify function has been called synchronously!\n' +
						'This can lead to frames being dropped.\n' +
						'Definitely report this to <https://github.com/elm-lang/Elm/issues>\n');
				}
				updateInProgress = true;
				var timestep = timer.now();
				for (var i = inputs.length; i--; )
				{
					inputs[i].notify(timestep, id, v);
				}
				updateInProgress = false;
			}
			function setTimeout(func, delay)
			{
				return window.setTimeout(func, delay);
			}

			var listeners = [];
			function addListener(relevantInputs, domNode, eventName, func)
			{
				domNode.addEventListener(eventName, func);
				var listener = {
					relevantInputs: relevantInputs,
					domNode: domNode,
					eventName: eventName,
					func: func
				};
				listeners.push(listener);
			}

			var argsTracker = {};
			for (var name in args)
			{
				argsTracker[name] = {
					value: args[name],
					used: false
				};
			}

			// create the actual RTS. Any impure modules will attach themselves to this
			// object. This permits many Elm programs to be embedded per document.
			var elm = {
				notify: notify,
				setTimeout: setTimeout,
				node: container,
				addListener: addListener,
				inputs: inputs,
				timer: timer,
				argsTracker: argsTracker,
				ports: {},

				isFullscreen: function() { return display === Display.FULLSCREEN; },
				isEmbed: function() { return display === Display.COMPONENT; },
				isWorker: function() { return display === Display.NONE; }
			};

			function swap(newModule)
			{
				removeListeners(listeners);
				var div = document.createElement('div');
				var newElm = init(display, div, newModule, args, elm);
				inputs = [];

				return newElm;
			}

			function dispose()
			{
				removeListeners(listeners);
				inputs = [];
			}

			var Module = {};
			try
			{
				Module = module.make(elm);
				checkInputs(elm);
			}
			catch (error)
			{
				if (typeof container.appendChild === "function")
				{
					container.appendChild(errorNode(error.message));
				}
				else
				{
					console.error(error.message);
				}
				throw error;
			}

			if (display !== Display.NONE)
			{
				var graphicsNode = initGraphics(elm, Module);
			}

			var rootNode = { kids: inputs };
			trimDeadNodes(rootNode);
			inputs = rootNode.kids;
			filterListeners(inputs, listeners);

			addReceivers(elm.ports);

			if (typeof moduleToReplace !== 'undefined')
			{
				hotSwap(moduleToReplace, elm);

				// rerender scene if graphics are enabled.
				if (typeof graphicsNode !== 'undefined')
				{
					graphicsNode.notify(0, true, 0);
				}
			}

			return {
				swap: swap,
				ports: elm.ports,
				dispose: dispose
			};
		}

		function checkInputs(elm)
		{
			var argsTracker = elm.argsTracker;
			for (var name in argsTracker)
			{
				if (!argsTracker[name].used)
				{
					throw new Error(
						"Port Error:\nYou provided an argument named '" + name +
						"' but there is no corresponding port!\n\n" +
						"Maybe add a port '" + name + "' to your Elm module?\n" +
						"Maybe remove the '" + name + "' argument from your initialization code in JS?"
					);
				}
			}
		}

		function errorNode(message)
		{
			var code = document.createElement('code');

			var lines = message.split('\n');
			code.appendChild(document.createTextNode(lines[0]));
			code.appendChild(document.createElement('br'));
			code.appendChild(document.createElement('br'));
			for (var i = 1; i < lines.length; ++i)
			{
				code.appendChild(document.createTextNode('\u00A0 \u00A0 ' + lines[i].replace(/  /g, '\u00A0 ')));
				code.appendChild(document.createElement('br'));
			}
			code.appendChild(document.createElement('br'));
			code.appendChild(document.createTextNode('Open the developer console for more details.'));
			return code;
		}


		//// FILTER SIGNALS ////

		// TODO: move this code into the signal module and create a function
		// Signal.initializeGraph that actually instantiates everything.

		function filterListeners(inputs, listeners)
		{
			loop:
			for (var i = listeners.length; i--; )
			{
				var listener = listeners[i];
				for (var j = inputs.length; j--; )
				{
					if (listener.relevantInputs.indexOf(inputs[j].id) >= 0)
					{
						continue loop;
					}
				}
				listener.domNode.removeEventListener(listener.eventName, listener.func);
			}
		}

		function removeListeners(listeners)
		{
			for (var i = listeners.length; i--; )
			{
				var listener = listeners[i];
				listener.domNode.removeEventListener(listener.eventName, listener.func);
			}
		}

		// add receivers for built-in ports if they are defined
		function addReceivers(ports)
		{
			if ('title' in ports)
			{
				if (typeof ports.title === 'string')
				{
					document.title = ports.title;
				}
				else
				{
					ports.title.subscribe(function(v) { document.title = v; });
				}
			}
			if ('redirect' in ports)
			{
				ports.redirect.subscribe(function(v) {
					if (v.length > 0)
					{
						window.location = v;
					}
				});
			}
		}


		// returns a boolean representing whether the node is alive or not.
		function trimDeadNodes(node)
		{
			if (node.isOutput)
			{
				return true;
			}

			var liveKids = [];
			for (var i = node.kids.length; i--; )
			{
				var kid = node.kids[i];
				if (trimDeadNodes(kid))
				{
					liveKids.push(kid);
				}
			}
			node.kids = liveKids;

			return liveKids.length > 0;
		}


		////  RENDERING  ////

		function initGraphics(elm, Module)
		{
			if (!('main' in Module))
			{
				throw new Error("'main' is missing! What do I display?!");
			}

			var signalGraph = Module.main;

			// make sure the signal graph is actually a signal & extract the visual model
			if (!('notify' in signalGraph))
			{
				signalGraph = Elm.Signal.make(elm).constant(signalGraph);
			}
			var initialScene = signalGraph.value;

			// Figure out what the render functions should be
			var render;
			var update;
			if (initialScene.ctor === 'Element_elm_builtin')
			{
				var Element = Elm.Native.Graphics.Element.make(elm);
				render = Element.render;
				update = Element.updateAndReplace;
			}
			else
			{
				var VirtualDom = Elm.Native.VirtualDom.make(elm);
				render = VirtualDom.render;
				update = VirtualDom.updateAndReplace;
			}

			// Add the initialScene to the DOM
			var container = elm.node;
			var node = render(initialScene);
			while (container.firstChild)
			{
				container.removeChild(container.firstChild);
			}
			container.appendChild(node);

			var _requestAnimationFrame =
				typeof requestAnimationFrame !== 'undefined'
					? requestAnimationFrame
					: function(cb) { setTimeout(cb, 1000 / 60); }
					;

			// domUpdate is called whenever the main Signal changes.
			//
			// domUpdate and drawCallback implement a small state machine in order
			// to schedule only 1 draw per animation frame. This enforces that
			// once draw has been called, it will not be called again until the
			// next frame.
			//
			// drawCallback is scheduled whenever
			// 1. The state transitions from PENDING_REQUEST to EXTRA_REQUEST, or
			// 2. The state transitions from NO_REQUEST to PENDING_REQUEST
			//
			// Invariants:
			// 1. In the NO_REQUEST state, there is never a scheduled drawCallback.
			// 2. In the PENDING_REQUEST and EXTRA_REQUEST states, there is always exactly 1
			//    scheduled drawCallback.
			var NO_REQUEST = 0;
			var PENDING_REQUEST = 1;
			var EXTRA_REQUEST = 2;
			var state = NO_REQUEST;
			var savedScene = initialScene;
			var scheduledScene = initialScene;

			function domUpdate(newScene)
			{
				scheduledScene = newScene;

				switch (state)
				{
					case NO_REQUEST:
						_requestAnimationFrame(drawCallback);
						state = PENDING_REQUEST;
						return;
					case PENDING_REQUEST:
						state = PENDING_REQUEST;
						return;
					case EXTRA_REQUEST:
						state = PENDING_REQUEST;
						return;
				}
			}

			function drawCallback()
			{
				switch (state)
				{
					case NO_REQUEST:
						// This state should not be possible. How can there be no
						// request, yet somehow we are actively fulfilling a
						// request?
						throw new Error(
							'Unexpected draw callback.\n' +
							'Please report this to <https://github.com/elm-lang/core/issues>.'
						);

					case PENDING_REQUEST:
						// At this point, we do not *know* that another frame is
						// needed, but we make an extra request to rAF just in
						// case. It's possible to drop a frame if rAF is called
						// too late, so we just do it preemptively.
						_requestAnimationFrame(drawCallback);
						state = EXTRA_REQUEST;

						// There's also stuff we definitely need to draw.
						draw();
						return;

					case EXTRA_REQUEST:
						// Turns out the extra request was not needed, so we will
						// stop calling rAF. No reason to call it all the time if
						// no one needs it.
						state = NO_REQUEST;
						return;
				}
			}

			function draw()
			{
				update(elm.node.firstChild, savedScene, scheduledScene);
				if (elm.Native.Window)
				{
					elm.Native.Window.values.resizeIfNeeded();
				}
				savedScene = scheduledScene;
			}

			var renderer = Elm.Native.Signal.make(elm).output('main', domUpdate, signalGraph);

			// must check for resize after 'renderer' is created so
			// that changes show up.
			if (elm.Native.Window)
			{
				elm.Native.Window.values.resizeIfNeeded();
			}

			return renderer;
		}

		//// HOT SWAPPING ////

		// Returns boolean indicating if the swap was successful.
		// Requires that the two signal graphs have exactly the same
		// structure.
		function hotSwap(from, to)
		{
			function similar(nodeOld, nodeNew)
			{
				if (nodeOld.id !== nodeNew.id)
				{
					return false;
				}
				if (nodeOld.isOutput)
				{
					return nodeNew.isOutput;
				}
				return nodeOld.kids.length === nodeNew.kids.length;
			}
			function swap(nodeOld, nodeNew)
			{
				nodeNew.value = nodeOld.value;
				return true;
			}
			var canSwap = depthFirstTraversals(similar, from.inputs, to.inputs);
			if (canSwap)
			{
				depthFirstTraversals(swap, from.inputs, to.inputs);
			}
			from.node.parentNode.replaceChild(to.node, from.node);

			return canSwap;
		}

		// Returns false if the node operation f ever fails.
		function depthFirstTraversals(f, queueOld, queueNew)
		{
			if (queueOld.length !== queueNew.length)
			{
				return false;
			}
			queueOld = queueOld.slice(0);
			queueNew = queueNew.slice(0);

			var seen = [];
			while (queueOld.length > 0 && queueNew.length > 0)
			{
				var nodeOld = queueOld.pop();
				var nodeNew = queueNew.pop();
				if (seen.indexOf(nodeOld.id) < 0)
				{
					if (!f(nodeOld, nodeNew))
					{
						return false;
					}
					queueOld = queueOld.concat(nodeOld.kids || []);
					queueNew = queueNew.concat(nodeNew.kids || []);
					seen.push(nodeOld.id);
				}
			}
			return true;
		}
	}());

	function F2(fun)
	{
		function wrapper(a) { return function(b) { return fun(a,b); }; }
		wrapper.arity = 2;
		wrapper.func = fun;
		return wrapper;
	}

	function F3(fun)
	{
		function wrapper(a) {
			return function(b) { return function(c) { return fun(a, b, c); }; };
		}
		wrapper.arity = 3;
		wrapper.func = fun;
		return wrapper;
	}

	function F4(fun)
	{
		function wrapper(a) { return function(b) { return function(c) {
			return function(d) { return fun(a, b, c, d); }; }; };
		}
		wrapper.arity = 4;
		wrapper.func = fun;
		return wrapper;
	}

	function F5(fun)
	{
		function wrapper(a) { return function(b) { return function(c) {
			return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
		}
		wrapper.arity = 5;
		wrapper.func = fun;
		return wrapper;
	}

	function F6(fun)
	{
		function wrapper(a) { return function(b) { return function(c) {
			return function(d) { return function(e) { return function(f) {
			return fun(a, b, c, d, e, f); }; }; }; }; };
		}
		wrapper.arity = 6;
		wrapper.func = fun;
		return wrapper;
	}

	function F7(fun)
	{
		function wrapper(a) { return function(b) { return function(c) {
			return function(d) { return function(e) { return function(f) {
			return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
		}
		wrapper.arity = 7;
		wrapper.func = fun;
		return wrapper;
	}

	function F8(fun)
	{
		function wrapper(a) { return function(b) { return function(c) {
			return function(d) { return function(e) { return function(f) {
			return function(g) { return function(h) {
			return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
		}
		wrapper.arity = 8;
		wrapper.func = fun;
		return wrapper;
	}

	function F9(fun)
	{
		function wrapper(a) { return function(b) { return function(c) {
			return function(d) { return function(e) { return function(f) {
			return function(g) { return function(h) { return function(i) {
			return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
		}
		wrapper.arity = 9;
		wrapper.func = fun;
		return wrapper;
	}

	function A2(fun, a, b)
	{
		return fun.arity === 2
			? fun.func(a, b)
			: fun(a)(b);
	}
	function A3(fun, a, b, c)
	{
		return fun.arity === 3
			? fun.func(a, b, c)
			: fun(a)(b)(c);
	}
	function A4(fun, a, b, c, d)
	{
		return fun.arity === 4
			? fun.func(a, b, c, d)
			: fun(a)(b)(c)(d);
	}
	function A5(fun, a, b, c, d, e)
	{
		return fun.arity === 5
			? fun.func(a, b, c, d, e)
			: fun(a)(b)(c)(d)(e);
	}
	function A6(fun, a, b, c, d, e, f)
	{
		return fun.arity === 6
			? fun.func(a, b, c, d, e, f)
			: fun(a)(b)(c)(d)(e)(f);
	}
	function A7(fun, a, b, c, d, e, f, g)
	{
		return fun.arity === 7
			? fun.func(a, b, c, d, e, f, g)
			: fun(a)(b)(c)(d)(e)(f)(g);
	}
	function A8(fun, a, b, c, d, e, f, g, h)
	{
		return fun.arity === 8
			? fun.func(a, b, c, d, e, f, g, h)
			: fun(a)(b)(c)(d)(e)(f)(g)(h);
	}
	function A9(fun, a, b, c, d, e, f, g, h, i)
	{
		return fun.arity === 9
			? fun.func(a, b, c, d, e, f, g, h, i)
			: fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
	}
}

Elm.Native = Elm.Native || {};
Elm.Native.Utils = {};
Elm.Native.Utils.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Utils = localRuntime.Native.Utils || {};
	if (localRuntime.Native.Utils.values)
	{
		return localRuntime.Native.Utils.values;
	}


	// COMPARISONS

	function eq(l, r)
	{
		var stack = [{'x': l, 'y': r}];
		while (stack.length > 0)
		{
			var front = stack.pop();
			var x = front.x;
			var y = front.y;
			if (x === y)
			{
				continue;
			}
			if (typeof x === 'object')
			{
				var c = 0;
				for (var i in x)
				{
					++c;
					if (i in y)
					{
						if (i !== 'ctor')
						{
							stack.push({ 'x': x[i], 'y': y[i] });
						}
					}
					else
					{
						return false;
					}
				}
				if ('ctor' in x)
				{
					stack.push({'x': x.ctor, 'y': y.ctor});
				}
				if (c !== Object.keys(y).length)
				{
					return false;
				}
			}
			else if (typeof x === 'function')
			{
				throw new Error('Equality error: general function equality is ' +
								'undecidable, and therefore, unsupported');
			}
			else
			{
				return false;
			}
		}
		return true;
	}

	// code in Generate/JavaScript.hs depends on the particular
	// integer values assigned to LT, EQ, and GT
	var LT = -1, EQ = 0, GT = 1, ord = ['LT', 'EQ', 'GT'];

	function compare(x, y)
	{
		return {
			ctor: ord[cmp(x, y) + 1]
		};
	}

	function cmp(x, y) {
		var ord;
		if (typeof x !== 'object')
		{
			return x === y ? EQ : x < y ? LT : GT;
		}
		else if (x.isChar)
		{
			var a = x.toString();
			var b = y.toString();
			return a === b
				? EQ
				: a < b
					? LT
					: GT;
		}
		else if (x.ctor === '::' || x.ctor === '[]')
		{
			while (true)
			{
				if (x.ctor === '[]' && y.ctor === '[]')
				{
					return EQ;
				}
				if (x.ctor !== y.ctor)
				{
					return x.ctor === '[]' ? LT : GT;
				}
				ord = cmp(x._0, y._0);
				if (ord !== EQ)
				{
					return ord;
				}
				x = x._1;
				y = y._1;
			}
		}
		else if (x.ctor.slice(0, 6) === '_Tuple')
		{
			var n = x.ctor.slice(6) - 0;
			var err = 'cannot compare tuples with more than 6 elements.';
			if (n === 0) return EQ;
			if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
			if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
			if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
			if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
			if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
			if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
			if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
			return EQ;
		}
		else
		{
			throw new Error('Comparison error: comparison is only defined on ints, ' +
							'floats, times, chars, strings, lists of comparable values, ' +
							'and tuples of comparable values.');
		}
	}


	// TUPLES

	var Tuple0 = {
		ctor: '_Tuple0'
	};

	function Tuple2(x, y)
	{
		return {
			ctor: '_Tuple2',
			_0: x,
			_1: y
		};
	}


	// LITERALS

	function chr(c)
	{
		var x = new String(c);
		x.isChar = true;
		return x;
	}

	function txt(str)
	{
		var t = new String(str);
		t.text = true;
		return t;
	}


	// GUID

	var count = 0;
	function guid(_)
	{
		return count++;
	}


	// RECORDS

	function update(oldRecord, updatedFields)
	{
		var newRecord = {};
		for (var key in oldRecord)
		{
			var value = (key in updatedFields) ? updatedFields[key] : oldRecord[key];
			newRecord[key] = value;
		}
		return newRecord;
	}


	// MOUSE COORDINATES

	function getXY(e)
	{
		var posx = 0;
		var posy = 0;
		if (e.pageX || e.pageY)
		{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY)
		{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		if (localRuntime.isEmbed())
		{
			var rect = localRuntime.node.getBoundingClientRect();
			var relx = rect.left + document.body.scrollLeft + document.documentElement.scrollLeft;
			var rely = rect.top + document.body.scrollTop + document.documentElement.scrollTop;
			// TODO: figure out if there is a way to avoid rounding here
			posx = posx - Math.round(relx) - localRuntime.node.clientLeft;
			posy = posy - Math.round(rely) - localRuntime.node.clientTop;
		}
		return Tuple2(posx, posy);
	}


	//// LIST STUFF ////

	var Nil = { ctor: '[]' };

	function Cons(hd, tl)
	{
		return {
			ctor: '::',
			_0: hd,
			_1: tl
		};
	}

	function list(arr)
	{
		var out = Nil;
		for (var i = arr.length; i--; )
		{
			out = Cons(arr[i], out);
		}
		return out;
	}

	function range(lo, hi)
	{
		var list = Nil;
		if (lo <= hi)
		{
			do
			{
				list = Cons(hi, list);
			}
			while (hi-- > lo);
		}
		return list;
	}

	function append(xs, ys)
	{
		// append Strings
		if (typeof xs === 'string')
		{
			return xs + ys;
		}

		// append Text
		if (xs.ctor.slice(0, 5) === 'Text:')
		{
			return {
				ctor: 'Text:Append',
				_0: xs,
				_1: ys
			};
		}


		// append Lists
		if (xs.ctor === '[]')
		{
			return ys;
		}
		var root = Cons(xs._0, Nil);
		var curr = root;
		xs = xs._1;
		while (xs.ctor !== '[]')
		{
			curr._1 = Cons(xs._0, Nil);
			xs = xs._1;
			curr = curr._1;
		}
		curr._1 = ys;
		return root;
	}


	// CRASHES

	function crash(moduleName, region)
	{
		return function(message) {
			throw new Error(
				'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
				+ 'The message provided by the code author is:\n\n    '
				+ message
			);
		};
	}

	function crashCase(moduleName, region, value)
	{
		return function(message) {
			throw new Error(
				'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
				+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
				+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
				+ 'The message provided by the code author is:\n\n    '
				+ message
			);
		};
	}

	function regionToString(region)
	{
		if (region.start.line == region.end.line)
		{
			return 'on line ' + region.start.line;
		}
		return 'between lines ' + region.start.line + ' and ' + region.end.line;
	}


	// BAD PORTS

	function badPort(expected, received)
	{
		throw new Error(
			'Runtime error when sending values through a port.\n\n'
			+ 'Expecting ' + expected + ' but was given ' + formatValue(received)
		);
	}

	function formatValue(value)
	{
		// Explicity format undefined values as "undefined"
		// because JSON.stringify(undefined) unhelpfully returns ""
		return (value === undefined) ? "undefined" : JSON.stringify(value);
	}


	// TO STRING

	var _Array;
	var Dict;
	var List;

	var toString = function(v)
	{
		var type = typeof v;
		if (type === 'function')
		{
			var name = v.func ? v.func.name : v.name;
			return '<function' + (name === '' ? '' : ': ') + name + '>';
		}
		else if (type === 'boolean')
		{
			return v ? 'True' : 'False';
		}
		else if (type === 'number')
		{
			return v + '';
		}
		else if ((v instanceof String) && v.isChar)
		{
			return '\'' + addSlashes(v, true) + '\'';
		}
		else if (type === 'string')
		{
			return '"' + addSlashes(v, false) + '"';
		}
		else if (type === 'object' && 'ctor' in v)
		{
			if (v.ctor.substring(0, 6) === '_Tuple')
			{
				var output = [];
				for (var k in v)
				{
					if (k === 'ctor') continue;
					output.push(toString(v[k]));
				}
				return '(' + output.join(',') + ')';
			}
			else if (v.ctor === '_Array')
			{
				if (!_Array)
				{
					_Array = Elm.Array.make(localRuntime);
				}
				var list = _Array.toList(v);
				return 'Array.fromList ' + toString(list);
			}
			else if (v.ctor === '::')
			{
				var output = '[' + toString(v._0);
				v = v._1;
				while (v.ctor === '::')
				{
					output += ',' + toString(v._0);
					v = v._1;
				}
				return output + ']';
			}
			else if (v.ctor === '[]')
			{
				return '[]';
			}
			else if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin' || v.ctor === 'Set_elm_builtin')
			{
				if (!Dict)
				{
					Dict = Elm.Dict.make(localRuntime);
				}
				var list;
				var name;
				if (v.ctor === 'Set_elm_builtin')
				{
					if (!List)
					{
						List = Elm.List.make(localRuntime);
					}
					name = 'Set';
					list = A2(List.map, function(x) {return x._0; }, Dict.toList(v._0));
				}
				else
				{
					name = 'Dict';
					list = Dict.toList(v);
				}
				return name + '.fromList ' + toString(list);
			}
			else if (v.ctor.slice(0, 5) === 'Text:')
			{
				return '<text>';
			}
			else if (v.ctor === 'Element_elm_builtin')
			{
				return '<element>'
			}
			else if (v.ctor === 'Form_elm_builtin')
			{
				return '<form>'
			}
			else
			{
				var output = '';
				for (var i in v)
				{
					if (i === 'ctor') continue;
					var str = toString(v[i]);
					var parenless = str[0] === '{' || str[0] === '<' || str.indexOf(' ') < 0;
					output += ' ' + (parenless ? str : '(' + str + ')');
				}
				return v.ctor + output;
			}
		}
		else if (type === 'object' && 'notify' in v && 'id' in v)
		{
			return '<signal>';
		}
		else if (type === 'object')
		{
			var output = [];
			for (var k in v)
			{
				output.push(k + ' = ' + toString(v[k]));
			}
			if (output.length === 0)
			{
				return '{}';
			}
			return '{ ' + output.join(', ') + ' }';
		}
		return '<internal structure>';
	};

	function addSlashes(str, isChar)
	{
		var s = str.replace(/\\/g, '\\\\')
				  .replace(/\n/g, '\\n')
				  .replace(/\t/g, '\\t')
				  .replace(/\r/g, '\\r')
				  .replace(/\v/g, '\\v')
				  .replace(/\0/g, '\\0');
		if (isChar)
		{
			return s.replace(/\'/g, '\\\'');
		}
		else
		{
			return s.replace(/\"/g, '\\"');
		}
	}


	return localRuntime.Native.Utils.values = {
		eq: eq,
		cmp: cmp,
		compare: F2(compare),
		Tuple0: Tuple0,
		Tuple2: Tuple2,
		chr: chr,
		txt: txt,
		update: update,
		guid: guid,
		getXY: getXY,

		Nil: Nil,
		Cons: Cons,
		list: list,
		range: range,
		append: F2(append),

		crash: crash,
		crashCase: crashCase,
		badPort: badPort,

		toString: toString
	};
};

Elm.Basics = Elm.Basics || {};
Elm.Basics.make = function (_elm) {
   "use strict";
   _elm.Basics = _elm.Basics || {};
   if (_elm.Basics.values) return _elm.Basics.values;
   var _U = Elm.Native.Utils.make(_elm),$Native$Basics = Elm.Native.Basics.make(_elm),$Native$Utils = Elm.Native.Utils.make(_elm);
   var _op = {};
   var uncurry = F2(function (f,_p0) {    var _p1 = _p0;return A2(f,_p1._0,_p1._1);});
   var curry = F3(function (f,a,b) {    return f({ctor: "_Tuple2",_0: a,_1: b});});
   var flip = F3(function (f,b,a) {    return A2(f,a,b);});
   var snd = function (_p2) {    var _p3 = _p2;return _p3._1;};
   var fst = function (_p4) {    var _p5 = _p4;return _p5._0;};
   var always = F2(function (a,_p6) {    return a;});
   var identity = function (x) {    return x;};
   _op["<|"] = F2(function (f,x) {    return f(x);});
   _op["|>"] = F2(function (x,f) {    return f(x);});
   _op[">>"] = F3(function (f,g,x) {    return g(f(x));});
   _op["<<"] = F3(function (g,f,x) {    return g(f(x));});
   _op["++"] = $Native$Utils.append;
   var toString = $Native$Utils.toString;
   var isInfinite = $Native$Basics.isInfinite;
   var isNaN = $Native$Basics.isNaN;
   var toFloat = $Native$Basics.toFloat;
   var ceiling = $Native$Basics.ceiling;
   var floor = $Native$Basics.floor;
   var truncate = $Native$Basics.truncate;
   var round = $Native$Basics.round;
   var not = $Native$Basics.not;
   var xor = $Native$Basics.xor;
   _op["||"] = $Native$Basics.or;
   _op["&&"] = $Native$Basics.and;
   var max = $Native$Basics.max;
   var min = $Native$Basics.min;
   var GT = {ctor: "GT"};
   var EQ = {ctor: "EQ"};
   var LT = {ctor: "LT"};
   var compare = $Native$Basics.compare;
   _op[">="] = $Native$Basics.ge;
   _op["<="] = $Native$Basics.le;
   _op[">"] = $Native$Basics.gt;
   _op["<"] = $Native$Basics.lt;
   _op["/="] = $Native$Basics.neq;
   _op["=="] = $Native$Basics.eq;
   var e = $Native$Basics.e;
   var pi = $Native$Basics.pi;
   var clamp = $Native$Basics.clamp;
   var logBase = $Native$Basics.logBase;
   var abs = $Native$Basics.abs;
   var negate = $Native$Basics.negate;
   var sqrt = $Native$Basics.sqrt;
   var atan2 = $Native$Basics.atan2;
   var atan = $Native$Basics.atan;
   var asin = $Native$Basics.asin;
   var acos = $Native$Basics.acos;
   var tan = $Native$Basics.tan;
   var sin = $Native$Basics.sin;
   var cos = $Native$Basics.cos;
   _op["^"] = $Native$Basics.exp;
   _op["%"] = $Native$Basics.mod;
   var rem = $Native$Basics.rem;
   _op["//"] = $Native$Basics.div;
   _op["/"] = $Native$Basics.floatDiv;
   _op["*"] = $Native$Basics.mul;
   _op["-"] = $Native$Basics.sub;
   _op["+"] = $Native$Basics.add;
   var toPolar = $Native$Basics.toPolar;
   var fromPolar = $Native$Basics.fromPolar;
   var turns = $Native$Basics.turns;
   var degrees = $Native$Basics.degrees;
   var radians = function (t) {    return t;};
   return _elm.Basics.values = {_op: _op
                               ,max: max
                               ,min: min
                               ,compare: compare
                               ,not: not
                               ,xor: xor
                               ,rem: rem
                               ,negate: negate
                               ,abs: abs
                               ,sqrt: sqrt
                               ,clamp: clamp
                               ,logBase: logBase
                               ,e: e
                               ,pi: pi
                               ,cos: cos
                               ,sin: sin
                               ,tan: tan
                               ,acos: acos
                               ,asin: asin
                               ,atan: atan
                               ,atan2: atan2
                               ,round: round
                               ,floor: floor
                               ,ceiling: ceiling
                               ,truncate: truncate
                               ,toFloat: toFloat
                               ,degrees: degrees
                               ,radians: radians
                               ,turns: turns
                               ,toPolar: toPolar
                               ,fromPolar: fromPolar
                               ,isNaN: isNaN
                               ,isInfinite: isInfinite
                               ,toString: toString
                               ,fst: fst
                               ,snd: snd
                               ,identity: identity
                               ,always: always
                               ,flip: flip
                               ,curry: curry
                               ,uncurry: uncurry
                               ,LT: LT
                               ,EQ: EQ
                               ,GT: GT};
};
Elm.Maybe = Elm.Maybe || {};
Elm.Maybe.make = function (_elm) {
   "use strict";
   _elm.Maybe = _elm.Maybe || {};
   if (_elm.Maybe.values) return _elm.Maybe.values;
   var _U = Elm.Native.Utils.make(_elm);
   var _op = {};
   var withDefault = F2(function ($default,maybe) {    var _p0 = maybe;if (_p0.ctor === "Just") {    return _p0._0;} else {    return $default;}});
   var Nothing = {ctor: "Nothing"};
   var oneOf = function (maybes) {
      oneOf: while (true) {
         var _p1 = maybes;
         if (_p1.ctor === "[]") {
               return Nothing;
            } else {
               var _p3 = _p1._0;
               var _p2 = _p3;
               if (_p2.ctor === "Nothing") {
                     var _v3 = _p1._1;
                     maybes = _v3;
                     continue oneOf;
                  } else {
                     return _p3;
                  }
            }
      }
   };
   var andThen = F2(function (maybeValue,callback) {
      var _p4 = maybeValue;
      if (_p4.ctor === "Just") {
            return callback(_p4._0);
         } else {
            return Nothing;
         }
   });
   var Just = function (a) {    return {ctor: "Just",_0: a};};
   var map = F2(function (f,maybe) {    var _p5 = maybe;if (_p5.ctor === "Just") {    return Just(f(_p5._0));} else {    return Nothing;}});
   var map2 = F3(function (func,ma,mb) {
      var _p6 = {ctor: "_Tuple2",_0: ma,_1: mb};
      if (_p6.ctor === "_Tuple2" && _p6._0.ctor === "Just" && _p6._1.ctor === "Just") {
            return Just(A2(func,_p6._0._0,_p6._1._0));
         } else {
            return Nothing;
         }
   });
   var map3 = F4(function (func,ma,mb,mc) {
      var _p7 = {ctor: "_Tuple3",_0: ma,_1: mb,_2: mc};
      if (_p7.ctor === "_Tuple3" && _p7._0.ctor === "Just" && _p7._1.ctor === "Just" && _p7._2.ctor === "Just") {
            return Just(A3(func,_p7._0._0,_p7._1._0,_p7._2._0));
         } else {
            return Nothing;
         }
   });
   var map4 = F5(function (func,ma,mb,mc,md) {
      var _p8 = {ctor: "_Tuple4",_0: ma,_1: mb,_2: mc,_3: md};
      if (_p8.ctor === "_Tuple4" && _p8._0.ctor === "Just" && _p8._1.ctor === "Just" && _p8._2.ctor === "Just" && _p8._3.ctor === "Just") {
            return Just(A4(func,_p8._0._0,_p8._1._0,_p8._2._0,_p8._3._0));
         } else {
            return Nothing;
         }
   });
   var map5 = F6(function (func,ma,mb,mc,md,me) {
      var _p9 = {ctor: "_Tuple5",_0: ma,_1: mb,_2: mc,_3: md,_4: me};
      if (_p9.ctor === "_Tuple5" && _p9._0.ctor === "Just" && _p9._1.ctor === "Just" && _p9._2.ctor === "Just" && _p9._3.ctor === "Just" && _p9._4.ctor === "Just")
      {
            return Just(A5(func,_p9._0._0,_p9._1._0,_p9._2._0,_p9._3._0,_p9._4._0));
         } else {
            return Nothing;
         }
   });
   return _elm.Maybe.values = {_op: _op
                              ,andThen: andThen
                              ,map: map
                              ,map2: map2
                              ,map3: map3
                              ,map4: map4
                              ,map5: map5
                              ,withDefault: withDefault
                              ,oneOf: oneOf
                              ,Just: Just
                              ,Nothing: Nothing};
};
Elm.Native.List = {};
Elm.Native.List.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.List = localRuntime.Native.List || {};
	if (localRuntime.Native.List.values)
	{
		return localRuntime.Native.List.values;
	}
	if ('values' in Elm.Native.List)
	{
		return localRuntime.Native.List.values = Elm.Native.List.values;
	}

	var Utils = Elm.Native.Utils.make(localRuntime);

	var Nil = Utils.Nil;
	var Cons = Utils.Cons;

	var fromArray = Utils.list;

	function toArray(xs)
	{
		var out = [];
		while (xs.ctor !== '[]')
		{
			out.push(xs._0);
			xs = xs._1;
		}
		return out;
	}

	// f defined similarly for both foldl and foldr (NB: different from Haskell)
	// ie, foldl : (a -> b -> b) -> b -> [a] -> b
	function foldl(f, b, xs)
	{
		var acc = b;
		while (xs.ctor !== '[]')
		{
			acc = A2(f, xs._0, acc);
			xs = xs._1;
		}
		return acc;
	}

	function foldr(f, b, xs)
	{
		var arr = toArray(xs);
		var acc = b;
		for (var i = arr.length; i--; )
		{
			acc = A2(f, arr[i], acc);
		}
		return acc;
	}

	function map2(f, xs, ys)
	{
		var arr = [];
		while (xs.ctor !== '[]' && ys.ctor !== '[]')
		{
			arr.push(A2(f, xs._0, ys._0));
			xs = xs._1;
			ys = ys._1;
		}
		return fromArray(arr);
	}

	function map3(f, xs, ys, zs)
	{
		var arr = [];
		while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
		{
			arr.push(A3(f, xs._0, ys._0, zs._0));
			xs = xs._1;
			ys = ys._1;
			zs = zs._1;
		}
		return fromArray(arr);
	}

	function map4(f, ws, xs, ys, zs)
	{
		var arr = [];
		while (   ws.ctor !== '[]'
			   && xs.ctor !== '[]'
			   && ys.ctor !== '[]'
			   && zs.ctor !== '[]')
		{
			arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
			ws = ws._1;
			xs = xs._1;
			ys = ys._1;
			zs = zs._1;
		}
		return fromArray(arr);
	}

	function map5(f, vs, ws, xs, ys, zs)
	{
		var arr = [];
		while (   vs.ctor !== '[]'
			   && ws.ctor !== '[]'
			   && xs.ctor !== '[]'
			   && ys.ctor !== '[]'
			   && zs.ctor !== '[]')
		{
			arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
			vs = vs._1;
			ws = ws._1;
			xs = xs._1;
			ys = ys._1;
			zs = zs._1;
		}
		return fromArray(arr);
	}

	function sortBy(f, xs)
	{
		return fromArray(toArray(xs).sort(function(a, b) {
			return Utils.cmp(f(a), f(b));
		}));
	}

	function sortWith(f, xs)
	{
		return fromArray(toArray(xs).sort(function(a, b) {
			var ord = f(a)(b).ctor;
			return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
		}));
	}

	function take(n, xs)
	{
		var arr = [];
		while (xs.ctor !== '[]' && n > 0)
		{
			arr.push(xs._0);
			xs = xs._1;
			--n;
		}
		return fromArray(arr);
	}


	Elm.Native.List.values = {
		Nil: Nil,
		Cons: Cons,
		cons: F2(Cons),
		toArray: toArray,
		fromArray: fromArray,

		foldl: F3(foldl),
		foldr: F3(foldr),

		map2: F3(map2),
		map3: F4(map3),
		map4: F5(map4),
		map5: F6(map5),
		sortBy: F2(sortBy),
		sortWith: F2(sortWith),
		take: F2(take)
	};
	return localRuntime.Native.List.values = Elm.Native.List.values;
};

Elm.List = Elm.List || {};
Elm.List.make = function (_elm) {
   "use strict";
   _elm.List = _elm.List || {};
   if (_elm.List.values) return _elm.List.values;
   var _U = Elm.Native.Utils.make(_elm),$Basics = Elm.Basics.make(_elm),$Maybe = Elm.Maybe.make(_elm),$Native$List = Elm.Native.List.make(_elm);
   var _op = {};
   var sortWith = $Native$List.sortWith;
   var sortBy = $Native$List.sortBy;
   var sort = function (xs) {    return A2(sortBy,$Basics.identity,xs);};
   var drop = F2(function (n,list) {
      drop: while (true) if (_U.cmp(n,0) < 1) return list; else {
            var _p0 = list;
            if (_p0.ctor === "[]") {
                  return list;
               } else {
                  var _v1 = n - 1,_v2 = _p0._1;
                  n = _v1;
                  list = _v2;
                  continue drop;
               }
         }
   });
   var take = $Native$List.take;
   var map5 = $Native$List.map5;
   var map4 = $Native$List.map4;
   var map3 = $Native$List.map3;
   var map2 = $Native$List.map2;
   var any = F2(function (isOkay,list) {
      any: while (true) {
         var _p1 = list;
         if (_p1.ctor === "[]") {
               return false;
            } else {
               if (isOkay(_p1._0)) return true; else {
                     var _v4 = isOkay,_v5 = _p1._1;
                     isOkay = _v4;
                     list = _v5;
                     continue any;
                  }
            }
      }
   });
   var all = F2(function (isOkay,list) {    return $Basics.not(A2(any,function (_p2) {    return $Basics.not(isOkay(_p2));},list));});
   var foldr = $Native$List.foldr;
   var foldl = $Native$List.foldl;
   var length = function (xs) {    return A3(foldl,F2(function (_p3,i) {    return i + 1;}),0,xs);};
   var sum = function (numbers) {    return A3(foldl,F2(function (x,y) {    return x + y;}),0,numbers);};
   var product = function (numbers) {    return A3(foldl,F2(function (x,y) {    return x * y;}),1,numbers);};
   var maximum = function (list) {
      var _p4 = list;
      if (_p4.ctor === "::") {
            return $Maybe.Just(A3(foldl,$Basics.max,_p4._0,_p4._1));
         } else {
            return $Maybe.Nothing;
         }
   };
   var minimum = function (list) {
      var _p5 = list;
      if (_p5.ctor === "::") {
            return $Maybe.Just(A3(foldl,$Basics.min,_p5._0,_p5._1));
         } else {
            return $Maybe.Nothing;
         }
   };
   var indexedMap = F2(function (f,xs) {    return A3(map2,f,_U.range(0,length(xs) - 1),xs);});
   var member = F2(function (x,xs) {    return A2(any,function (a) {    return _U.eq(a,x);},xs);});
   var isEmpty = function (xs) {    var _p6 = xs;if (_p6.ctor === "[]") {    return true;} else {    return false;}};
   var tail = function (list) {    var _p7 = list;if (_p7.ctor === "::") {    return $Maybe.Just(_p7._1);} else {    return $Maybe.Nothing;}};
   var head = function (list) {    var _p8 = list;if (_p8.ctor === "::") {    return $Maybe.Just(_p8._0);} else {    return $Maybe.Nothing;}};
   _op["::"] = $Native$List.cons;
   var map = F2(function (f,xs) {    return A3(foldr,F2(function (x,acc) {    return A2(_op["::"],f(x),acc);}),_U.list([]),xs);});
   var filter = F2(function (pred,xs) {
      var conditionalCons = F2(function (x,xs$) {    return pred(x) ? A2(_op["::"],x,xs$) : xs$;});
      return A3(foldr,conditionalCons,_U.list([]),xs);
   });
   var maybeCons = F3(function (f,mx,xs) {    var _p9 = f(mx);if (_p9.ctor === "Just") {    return A2(_op["::"],_p9._0,xs);} else {    return xs;}});
   var filterMap = F2(function (f,xs) {    return A3(foldr,maybeCons(f),_U.list([]),xs);});
   var reverse = function (list) {    return A3(foldl,F2(function (x,y) {    return A2(_op["::"],x,y);}),_U.list([]),list);};
   var scanl = F3(function (f,b,xs) {
      var scan1 = F2(function (x,accAcc) {
         var _p10 = accAcc;
         if (_p10.ctor === "::") {
               return A2(_op["::"],A2(f,x,_p10._0),accAcc);
            } else {
               return _U.list([]);
            }
      });
      return reverse(A3(foldl,scan1,_U.list([b]),xs));
   });
   var append = F2(function (xs,ys) {
      var _p11 = ys;
      if (_p11.ctor === "[]") {
            return xs;
         } else {
            return A3(foldr,F2(function (x,y) {    return A2(_op["::"],x,y);}),ys,xs);
         }
   });
   var concat = function (lists) {    return A3(foldr,append,_U.list([]),lists);};
   var concatMap = F2(function (f,list) {    return concat(A2(map,f,list));});
   var partition = F2(function (pred,list) {
      var step = F2(function (x,_p12) {
         var _p13 = _p12;
         var _p15 = _p13._0;
         var _p14 = _p13._1;
         return pred(x) ? {ctor: "_Tuple2",_0: A2(_op["::"],x,_p15),_1: _p14} : {ctor: "_Tuple2",_0: _p15,_1: A2(_op["::"],x,_p14)};
      });
      return A3(foldr,step,{ctor: "_Tuple2",_0: _U.list([]),_1: _U.list([])},list);
   });
   var unzip = function (pairs) {
      var step = F2(function (_p17,_p16) {
         var _p18 = _p17;
         var _p19 = _p16;
         return {ctor: "_Tuple2",_0: A2(_op["::"],_p18._0,_p19._0),_1: A2(_op["::"],_p18._1,_p19._1)};
      });
      return A3(foldr,step,{ctor: "_Tuple2",_0: _U.list([]),_1: _U.list([])},pairs);
   };
   var intersperse = F2(function (sep,xs) {
      var _p20 = xs;
      if (_p20.ctor === "[]") {
            return _U.list([]);
         } else {
            var step = F2(function (x,rest) {    return A2(_op["::"],sep,A2(_op["::"],x,rest));});
            var spersed = A3(foldr,step,_U.list([]),_p20._1);
            return A2(_op["::"],_p20._0,spersed);
         }
   });
   var repeatHelp = F3(function (result,n,value) {
      repeatHelp: while (true) if (_U.cmp(n,0) < 1) return result; else {
            var _v18 = A2(_op["::"],value,result),_v19 = n - 1,_v20 = value;
            result = _v18;
            n = _v19;
            value = _v20;
            continue repeatHelp;
         }
   });
   var repeat = F2(function (n,value) {    return A3(repeatHelp,_U.list([]),n,value);});
   return _elm.List.values = {_op: _op
                             ,isEmpty: isEmpty
                             ,length: length
                             ,reverse: reverse
                             ,member: member
                             ,head: head
                             ,tail: tail
                             ,filter: filter
                             ,take: take
                             ,drop: drop
                             ,repeat: repeat
                             ,append: append
                             ,concat: concat
                             ,intersperse: intersperse
                             ,partition: partition
                             ,unzip: unzip
                             ,map: map
                             ,map2: map2
                             ,map3: map3
                             ,map4: map4
                             ,map5: map5
                             ,filterMap: filterMap
                             ,concatMap: concatMap
                             ,indexedMap: indexedMap
                             ,foldr: foldr
                             ,foldl: foldl
                             ,sum: sum
                             ,product: product
                             ,maximum: maximum
                             ,minimum: minimum
                             ,all: all
                             ,any: any
                             ,scanl: scanl
                             ,sort: sort
                             ,sortBy: sortBy
                             ,sortWith: sortWith};
};
Elm.Native.Transform2D = {};
Elm.Native.Transform2D.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Transform2D = localRuntime.Native.Transform2D || {};
	if (localRuntime.Native.Transform2D.values)
	{
		return localRuntime.Native.Transform2D.values;
	}

	var A;
	if (typeof Float32Array === 'undefined')
	{
		A = function(arr)
		{
			this.length = arr.length;
			this[0] = arr[0];
			this[1] = arr[1];
			this[2] = arr[2];
			this[3] = arr[3];
			this[4] = arr[4];
			this[5] = arr[5];
		};
	}
	else
	{
		A = Float32Array;
	}

	// layout of matrix in an array is
	//
	//   | m11 m12 dx |
	//   | m21 m22 dy |
	//   |  0   0   1 |
	//
	//  new A([ m11, m12, dx, m21, m22, dy ])

	var identity = new A([1, 0, 0, 0, 1, 0]);
	function matrix(m11, m12, m21, m22, dx, dy)
	{
		return new A([m11, m12, dx, m21, m22, dy]);
	}

	function rotation(t)
	{
		var c = Math.cos(t);
		var s = Math.sin(t);
		return new A([c, -s, 0, s, c, 0]);
	}

	function rotate(t, m)
	{
		var c = Math.cos(t);
		var s = Math.sin(t);
		var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4];
		return new A([m11 * c + m12 * s, -m11 * s + m12 * c, m[2],
					  m21 * c + m22 * s, -m21 * s + m22 * c, m[5]]);
	}
	/*
	function move(xy,m) {
		var x = xy._0;
		var y = xy._1;
		var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4];
		return new A([m11, m12, m11*x + m12*y + m[2],
					  m21, m22, m21*x + m22*y + m[5]]);
	}
	function scale(s,m) { return new A([m[0]*s, m[1]*s, m[2], m[3]*s, m[4]*s, m[5]]); }
	function scaleX(x,m) { return new A([m[0]*x, m[1], m[2], m[3]*x, m[4], m[5]]); }
	function scaleY(y,m) { return new A([m[0], m[1]*y, m[2], m[3], m[4]*y, m[5]]); }
	function reflectX(m) { return new A([-m[0], m[1], m[2], -m[3], m[4], m[5]]); }
	function reflectY(m) { return new A([m[0], -m[1], m[2], m[3], -m[4], m[5]]); }

	function transform(m11, m21, m12, m22, mdx, mdy, n) {
		var n11 = n[0], n12 = n[1], n21 = n[3], n22 = n[4], ndx = n[2], ndy = n[5];
		return new A([m11*n11 + m12*n21,
					  m11*n12 + m12*n22,
					  m11*ndx + m12*ndy + mdx,
					  m21*n11 + m22*n21,
					  m21*n12 + m22*n22,
					  m21*ndx + m22*ndy + mdy]);
	}
	*/
	function multiply(m, n)
	{
		var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4], mdx = m[2], mdy = m[5];
		var n11 = n[0], n12 = n[1], n21 = n[3], n22 = n[4], ndx = n[2], ndy = n[5];
		return new A([m11 * n11 + m12 * n21,
					  m11 * n12 + m12 * n22,
					  m11 * ndx + m12 * ndy + mdx,
					  m21 * n11 + m22 * n21,
					  m21 * n12 + m22 * n22,
					  m21 * ndx + m22 * ndy + mdy]);
	}

	return localRuntime.Native.Transform2D.values = {
		identity: identity,
		matrix: F6(matrix),
		rotation: rotation,
		multiply: F2(multiply)
		/*
		transform: F7(transform),
		rotate: F2(rotate),
		move: F2(move),
		scale: F2(scale),
		scaleX: F2(scaleX),
		scaleY: F2(scaleY),
		reflectX: reflectX,
		reflectY: reflectY
		*/
	};
};

Elm.Transform2D = Elm.Transform2D || {};
Elm.Transform2D.make = function (_elm) {
   "use strict";
   _elm.Transform2D = _elm.Transform2D || {};
   if (_elm.Transform2D.values) return _elm.Transform2D.values;
   var _U = Elm.Native.Utils.make(_elm),$Native$Transform2D = Elm.Native.Transform2D.make(_elm);
   var _op = {};
   var multiply = $Native$Transform2D.multiply;
   var rotation = $Native$Transform2D.rotation;
   var matrix = $Native$Transform2D.matrix;
   var translation = F2(function (x,y) {    return A6(matrix,1,0,0,1,x,y);});
   var scale = function (s) {    return A6(matrix,s,0,0,s,0,0);};
   var scaleX = function (x) {    return A6(matrix,x,0,0,1,0,0);};
   var scaleY = function (y) {    return A6(matrix,1,0,0,y,0,0);};
   var identity = $Native$Transform2D.identity;
   var Transform2D = {ctor: "Transform2D"};
   return _elm.Transform2D.values = {_op: _op
                                    ,identity: identity
                                    ,matrix: matrix
                                    ,multiply: multiply
                                    ,rotation: rotation
                                    ,translation: translation
                                    ,scale: scale
                                    ,scaleX: scaleX
                                    ,scaleY: scaleY};
};

// setup
Elm.Native = Elm.Native || {};
Elm.Native.Graphics = Elm.Native.Graphics || {};
Elm.Native.Graphics.Collage = Elm.Native.Graphics.Collage || {};

// definition
Elm.Native.Graphics.Collage.make = function(localRuntime) {
	'use strict';

	// attempt to short-circuit
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Graphics = localRuntime.Native.Graphics || {};
	localRuntime.Native.Graphics.Collage = localRuntime.Native.Graphics.Collage || {};
	if ('values' in localRuntime.Native.Graphics.Collage)
	{
		return localRuntime.Native.Graphics.Collage.values;
	}

	// okay, we cannot short-ciruit, so now we define everything
	var Color = Elm.Native.Color.make(localRuntime);
	var List = Elm.Native.List.make(localRuntime);
	var NativeElement = Elm.Native.Graphics.Element.make(localRuntime);
	var Transform = Elm.Transform2D.make(localRuntime);
	var Utils = Elm.Native.Utils.make(localRuntime);

	function setStrokeStyle(ctx, style)
	{
		ctx.lineWidth = style.width;

		var cap = style.cap.ctor;
		ctx.lineCap = cap === 'Flat'
			? 'butt'
			: cap === 'Round'
				? 'round'
				: 'square';

		var join = style.join.ctor;
		ctx.lineJoin = join === 'Smooth'
			? 'round'
			: join === 'Sharp'
				? 'miter'
				: 'bevel';

		ctx.miterLimit = style.join._0 || 10;
		ctx.strokeStyle = Color.toCss(style.color);
	}

	function setFillStyle(redo, ctx, style)
	{
		var sty = style.ctor;
		ctx.fillStyle = sty === 'Solid'
			? Color.toCss(style._0)
			: sty === 'Texture'
				? texture(redo, ctx, style._0)
				: gradient(ctx, style._0);
	}

	function trace(ctx, path)
	{
		var points = List.toArray(path);
		var i = points.length - 1;
		if (i <= 0)
		{
			return;
		}
		ctx.moveTo(points[i]._0, points[i]._1);
		while (i--)
		{
			ctx.lineTo(points[i]._0, points[i]._1);
		}
		if (path.closed)
		{
			i = points.length - 1;
			ctx.lineTo(points[i]._0, points[i]._1);
		}
	}

	function line(ctx, style, path)
	{
		if (style.dashing.ctor === '[]')
		{
			trace(ctx, path);
		}
		else
		{
			customLineHelp(ctx, style, path);
		}
		ctx.scale(1, -1);
		ctx.stroke();
	}

	function customLineHelp(ctx, style, path)
	{
		var points = List.toArray(path);
		if (path.closed)
		{
			points.push(points[0]);
		}
		var pattern = List.toArray(style.dashing);
		var i = points.length - 1;
		if (i <= 0)
		{
			return;
		}
		var x0 = points[i]._0, y0 = points[i]._1;
		var x1 = 0, y1 = 0, dx = 0, dy = 0, remaining = 0;
		var pindex = 0, plen = pattern.length;
		var draw = true, segmentLength = pattern[0];
		ctx.moveTo(x0, y0);
		while (i--)
		{
			x1 = points[i]._0;
			y1 = points[i]._1;
			dx = x1 - x0;
			dy = y1 - y0;
			remaining = Math.sqrt(dx * dx + dy * dy);
			while (segmentLength <= remaining)
			{
				x0 += dx * segmentLength / remaining;
				y0 += dy * segmentLength / remaining;
				ctx[draw ? 'lineTo' : 'moveTo'](x0, y0);
				// update starting position
				dx = x1 - x0;
				dy = y1 - y0;
				remaining = Math.sqrt(dx * dx + dy * dy);
				// update pattern
				draw = !draw;
				pindex = (pindex + 1) % plen;
				segmentLength = pattern[pindex];
			}
			if (remaining > 0)
			{
				ctx[draw ? 'lineTo' : 'moveTo'](x1, y1);
				segmentLength -= remaining;
			}
			x0 = x1;
			y0 = y1;
		}
	}

	function drawLine(ctx, style, path)
	{
		setStrokeStyle(ctx, style);
		return line(ctx, style, path);
	}

	function texture(redo, ctx, src)
	{
		var img = new Image();
		img.src = src;
		img.onload = redo;
		return ctx.createPattern(img, 'repeat');
	}

	function gradient(ctx, grad)
	{
		var g;
		var stops = [];
		if (grad.ctor === 'Linear')
		{
			var p0 = grad._0, p1 = grad._1;
			g = ctx.createLinearGradient(p0._0, -p0._1, p1._0, -p1._1);
			stops = List.toArray(grad._2);
		}
		else
		{
			var p0 = grad._0, p2 = grad._2;
			g = ctx.createRadialGradient(p0._0, -p0._1, grad._1, p2._0, -p2._1, grad._3);
			stops = List.toArray(grad._4);
		}
		var len = stops.length;
		for (var i = 0; i < len; ++i)
		{
			var stop = stops[i];
			g.addColorStop(stop._0, Color.toCss(stop._1));
		}
		return g;
	}

	function drawShape(redo, ctx, style, path)
	{
		trace(ctx, path);
		setFillStyle(redo, ctx, style);
		ctx.scale(1, -1);
		ctx.fill();
	}


	// TEXT RENDERING

	function fillText(redo, ctx, text)
	{
		drawText(ctx, text, ctx.fillText);
	}

	function strokeText(redo, ctx, style, text)
	{
		setStrokeStyle(ctx, style);
		// Use native canvas API for dashes only for text for now
		// Degrades to non-dashed on IE 9 + 10
		if (style.dashing.ctor !== '[]' && ctx.setLineDash)
		{
			var pattern = List.toArray(style.dashing);
			ctx.setLineDash(pattern);
		}
		drawText(ctx, text, ctx.strokeText);
	}

	function drawText(ctx, text, canvasDrawFn)
	{
		var textChunks = chunkText(defaultContext, text);

		var totalWidth = 0;
		var maxHeight = 0;
		var numChunks = textChunks.length;

		ctx.scale(1,-1);

		for (var i = numChunks; i--; )
		{
			var chunk = textChunks[i];
			ctx.font = chunk.font;
			var metrics = ctx.measureText(chunk.text);
			chunk.width = metrics.width;
			totalWidth += chunk.width;
			if (chunk.height > maxHeight)
			{
				maxHeight = chunk.height;
			}
		}

		var x = -totalWidth / 2.0;
		for (var i = 0; i < numChunks; ++i)
		{
			var chunk = textChunks[i];
			ctx.font = chunk.font;
			ctx.fillStyle = chunk.color;
			canvasDrawFn.call(ctx, chunk.text, x, maxHeight / 2);
			x += chunk.width;
		}
	}

	function toFont(props)
	{
		return [
			props['font-style'],
			props['font-variant'],
			props['font-weight'],
			props['font-size'],
			props['font-family']
		].join(' ');
	}


	// Convert the object returned by the text module
	// into something we can use for styling canvas text
	function chunkText(context, text)
	{
		var tag = text.ctor;
		if (tag === 'Text:Append')
		{
			var leftChunks = chunkText(context, text._0);
			var rightChunks = chunkText(context, text._1);
			return leftChunks.concat(rightChunks);
		}
		if (tag === 'Text:Text')
		{
			return [{
				text: text._0,
				color: context.color,
				height: context['font-size'].slice(0, -2) | 0,
				font: toFont(context)
			}];
		}
		if (tag === 'Text:Meta')
		{
			var newContext = freshContext(text._0, context);
			return chunkText(newContext, text._1);
		}
	}

	function freshContext(props, ctx)
	{
		return {
			'font-style': props['font-style'] || ctx['font-style'],
			'font-variant': props['font-variant'] || ctx['font-variant'],
			'font-weight': props['font-weight'] || ctx['font-weight'],
			'font-size': props['font-size'] || ctx['font-size'],
			'font-family': props['font-family'] || ctx['font-family'],
			'color': props['color'] || ctx['color']
		};
	}

	var defaultContext = {
		'font-style': 'normal',
		'font-variant': 'normal',
		'font-weight': 'normal',
		'font-size': '12px',
		'font-family': 'sans-serif',
		'color': 'black'
	};


	// IMAGES

	function drawImage(redo, ctx, form)
	{
		var img = new Image();
		img.onload = redo;
		img.src = form._3;
		var w = form._0,
			h = form._1,
			pos = form._2,
			srcX = pos._0,
			srcY = pos._1,
			srcW = w,
			srcH = h,
			destX = -w / 2,
			destY = -h / 2,
			destW = w,
			destH = h;

		ctx.scale(1, -1);
		ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
	}

	function renderForm(redo, ctx, form)
	{
		ctx.save();

		var x = form.x,
			y = form.y,
			theta = form.theta,
			scale = form.scale;

		if (x !== 0 || y !== 0)
		{
			ctx.translate(x, y);
		}
		if (theta !== 0)
		{
			ctx.rotate(theta % (Math.PI * 2));
		}
		if (scale !== 1)
		{
			ctx.scale(scale, scale);
		}
		if (form.alpha !== 1)
		{
			ctx.globalAlpha = ctx.globalAlpha * form.alpha;
		}

		ctx.beginPath();
		var f = form.form;
		switch (f.ctor)
		{
			case 'FPath':
				drawLine(ctx, f._0, f._1);
				break;

			case 'FImage':
				drawImage(redo, ctx, f);
				break;

			case 'FShape':
				if (f._0.ctor === 'Line')
				{
					f._1.closed = true;
					drawLine(ctx, f._0._0, f._1);
				}
				else
				{
					drawShape(redo, ctx, f._0._0, f._1);
				}
				break;

			case 'FText':
				fillText(redo, ctx, f._0);
				break;

			case 'FOutlinedText':
				strokeText(redo, ctx, f._0, f._1);
				break;
		}
		ctx.restore();
	}

	function formToMatrix(form)
	{
	   var scale = form.scale;
	   var matrix = A6( Transform.matrix, scale, 0, 0, scale, form.x, form.y );

	   var theta = form.theta;
	   if (theta !== 0)
	   {
		   matrix = A2( Transform.multiply, matrix, Transform.rotation(theta) );
	   }

	   return matrix;
	}

	function str(n)
	{
		if (n < 0.00001 && n > -0.00001)
		{
			return 0;
		}
		return n;
	}

	function makeTransform(w, h, form, matrices)
	{
		var props = form.form._0._0.props;
		var m = A6( Transform.matrix, 1, 0, 0, -1,
					(w - props.width ) / 2,
					(h - props.height) / 2 );
		var len = matrices.length;
		for (var i = 0; i < len; ++i)
		{
			m = A2( Transform.multiply, m, matrices[i] );
		}
		m = A2( Transform.multiply, m, formToMatrix(form) );

		return 'matrix(' +
			str( m[0]) + ', ' + str( m[3]) + ', ' +
			str(-m[1]) + ', ' + str(-m[4]) + ', ' +
			str( m[2]) + ', ' + str( m[5]) + ')';
	}

	function stepperHelp(list)
	{
		var arr = List.toArray(list);
		var i = 0;
		function peekNext()
		{
			return i < arr.length ? arr[i]._0.form.ctor : '';
		}
		// assumes that there is a next element
		function next()
		{
			var out = arr[i]._0;
			++i;
			return out;
		}
		return {
			peekNext: peekNext,
			next: next
		};
	}

	function formStepper(forms)
	{
		var ps = [stepperHelp(forms)];
		var matrices = [];
		var alphas = [];
		function peekNext()
		{
			var len = ps.length;
			var formType = '';
			for (var i = 0; i < len; ++i )
			{
				if (formType = ps[i].peekNext()) return formType;
			}
			return '';
		}
		// assumes that there is a next element
		function next(ctx)
		{
			while (!ps[0].peekNext())
			{
				ps.shift();
				matrices.pop();
				alphas.shift();
				if (ctx)
				{
					ctx.restore();
				}
			}
			var out = ps[0].next();
			var f = out.form;
			if (f.ctor === 'FGroup')
			{
				ps.unshift(stepperHelp(f._1));
				var m = A2(Transform.multiply, f._0, formToMatrix(out));
				ctx.save();
				ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
				matrices.push(m);

				var alpha = (alphas[0] || 1) * out.alpha;
				alphas.unshift(alpha);
				ctx.globalAlpha = alpha;
			}
			return out;
		}
		function transforms()
		{
			return matrices;
		}
		function alpha()
		{
			return alphas[0] || 1;
		}
		return {
			peekNext: peekNext,
			next: next,
			transforms: transforms,
			alpha: alpha
		};
	}

	function makeCanvas(w, h)
	{
		var canvas = NativeElement.createNode('canvas');
		canvas.style.width  = w + 'px';
		canvas.style.height = h + 'px';
		canvas.style.display = 'block';
		canvas.style.position = 'absolute';
		var ratio = window.devicePixelRatio || 1;
		canvas.width  = w * ratio;
		canvas.height = h * ratio;
		return canvas;
	}

	function render(model)
	{
		var div = NativeElement.createNode('div');
		div.style.overflow = 'hidden';
		div.style.position = 'relative';
		update(div, model, model);
		return div;
	}

	function nodeStepper(w, h, div)
	{
		var kids = div.childNodes;
		var i = 0;
		var ratio = window.devicePixelRatio || 1;

		function transform(transforms, ctx)
		{
			ctx.translate( w / 2 * ratio, h / 2 * ratio );
			ctx.scale( ratio, -ratio );
			var len = transforms.length;
			for (var i = 0; i < len; ++i)
			{
				var m = transforms[i];
				ctx.save();
				ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
			}
			return ctx;
		}
		function nextContext(transforms)
		{
			while (i < kids.length)
			{
				var node = kids[i];
				if (node.getContext)
				{
					node.width = w * ratio;
					node.height = h * ratio;
					node.style.width = w + 'px';
					node.style.height = h + 'px';
					++i;
					return transform(transforms, node.getContext('2d'));
				}
				div.removeChild(node);
			}
			var canvas = makeCanvas(w, h);
			div.appendChild(canvas);
			// we have added a new node, so we must step our position
			++i;
			return transform(transforms, canvas.getContext('2d'));
		}
		function addElement(matrices, alpha, form)
		{
			var kid = kids[i];
			var elem = form.form._0;

			var node = (!kid || kid.getContext)
				? NativeElement.render(elem)
				: NativeElement.update(kid, kid.oldElement, elem);

			node.style.position = 'absolute';
			node.style.opacity = alpha * form.alpha * elem._0.props.opacity;
			NativeElement.addTransform(node.style, makeTransform(w, h, form, matrices));
			node.oldElement = elem;
			++i;
			if (!kid)
			{
				div.appendChild(node);
			}
			else
			{
				div.insertBefore(node, kid);
			}
		}
		function clearRest()
		{
			while (i < kids.length)
			{
				div.removeChild(kids[i]);
			}
		}
		return {
			nextContext: nextContext,
			addElement: addElement,
			clearRest: clearRest
		};
	}


	function update(div, _, model)
	{
		var w = model.w;
		var h = model.h;

		var forms = formStepper(model.forms);
		var nodes = nodeStepper(w, h, div);
		var ctx = null;
		var formType = '';

		while (formType = forms.peekNext())
		{
			// make sure we have context if we need it
			if (ctx === null && formType !== 'FElement')
			{
				ctx = nodes.nextContext(forms.transforms());
				ctx.globalAlpha = forms.alpha();
			}

			var form = forms.next(ctx);
			// if it is FGroup, all updates are made within formStepper when next is called.
			if (formType === 'FElement')
			{
				// update or insert an element, get a new context
				nodes.addElement(forms.transforms(), forms.alpha(), form);
				ctx = null;
			}
			else if (formType !== 'FGroup')
			{
				renderForm(function() { update(div, model, model); }, ctx, form);
			}
		}
		nodes.clearRest();
		return div;
	}


	function collage(w, h, forms)
	{
		return A3(NativeElement.newElement, w, h, {
			ctor: 'Custom',
			type: 'Collage',
			render: render,
			update: update,
			model: {w: w, h: h, forms: forms}
		});
	}

	return localRuntime.Native.Graphics.Collage.values = {
		collage: F3(collage)
	};
};

Elm.Native.Color = {};
Elm.Native.Color.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Color = localRuntime.Native.Color || {};
	if (localRuntime.Native.Color.values)
	{
		return localRuntime.Native.Color.values;
	}

	function toCss(c)
	{
		var format = '';
		var colors = '';
		if (c.ctor === 'RGBA')
		{
			format = 'rgb';
			colors = c._0 + ', ' + c._1 + ', ' + c._2;
		}
		else
		{
			format = 'hsl';
			colors = (c._0 * 180 / Math.PI) + ', ' +
					 (c._1 * 100) + '%, ' +
					 (c._2 * 100) + '%';
		}
		if (c._3 === 1)
		{
			return format + '(' + colors + ')';
		}
		else
		{
			return format + 'a(' + colors + ', ' + c._3 + ')';
		}
	}

	return localRuntime.Native.Color.values = {
		toCss: toCss
	};
};

Elm.Color = Elm.Color || {};
Elm.Color.make = function (_elm) {
   "use strict";
   _elm.Color = _elm.Color || {};
   if (_elm.Color.values) return _elm.Color.values;
   var _U = Elm.Native.Utils.make(_elm),$Basics = Elm.Basics.make(_elm);
   var _op = {};
   var Radial = F5(function (a,b,c,d,e) {    return {ctor: "Radial",_0: a,_1: b,_2: c,_3: d,_4: e};});
   var radial = Radial;
   var Linear = F3(function (a,b,c) {    return {ctor: "Linear",_0: a,_1: b,_2: c};});
   var linear = Linear;
   var fmod = F2(function (f,n) {    var integer = $Basics.floor(f);return $Basics.toFloat(A2($Basics._op["%"],integer,n)) + f - $Basics.toFloat(integer);});
   var rgbToHsl = F3(function (red,green,blue) {
      var b = $Basics.toFloat(blue) / 255;
      var g = $Basics.toFloat(green) / 255;
      var r = $Basics.toFloat(red) / 255;
      var cMax = A2($Basics.max,A2($Basics.max,r,g),b);
      var cMin = A2($Basics.min,A2($Basics.min,r,g),b);
      var c = cMax - cMin;
      var lightness = (cMax + cMin) / 2;
      var saturation = _U.eq(lightness,0) ? 0 : c / (1 - $Basics.abs(2 * lightness - 1));
      var hue = $Basics.degrees(60) * (_U.eq(cMax,r) ? A2(fmod,(g - b) / c,6) : _U.eq(cMax,g) ? (b - r) / c + 2 : (r - g) / c + 4);
      return {ctor: "_Tuple3",_0: hue,_1: saturation,_2: lightness};
   });
   var hslToRgb = F3(function (hue,saturation,lightness) {
      var hue$ = hue / $Basics.degrees(60);
      var chroma = (1 - $Basics.abs(2 * lightness - 1)) * saturation;
      var x = chroma * (1 - $Basics.abs(A2(fmod,hue$,2) - 1));
      var _p0 = _U.cmp(hue$,0) < 0 ? {ctor: "_Tuple3",_0: 0,_1: 0,_2: 0} : _U.cmp(hue$,1) < 0 ? {ctor: "_Tuple3",_0: chroma,_1: x,_2: 0} : _U.cmp(hue$,
      2) < 0 ? {ctor: "_Tuple3",_0: x,_1: chroma,_2: 0} : _U.cmp(hue$,3) < 0 ? {ctor: "_Tuple3",_0: 0,_1: chroma,_2: x} : _U.cmp(hue$,4) < 0 ? {ctor: "_Tuple3"
                                                                                                                                               ,_0: 0
                                                                                                                                               ,_1: x
                                                                                                                                               ,_2: chroma} : _U.cmp(hue$,
      5) < 0 ? {ctor: "_Tuple3",_0: x,_1: 0,_2: chroma} : _U.cmp(hue$,6) < 0 ? {ctor: "_Tuple3",_0: chroma,_1: 0,_2: x} : {ctor: "_Tuple3",_0: 0,_1: 0,_2: 0};
      var r = _p0._0;
      var g = _p0._1;
      var b = _p0._2;
      var m = lightness - chroma / 2;
      return {ctor: "_Tuple3",_0: r + m,_1: g + m,_2: b + m};
   });
   var toRgb = function (color) {
      var _p1 = color;
      if (_p1.ctor === "RGBA") {
            return {red: _p1._0,green: _p1._1,blue: _p1._2,alpha: _p1._3};
         } else {
            var _p2 = A3(hslToRgb,_p1._0,_p1._1,_p1._2);
            var r = _p2._0;
            var g = _p2._1;
            var b = _p2._2;
            return {red: $Basics.round(255 * r),green: $Basics.round(255 * g),blue: $Basics.round(255 * b),alpha: _p1._3};
         }
   };
   var toHsl = function (color) {
      var _p3 = color;
      if (_p3.ctor === "HSLA") {
            return {hue: _p3._0,saturation: _p3._1,lightness: _p3._2,alpha: _p3._3};
         } else {
            var _p4 = A3(rgbToHsl,_p3._0,_p3._1,_p3._2);
            var h = _p4._0;
            var s = _p4._1;
            var l = _p4._2;
            return {hue: h,saturation: s,lightness: l,alpha: _p3._3};
         }
   };
   var HSLA = F4(function (a,b,c,d) {    return {ctor: "HSLA",_0: a,_1: b,_2: c,_3: d};});
   var hsla = F4(function (hue,saturation,lightness,alpha) {
      return A4(HSLA,hue - $Basics.turns($Basics.toFloat($Basics.floor(hue / (2 * $Basics.pi)))),saturation,lightness,alpha);
   });
   var hsl = F3(function (hue,saturation,lightness) {    return A4(hsla,hue,saturation,lightness,1);});
   var complement = function (color) {
      var _p5 = color;
      if (_p5.ctor === "HSLA") {
            return A4(hsla,_p5._0 + $Basics.degrees(180),_p5._1,_p5._2,_p5._3);
         } else {
            var _p6 = A3(rgbToHsl,_p5._0,_p5._1,_p5._2);
            var h = _p6._0;
            var s = _p6._1;
            var l = _p6._2;
            return A4(hsla,h + $Basics.degrees(180),s,l,_p5._3);
         }
   };
   var grayscale = function (p) {    return A4(HSLA,0,0,1 - p,1);};
   var greyscale = function (p) {    return A4(HSLA,0,0,1 - p,1);};
   var RGBA = F4(function (a,b,c,d) {    return {ctor: "RGBA",_0: a,_1: b,_2: c,_3: d};});
   var rgba = RGBA;
   var rgb = F3(function (r,g,b) {    return A4(RGBA,r,g,b,1);});
   var lightRed = A4(RGBA,239,41,41,1);
   var red = A4(RGBA,204,0,0,1);
   var darkRed = A4(RGBA,164,0,0,1);
   var lightOrange = A4(RGBA,252,175,62,1);
   var orange = A4(RGBA,245,121,0,1);
   var darkOrange = A4(RGBA,206,92,0,1);
   var lightYellow = A4(RGBA,255,233,79,1);
   var yellow = A4(RGBA,237,212,0,1);
   var darkYellow = A4(RGBA,196,160,0,1);
   var lightGreen = A4(RGBA,138,226,52,1);
   var green = A4(RGBA,115,210,22,1);
   var darkGreen = A4(RGBA,78,154,6,1);
   var lightBlue = A4(RGBA,114,159,207,1);
   var blue = A4(RGBA,52,101,164,1);
   var darkBlue = A4(RGBA,32,74,135,1);
   var lightPurple = A4(RGBA,173,127,168,1);
   var purple = A4(RGBA,117,80,123,1);
   var darkPurple = A4(RGBA,92,53,102,1);
   var lightBrown = A4(RGBA,233,185,110,1);
   var brown = A4(RGBA,193,125,17,1);
   var darkBrown = A4(RGBA,143,89,2,1);
   var black = A4(RGBA,0,0,0,1);
   var white = A4(RGBA,255,255,255,1);
   var lightGrey = A4(RGBA,238,238,236,1);
   var grey = A4(RGBA,211,215,207,1);
   var darkGrey = A4(RGBA,186,189,182,1);
   var lightGray = A4(RGBA,238,238,236,1);
   var gray = A4(RGBA,211,215,207,1);
   var darkGray = A4(RGBA,186,189,182,1);
   var lightCharcoal = A4(RGBA,136,138,133,1);
   var charcoal = A4(RGBA,85,87,83,1);
   var darkCharcoal = A4(RGBA,46,52,54,1);
   return _elm.Color.values = {_op: _op
                              ,rgb: rgb
                              ,rgba: rgba
                              ,hsl: hsl
                              ,hsla: hsla
                              ,greyscale: greyscale
                              ,grayscale: grayscale
                              ,complement: complement
                              ,linear: linear
                              ,radial: radial
                              ,toRgb: toRgb
                              ,toHsl: toHsl
                              ,red: red
                              ,orange: orange
                              ,yellow: yellow
                              ,green: green
                              ,blue: blue
                              ,purple: purple
                              ,brown: brown
                              ,lightRed: lightRed
                              ,lightOrange: lightOrange
                              ,lightYellow: lightYellow
                              ,lightGreen: lightGreen
                              ,lightBlue: lightBlue
                              ,lightPurple: lightPurple
                              ,lightBrown: lightBrown
                              ,darkRed: darkRed
                              ,darkOrange: darkOrange
                              ,darkYellow: darkYellow
                              ,darkGreen: darkGreen
                              ,darkBlue: darkBlue
                              ,darkPurple: darkPurple
                              ,darkBrown: darkBrown
                              ,white: white
                              ,lightGrey: lightGrey
                              ,grey: grey
                              ,darkGrey: darkGrey
                              ,lightCharcoal: lightCharcoal
                              ,charcoal: charcoal
                              ,darkCharcoal: darkCharcoal
                              ,black: black
                              ,lightGray: lightGray
                              ,gray: gray
                              ,darkGray: darkGray};
};

// setup
Elm.Native = Elm.Native || {};
Elm.Native.Graphics = Elm.Native.Graphics || {};
Elm.Native.Graphics.Element = Elm.Native.Graphics.Element || {};

// definition
Elm.Native.Graphics.Element.make = function(localRuntime) {
	'use strict';

	// attempt to short-circuit
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Graphics = localRuntime.Native.Graphics || {};
	localRuntime.Native.Graphics.Element = localRuntime.Native.Graphics.Element || {};
	if ('values' in localRuntime.Native.Graphics.Element)
	{
		return localRuntime.Native.Graphics.Element.values;
	}

	var Color = Elm.Native.Color.make(localRuntime);
	var List = Elm.Native.List.make(localRuntime);
	var Maybe = Elm.Maybe.make(localRuntime);
	var Text = Elm.Native.Text.make(localRuntime);
	var Utils = Elm.Native.Utils.make(localRuntime);


	// CREATION

	var createNode =
		typeof document === 'undefined'
			?
				function(_)
				{
					return {
						style: {},
						appendChild: function() {}
					};
				}
			:
				function(elementType)
				{
					var node = document.createElement(elementType);
					node.style.padding = '0';
					node.style.margin = '0';
					return node;
				}
			;


	function newElement(width, height, elementPrim)
	{
		return {
			ctor: 'Element_elm_builtin',
			_0: {
				element: elementPrim,
				props: {
					id: Utils.guid(),
					width: width,
					height: height,
					opacity: 1,
					color: Maybe.Nothing,
					href: '',
					tag: '',
					hover: Utils.Tuple0,
					click: Utils.Tuple0
				}
			}
		};
	}


	// PROPERTIES

	function setProps(elem, node)
	{
		var props = elem.props;

		var element = elem.element;
		var width = props.width - (element.adjustWidth || 0);
		var height = props.height - (element.adjustHeight || 0);
		node.style.width  = (width | 0) + 'px';
		node.style.height = (height | 0) + 'px';

		if (props.opacity !== 1)
		{
			node.style.opacity = props.opacity;
		}

		if (props.color.ctor === 'Just')
		{
			node.style.backgroundColor = Color.toCss(props.color._0);
		}

		if (props.tag !== '')
		{
			node.id = props.tag;
		}

		if (props.hover.ctor !== '_Tuple0')
		{
			addHover(node, props.hover);
		}

		if (props.click.ctor !== '_Tuple0')
		{
			addClick(node, props.click);
		}

		if (props.href !== '')
		{
			var anchor = createNode('a');
			anchor.href = props.href;
			anchor.style.display = 'block';
			anchor.style.pointerEvents = 'auto';
			anchor.appendChild(node);
			node = anchor;
		}

		return node;
	}

	function addClick(e, handler)
	{
		e.style.pointerEvents = 'auto';
		e.elm_click_handler = handler;
		function trigger(ev)
		{
			e.elm_click_handler(Utils.Tuple0);
			ev.stopPropagation();
		}
		e.elm_click_trigger = trigger;
		e.addEventListener('click', trigger);
	}

	function removeClick(e, handler)
	{
		if (e.elm_click_trigger)
		{
			e.removeEventListener('click', e.elm_click_trigger);
			e.elm_click_trigger = null;
			e.elm_click_handler = null;
		}
	}

	function addHover(e, handler)
	{
		e.style.pointerEvents = 'auto';
		e.elm_hover_handler = handler;
		e.elm_hover_count = 0;

		function over(evt)
		{
			if (e.elm_hover_count++ > 0) return;
			e.elm_hover_handler(true);
			evt.stopPropagation();
		}
		function out(evt)
		{
			if (e.contains(evt.toElement || evt.relatedTarget)) return;
			e.elm_hover_count = 0;
			e.elm_hover_handler(false);
			evt.stopPropagation();
		}
		e.elm_hover_over = over;
		e.elm_hover_out = out;
		e.addEventListener('mouseover', over);
		e.addEventListener('mouseout', out);
	}

	function removeHover(e)
	{
		e.elm_hover_handler = null;
		if (e.elm_hover_over)
		{
			e.removeEventListener('mouseover', e.elm_hover_over);
			e.elm_hover_over = null;
		}
		if (e.elm_hover_out)
		{
			e.removeEventListener('mouseout', e.elm_hover_out);
			e.elm_hover_out = null;
		}
	}


	// IMAGES

	function image(props, img)
	{
		switch (img._0.ctor)
		{
			case 'Plain':
				return plainImage(img._3);

			case 'Fitted':
				return fittedImage(props.width, props.height, img._3);

			case 'Cropped':
				return croppedImage(img, props.width, props.height, img._3);

			case 'Tiled':
				return tiledImage(img._3);
		}
	}

	function plainImage(src)
	{
		var img = createNode('img');
		img.src = src;
		img.name = src;
		img.style.display = 'block';
		return img;
	}

	function tiledImage(src)
	{
		var div = createNode('div');
		div.style.backgroundImage = 'url(' + src + ')';
		return div;
	}

	function fittedImage(w, h, src)
	{
		var div = createNode('div');
		div.style.background = 'url(' + src + ') no-repeat center';
		div.style.webkitBackgroundSize = 'cover';
		div.style.MozBackgroundSize = 'cover';
		div.style.OBackgroundSize = 'cover';
		div.style.backgroundSize = 'cover';
		return div;
	}

	function croppedImage(elem, w, h, src)
	{
		var pos = elem._0._0;
		var e = createNode('div');
		e.style.overflow = 'hidden';

		var img = createNode('img');
		img.onload = function() {
			var sw = w / elem._1, sh = h / elem._2;
			img.style.width = ((this.width * sw) | 0) + 'px';
			img.style.height = ((this.height * sh) | 0) + 'px';
			img.style.marginLeft = ((- pos._0 * sw) | 0) + 'px';
			img.style.marginTop = ((- pos._1 * sh) | 0) + 'px';
		};
		img.src = src;
		img.name = src;
		e.appendChild(img);
		return e;
	}


	// FLOW

	function goOut(node)
	{
		node.style.position = 'absolute';
		return node;
	}
	function goDown(node)
	{
		return node;
	}
	function goRight(node)
	{
		node.style.styleFloat = 'left';
		node.style.cssFloat = 'left';
		return node;
	}

	var directionTable = {
		DUp: goDown,
		DDown: goDown,
		DLeft: goRight,
		DRight: goRight,
		DIn: goOut,
		DOut: goOut
	};
	function needsReversal(dir)
	{
		return dir === 'DUp' || dir === 'DLeft' || dir === 'DIn';
	}

	function flow(dir, elist)
	{
		var array = List.toArray(elist);
		var container = createNode('div');
		var goDir = directionTable[dir];
		if (goDir === goOut)
		{
			container.style.pointerEvents = 'none';
		}
		if (needsReversal(dir))
		{
			array.reverse();
		}
		var len = array.length;
		for (var i = 0; i < len; ++i)
		{
			container.appendChild(goDir(render(array[i])));
		}
		return container;
	}


	// CONTAINER

	function toPos(pos)
	{
		return pos.ctor === 'Absolute'
			? pos._0 + 'px'
			: (pos._0 * 100) + '%';
	}

	// must clear right, left, top, bottom, and transform
	// before calling this function
	function setPos(pos, wrappedElement, e)
	{
		var elem = wrappedElement._0;
		var element = elem.element;
		var props = elem.props;
		var w = props.width + (element.adjustWidth ? element.adjustWidth : 0);
		var h = props.height + (element.adjustHeight ? element.adjustHeight : 0);

		e.style.position = 'absolute';
		e.style.margin = 'auto';
		var transform = '';

		switch (pos.horizontal.ctor)
		{
			case 'P':
				e.style.right = toPos(pos.x);
				e.style.removeProperty('left');
				break;

			case 'Z':
				transform = 'translateX(' + ((-w / 2) | 0) + 'px) ';

			case 'N':
				e.style.left = toPos(pos.x);
				e.style.removeProperty('right');
				break;
		}
		switch (pos.vertical.ctor)
		{
			case 'N':
				e.style.bottom = toPos(pos.y);
				e.style.removeProperty('top');
				break;

			case 'Z':
				transform += 'translateY(' + ((-h / 2) | 0) + 'px)';

			case 'P':
				e.style.top = toPos(pos.y);
				e.style.removeProperty('bottom');
				break;
		}
		if (transform !== '')
		{
			addTransform(e.style, transform);
		}
		return e;
	}

	function addTransform(style, transform)
	{
		style.transform       = transform;
		style.msTransform     = transform;
		style.MozTransform    = transform;
		style.webkitTransform = transform;
		style.OTransform      = transform;
	}

	function container(pos, elem)
	{
		var e = render(elem);
		setPos(pos, elem, e);
		var div = createNode('div');
		div.style.position = 'relative';
		div.style.overflow = 'hidden';
		div.appendChild(e);
		return div;
	}


	function rawHtml(elem)
	{
		var html = elem.html;
		var align = elem.align;

		var div = createNode('div');
		div.innerHTML = html;
		div.style.visibility = 'hidden';
		if (align)
		{
			div.style.textAlign = align;
		}
		div.style.visibility = 'visible';
		div.style.pointerEvents = 'auto';
		return div;
	}


	// RENDER

	function render(wrappedElement)
	{
		var elem = wrappedElement._0;
		return setProps(elem, makeElement(elem));
	}

	function makeElement(e)
	{
		var elem = e.element;
		switch (elem.ctor)
		{
			case 'Image':
				return image(e.props, elem);

			case 'Flow':
				return flow(elem._0.ctor, elem._1);

			case 'Container':
				return container(elem._0, elem._1);

			case 'Spacer':
				return createNode('div');

			case 'RawHtml':
				return rawHtml(elem);

			case 'Custom':
				return elem.render(elem.model);
		}
	}

	function updateAndReplace(node, curr, next)
	{
		var newNode = update(node, curr, next);
		if (newNode !== node)
		{
			node.parentNode.replaceChild(newNode, node);
		}
		return newNode;
	}


	// UPDATE

	function update(node, wrappedCurrent, wrappedNext)
	{
		var curr = wrappedCurrent._0;
		var next = wrappedNext._0;
		var rootNode = node;
		if (node.tagName === 'A')
		{
			node = node.firstChild;
		}
		if (curr.props.id === next.props.id)
		{
			updateProps(node, curr, next);
			return rootNode;
		}
		if (curr.element.ctor !== next.element.ctor)
		{
			return render(wrappedNext);
		}
		var nextE = next.element;
		var currE = curr.element;
		switch (nextE.ctor)
		{
			case 'Spacer':
				updateProps(node, curr, next);
				return rootNode;

			case 'RawHtml':
				if(currE.html.valueOf() !== nextE.html.valueOf())
				{
					node.innerHTML = nextE.html;
				}
				updateProps(node, curr, next);
				return rootNode;

			case 'Image':
				if (nextE._0.ctor === 'Plain')
				{
					if (nextE._3 !== currE._3)
					{
						node.src = nextE._3;
					}
				}
				else if (!Utils.eq(nextE, currE)
					|| next.props.width !== curr.props.width
					|| next.props.height !== curr.props.height)
				{
					return render(wrappedNext);
				}
				updateProps(node, curr, next);
				return rootNode;

			case 'Flow':
				var arr = List.toArray(nextE._1);
				for (var i = arr.length; i--; )
				{
					arr[i] = arr[i]._0.element.ctor;
				}
				if (nextE._0.ctor !== currE._0.ctor)
				{
					return render(wrappedNext);
				}
				var nexts = List.toArray(nextE._1);
				var kids = node.childNodes;
				if (nexts.length !== kids.length)
				{
					return render(wrappedNext);
				}
				var currs = List.toArray(currE._1);
				var dir = nextE._0.ctor;
				var goDir = directionTable[dir];
				var toReverse = needsReversal(dir);
				var len = kids.length;
				for (var i = len; i--; )
				{
					var subNode = kids[toReverse ? len - i - 1 : i];
					goDir(updateAndReplace(subNode, currs[i], nexts[i]));
				}
				updateProps(node, curr, next);
				return rootNode;

			case 'Container':
				var subNode = node.firstChild;
				var newSubNode = updateAndReplace(subNode, currE._1, nextE._1);
				setPos(nextE._0, nextE._1, newSubNode);
				updateProps(node, curr, next);
				return rootNode;

			case 'Custom':
				if (currE.type === nextE.type)
				{
					var updatedNode = nextE.update(node, currE.model, nextE.model);
					updateProps(updatedNode, curr, next);
					return updatedNode;
				}
				return render(wrappedNext);
		}
	}

	function updateProps(node, curr, next)
	{
		var nextProps = next.props;
		var currProps = curr.props;

		var element = next.element;
		var width = nextProps.width - (element.adjustWidth || 0);
		var height = nextProps.height - (element.adjustHeight || 0);
		if (width !== currProps.width)
		{
			node.style.width = (width | 0) + 'px';
		}
		if (height !== currProps.height)
		{
			node.style.height = (height | 0) + 'px';
		}

		if (nextProps.opacity !== currProps.opacity)
		{
			node.style.opacity = nextProps.opacity;
		}

		var nextColor = nextProps.color.ctor === 'Just'
			? Color.toCss(nextProps.color._0)
			: '';
		if (node.style.backgroundColor !== nextColor)
		{
			node.style.backgroundColor = nextColor;
		}

		if (nextProps.tag !== currProps.tag)
		{
			node.id = nextProps.tag;
		}

		if (nextProps.href !== currProps.href)
		{
			if (currProps.href === '')
			{
				// add a surrounding href
				var anchor = createNode('a');
				anchor.href = nextProps.href;
				anchor.style.display = 'block';
				anchor.style.pointerEvents = 'auto';

				node.parentNode.replaceChild(anchor, node);
				anchor.appendChild(node);
			}
			else if (nextProps.href === '')
			{
				// remove the surrounding href
				var anchor = node.parentNode;
				anchor.parentNode.replaceChild(node, anchor);
			}
			else
			{
				// just update the link
				node.parentNode.href = nextProps.href;
			}
		}

		// update click and hover handlers
		var removed = false;

		// update hover handlers
		if (currProps.hover.ctor === '_Tuple0')
		{
			if (nextProps.hover.ctor !== '_Tuple0')
			{
				addHover(node, nextProps.hover);
			}
		}
		else
		{
			if (nextProps.hover.ctor === '_Tuple0')
			{
				removed = true;
				removeHover(node);
			}
			else
			{
				node.elm_hover_handler = nextProps.hover;
			}
		}

		// update click handlers
		if (currProps.click.ctor === '_Tuple0')
		{
			if (nextProps.click.ctor !== '_Tuple0')
			{
				addClick(node, nextProps.click);
			}
		}
		else
		{
			if (nextProps.click.ctor === '_Tuple0')
			{
				removed = true;
				removeClick(node);
			}
			else
			{
				node.elm_click_handler = nextProps.click;
			}
		}

		// stop capturing clicks if
		if (removed
			&& nextProps.hover.ctor === '_Tuple0'
			&& nextProps.click.ctor === '_Tuple0')
		{
			node.style.pointerEvents = 'none';
		}
	}


	// TEXT

	function block(align)
	{
		return function(text)
		{
			var raw = {
				ctor: 'RawHtml',
				html: Text.renderHtml(text),
				align: align
			};
			var pos = htmlHeight(0, raw);
			return newElement(pos._0, pos._1, raw);
		};
	}

	function markdown(text)
	{
		var raw = {
			ctor: 'RawHtml',
			html: text,
			align: null
		};
		var pos = htmlHeight(0, raw);
		return newElement(pos._0, pos._1, raw);
	}

	var htmlHeight =
		typeof document !== 'undefined'
			? realHtmlHeight
			: function(a, b) { return Utils.Tuple2(0, 0); };

	function realHtmlHeight(width, rawHtml)
	{
		// create dummy node
		var temp = document.createElement('div');
		temp.innerHTML = rawHtml.html;
		if (width > 0)
		{
			temp.style.width = width + 'px';
		}
		temp.style.visibility = 'hidden';
		temp.style.styleFloat = 'left';
		temp.style.cssFloat = 'left';

		document.body.appendChild(temp);

		// get dimensions
		var style = window.getComputedStyle(temp, null);
		var w = Math.ceil(style.getPropertyValue('width').slice(0, -2) - 0);
		var h = Math.ceil(style.getPropertyValue('height').slice(0, -2) - 0);
		document.body.removeChild(temp);
		return Utils.Tuple2(w, h);
	}


	return localRuntime.Native.Graphics.Element.values = {
		render: render,
		update: update,
		updateAndReplace: updateAndReplace,

		createNode: createNode,
		newElement: F3(newElement),
		addTransform: addTransform,
		htmlHeight: F2(htmlHeight),
		guid: Utils.guid,

		block: block,
		markdown: markdown
	};
};

Elm.Native.Text = {};
Elm.Native.Text.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Text = localRuntime.Native.Text || {};
	if (localRuntime.Native.Text.values)
	{
		return localRuntime.Native.Text.values;
	}

	var toCss = Elm.Native.Color.make(localRuntime).toCss;
	var List = Elm.Native.List.make(localRuntime);


	// CONSTRUCTORS

	function fromString(str)
	{
		return {
			ctor: 'Text:Text',
			_0: str
		};
	}

	function append(a, b)
	{
		return {
			ctor: 'Text:Append',
			_0: a,
			_1: b
		};
	}

	function addMeta(field, value, text)
	{
		var newProps = {};
		var newText = {
			ctor: 'Text:Meta',
			_0: newProps,
			_1: text
		};

		if (text.ctor === 'Text:Meta')
		{
			newText._1 = text._1;
			var props = text._0;
			for (var i = metaKeys.length; i--; )
			{
				var key = metaKeys[i];
				var val = props[key];
				if (val)
				{
					newProps[key] = val;
				}
			}
		}
		newProps[field] = value;
		return newText;
	}

	var metaKeys = [
		'font-size',
		'font-family',
		'font-style',
		'font-weight',
		'href',
		'text-decoration',
		'color'
	];


	// conversions from Elm values to CSS

	function toTypefaces(list)
	{
		var typefaces = List.toArray(list);
		for (var i = typefaces.length; i--; )
		{
			var typeface = typefaces[i];
			if (typeface.indexOf(' ') > -1)
			{
				typefaces[i] = "'" + typeface + "'";
			}
		}
		return typefaces.join(',');
	}

	function toLine(line)
	{
		var ctor = line.ctor;
		return ctor === 'Under'
			? 'underline'
			: ctor === 'Over'
				? 'overline'
				: 'line-through';
	}

	// setting styles of Text

	function style(style, text)
	{
		var newText = addMeta('color', toCss(style.color), text);
		var props = newText._0;

		if (style.typeface.ctor !== '[]')
		{
			props['font-family'] = toTypefaces(style.typeface);
		}
		if (style.height.ctor !== 'Nothing')
		{
			props['font-size'] = style.height._0 + 'px';
		}
		if (style.bold)
		{
			props['font-weight'] = 'bold';
		}
		if (style.italic)
		{
			props['font-style'] = 'italic';
		}
		if (style.line.ctor !== 'Nothing')
		{
			props['text-decoration'] = toLine(style.line._0);
		}
		return newText;
	}

	function height(px, text)
	{
		return addMeta('font-size', px + 'px', text);
	}

	function typeface(names, text)
	{
		return addMeta('font-family', toTypefaces(names), text);
	}

	function monospace(text)
	{
		return addMeta('font-family', 'monospace', text);
	}

	function italic(text)
	{
		return addMeta('font-style', 'italic', text);
	}

	function bold(text)
	{
		return addMeta('font-weight', 'bold', text);
	}

	function link(href, text)
	{
		return addMeta('href', href, text);
	}

	function line(line, text)
	{
		return addMeta('text-decoration', toLine(line), text);
	}

	function color(color, text)
	{
		return addMeta('color', toCss(color), text);
	}


	// RENDER

	function renderHtml(text)
	{
		var tag = text.ctor;
		if (tag === 'Text:Append')
		{
			return renderHtml(text._0) + renderHtml(text._1);
		}
		if (tag === 'Text:Text')
		{
			return properEscape(text._0);
		}
		if (tag === 'Text:Meta')
		{
			return renderMeta(text._0, renderHtml(text._1));
		}
	}

	function renderMeta(metas, string)
	{
		var href = metas.href;
		if (href)
		{
			string = '<a href="' + href + '">' + string + '</a>';
		}
		var styles = '';
		for (var key in metas)
		{
			if (key === 'href')
			{
				continue;
			}
			styles += key + ':' + metas[key] + ';';
		}
		if (styles)
		{
			string = '<span style="' + styles + '">' + string + '</span>';
		}
		return string;
	}

	function properEscape(str)
	{
		if (str.length === 0)
		{
			return str;
		}
		str = str //.replace(/&/g,  '&#38;')
			.replace(/"/g,  '&#34;')
			.replace(/'/g,  '&#39;')
			.replace(/</g,  '&#60;')
			.replace(/>/g,  '&#62;');
		var arr = str.split('\n');
		for (var i = arr.length; i--; )
		{
			arr[i] = makeSpaces(arr[i]);
		}
		return arr.join('<br/>');
	}

	function makeSpaces(s)
	{
		if (s.length === 0)
		{
			return s;
		}
		var arr = s.split('');
		if (arr[0] === ' ')
		{
			arr[0] = '&nbsp;';
		}
		for (var i = arr.length; --i; )
		{
			if (arr[i][0] === ' ' && arr[i - 1] === ' ')
			{
				arr[i - 1] = arr[i - 1] + arr[i];
				arr[i] = '';
			}
		}
		for (var i = arr.length; i--; )
		{
			if (arr[i].length > 1 && arr[i][0] === ' ')
			{
				var spaces = arr[i].split('');
				for (var j = spaces.length - 2; j >= 0; j -= 2)
				{
					spaces[j] = '&nbsp;';
				}
				arr[i] = spaces.join('');
			}
		}
		arr = arr.join('');
		if (arr[arr.length - 1] === ' ')
		{
			return arr.slice(0, -1) + '&nbsp;';
		}
		return arr;
	}


	return localRuntime.Native.Text.values = {
		fromString: fromString,
		append: F2(append),

		height: F2(height),
		italic: italic,
		bold: bold,
		line: F2(line),
		monospace: monospace,
		typeface: F2(typeface),
		color: F2(color),
		link: F2(link),
		style: F2(style),

		toTypefaces: toTypefaces,
		toLine: toLine,
		renderHtml: renderHtml
	};
};

Elm.Text = Elm.Text || {};
Elm.Text.make = function (_elm) {
   "use strict";
   _elm.Text = _elm.Text || {};
   if (_elm.Text.values) return _elm.Text.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Color = Elm.Color.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Text = Elm.Native.Text.make(_elm);
   var _op = {};
   var line = $Native$Text.line;
   var italic = $Native$Text.italic;
   var bold = $Native$Text.bold;
   var color = $Native$Text.color;
   var height = $Native$Text.height;
   var link = $Native$Text.link;
   var monospace = $Native$Text.monospace;
   var typeface = $Native$Text.typeface;
   var style = $Native$Text.style;
   var append = $Native$Text.append;
   var fromString = $Native$Text.fromString;
   var empty = fromString("");
   var concat = function (texts) {    return A3($List.foldr,append,empty,texts);};
   var join = F2(function (seperator,texts) {    return concat(A2($List.intersperse,seperator,texts));});
   var defaultStyle = {typeface: _U.list([]),height: $Maybe.Nothing,color: $Color.black,bold: false,italic: false,line: $Maybe.Nothing};
   var Style = F6(function (a,b,c,d,e,f) {    return {typeface: a,height: b,color: c,bold: d,italic: e,line: f};});
   var Through = {ctor: "Through"};
   var Over = {ctor: "Over"};
   var Under = {ctor: "Under"};
   var Text = {ctor: "Text"};
   return _elm.Text.values = {_op: _op
                             ,fromString: fromString
                             ,empty: empty
                             ,append: append
                             ,concat: concat
                             ,join: join
                             ,link: link
                             ,style: style
                             ,defaultStyle: defaultStyle
                             ,typeface: typeface
                             ,monospace: monospace
                             ,height: height
                             ,color: color
                             ,bold: bold
                             ,italic: italic
                             ,line: line
                             ,Style: Style
                             ,Under: Under
                             ,Over: Over
                             ,Through: Through};
};
Elm.Graphics = Elm.Graphics || {};
Elm.Graphics.Element = Elm.Graphics.Element || {};
Elm.Graphics.Element.make = function (_elm) {
   "use strict";
   _elm.Graphics = _elm.Graphics || {};
   _elm.Graphics.Element = _elm.Graphics.Element || {};
   if (_elm.Graphics.Element.values) return _elm.Graphics.Element.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Color = Elm.Color.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Graphics$Element = Elm.Native.Graphics.Element.make(_elm),
   $Text = Elm.Text.make(_elm);
   var _op = {};
   var DOut = {ctor: "DOut"};
   var outward = DOut;
   var DIn = {ctor: "DIn"};
   var inward = DIn;
   var DRight = {ctor: "DRight"};
   var right = DRight;
   var DLeft = {ctor: "DLeft"};
   var left = DLeft;
   var DDown = {ctor: "DDown"};
   var down = DDown;
   var DUp = {ctor: "DUp"};
   var up = DUp;
   var RawPosition = F4(function (a,b,c,d) {    return {horizontal: a,vertical: b,x: c,y: d};});
   var Position = function (a) {    return {ctor: "Position",_0: a};};
   var Relative = function (a) {    return {ctor: "Relative",_0: a};};
   var relative = Relative;
   var Absolute = function (a) {    return {ctor: "Absolute",_0: a};};
   var absolute = Absolute;
   var N = {ctor: "N"};
   var bottomLeft = Position({horizontal: N,vertical: N,x: Absolute(0),y: Absolute(0)});
   var bottomLeftAt = F2(function (x,y) {    return Position({horizontal: N,vertical: N,x: x,y: y});});
   var Z = {ctor: "Z"};
   var middle = Position({horizontal: Z,vertical: Z,x: Relative(0.5),y: Relative(0.5)});
   var midLeft = Position({horizontal: N,vertical: Z,x: Absolute(0),y: Relative(0.5)});
   var midBottom = Position({horizontal: Z,vertical: N,x: Relative(0.5),y: Absolute(0)});
   var middleAt = F2(function (x,y) {    return Position({horizontal: Z,vertical: Z,x: x,y: y});});
   var midLeftAt = F2(function (x,y) {    return Position({horizontal: N,vertical: Z,x: x,y: y});});
   var midBottomAt = F2(function (x,y) {    return Position({horizontal: Z,vertical: N,x: x,y: y});});
   var P = {ctor: "P"};
   var topLeft = Position({horizontal: N,vertical: P,x: Absolute(0),y: Absolute(0)});
   var topRight = Position({horizontal: P,vertical: P,x: Absolute(0),y: Absolute(0)});
   var bottomRight = Position({horizontal: P,vertical: N,x: Absolute(0),y: Absolute(0)});
   var midRight = Position({horizontal: P,vertical: Z,x: Absolute(0),y: Relative(0.5)});
   var midTop = Position({horizontal: Z,vertical: P,x: Relative(0.5),y: Absolute(0)});
   var topLeftAt = F2(function (x,y) {    return Position({horizontal: N,vertical: P,x: x,y: y});});
   var topRightAt = F2(function (x,y) {    return Position({horizontal: P,vertical: P,x: x,y: y});});
   var bottomRightAt = F2(function (x,y) {    return Position({horizontal: P,vertical: N,x: x,y: y});});
   var midRightAt = F2(function (x,y) {    return Position({horizontal: P,vertical: Z,x: x,y: y});});
   var midTopAt = F2(function (x,y) {    return Position({horizontal: Z,vertical: P,x: x,y: y});});
   var justified = $Native$Graphics$Element.block("justify");
   var centered = $Native$Graphics$Element.block("center");
   var rightAligned = $Native$Graphics$Element.block("right");
   var leftAligned = $Native$Graphics$Element.block("left");
   var show = function (value) {    return leftAligned($Text.monospace($Text.fromString($Basics.toString(value))));};
   var Tiled = {ctor: "Tiled"};
   var Cropped = function (a) {    return {ctor: "Cropped",_0: a};};
   var Fitted = {ctor: "Fitted"};
   var Plain = {ctor: "Plain"};
   var Custom = {ctor: "Custom"};
   var RawHtml = {ctor: "RawHtml"};
   var Spacer = {ctor: "Spacer"};
   var Flow = F2(function (a,b) {    return {ctor: "Flow",_0: a,_1: b};});
   var Container = F2(function (a,b) {    return {ctor: "Container",_0: a,_1: b};});
   var Image = F4(function (a,b,c,d) {    return {ctor: "Image",_0: a,_1: b,_2: c,_3: d};});
   var newElement = $Native$Graphics$Element.newElement;
   var image = F3(function (w,h,src) {    return A3(newElement,w,h,A4(Image,Plain,w,h,src));});
   var fittedImage = F3(function (w,h,src) {    return A3(newElement,w,h,A4(Image,Fitted,w,h,src));});
   var croppedImage = F4(function (pos,w,h,src) {    return A3(newElement,w,h,A4(Image,Cropped(pos),w,h,src));});
   var tiledImage = F3(function (w,h,src) {    return A3(newElement,w,h,A4(Image,Tiled,w,h,src));});
   var container = F4(function (w,h,_p0,e) {    var _p1 = _p0;return A3(newElement,w,h,A2(Container,_p1._0,e));});
   var spacer = F2(function (w,h) {    return A3(newElement,w,h,Spacer);});
   var sizeOf = function (_p2) {    var _p3 = _p2;var _p4 = _p3._0;return {ctor: "_Tuple2",_0: _p4.props.width,_1: _p4.props.height};};
   var heightOf = function (_p5) {    var _p6 = _p5;return _p6._0.props.height;};
   var widthOf = function (_p7) {    var _p8 = _p7;return _p8._0.props.width;};
   var above = F2(function (hi,lo) {
      return A3(newElement,A2($Basics.max,widthOf(hi),widthOf(lo)),heightOf(hi) + heightOf(lo),A2(Flow,DDown,_U.list([hi,lo])));
   });
   var below = F2(function (lo,hi) {
      return A3(newElement,A2($Basics.max,widthOf(hi),widthOf(lo)),heightOf(hi) + heightOf(lo),A2(Flow,DDown,_U.list([hi,lo])));
   });
   var beside = F2(function (lft,rht) {
      return A3(newElement,widthOf(lft) + widthOf(rht),A2($Basics.max,heightOf(lft),heightOf(rht)),A2(Flow,right,_U.list([lft,rht])));
   });
   var layers = function (es) {
      var hs = A2($List.map,heightOf,es);
      var ws = A2($List.map,widthOf,es);
      return A3(newElement,A2($Maybe.withDefault,0,$List.maximum(ws)),A2($Maybe.withDefault,0,$List.maximum(hs)),A2(Flow,DOut,es));
   };
   var empty = A2(spacer,0,0);
   var flow = F2(function (dir,es) {
      var newFlow = F2(function (w,h) {    return A3(newElement,w,h,A2(Flow,dir,es));});
      var maxOrZero = function (list) {    return A2($Maybe.withDefault,0,$List.maximum(list));};
      var hs = A2($List.map,heightOf,es);
      var ws = A2($List.map,widthOf,es);
      if (_U.eq(es,_U.list([]))) return empty; else {
            var _p9 = dir;
            switch (_p9.ctor)
            {case "DUp": return A2(newFlow,maxOrZero(ws),$List.sum(hs));
               case "DDown": return A2(newFlow,maxOrZero(ws),$List.sum(hs));
               case "DLeft": return A2(newFlow,$List.sum(ws),maxOrZero(hs));
               case "DRight": return A2(newFlow,$List.sum(ws),maxOrZero(hs));
               case "DIn": return A2(newFlow,maxOrZero(ws),maxOrZero(hs));
               default: return A2(newFlow,maxOrZero(ws),maxOrZero(hs));}
         }
   });
   var Properties = F9(function (a,b,c,d,e,f,g,h,i) {    return {id: a,width: b,height: c,opacity: d,color: e,href: f,tag: g,hover: h,click: i};});
   var Element_elm_builtin = function (a) {    return {ctor: "Element_elm_builtin",_0: a};};
   var width = F2(function (newWidth,_p10) {
      var _p11 = _p10;
      var _p14 = _p11._0.props;
      var _p13 = _p11._0.element;
      var newHeight = function () {
         var _p12 = _p13;
         switch (_p12.ctor)
         {case "Image": return $Basics.round($Basics.toFloat(_p12._2) / $Basics.toFloat(_p12._1) * $Basics.toFloat(newWidth));
            case "RawHtml": return $Basics.snd(A2($Native$Graphics$Element.htmlHeight,newWidth,_p13));
            default: return _p14.height;}
      }();
      return Element_elm_builtin({element: _p13,props: _U.update(_p14,{width: newWidth,height: newHeight})});
   });
   var height = F2(function (newHeight,_p15) {
      var _p16 = _p15;
      return Element_elm_builtin({element: _p16._0.element,props: _U.update(_p16._0.props,{height: newHeight})});
   });
   var size = F3(function (w,h,e) {    return A2(height,h,A2(width,w,e));});
   var opacity = F2(function (givenOpacity,_p17) {
      var _p18 = _p17;
      return Element_elm_builtin({element: _p18._0.element,props: _U.update(_p18._0.props,{opacity: givenOpacity})});
   });
   var color = F2(function (clr,_p19) {
      var _p20 = _p19;
      return Element_elm_builtin({element: _p20._0.element,props: _U.update(_p20._0.props,{color: $Maybe.Just(clr)})});
   });
   var tag = F2(function (name,_p21) {    var _p22 = _p21;return Element_elm_builtin({element: _p22._0.element,props: _U.update(_p22._0.props,{tag: name})});});
   var link = F2(function (href,_p23) {
      var _p24 = _p23;
      return Element_elm_builtin({element: _p24._0.element,props: _U.update(_p24._0.props,{href: href})});
   });
   return _elm.Graphics.Element.values = {_op: _op
                                         ,image: image
                                         ,fittedImage: fittedImage
                                         ,croppedImage: croppedImage
                                         ,tiledImage: tiledImage
                                         ,leftAligned: leftAligned
                                         ,rightAligned: rightAligned
                                         ,centered: centered
                                         ,justified: justified
                                         ,show: show
                                         ,width: width
                                         ,height: height
                                         ,size: size
                                         ,color: color
                                         ,opacity: opacity
                                         ,link: link
                                         ,tag: tag
                                         ,widthOf: widthOf
                                         ,heightOf: heightOf
                                         ,sizeOf: sizeOf
                                         ,flow: flow
                                         ,up: up
                                         ,down: down
                                         ,left: left
                                         ,right: right
                                         ,inward: inward
                                         ,outward: outward
                                         ,layers: layers
                                         ,above: above
                                         ,below: below
                                         ,beside: beside
                                         ,empty: empty
                                         ,spacer: spacer
                                         ,container: container
                                         ,middle: middle
                                         ,midTop: midTop
                                         ,midBottom: midBottom
                                         ,midLeft: midLeft
                                         ,midRight: midRight
                                         ,topLeft: topLeft
                                         ,topRight: topRight
                                         ,bottomLeft: bottomLeft
                                         ,bottomRight: bottomRight
                                         ,absolute: absolute
                                         ,relative: relative
                                         ,middleAt: middleAt
                                         ,midTopAt: midTopAt
                                         ,midBottomAt: midBottomAt
                                         ,midLeftAt: midLeftAt
                                         ,midRightAt: midRightAt
                                         ,topLeftAt: topLeftAt
                                         ,topRightAt: topRightAt
                                         ,bottomLeftAt: bottomLeftAt
                                         ,bottomRightAt: bottomRightAt};
};
Elm.Graphics = Elm.Graphics || {};
Elm.Graphics.Collage = Elm.Graphics.Collage || {};
Elm.Graphics.Collage.make = function (_elm) {
   "use strict";
   _elm.Graphics = _elm.Graphics || {};
   _elm.Graphics.Collage = _elm.Graphics.Collage || {};
   if (_elm.Graphics.Collage.values) return _elm.Graphics.Collage.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Color = Elm.Color.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $List = Elm.List.make(_elm),
   $Native$Graphics$Collage = Elm.Native.Graphics.Collage.make(_elm),
   $Text = Elm.Text.make(_elm),
   $Transform2D = Elm.Transform2D.make(_elm);
   var _op = {};
   var Shape = function (a) {    return {ctor: "Shape",_0: a};};
   var polygon = function (points) {    return Shape(points);};
   var rect = F2(function (w,h) {
      var hh = h / 2;
      var hw = w / 2;
      return Shape(_U.list([{ctor: "_Tuple2",_0: 0 - hw,_1: 0 - hh}
                           ,{ctor: "_Tuple2",_0: 0 - hw,_1: hh}
                           ,{ctor: "_Tuple2",_0: hw,_1: hh}
                           ,{ctor: "_Tuple2",_0: hw,_1: 0 - hh}]));
   });
   var square = function (n) {    return A2(rect,n,n);};
   var oval = F2(function (w,h) {
      var hh = h / 2;
      var hw = w / 2;
      var n = 50;
      var t = 2 * $Basics.pi / n;
      var f = function (i) {    return {ctor: "_Tuple2",_0: hw * $Basics.cos(t * i),_1: hh * $Basics.sin(t * i)};};
      return Shape(A2($List.map,f,_U.range(0,n - 1)));
   });
   var circle = function (r) {    return A2(oval,2 * r,2 * r);};
   var ngon = F2(function (n,r) {
      var m = $Basics.toFloat(n);
      var t = 2 * $Basics.pi / m;
      var f = function (i) {    return {ctor: "_Tuple2",_0: r * $Basics.cos(t * i),_1: r * $Basics.sin(t * i)};};
      return Shape(A2($List.map,f,_U.range(0,m - 1)));
   });
   var Path = function (a) {    return {ctor: "Path",_0: a};};
   var path = function (ps) {    return Path(ps);};
   var segment = F2(function (p1,p2) {    return Path(_U.list([p1,p2]));});
   var collage = $Native$Graphics$Collage.collage;
   var Fill = function (a) {    return {ctor: "Fill",_0: a};};
   var Line = function (a) {    return {ctor: "Line",_0: a};};
   var FGroup = F2(function (a,b) {    return {ctor: "FGroup",_0: a,_1: b};});
   var FElement = function (a) {    return {ctor: "FElement",_0: a};};
   var FImage = F4(function (a,b,c,d) {    return {ctor: "FImage",_0: a,_1: b,_2: c,_3: d};});
   var FText = function (a) {    return {ctor: "FText",_0: a};};
   var FOutlinedText = F2(function (a,b) {    return {ctor: "FOutlinedText",_0: a,_1: b};});
   var FShape = F2(function (a,b) {    return {ctor: "FShape",_0: a,_1: b};});
   var FPath = F2(function (a,b) {    return {ctor: "FPath",_0: a,_1: b};});
   var LineStyle = F6(function (a,b,c,d,e,f) {    return {color: a,width: b,cap: c,join: d,dashing: e,dashOffset: f};});
   var Clipped = {ctor: "Clipped"};
   var Sharp = function (a) {    return {ctor: "Sharp",_0: a};};
   var Smooth = {ctor: "Smooth"};
   var Padded = {ctor: "Padded"};
   var Round = {ctor: "Round"};
   var Flat = {ctor: "Flat"};
   var defaultLine = {color: $Color.black,width: 1,cap: Flat,join: Sharp(10),dashing: _U.list([]),dashOffset: 0};
   var solid = function (clr) {    return _U.update(defaultLine,{color: clr});};
   var dashed = function (clr) {    return _U.update(defaultLine,{color: clr,dashing: _U.list([8,4])});};
   var dotted = function (clr) {    return _U.update(defaultLine,{color: clr,dashing: _U.list([3,3])});};
   var Grad = function (a) {    return {ctor: "Grad",_0: a};};
   var Texture = function (a) {    return {ctor: "Texture",_0: a};};
   var Solid = function (a) {    return {ctor: "Solid",_0: a};};
   var Form_elm_builtin = function (a) {    return {ctor: "Form_elm_builtin",_0: a};};
   var form = function (f) {    return Form_elm_builtin({theta: 0,scale: 1,x: 0,y: 0,alpha: 1,form: f});};
   var fill = F2(function (style,_p0) {    var _p1 = _p0;return form(A2(FShape,Fill(style),_p1._0));});
   var filled = F2(function (color,shape) {    return A2(fill,Solid(color),shape);});
   var textured = F2(function (src,shape) {    return A2(fill,Texture(src),shape);});
   var gradient = F2(function (grad,shape) {    return A2(fill,Grad(grad),shape);});
   var outlined = F2(function (style,_p2) {    var _p3 = _p2;return form(A2(FShape,Line(style),_p3._0));});
   var traced = F2(function (style,_p4) {    var _p5 = _p4;return form(A2(FPath,style,_p5._0));});
   var sprite = F4(function (w,h,pos,src) {    return form(A4(FImage,w,h,pos,src));});
   var toForm = function (e) {    return form(FElement(e));};
   var group = function (fs) {    return form(A2(FGroup,$Transform2D.identity,fs));};
   var groupTransform = F2(function (matrix,fs) {    return form(A2(FGroup,matrix,fs));});
   var text = function (t) {    return form(FText(t));};
   var outlinedText = F2(function (ls,t) {    return form(A2(FOutlinedText,ls,t));});
   var move = F2(function (_p7,_p6) {
      var _p8 = _p7;
      var _p9 = _p6;
      var _p10 = _p9._0;
      return Form_elm_builtin(_U.update(_p10,{x: _p10.x + _p8._0,y: _p10.y + _p8._1}));
   });
   var moveX = F2(function (x,_p11) {    var _p12 = _p11;var _p13 = _p12._0;return Form_elm_builtin(_U.update(_p13,{x: _p13.x + x}));});
   var moveY = F2(function (y,_p14) {    var _p15 = _p14;var _p16 = _p15._0;return Form_elm_builtin(_U.update(_p16,{y: _p16.y + y}));});
   var scale = F2(function (s,_p17) {    var _p18 = _p17;var _p19 = _p18._0;return Form_elm_builtin(_U.update(_p19,{scale: _p19.scale * s}));});
   var rotate = F2(function (t,_p20) {    var _p21 = _p20;var _p22 = _p21._0;return Form_elm_builtin(_U.update(_p22,{theta: _p22.theta + t}));});
   var alpha = F2(function (a,_p23) {    var _p24 = _p23;return Form_elm_builtin(_U.update(_p24._0,{alpha: a}));});
   return _elm.Graphics.Collage.values = {_op: _op
                                         ,collage: collage
                                         ,toForm: toForm
                                         ,filled: filled
                                         ,textured: textured
                                         ,gradient: gradient
                                         ,outlined: outlined
                                         ,traced: traced
                                         ,text: text
                                         ,outlinedText: outlinedText
                                         ,move: move
                                         ,moveX: moveX
                                         ,moveY: moveY
                                         ,scale: scale
                                         ,rotate: rotate
                                         ,alpha: alpha
                                         ,group: group
                                         ,groupTransform: groupTransform
                                         ,rect: rect
                                         ,oval: oval
                                         ,square: square
                                         ,circle: circle
                                         ,ngon: ngon
                                         ,polygon: polygon
                                         ,segment: segment
                                         ,path: path
                                         ,solid: solid
                                         ,dashed: dashed
                                         ,dotted: dotted
                                         ,defaultLine: defaultLine
                                         ,LineStyle: LineStyle
                                         ,Flat: Flat
                                         ,Round: Round
                                         ,Padded: Padded
                                         ,Smooth: Smooth
                                         ,Sharp: Sharp
                                         ,Clipped: Clipped};
};
Elm.Native.Debug = {};
Elm.Native.Debug.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Debug = localRuntime.Native.Debug || {};
	if (localRuntime.Native.Debug.values)
	{
		return localRuntime.Native.Debug.values;
	}

	var toString = Elm.Native.Utils.make(localRuntime).toString;

	function log(tag, value)
	{
		var msg = tag + ': ' + toString(value);
		var process = process || {};
		if (process.stdout)
		{
			process.stdout.write(msg);
		}
		else
		{
			console.log(msg);
		}
		return value;
	}

	function crash(message)
	{
		throw new Error(message);
	}

	function tracePath(tag, form)
	{
		if (localRuntime.debug)
		{
			return localRuntime.debug.trace(tag, form);
		}
		return form;
	}

	function watch(tag, value)
	{
		if (localRuntime.debug)
		{
			localRuntime.debug.watch(tag, value);
		}
		return value;
	}

	function watchSummary(tag, summarize, value)
	{
		if (localRuntime.debug)
		{
			localRuntime.debug.watch(tag, summarize(value));
		}
		return value;
	}

	return localRuntime.Native.Debug.values = {
		crash: crash,
		tracePath: F2(tracePath),
		log: F2(log),
		watch: F2(watch),
		watchSummary: F3(watchSummary)
	};
};

Elm.Debug = Elm.Debug || {};
Elm.Debug.make = function (_elm) {
   "use strict";
   _elm.Debug = _elm.Debug || {};
   if (_elm.Debug.values) return _elm.Debug.values;
   var _U = Elm.Native.Utils.make(_elm),$Graphics$Collage = Elm.Graphics.Collage.make(_elm),$Native$Debug = Elm.Native.Debug.make(_elm);
   var _op = {};
   var trace = $Native$Debug.tracePath;
   var watchSummary = $Native$Debug.watchSummary;
   var watch = $Native$Debug.watch;
   var crash = $Native$Debug.crash;
   var log = $Native$Debug.log;
   return _elm.Debug.values = {_op: _op,log: log,crash: crash,watch: watch,watchSummary: watchSummary,trace: trace};
};
Elm.Result = Elm.Result || {};
Elm.Result.make = function (_elm) {
   "use strict";
   _elm.Result = _elm.Result || {};
   if (_elm.Result.values) return _elm.Result.values;
   var _U = Elm.Native.Utils.make(_elm),$Maybe = Elm.Maybe.make(_elm);
   var _op = {};
   var toMaybe = function (result) {    var _p0 = result;if (_p0.ctor === "Ok") {    return $Maybe.Just(_p0._0);} else {    return $Maybe.Nothing;}};
   var withDefault = F2(function (def,result) {    var _p1 = result;if (_p1.ctor === "Ok") {    return _p1._0;} else {    return def;}});
   var Err = function (a) {    return {ctor: "Err",_0: a};};
   var andThen = F2(function (result,callback) {    var _p2 = result;if (_p2.ctor === "Ok") {    return callback(_p2._0);} else {    return Err(_p2._0);}});
   var Ok = function (a) {    return {ctor: "Ok",_0: a};};
   var map = F2(function (func,ra) {    var _p3 = ra;if (_p3.ctor === "Ok") {    return Ok(func(_p3._0));} else {    return Err(_p3._0);}});
   var map2 = F3(function (func,ra,rb) {
      var _p4 = {ctor: "_Tuple2",_0: ra,_1: rb};
      if (_p4._0.ctor === "Ok") {
            if (_p4._1.ctor === "Ok") {
                  return Ok(A2(func,_p4._0._0,_p4._1._0));
               } else {
                  return Err(_p4._1._0);
               }
         } else {
            return Err(_p4._0._0);
         }
   });
   var map3 = F4(function (func,ra,rb,rc) {
      var _p5 = {ctor: "_Tuple3",_0: ra,_1: rb,_2: rc};
      if (_p5._0.ctor === "Ok") {
            if (_p5._1.ctor === "Ok") {
                  if (_p5._2.ctor === "Ok") {
                        return Ok(A3(func,_p5._0._0,_p5._1._0,_p5._2._0));
                     } else {
                        return Err(_p5._2._0);
                     }
               } else {
                  return Err(_p5._1._0);
               }
         } else {
            return Err(_p5._0._0);
         }
   });
   var map4 = F5(function (func,ra,rb,rc,rd) {
      var _p6 = {ctor: "_Tuple4",_0: ra,_1: rb,_2: rc,_3: rd};
      if (_p6._0.ctor === "Ok") {
            if (_p6._1.ctor === "Ok") {
                  if (_p6._2.ctor === "Ok") {
                        if (_p6._3.ctor === "Ok") {
                              return Ok(A4(func,_p6._0._0,_p6._1._0,_p6._2._0,_p6._3._0));
                           } else {
                              return Err(_p6._3._0);
                           }
                     } else {
                        return Err(_p6._2._0);
                     }
               } else {
                  return Err(_p6._1._0);
               }
         } else {
            return Err(_p6._0._0);
         }
   });
   var map5 = F6(function (func,ra,rb,rc,rd,re) {
      var _p7 = {ctor: "_Tuple5",_0: ra,_1: rb,_2: rc,_3: rd,_4: re};
      if (_p7._0.ctor === "Ok") {
            if (_p7._1.ctor === "Ok") {
                  if (_p7._2.ctor === "Ok") {
                        if (_p7._3.ctor === "Ok") {
                              if (_p7._4.ctor === "Ok") {
                                    return Ok(A5(func,_p7._0._0,_p7._1._0,_p7._2._0,_p7._3._0,_p7._4._0));
                                 } else {
                                    return Err(_p7._4._0);
                                 }
                           } else {
                              return Err(_p7._3._0);
                           }
                     } else {
                        return Err(_p7._2._0);
                     }
               } else {
                  return Err(_p7._1._0);
               }
         } else {
            return Err(_p7._0._0);
         }
   });
   var formatError = F2(function (f,result) {    var _p8 = result;if (_p8.ctor === "Ok") {    return Ok(_p8._0);} else {    return Err(f(_p8._0));}});
   var fromMaybe = F2(function (err,maybe) {    var _p9 = maybe;if (_p9.ctor === "Just") {    return Ok(_p9._0);} else {    return Err(err);}});
   return _elm.Result.values = {_op: _op
                               ,withDefault: withDefault
                               ,map: map
                               ,map2: map2
                               ,map3: map3
                               ,map4: map4
                               ,map5: map5
                               ,andThen: andThen
                               ,toMaybe: toMaybe
                               ,fromMaybe: fromMaybe
                               ,formatError: formatError
                               ,Ok: Ok
                               ,Err: Err};
};
Elm.Native.Signal = {};

Elm.Native.Signal.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Signal = localRuntime.Native.Signal || {};
	if (localRuntime.Native.Signal.values)
	{
		return localRuntime.Native.Signal.values;
	}


	var Task = Elm.Native.Task.make(localRuntime);
	var Utils = Elm.Native.Utils.make(localRuntime);


	function broadcastToKids(node, timestamp, update)
	{
		var kids = node.kids;
		for (var i = kids.length; i--; )
		{
			kids[i].notify(timestamp, update, node.id);
		}
	}


	// INPUT

	function input(name, base)
	{
		var node = {
			id: Utils.guid(),
			name: 'input-' + name,
			value: base,
			parents: [],
			kids: []
		};

		node.notify = function(timestamp, targetId, value) {
			var update = targetId === node.id;
			if (update)
			{
				node.value = value;
			}
			broadcastToKids(node, timestamp, update);
			return update;
		};

		localRuntime.inputs.push(node);

		return node;
	}

	function constant(value)
	{
		return input('constant', value);
	}


	// MAILBOX

	function mailbox(base)
	{
		var signal = input('mailbox', base);

		function send(value) {
			return Task.asyncFunction(function(callback) {
				localRuntime.setTimeout(function() {
					localRuntime.notify(signal.id, value);
				}, 0);
				callback(Task.succeed(Utils.Tuple0));
			});
		}

		return {
			signal: signal,
			address: {
				ctor: 'Address',
				_0: send
			}
		};
	}

	function sendMessage(message)
	{
		Task.perform(message._0);
	}


	// OUTPUT

	function output(name, handler, parent)
	{
		var node = {
			id: Utils.guid(),
			name: 'output-' + name,
			parents: [parent],
			isOutput: true
		};

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			if (parentUpdate)
			{
				handler(parent.value);
			}
		};

		parent.kids.push(node);

		return node;
	}


	// MAP

	function mapMany(refreshValue, args)
	{
		var node = {
			id: Utils.guid(),
			name: 'map' + args.length,
			value: refreshValue(),
			parents: args,
			kids: []
		};

		var numberOfParents = args.length;
		var count = 0;
		var update = false;

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			++count;

			update = update || parentUpdate;

			if (count === numberOfParents)
			{
				if (update)
				{
					node.value = refreshValue();
				}
				broadcastToKids(node, timestamp, update);
				update = false;
				count = 0;
			}
		};

		for (var i = numberOfParents; i--; )
		{
			args[i].kids.push(node);
		}

		return node;
	}


	function map(func, a)
	{
		function refreshValue()
		{
			return func(a.value);
		}
		return mapMany(refreshValue, [a]);
	}


	function map2(func, a, b)
	{
		function refreshValue()
		{
			return A2( func, a.value, b.value );
		}
		return mapMany(refreshValue, [a, b]);
	}


	function map3(func, a, b, c)
	{
		function refreshValue()
		{
			return A3( func, a.value, b.value, c.value );
		}
		return mapMany(refreshValue, [a, b, c]);
	}


	function map4(func, a, b, c, d)
	{
		function refreshValue()
		{
			return A4( func, a.value, b.value, c.value, d.value );
		}
		return mapMany(refreshValue, [a, b, c, d]);
	}


	function map5(func, a, b, c, d, e)
	{
		function refreshValue()
		{
			return A5( func, a.value, b.value, c.value, d.value, e.value );
		}
		return mapMany(refreshValue, [a, b, c, d, e]);
	}


	// FOLD

	function foldp(update, state, signal)
	{
		var node = {
			id: Utils.guid(),
			name: 'foldp',
			parents: [signal],
			kids: [],
			value: state
		};

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			if (parentUpdate)
			{
				node.value = A2( update, signal.value, node.value );
			}
			broadcastToKids(node, timestamp, parentUpdate);
		};

		signal.kids.push(node);

		return node;
	}


	// TIME

	function timestamp(signal)
	{
		var node = {
			id: Utils.guid(),
			name: 'timestamp',
			value: Utils.Tuple2(localRuntime.timer.programStart, signal.value),
			parents: [signal],
			kids: []
		};

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			if (parentUpdate)
			{
				node.value = Utils.Tuple2(timestamp, signal.value);
			}
			broadcastToKids(node, timestamp, parentUpdate);
		};

		signal.kids.push(node);

		return node;
	}


	function delay(time, signal)
	{
		var delayed = input('delay-input-' + time, signal.value);

		function handler(value)
		{
			setTimeout(function() {
				localRuntime.notify(delayed.id, value);
			}, time);
		}

		output('delay-output-' + time, handler, signal);

		return delayed;
	}


	// MERGING

	function genericMerge(tieBreaker, leftStream, rightStream)
	{
		var node = {
			id: Utils.guid(),
			name: 'merge',
			value: A2(tieBreaker, leftStream.value, rightStream.value),
			parents: [leftStream, rightStream],
			kids: []
		};

		var left = { touched: false, update: false, value: null };
		var right = { touched: false, update: false, value: null };

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			if (parentID === leftStream.id)
			{
				left.touched = true;
				left.update = parentUpdate;
				left.value = leftStream.value;
			}
			if (parentID === rightStream.id)
			{
				right.touched = true;
				right.update = parentUpdate;
				right.value = rightStream.value;
			}

			if (left.touched && right.touched)
			{
				var update = false;
				if (left.update && right.update)
				{
					node.value = A2(tieBreaker, left.value, right.value);
					update = true;
				}
				else if (left.update)
				{
					node.value = left.value;
					update = true;
				}
				else if (right.update)
				{
					node.value = right.value;
					update = true;
				}
				left.touched = false;
				right.touched = false;

				broadcastToKids(node, timestamp, update);
			}
		};

		leftStream.kids.push(node);
		rightStream.kids.push(node);

		return node;
	}


	// FILTERING

	function filterMap(toMaybe, base, signal)
	{
		var maybe = toMaybe(signal.value);
		var node = {
			id: Utils.guid(),
			name: 'filterMap',
			value: maybe.ctor === 'Nothing' ? base : maybe._0,
			parents: [signal],
			kids: []
		};

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			var update = false;
			if (parentUpdate)
			{
				var maybe = toMaybe(signal.value);
				if (maybe.ctor === 'Just')
				{
					update = true;
					node.value = maybe._0;
				}
			}
			broadcastToKids(node, timestamp, update);
		};

		signal.kids.push(node);

		return node;
	}


	// SAMPLING

	function sampleOn(ticker, signal)
	{
		var node = {
			id: Utils.guid(),
			name: 'sampleOn',
			value: signal.value,
			parents: [ticker, signal],
			kids: []
		};

		var signalTouch = false;
		var tickerTouch = false;
		var tickerUpdate = false;

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			if (parentID === ticker.id)
			{
				tickerTouch = true;
				tickerUpdate = parentUpdate;
			}
			if (parentID === signal.id)
			{
				signalTouch = true;
			}

			if (tickerTouch && signalTouch)
			{
				if (tickerUpdate)
				{
					node.value = signal.value;
				}
				tickerTouch = false;
				signalTouch = false;

				broadcastToKids(node, timestamp, tickerUpdate);
			}
		};

		ticker.kids.push(node);
		signal.kids.push(node);

		return node;
	}


	// DROP REPEATS

	function dropRepeats(signal)
	{
		var node = {
			id: Utils.guid(),
			name: 'dropRepeats',
			value: signal.value,
			parents: [signal],
			kids: []
		};

		node.notify = function(timestamp, parentUpdate, parentID)
		{
			var update = false;
			if (parentUpdate && !Utils.eq(node.value, signal.value))
			{
				node.value = signal.value;
				update = true;
			}
			broadcastToKids(node, timestamp, update);
		};

		signal.kids.push(node);

		return node;
	}


	return localRuntime.Native.Signal.values = {
		input: input,
		constant: constant,
		mailbox: mailbox,
		sendMessage: sendMessage,
		output: output,
		map: F2(map),
		map2: F3(map2),
		map3: F4(map3),
		map4: F5(map4),
		map5: F6(map5),
		foldp: F3(foldp),
		genericMerge: F3(genericMerge),
		filterMap: F3(filterMap),
		sampleOn: F2(sampleOn),
		dropRepeats: dropRepeats,
		timestamp: timestamp,
		delay: F2(delay)
	};
};

Elm.Native.Task = {};

Elm.Native.Task.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Task = localRuntime.Native.Task || {};
	if (localRuntime.Native.Task.values)
	{
		return localRuntime.Native.Task.values;
	}

	var Result = Elm.Result.make(localRuntime);
	var Signal;
	var Utils = Elm.Native.Utils.make(localRuntime);


	// CONSTRUCTORS

	function succeed(value)
	{
		return {
			tag: 'Succeed',
			value: value
		};
	}

	function fail(error)
	{
		return {
			tag: 'Fail',
			value: error
		};
	}

	function asyncFunction(func)
	{
		return {
			tag: 'Async',
			asyncFunction: func
		};
	}

	function andThen(task, callback)
	{
		return {
			tag: 'AndThen',
			task: task,
			callback: callback
		};
	}

	function catch_(task, callback)
	{
		return {
			tag: 'Catch',
			task: task,
			callback: callback
		};
	}


	// RUNNER

	function perform(task) {
		runTask({ task: task }, function() {});
	}

	function performSignal(name, signal)
	{
		var workQueue = [];

		function onComplete()
		{
			workQueue.shift();

			if (workQueue.length > 0)
			{
				var task = workQueue[0];

				setTimeout(function() {
					runTask(task, onComplete);
				}, 0);
			}
		}

		function register(task)
		{
			var root = { task: task };
			workQueue.push(root);
			if (workQueue.length === 1)
			{
				runTask(root, onComplete);
			}
		}

		if (!Signal)
		{
			Signal = Elm.Native.Signal.make(localRuntime);
		}
		Signal.output('perform-tasks-' + name, register, signal);

		register(signal.value);

		return signal;
	}

	function mark(status, task)
	{
		return { status: status, task: task };
	}

	function runTask(root, onComplete)
	{
		var result = mark('runnable', root.task);
		while (result.status === 'runnable')
		{
			result = stepTask(onComplete, root, result.task);
		}

		if (result.status === 'done')
		{
			root.task = result.task;
			onComplete();
		}

		if (result.status === 'blocked')
		{
			root.task = result.task;
		}
	}

	function stepTask(onComplete, root, task)
	{
		var tag = task.tag;

		if (tag === 'Succeed' || tag === 'Fail')
		{
			return mark('done', task);
		}

		if (tag === 'Async')
		{
			var placeHolder = {};
			var couldBeSync = true;
			var wasSync = false;

			task.asyncFunction(function(result) {
				placeHolder.tag = result.tag;
				placeHolder.value = result.value;
				if (couldBeSync)
				{
					wasSync = true;
				}
				else
				{
					runTask(root, onComplete);
				}
			});
			couldBeSync = false;
			return mark(wasSync ? 'done' : 'blocked', placeHolder);
		}

		if (tag === 'AndThen' || tag === 'Catch')
		{
			var result = mark('runnable', task.task);
			while (result.status === 'runnable')
			{
				result = stepTask(onComplete, root, result.task);
			}

			if (result.status === 'done')
			{
				var activeTask = result.task;
				var activeTag = activeTask.tag;

				var succeedChain = activeTag === 'Succeed' && tag === 'AndThen';
				var failChain = activeTag === 'Fail' && tag === 'Catch';

				return (succeedChain || failChain)
					? mark('runnable', task.callback(activeTask.value))
					: mark('runnable', activeTask);
			}
			if (result.status === 'blocked')
			{
				return mark('blocked', {
					tag: tag,
					task: result.task,
					callback: task.callback
				});
			}
		}
	}


	// THREADS

	function sleep(time) {
		return asyncFunction(function(callback) {
			setTimeout(function() {
				callback(succeed(Utils.Tuple0));
			}, time);
		});
	}

	function spawn(task) {
		return asyncFunction(function(callback) {
			var id = setTimeout(function() {
				perform(task);
			}, 0);
			callback(succeed(id));
		});
	}


	return localRuntime.Native.Task.values = {
		succeed: succeed,
		fail: fail,
		asyncFunction: asyncFunction,
		andThen: F2(andThen),
		catch_: F2(catch_),
		perform: perform,
		performSignal: performSignal,
		spawn: spawn,
		sleep: sleep
	};
};

Elm.Task = Elm.Task || {};
Elm.Task.make = function (_elm) {
   "use strict";
   _elm.Task = _elm.Task || {};
   if (_elm.Task.values) return _elm.Task.values;
   var _U = Elm.Native.Utils.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Task = Elm.Native.Task.make(_elm),
   $Result = Elm.Result.make(_elm);
   var _op = {};
   var sleep = $Native$Task.sleep;
   var spawn = $Native$Task.spawn;
   var ThreadID = function (a) {    return {ctor: "ThreadID",_0: a};};
   var onError = $Native$Task.catch_;
   var andThen = $Native$Task.andThen;
   var fail = $Native$Task.fail;
   var mapError = F2(function (f,task) {    return A2(onError,task,function (err) {    return fail(f(err));});});
   var succeed = $Native$Task.succeed;
   var map = F2(function (func,taskA) {    return A2(andThen,taskA,function (a) {    return succeed(func(a));});});
   var map2 = F3(function (func,taskA,taskB) {
      return A2(andThen,taskA,function (a) {    return A2(andThen,taskB,function (b) {    return succeed(A2(func,a,b));});});
   });
   var map3 = F4(function (func,taskA,taskB,taskC) {
      return A2(andThen,
      taskA,
      function (a) {
         return A2(andThen,taskB,function (b) {    return A2(andThen,taskC,function (c) {    return succeed(A3(func,a,b,c));});});
      });
   });
   var map4 = F5(function (func,taskA,taskB,taskC,taskD) {
      return A2(andThen,
      taskA,
      function (a) {
         return A2(andThen,
         taskB,
         function (b) {
            return A2(andThen,taskC,function (c) {    return A2(andThen,taskD,function (d) {    return succeed(A4(func,a,b,c,d));});});
         });
      });
   });
   var map5 = F6(function (func,taskA,taskB,taskC,taskD,taskE) {
      return A2(andThen,
      taskA,
      function (a) {
         return A2(andThen,
         taskB,
         function (b) {
            return A2(andThen,
            taskC,
            function (c) {
               return A2(andThen,taskD,function (d) {    return A2(andThen,taskE,function (e) {    return succeed(A5(func,a,b,c,d,e));});});
            });
         });
      });
   });
   var andMap = F2(function (taskFunc,taskValue) {
      return A2(andThen,taskFunc,function (func) {    return A2(andThen,taskValue,function (value) {    return succeed(func(value));});});
   });
   var sequence = function (tasks) {
      var _p0 = tasks;
      if (_p0.ctor === "[]") {
            return succeed(_U.list([]));
         } else {
            return A3(map2,F2(function (x,y) {    return A2($List._op["::"],x,y);}),_p0._0,sequence(_p0._1));
         }
   };
   var toMaybe = function (task) {    return A2(onError,A2(map,$Maybe.Just,task),function (_p1) {    return succeed($Maybe.Nothing);});};
   var fromMaybe = F2(function ($default,maybe) {    var _p2 = maybe;if (_p2.ctor === "Just") {    return succeed(_p2._0);} else {    return fail($default);}});
   var toResult = function (task) {    return A2(onError,A2(map,$Result.Ok,task),function (msg) {    return succeed($Result.Err(msg));});};
   var fromResult = function (result) {    var _p3 = result;if (_p3.ctor === "Ok") {    return succeed(_p3._0);} else {    return fail(_p3._0);}};
   var Task = {ctor: "Task"};
   return _elm.Task.values = {_op: _op
                             ,succeed: succeed
                             ,fail: fail
                             ,map: map
                             ,map2: map2
                             ,map3: map3
                             ,map4: map4
                             ,map5: map5
                             ,andMap: andMap
                             ,sequence: sequence
                             ,andThen: andThen
                             ,onError: onError
                             ,mapError: mapError
                             ,toMaybe: toMaybe
                             ,fromMaybe: fromMaybe
                             ,toResult: toResult
                             ,fromResult: fromResult
                             ,spawn: spawn
                             ,sleep: sleep};
};
Elm.Signal = Elm.Signal || {};
Elm.Signal.make = function (_elm) {
   "use strict";
   _elm.Signal = _elm.Signal || {};
   if (_elm.Signal.values) return _elm.Signal.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Signal = Elm.Native.Signal.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var send = F2(function (_p0,value) {
      var _p1 = _p0;
      return A2($Task.onError,_p1._0(value),function (_p2) {    return $Task.succeed({ctor: "_Tuple0"});});
   });
   var Message = function (a) {    return {ctor: "Message",_0: a};};
   var message = F2(function (_p3,value) {    var _p4 = _p3;return Message(_p4._0(value));});
   var mailbox = $Native$Signal.mailbox;
   var Address = function (a) {    return {ctor: "Address",_0: a};};
   var forwardTo = F2(function (_p5,f) {    var _p6 = _p5;return Address(function (x) {    return _p6._0(f(x));});});
   var Mailbox = F2(function (a,b) {    return {address: a,signal: b};});
   var sampleOn = $Native$Signal.sampleOn;
   var dropRepeats = $Native$Signal.dropRepeats;
   var filterMap = $Native$Signal.filterMap;
   var filter = F3(function (isOk,base,signal) {
      return A3(filterMap,function (value) {    return isOk(value) ? $Maybe.Just(value) : $Maybe.Nothing;},base,signal);
   });
   var merge = F2(function (left,right) {    return A3($Native$Signal.genericMerge,$Basics.always,left,right);});
   var mergeMany = function (signalList) {
      var _p7 = $List.reverse(signalList);
      if (_p7.ctor === "[]") {
            return _U.crashCase("Signal",{start: {line: 184,column: 3},end: {line: 189,column: 40}},_p7)("mergeMany was given an empty list!");
         } else {
            return A3($List.foldl,merge,_p7._0,_p7._1);
         }
   };
   var foldp = $Native$Signal.foldp;
   var map5 = $Native$Signal.map5;
   var map4 = $Native$Signal.map4;
   var map3 = $Native$Signal.map3;
   var map2 = $Native$Signal.map2;
   var map = $Native$Signal.map;
   var constant = $Native$Signal.constant;
   var Signal = {ctor: "Signal"};
   return _elm.Signal.values = {_op: _op
                               ,merge: merge
                               ,mergeMany: mergeMany
                               ,map: map
                               ,map2: map2
                               ,map3: map3
                               ,map4: map4
                               ,map5: map5
                               ,constant: constant
                               ,dropRepeats: dropRepeats
                               ,filter: filter
                               ,filterMap: filterMap
                               ,sampleOn: sampleOn
                               ,foldp: foldp
                               ,mailbox: mailbox
                               ,send: send
                               ,message: message
                               ,forwardTo: forwardTo
                               ,Mailbox: Mailbox};
};
Elm.Native.Json = {};

Elm.Native.Json.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Json = localRuntime.Native.Json || {};
	if (localRuntime.Native.Json.values) {
		return localRuntime.Native.Json.values;
	}

	var ElmArray = Elm.Native.Array.make(localRuntime);
	var List = Elm.Native.List.make(localRuntime);
	var Maybe = Elm.Maybe.make(localRuntime);
	var Result = Elm.Result.make(localRuntime);
	var Utils = Elm.Native.Utils.make(localRuntime);


	function crash(expected, actual) {
		throw new Error(
			'expecting ' + expected + ' but got ' + JSON.stringify(actual)
		);
	}


	// PRIMITIVE VALUES

	function decodeNull(successValue) {
		return function(value) {
			if (value === null) {
				return successValue;
			}
			crash('null', value);
		};
	}


	function decodeString(value) {
		if (typeof value === 'string' || value instanceof String) {
			return value;
		}
		crash('a String', value);
	}


	function decodeFloat(value) {
		if (typeof value === 'number') {
			return value;
		}
		crash('a Float', value);
	}


	function decodeInt(value) {
		if (typeof value !== 'number') {
			crash('an Int', value);
		}

		if (value < 2147483647 && value > -2147483647 && (value | 0) === value) {
			return value;
		}

		if (isFinite(value) && !(value % 1)) {
			return value;
		}

		crash('an Int', value);
	}


	function decodeBool(value) {
		if (typeof value === 'boolean') {
			return value;
		}
		crash('a Bool', value);
	}


	// ARRAY

	function decodeArray(decoder) {
		return function(value) {
			if (value instanceof Array) {
				var len = value.length;
				var array = new Array(len);
				for (var i = len; i--; ) {
					array[i] = decoder(value[i]);
				}
				return ElmArray.fromJSArray(array);
			}
			crash('an Array', value);
		};
	}


	// LIST

	function decodeList(decoder) {
		return function(value) {
			if (value instanceof Array) {
				var len = value.length;
				var list = List.Nil;
				for (var i = len; i--; ) {
					list = List.Cons( decoder(value[i]), list );
				}
				return list;
			}
			crash('a List', value);
		};
	}


	// MAYBE

	function decodeMaybe(decoder) {
		return function(value) {
			try {
				return Maybe.Just(decoder(value));
			} catch(e) {
				return Maybe.Nothing;
			}
		};
	}


	// FIELDS

	function decodeField(field, decoder) {
		return function(value) {
			var subValue = value[field];
			if (subValue !== undefined) {
				return decoder(subValue);
			}
			crash("an object with field '" + field + "'", value);
		};
	}


	// OBJECTS

	function decodeKeyValuePairs(decoder) {
		return function(value) {
			var isObject =
				typeof value === 'object'
					&& value !== null
					&& !(value instanceof Array);

			if (isObject) {
				var keyValuePairs = List.Nil;
				for (var key in value)
				{
					var elmValue = decoder(value[key]);
					var pair = Utils.Tuple2(key, elmValue);
					keyValuePairs = List.Cons(pair, keyValuePairs);
				}
				return keyValuePairs;
			}

			crash('an object', value);
		};
	}

	function decodeObject1(f, d1) {
		return function(value) {
			return f(d1(value));
		};
	}

	function decodeObject2(f, d1, d2) {
		return function(value) {
			return A2( f, d1(value), d2(value) );
		};
	}

	function decodeObject3(f, d1, d2, d3) {
		return function(value) {
			return A3( f, d1(value), d2(value), d3(value) );
		};
	}

	function decodeObject4(f, d1, d2, d3, d4) {
		return function(value) {
			return A4( f, d1(value), d2(value), d3(value), d4(value) );
		};
	}

	function decodeObject5(f, d1, d2, d3, d4, d5) {
		return function(value) {
			return A5( f, d1(value), d2(value), d3(value), d4(value), d5(value) );
		};
	}

	function decodeObject6(f, d1, d2, d3, d4, d5, d6) {
		return function(value) {
			return A6( f,
				d1(value),
				d2(value),
				d3(value),
				d4(value),
				d5(value),
				d6(value)
			);
		};
	}

	function decodeObject7(f, d1, d2, d3, d4, d5, d6, d7) {
		return function(value) {
			return A7( f,
				d1(value),
				d2(value),
				d3(value),
				d4(value),
				d5(value),
				d6(value),
				d7(value)
			);
		};
	}

	function decodeObject8(f, d1, d2, d3, d4, d5, d6, d7, d8) {
		return function(value) {
			return A8( f,
				d1(value),
				d2(value),
				d3(value),
				d4(value),
				d5(value),
				d6(value),
				d7(value),
				d8(value)
			);
		};
	}


	// TUPLES

	function decodeTuple1(f, d1) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 1 ) {
				crash('a Tuple of length 1', value);
			}
			return f( d1(value[0]) );
		};
	}

	function decodeTuple2(f, d1, d2) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 2 ) {
				crash('a Tuple of length 2', value);
			}
			return A2( f, d1(value[0]), d2(value[1]) );
		};
	}

	function decodeTuple3(f, d1, d2, d3) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 3 ) {
				crash('a Tuple of length 3', value);
			}
			return A3( f, d1(value[0]), d2(value[1]), d3(value[2]) );
		};
	}


	function decodeTuple4(f, d1, d2, d3, d4) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 4 ) {
				crash('a Tuple of length 4', value);
			}
			return A4( f, d1(value[0]), d2(value[1]), d3(value[2]), d4(value[3]) );
		};
	}


	function decodeTuple5(f, d1, d2, d3, d4, d5) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 5 ) {
				crash('a Tuple of length 5', value);
			}
			return A5( f,
				d1(value[0]),
				d2(value[1]),
				d3(value[2]),
				d4(value[3]),
				d5(value[4])
			);
		};
	}


	function decodeTuple6(f, d1, d2, d3, d4, d5, d6) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 6 ) {
				crash('a Tuple of length 6', value);
			}
			return A6( f,
				d1(value[0]),
				d2(value[1]),
				d3(value[2]),
				d4(value[3]),
				d5(value[4]),
				d6(value[5])
			);
		};
	}

	function decodeTuple7(f, d1, d2, d3, d4, d5, d6, d7) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 7 ) {
				crash('a Tuple of length 7', value);
			}
			return A7( f,
				d1(value[0]),
				d2(value[1]),
				d3(value[2]),
				d4(value[3]),
				d5(value[4]),
				d6(value[5]),
				d7(value[6])
			);
		};
	}


	function decodeTuple8(f, d1, d2, d3, d4, d5, d6, d7, d8) {
		return function(value) {
			if ( !(value instanceof Array) || value.length !== 8 ) {
				crash('a Tuple of length 8', value);
			}
			return A8( f,
				d1(value[0]),
				d2(value[1]),
				d3(value[2]),
				d4(value[3]),
				d5(value[4]),
				d6(value[5]),
				d7(value[6]),
				d8(value[7])
			);
		};
	}


	// CUSTOM DECODERS

	function decodeValue(value) {
		return value;
	}

	function runDecoderValue(decoder, value) {
		try {
			return Result.Ok(decoder(value));
		} catch(e) {
			return Result.Err(e.message);
		}
	}

	function customDecoder(decoder, callback) {
		return function(value) {
			var result = callback(decoder(value));
			if (result.ctor === 'Err') {
				throw new Error('custom decoder failed: ' + result._0);
			}
			return result._0;
		};
	}

	function andThen(decode, callback) {
		return function(value) {
			var result = decode(value);
			return callback(result)(value);
		};
	}

	function fail(msg) {
		return function(value) {
			throw new Error(msg);
		};
	}

	function succeed(successValue) {
		return function(value) {
			return successValue;
		};
	}


	// ONE OF MANY

	function oneOf(decoders) {
		return function(value) {
			var errors = [];
			var temp = decoders;
			while (temp.ctor !== '[]') {
				try {
					return temp._0(value);
				} catch(e) {
					errors.push(e.message);
				}
				temp = temp._1;
			}
			throw new Error('expecting one of the following:\n    ' + errors.join('\n    '));
		};
	}

	function get(decoder, value) {
		try {
			return Result.Ok(decoder(value));
		} catch(e) {
			return Result.Err(e.message);
		}
	}


	// ENCODE / DECODE

	function runDecoderString(decoder, string) {
		try {
			return Result.Ok(decoder(JSON.parse(string)));
		} catch(e) {
			return Result.Err(e.message);
		}
	}

	function encode(indentLevel, value) {
		return JSON.stringify(value, null, indentLevel);
	}

	function identity(value) {
		return value;
	}

	function encodeObject(keyValuePairs) {
		var obj = {};
		while (keyValuePairs.ctor !== '[]') {
			var pair = keyValuePairs._0;
			obj[pair._0] = pair._1;
			keyValuePairs = keyValuePairs._1;
		}
		return obj;
	}

	return localRuntime.Native.Json.values = {
		encode: F2(encode),
		runDecoderString: F2(runDecoderString),
		runDecoderValue: F2(runDecoderValue),

		get: F2(get),
		oneOf: oneOf,

		decodeNull: decodeNull,
		decodeInt: decodeInt,
		decodeFloat: decodeFloat,
		decodeString: decodeString,
		decodeBool: decodeBool,

		decodeMaybe: decodeMaybe,

		decodeList: decodeList,
		decodeArray: decodeArray,

		decodeField: F2(decodeField),

		decodeObject1: F2(decodeObject1),
		decodeObject2: F3(decodeObject2),
		decodeObject3: F4(decodeObject3),
		decodeObject4: F5(decodeObject4),
		decodeObject5: F6(decodeObject5),
		decodeObject6: F7(decodeObject6),
		decodeObject7: F8(decodeObject7),
		decodeObject8: F9(decodeObject8),
		decodeKeyValuePairs: decodeKeyValuePairs,

		decodeTuple1: F2(decodeTuple1),
		decodeTuple2: F3(decodeTuple2),
		decodeTuple3: F4(decodeTuple3),
		decodeTuple4: F5(decodeTuple4),
		decodeTuple5: F6(decodeTuple5),
		decodeTuple6: F7(decodeTuple6),
		decodeTuple7: F8(decodeTuple7),
		decodeTuple8: F9(decodeTuple8),

		andThen: F2(andThen),
		decodeValue: decodeValue,
		customDecoder: F2(customDecoder),
		fail: fail,
		succeed: succeed,

		identity: identity,
		encodeNull: null,
		encodeArray: ElmArray.toJSArray,
		encodeList: List.toArray,
		encodeObject: encodeObject

	};
};

Elm.Native.Array = {};
Elm.Native.Array.make = function(localRuntime) {

	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Array = localRuntime.Native.Array || {};
	if (localRuntime.Native.Array.values)
	{
		return localRuntime.Native.Array.values;
	}
	if ('values' in Elm.Native.Array)
	{
		return localRuntime.Native.Array.values = Elm.Native.Array.values;
	}

	var List = Elm.Native.List.make(localRuntime);

	// A RRB-Tree has two distinct data types.
	// Leaf -> "height"  is always 0
	//         "table"   is an array of elements
	// Node -> "height"  is always greater than 0
	//         "table"   is an array of child nodes
	//         "lengths" is an array of accumulated lengths of the child nodes

	// M is the maximal table size. 32 seems fast. E is the allowed increase
	// of search steps when concatting to find an index. Lower values will
	// decrease balancing, but will increase search steps.
	var M = 32;
	var E = 2;

	// An empty array.
	var empty = {
		ctor: '_Array',
		height: 0,
		table: []
	};


	function get(i, array)
	{
		if (i < 0 || i >= length(array))
		{
			throw new Error(
				'Index ' + i + ' is out of range. Check the length of ' +
				'your array first or use getMaybe or getWithDefault.');
		}
		return unsafeGet(i, array);
	}


	function unsafeGet(i, array)
	{
		for (var x = array.height; x > 0; x--)
		{
			var slot = i >> (x * 5);
			while (array.lengths[slot] <= i)
			{
				slot++;
			}
			if (slot > 0)
			{
				i -= array.lengths[slot - 1];
			}
			array = array.table[slot];
		}
		return array.table[i];
	}


	// Sets the value at the index i. Only the nodes leading to i will get
	// copied and updated.
	function set(i, item, array)
	{
		if (i < 0 || length(array) <= i)
		{
			return array;
		}
		return unsafeSet(i, item, array);
	}


	function unsafeSet(i, item, array)
	{
		array = nodeCopy(array);

		if (array.height === 0)
		{
			array.table[i] = item;
		}
		else
		{
			var slot = getSlot(i, array);
			if (slot > 0)
			{
				i -= array.lengths[slot - 1];
			}
			array.table[slot] = unsafeSet(i, item, array.table[slot]);
		}
		return array;
	}


	function initialize(len, f)
	{
		if (len <= 0)
		{
			return empty;
		}
		var h = Math.floor( Math.log(len) / Math.log(M) );
		return initialize_(f, h, 0, len);
	}

	function initialize_(f, h, from, to)
	{
		if (h === 0)
		{
			var table = new Array((to - from) % (M + 1));
			for (var i = 0; i < table.length; i++)
			{
			  table[i] = f(from + i);
			}
			return {
				ctor: '_Array',
				height: 0,
				table: table
			};
		}

		var step = Math.pow(M, h);
		var table = new Array(Math.ceil((to - from) / step));
		var lengths = new Array(table.length);
		for (var i = 0; i < table.length; i++)
		{
			table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
		}
		return {
			ctor: '_Array',
			height: h,
			table: table,
			lengths: lengths
		};
	}

	function fromList(list)
	{
		if (list === List.Nil)
		{
			return empty;
		}

		// Allocate M sized blocks (table) and write list elements to it.
		var table = new Array(M);
		var nodes = [];
		var i = 0;

		while (list.ctor !== '[]')
		{
			table[i] = list._0;
			list = list._1;
			i++;

			// table is full, so we can push a leaf containing it into the
			// next node.
			if (i === M)
			{
				var leaf = {
					ctor: '_Array',
					height: 0,
					table: table
				};
				fromListPush(leaf, nodes);
				table = new Array(M);
				i = 0;
			}
		}

		// Maybe there is something left on the table.
		if (i > 0)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table.splice(0, i)
			};
			fromListPush(leaf, nodes);
		}

		// Go through all of the nodes and eventually push them into higher nodes.
		for (var h = 0; h < nodes.length - 1; h++)
		{
			if (nodes[h].table.length > 0)
			{
				fromListPush(nodes[h], nodes);
			}
		}

		var head = nodes[nodes.length - 1];
		if (head.height > 0 && head.table.length === 1)
		{
			return head.table[0];
		}
		else
		{
			return head;
		}
	}

	// Push a node into a higher node as a child.
	function fromListPush(toPush, nodes)
	{
		var h = toPush.height;

		// Maybe the node on this height does not exist.
		if (nodes.length === h)
		{
			var node = {
				ctor: '_Array',
				height: h + 1,
				table: [],
				lengths: []
			};
			nodes.push(node);
		}

		nodes[h].table.push(toPush);
		var len = length(toPush);
		if (nodes[h].lengths.length > 0)
		{
			len += nodes[h].lengths[nodes[h].lengths.length - 1];
		}
		nodes[h].lengths.push(len);

		if (nodes[h].table.length === M)
		{
			fromListPush(nodes[h], nodes);
			nodes[h] = {
				ctor: '_Array',
				height: h + 1,
				table: [],
				lengths: []
			};
		}
	}

	// Pushes an item via push_ to the bottom right of a tree.
	function push(item, a)
	{
		var pushed = push_(item, a);
		if (pushed !== null)
		{
			return pushed;
		}

		var newTree = create(item, a.height);
		return siblise(a, newTree);
	}

	// Recursively tries to push an item to the bottom-right most
	// tree possible. If there is no space left for the item,
	// null will be returned.
	function push_(item, a)
	{
		// Handle resursion stop at leaf level.
		if (a.height === 0)
		{
			if (a.table.length < M)
			{
				var newA = {
					ctor: '_Array',
					height: 0,
					table: a.table.slice()
				};
				newA.table.push(item);
				return newA;
			}
			else
			{
			  return null;
			}
		}

		// Recursively push
		var pushed = push_(item, botRight(a));

		// There was space in the bottom right tree, so the slot will
		// be updated.
		if (pushed !== null)
		{
			var newA = nodeCopy(a);
			newA.table[newA.table.length - 1] = pushed;
			newA.lengths[newA.lengths.length - 1]++;
			return newA;
		}

		// When there was no space left, check if there is space left
		// for a new slot with a tree which contains only the item
		// at the bottom.
		if (a.table.length < M)
		{
			var newSlot = create(item, a.height - 1);
			var newA = nodeCopy(a);
			newA.table.push(newSlot);
			newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
			return newA;
		}
		else
		{
			return null;
		}
	}

	// Converts an array into a list of elements.
	function toList(a)
	{
		return toList_(List.Nil, a);
	}

	function toList_(list, a)
	{
		for (var i = a.table.length - 1; i >= 0; i--)
		{
			list =
				a.height === 0
					? List.Cons(a.table[i], list)
					: toList_(list, a.table[i]);
		}
		return list;
	}

	// Maps a function over the elements of an array.
	function map(f, a)
	{
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: new Array(a.table.length)
		};
		if (a.height > 0)
		{
			newA.lengths = a.lengths;
		}
		for (var i = 0; i < a.table.length; i++)
		{
			newA.table[i] =
				a.height === 0
					? f(a.table[i])
					: map(f, a.table[i]);
		}
		return newA;
	}

	// Maps a function over the elements with their index as first argument.
	function indexedMap(f, a)
	{
		return indexedMap_(f, a, 0);
	}

	function indexedMap_(f, a, from)
	{
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: new Array(a.table.length)
		};
		if (a.height > 0)
		{
			newA.lengths = a.lengths;
		}
		for (var i = 0; i < a.table.length; i++)
		{
			newA.table[i] =
				a.height === 0
					? A2(f, from + i, a.table[i])
					: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
		}
		return newA;
	}

	function foldl(f, b, a)
	{
		if (a.height === 0)
		{
			for (var i = 0; i < a.table.length; i++)
			{
				b = A2(f, a.table[i], b);
			}
		}
		else
		{
			for (var i = 0; i < a.table.length; i++)
			{
				b = foldl(f, b, a.table[i]);
			}
		}
		return b;
	}

	function foldr(f, b, a)
	{
		if (a.height === 0)
		{
			for (var i = a.table.length; i--; )
			{
				b = A2(f, a.table[i], b);
			}
		}
		else
		{
			for (var i = a.table.length; i--; )
			{
				b = foldr(f, b, a.table[i]);
			}
		}
		return b;
	}

	// TODO: currently, it slices the right, then the left. This can be
	// optimized.
	function slice(from, to, a)
	{
		if (from < 0)
		{
			from += length(a);
		}
		if (to < 0)
		{
			to += length(a);
		}
		return sliceLeft(from, sliceRight(to, a));
	}

	function sliceRight(to, a)
	{
		if (to === length(a))
		{
			return a;
		}

		// Handle leaf level.
		if (a.height === 0)
		{
			var newA = { ctor:'_Array', height:0 };
			newA.table = a.table.slice(0, to);
			return newA;
		}

		// Slice the right recursively.
		var right = getSlot(to, a);
		var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

		// Maybe the a node is not even needed, as sliced contains the whole slice.
		if (right === 0)
		{
			return sliced;
		}

		// Create new node.
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: a.table.slice(0, right),
			lengths: a.lengths.slice(0, right)
		};
		if (sliced.table.length > 0)
		{
			newA.table[right] = sliced;
			newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
		}
		return newA;
	}

	function sliceLeft(from, a)
	{
		if (from === 0)
		{
			return a;
		}

		// Handle leaf level.
		if (a.height === 0)
		{
			var newA = { ctor:'_Array', height:0 };
			newA.table = a.table.slice(from, a.table.length + 1);
			return newA;
		}

		// Slice the left recursively.
		var left = getSlot(from, a);
		var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

		// Maybe the a node is not even needed, as sliced contains the whole slice.
		if (left === a.table.length - 1)
		{
			return sliced;
		}

		// Create new node.
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: a.table.slice(left, a.table.length + 1),
			lengths: new Array(a.table.length - left)
		};
		newA.table[0] = sliced;
		var len = 0;
		for (var i = 0; i < newA.table.length; i++)
		{
			len += length(newA.table[i]);
			newA.lengths[i] = len;
		}

		return newA;
	}

	// Appends two trees.
	function append(a,b)
	{
		if (a.table.length === 0)
		{
			return b;
		}
		if (b.table.length === 0)
		{
			return a;
		}

		var c = append_(a, b);

		// Check if both nodes can be crunshed together.
		if (c[0].table.length + c[1].table.length <= M)
		{
			if (c[0].table.length === 0)
			{
				return c[1];
			}
			if (c[1].table.length === 0)
			{
				return c[0];
			}

			// Adjust .table and .lengths
			c[0].table = c[0].table.concat(c[1].table);
			if (c[0].height > 0)
			{
				var len = length(c[0]);
				for (var i = 0; i < c[1].lengths.length; i++)
				{
					c[1].lengths[i] += len;
				}
				c[0].lengths = c[0].lengths.concat(c[1].lengths);
			}

			return c[0];
		}

		if (c[0].height > 0)
		{
			var toRemove = calcToRemove(a, b);
			if (toRemove > E)
			{
				c = shuffle(c[0], c[1], toRemove);
			}
		}

		return siblise(c[0], c[1]);
	}

	// Returns an array of two nodes; right and left. One node _may_ be empty.
	function append_(a, b)
	{
		if (a.height === 0 && b.height === 0)
		{
			return [a, b];
		}

		if (a.height !== 1 || b.height !== 1)
		{
			if (a.height === b.height)
			{
				a = nodeCopy(a);
				b = nodeCopy(b);
				var appended = append_(botRight(a), botLeft(b));

				insertRight(a, appended[1]);
				insertLeft(b, appended[0]);
			}
			else if (a.height > b.height)
			{
				a = nodeCopy(a);
				var appended = append_(botRight(a), b);

				insertRight(a, appended[0]);
				b = parentise(appended[1], appended[1].height + 1);
			}
			else
			{
				b = nodeCopy(b);
				var appended = append_(a, botLeft(b));

				var left = appended[0].table.length === 0 ? 0 : 1;
				var right = left === 0 ? 1 : 0;
				insertLeft(b, appended[left]);
				a = parentise(appended[right], appended[right].height + 1);
			}
		}

		// Check if balancing is needed and return based on that.
		if (a.table.length === 0 || b.table.length === 0)
		{
			return [a, b];
		}

		var toRemove = calcToRemove(a, b);
		if (toRemove <= E)
		{
			return [a, b];
		}
		return shuffle(a, b, toRemove);
	}

	// Helperfunctions for append_. Replaces a child node at the side of the parent.
	function insertRight(parent, node)
	{
		var index = parent.table.length - 1;
		parent.table[index] = node;
		parent.lengths[index] = length(node);
		parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
	}

	function insertLeft(parent, node)
	{
		if (node.table.length > 0)
		{
			parent.table[0] = node;
			parent.lengths[0] = length(node);

			var len = length(parent.table[0]);
			for (var i = 1; i < parent.lengths.length; i++)
			{
				len += length(parent.table[i]);
				parent.lengths[i] = len;
			}
		}
		else
		{
			parent.table.shift();
			for (var i = 1; i < parent.lengths.length; i++)
			{
				parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
			}
			parent.lengths.shift();
		}
	}

	// Returns the extra search steps for E. Refer to the paper.
	function calcToRemove(a, b)
	{
		var subLengths = 0;
		for (var i = 0; i < a.table.length; i++)
		{
			subLengths += a.table[i].table.length;
		}
		for (var i = 0; i < b.table.length; i++)
		{
			subLengths += b.table[i].table.length;
		}

		var toRemove = a.table.length + b.table.length;
		return toRemove - (Math.floor((subLengths - 1) / M) + 1);
	}

	// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
	function get2(a, b, index)
	{
		return index < a.length
			? a[index]
			: b[index - a.length];
	}

	function set2(a, b, index, value)
	{
		if (index < a.length)
		{
			a[index] = value;
		}
		else
		{
			b[index - a.length] = value;
		}
	}

	function saveSlot(a, b, index, slot)
	{
		set2(a.table, b.table, index, slot);

		var l = (index === 0 || index === a.lengths.length)
			? 0
			: get2(a.lengths, a.lengths, index - 1);

		set2(a.lengths, b.lengths, index, l + length(slot));
	}

	// Creates a node or leaf with a given length at their arrays for perfomance.
	// Is only used by shuffle.
	function createNode(h, length)
	{
		if (length < 0)
		{
			length = 0;
		}
		var a = {
			ctor: '_Array',
			height: h,
			table: new Array(length)
		};
		if (h > 0)
		{
			a.lengths = new Array(length);
		}
		return a;
	}

	// Returns an array of two balanced nodes.
	function shuffle(a, b, toRemove)
	{
		var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
		var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

		// Skip the slots with size M. More precise: copy the slot references
		// to the new node
		var read = 0;
		while (get2(a.table, b.table, read).table.length % M === 0)
		{
			set2(newA.table, newB.table, read, get2(a.table, b.table, read));
			set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
			read++;
		}

		// Pulling items from left to right, caching in a slot before writing
		// it into the new nodes.
		var write = read;
		var slot = new createNode(a.height - 1, 0);
		var from = 0;

		// If the current slot is still containing data, then there will be at
		// least one more write, so we do not break this loop yet.
		while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
		{
			// Find out the max possible items for copying.
			var source = get2(a.table, b.table, read);
			var to = Math.min(M - slot.table.length, source.table.length);

			// Copy and adjust size table.
			slot.table = slot.table.concat(source.table.slice(from, to));
			if (slot.height > 0)
			{
				var len = slot.lengths.length;
				for (var i = len; i < len + to - from; i++)
				{
					slot.lengths[i] = length(slot.table[i]);
					slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
				}
			}

			from += to;

			// Only proceed to next slots[i] if the current one was
			// fully copied.
			if (source.table.length <= to)
			{
				read++; from = 0;
			}

			// Only create a new slot if the current one is filled up.
			if (slot.table.length === M)
			{
				saveSlot(newA, newB, write, slot);
				slot = createNode(a.height - 1, 0);
				write++;
			}
		}

		// Cleanup after the loop. Copy the last slot into the new nodes.
		if (slot.table.length > 0)
		{
			saveSlot(newA, newB, write, slot);
			write++;
		}

		// Shift the untouched slots to the left
		while (read < a.table.length + b.table.length )
		{
			saveSlot(newA, newB, write, get2(a.table, b.table, read));
			read++;
			write++;
		}

		return [newA, newB];
	}

	// Navigation functions
	function botRight(a)
	{
		return a.table[a.table.length - 1];
	}
	function botLeft(a)
	{
		return a.table[0];
	}

	// Copies a node for updating. Note that you should not use this if
	// only updating only one of "table" or "lengths" for performance reasons.
	function nodeCopy(a)
	{
		var newA = {
			ctor: '_Array',
			height: a.height,
			table: a.table.slice()
		};
		if (a.height > 0)
		{
			newA.lengths = a.lengths.slice();
		}
		return newA;
	}

	// Returns how many items are in the tree.
	function length(array)
	{
		if (array.height === 0)
		{
			return array.table.length;
		}
		else
		{
			return array.lengths[array.lengths.length - 1];
		}
	}

	// Calculates in which slot of "table" the item probably is, then
	// find the exact slot via forward searching in  "lengths". Returns the index.
	function getSlot(i, a)
	{
		var slot = i >> (5 * a.height);
		while (a.lengths[slot] <= i)
		{
			slot++;
		}
		return slot;
	}

	// Recursively creates a tree with a given height containing
	// only the given item.
	function create(item, h)
	{
		if (h === 0)
		{
			return {
				ctor: '_Array',
				height: 0,
				table: [item]
			};
		}
		return {
			ctor: '_Array',
			height: h,
			table: [create(item, h - 1)],
			lengths: [1]
		};
	}

	// Recursively creates a tree that contains the given tree.
	function parentise(tree, h)
	{
		if (h === tree.height)
		{
			return tree;
		}

		return {
			ctor: '_Array',
			height: h,
			table: [parentise(tree, h - 1)],
			lengths: [length(tree)]
		};
	}

	// Emphasizes blood brotherhood beneath two trees.
	function siblise(a, b)
	{
		return {
			ctor: '_Array',
			height: a.height + 1,
			table: [a, b],
			lengths: [length(a), length(a) + length(b)]
		};
	}

	function toJSArray(a)
	{
		var jsArray = new Array(length(a));
		toJSArray_(jsArray, 0, a);
		return jsArray;
	}

	function toJSArray_(jsArray, i, a)
	{
		for (var t = 0; t < a.table.length; t++)
		{
			if (a.height === 0)
			{
				jsArray[i + t] = a.table[t];
			}
			else
			{
				var inc = t === 0 ? 0 : a.lengths[t - 1];
				toJSArray_(jsArray, i + inc, a.table[t]);
			}
		}
	}

	function fromJSArray(jsArray)
	{
		if (jsArray.length === 0)
		{
			return empty;
		}
		var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
		return fromJSArray_(jsArray, h, 0, jsArray.length);
	}

	function fromJSArray_(jsArray, h, from, to)
	{
		if (h === 0)
		{
			return {
				ctor: '_Array',
				height: 0,
				table: jsArray.slice(from, to)
			};
		}

		var step = Math.pow(M, h);
		var table = new Array(Math.ceil((to - from) / step));
		var lengths = new Array(table.length);
		for (var i = 0; i < table.length; i++)
		{
			table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		return {
			ctor: '_Array',
			height: h,
			table: table,
			lengths: lengths
		};
	}

	Elm.Native.Array.values = {
		empty: empty,
		fromList: fromList,
		toList: toList,
		initialize: F2(initialize),
		append: F2(append),
		push: F2(push),
		slice: F3(slice),
		get: F2(get),
		set: F3(set),
		map: F2(map),
		indexedMap: F2(indexedMap),
		foldl: F3(foldl),
		foldr: F3(foldr),
		length: length,

		toJSArray: toJSArray,
		fromJSArray: fromJSArray
	};

	return localRuntime.Native.Array.values = Elm.Native.Array.values;
};

Elm.Array = Elm.Array || {};
Elm.Array.make = function (_elm) {
   "use strict";
   _elm.Array = _elm.Array || {};
   if (_elm.Array.values) return _elm.Array.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Array = Elm.Native.Array.make(_elm);
   var _op = {};
   var append = $Native$Array.append;
   var length = $Native$Array.length;
   var isEmpty = function (array) {    return _U.eq(length(array),0);};
   var slice = $Native$Array.slice;
   var set = $Native$Array.set;
   var get = F2(function (i,array) {
      return _U.cmp(0,i) < 1 && _U.cmp(i,$Native$Array.length(array)) < 0 ? $Maybe.Just(A2($Native$Array.get,i,array)) : $Maybe.Nothing;
   });
   var push = $Native$Array.push;
   var empty = $Native$Array.empty;
   var filter = F2(function (isOkay,arr) {
      var update = F2(function (x,xs) {    return isOkay(x) ? A2($Native$Array.push,x,xs) : xs;});
      return A3($Native$Array.foldl,update,$Native$Array.empty,arr);
   });
   var foldr = $Native$Array.foldr;
   var foldl = $Native$Array.foldl;
   var indexedMap = $Native$Array.indexedMap;
   var map = $Native$Array.map;
   var toIndexedList = function (array) {
      return A3($List.map2,
      F2(function (v0,v1) {    return {ctor: "_Tuple2",_0: v0,_1: v1};}),
      _U.range(0,$Native$Array.length(array) - 1),
      $Native$Array.toList(array));
   };
   var toList = $Native$Array.toList;
   var fromList = $Native$Array.fromList;
   var initialize = $Native$Array.initialize;
   var repeat = F2(function (n,e) {    return A2(initialize,n,$Basics.always(e));});
   var Array = {ctor: "Array"};
   return _elm.Array.values = {_op: _op
                              ,empty: empty
                              ,repeat: repeat
                              ,initialize: initialize
                              ,fromList: fromList
                              ,isEmpty: isEmpty
                              ,length: length
                              ,push: push
                              ,append: append
                              ,get: get
                              ,set: set
                              ,slice: slice
                              ,toList: toList
                              ,toIndexedList: toIndexedList
                              ,map: map
                              ,indexedMap: indexedMap
                              ,filter: filter
                              ,foldl: foldl
                              ,foldr: foldr};
};
Elm.Native.String = {};

Elm.Native.String.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.String = localRuntime.Native.String || {};
	if (localRuntime.Native.String.values)
	{
		return localRuntime.Native.String.values;
	}
	if ('values' in Elm.Native.String)
	{
		return localRuntime.Native.String.values = Elm.Native.String.values;
	}


	var Char = Elm.Char.make(localRuntime);
	var List = Elm.Native.List.make(localRuntime);
	var Maybe = Elm.Maybe.make(localRuntime);
	var Result = Elm.Result.make(localRuntime);
	var Utils = Elm.Native.Utils.make(localRuntime);

	function isEmpty(str)
	{
		return str.length === 0;
	}
	function cons(chr, str)
	{
		return chr + str;
	}
	function uncons(str)
	{
		var hd = str[0];
		if (hd)
		{
			return Maybe.Just(Utils.Tuple2(Utils.chr(hd), str.slice(1)));
		}
		return Maybe.Nothing;
	}
	function append(a, b)
	{
		return a + b;
	}
	function concat(strs)
	{
		return List.toArray(strs).join('');
	}
	function length(str)
	{
		return str.length;
	}
	function map(f, str)
	{
		var out = str.split('');
		for (var i = out.length; i--; )
		{
			out[i] = f(Utils.chr(out[i]));
		}
		return out.join('');
	}
	function filter(pred, str)
	{
		return str.split('').map(Utils.chr).filter(pred).join('');
	}
	function reverse(str)
	{
		return str.split('').reverse().join('');
	}
	function foldl(f, b, str)
	{
		var len = str.length;
		for (var i = 0; i < len; ++i)
		{
			b = A2(f, Utils.chr(str[i]), b);
		}
		return b;
	}
	function foldr(f, b, str)
	{
		for (var i = str.length; i--; )
		{
			b = A2(f, Utils.chr(str[i]), b);
		}
		return b;
	}
	function split(sep, str)
	{
		return List.fromArray(str.split(sep));
	}
	function join(sep, strs)
	{
		return List.toArray(strs).join(sep);
	}
	function repeat(n, str)
	{
		var result = '';
		while (n > 0)
		{
			if (n & 1)
			{
				result += str;
			}
			n >>= 1, str += str;
		}
		return result;
	}
	function slice(start, end, str)
	{
		return str.slice(start, end);
	}
	function left(n, str)
	{
		return n < 1 ? '' : str.slice(0, n);
	}
	function right(n, str)
	{
		return n < 1 ? '' : str.slice(-n);
	}
	function dropLeft(n, str)
	{
		return n < 1 ? str : str.slice(n);
	}
	function dropRight(n, str)
	{
		return n < 1 ? str : str.slice(0, -n);
	}
	function pad(n, chr, str)
	{
		var half = (n - str.length) / 2;
		return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
	}
	function padRight(n, chr, str)
	{
		return str + repeat(n - str.length, chr);
	}
	function padLeft(n, chr, str)
	{
		return repeat(n - str.length, chr) + str;
	}

	function trim(str)
	{
		return str.trim();
	}
	function trimLeft(str)
	{
		return str.replace(/^\s+/, '');
	}
	function trimRight(str)
	{
		return str.replace(/\s+$/, '');
	}

	function words(str)
	{
		return List.fromArray(str.trim().split(/\s+/g));
	}
	function lines(str)
	{
		return List.fromArray(str.split(/\r\n|\r|\n/g));
	}

	function toUpper(str)
	{
		return str.toUpperCase();
	}
	function toLower(str)
	{
		return str.toLowerCase();
	}

	function any(pred, str)
	{
		for (var i = str.length; i--; )
		{
			if (pred(Utils.chr(str[i])))
			{
				return true;
			}
		}
		return false;
	}
	function all(pred, str)
	{
		for (var i = str.length; i--; )
		{
			if (!pred(Utils.chr(str[i])))
			{
				return false;
			}
		}
		return true;
	}

	function contains(sub, str)
	{
		return str.indexOf(sub) > -1;
	}
	function startsWith(sub, str)
	{
		return str.indexOf(sub) === 0;
	}
	function endsWith(sub, str)
	{
		return str.length >= sub.length &&
			str.lastIndexOf(sub) === str.length - sub.length;
	}
	function indexes(sub, str)
	{
		var subLen = sub.length;
		var i = 0;
		var is = [];
		while ((i = str.indexOf(sub, i)) > -1)
		{
			is.push(i);
			i = i + subLen;
		}
		return List.fromArray(is);
	}

	function toInt(s)
	{
		var len = s.length;
		if (len === 0)
		{
			return Result.Err("could not convert string '" + s + "' to an Int" );
		}
		var start = 0;
		if (s[0] === '-')
		{
			if (len === 1)
			{
				return Result.Err("could not convert string '" + s + "' to an Int" );
			}
			start = 1;
		}
		for (var i = start; i < len; ++i)
		{
			if (!Char.isDigit(s[i]))
			{
				return Result.Err("could not convert string '" + s + "' to an Int" );
			}
		}
		return Result.Ok(parseInt(s, 10));
	}

	function toFloat(s)
	{
		var len = s.length;
		if (len === 0)
		{
			return Result.Err("could not convert string '" + s + "' to a Float" );
		}
		var start = 0;
		if (s[0] === '-')
		{
			if (len === 1)
			{
				return Result.Err("could not convert string '" + s + "' to a Float" );
			}
			start = 1;
		}
		var dotCount = 0;
		for (var i = start; i < len; ++i)
		{
			if (Char.isDigit(s[i]))
			{
				continue;
			}
			if (s[i] === '.')
			{
				dotCount += 1;
				if (dotCount <= 1)
				{
					continue;
				}
			}
			return Result.Err("could not convert string '" + s + "' to a Float" );
		}
		return Result.Ok(parseFloat(s));
	}

	function toList(str)
	{
		return List.fromArray(str.split('').map(Utils.chr));
	}
	function fromList(chars)
	{
		return List.toArray(chars).join('');
	}

	return Elm.Native.String.values = {
		isEmpty: isEmpty,
		cons: F2(cons),
		uncons: uncons,
		append: F2(append),
		concat: concat,
		length: length,
		map: F2(map),
		filter: F2(filter),
		reverse: reverse,
		foldl: F3(foldl),
		foldr: F3(foldr),

		split: F2(split),
		join: F2(join),
		repeat: F2(repeat),

		slice: F3(slice),
		left: F2(left),
		right: F2(right),
		dropLeft: F2(dropLeft),
		dropRight: F2(dropRight),

		pad: F3(pad),
		padLeft: F3(padLeft),
		padRight: F3(padRight),

		trim: trim,
		trimLeft: trimLeft,
		trimRight: trimRight,

		words: words,
		lines: lines,

		toUpper: toUpper,
		toLower: toLower,

		any: F2(any),
		all: F2(all),

		contains: F2(contains),
		startsWith: F2(startsWith),
		endsWith: F2(endsWith),
		indexes: F2(indexes),

		toInt: toInt,
		toFloat: toFloat,
		toList: toList,
		fromList: fromList
	};
};

Elm.Native.Char = {};
Elm.Native.Char.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Char = localRuntime.Native.Char || {};
	if (localRuntime.Native.Char.values)
	{
		return localRuntime.Native.Char.values;
	}

	var Utils = Elm.Native.Utils.make(localRuntime);

	return localRuntime.Native.Char.values = {
		fromCode: function(c) { return Utils.chr(String.fromCharCode(c)); },
		toCode: function(c) { return c.charCodeAt(0); },
		toUpper: function(c) { return Utils.chr(c.toUpperCase()); },
		toLower: function(c) { return Utils.chr(c.toLowerCase()); },
		toLocaleUpper: function(c) { return Utils.chr(c.toLocaleUpperCase()); },
		toLocaleLower: function(c) { return Utils.chr(c.toLocaleLowerCase()); }
	};
};

Elm.Char = Elm.Char || {};
Elm.Char.make = function (_elm) {
   "use strict";
   _elm.Char = _elm.Char || {};
   if (_elm.Char.values) return _elm.Char.values;
   var _U = Elm.Native.Utils.make(_elm),$Basics = Elm.Basics.make(_elm),$Native$Char = Elm.Native.Char.make(_elm);
   var _op = {};
   var fromCode = $Native$Char.fromCode;
   var toCode = $Native$Char.toCode;
   var toLocaleLower = $Native$Char.toLocaleLower;
   var toLocaleUpper = $Native$Char.toLocaleUpper;
   var toLower = $Native$Char.toLower;
   var toUpper = $Native$Char.toUpper;
   var isBetween = F3(function (low,high,$char) {    var code = toCode($char);return _U.cmp(code,toCode(low)) > -1 && _U.cmp(code,toCode(high)) < 1;});
   var isUpper = A2(isBetween,_U.chr("A"),_U.chr("Z"));
   var isLower = A2(isBetween,_U.chr("a"),_U.chr("z"));
   var isDigit = A2(isBetween,_U.chr("0"),_U.chr("9"));
   var isOctDigit = A2(isBetween,_U.chr("0"),_U.chr("7"));
   var isHexDigit = function ($char) {
      return isDigit($char) || (A3(isBetween,_U.chr("a"),_U.chr("f"),$char) || A3(isBetween,_U.chr("A"),_U.chr("F"),$char));
   };
   return _elm.Char.values = {_op: _op
                             ,isUpper: isUpper
                             ,isLower: isLower
                             ,isDigit: isDigit
                             ,isOctDigit: isOctDigit
                             ,isHexDigit: isHexDigit
                             ,toUpper: toUpper
                             ,toLower: toLower
                             ,toLocaleUpper: toLocaleUpper
                             ,toLocaleLower: toLocaleLower
                             ,toCode: toCode
                             ,fromCode: fromCode};
};
Elm.String = Elm.String || {};
Elm.String.make = function (_elm) {
   "use strict";
   _elm.String = _elm.String || {};
   if (_elm.String.values) return _elm.String.values;
   var _U = Elm.Native.Utils.make(_elm),$Maybe = Elm.Maybe.make(_elm),$Native$String = Elm.Native.String.make(_elm),$Result = Elm.Result.make(_elm);
   var _op = {};
   var fromList = $Native$String.fromList;
   var toList = $Native$String.toList;
   var toFloat = $Native$String.toFloat;
   var toInt = $Native$String.toInt;
   var indices = $Native$String.indexes;
   var indexes = $Native$String.indexes;
   var endsWith = $Native$String.endsWith;
   var startsWith = $Native$String.startsWith;
   var contains = $Native$String.contains;
   var all = $Native$String.all;
   var any = $Native$String.any;
   var toLower = $Native$String.toLower;
   var toUpper = $Native$String.toUpper;
   var lines = $Native$String.lines;
   var words = $Native$String.words;
   var trimRight = $Native$String.trimRight;
   var trimLeft = $Native$String.trimLeft;
   var trim = $Native$String.trim;
   var padRight = $Native$String.padRight;
   var padLeft = $Native$String.padLeft;
   var pad = $Native$String.pad;
   var dropRight = $Native$String.dropRight;
   var dropLeft = $Native$String.dropLeft;
   var right = $Native$String.right;
   var left = $Native$String.left;
   var slice = $Native$String.slice;
   var repeat = $Native$String.repeat;
   var join = $Native$String.join;
   var split = $Native$String.split;
   var foldr = $Native$String.foldr;
   var foldl = $Native$String.foldl;
   var reverse = $Native$String.reverse;
   var filter = $Native$String.filter;
   var map = $Native$String.map;
   var length = $Native$String.length;
   var concat = $Native$String.concat;
   var append = $Native$String.append;
   var uncons = $Native$String.uncons;
   var cons = $Native$String.cons;
   var fromChar = function ($char) {    return A2(cons,$char,"");};
   var isEmpty = $Native$String.isEmpty;
   return _elm.String.values = {_op: _op
                               ,isEmpty: isEmpty
                               ,length: length
                               ,reverse: reverse
                               ,repeat: repeat
                               ,cons: cons
                               ,uncons: uncons
                               ,fromChar: fromChar
                               ,append: append
                               ,concat: concat
                               ,split: split
                               ,join: join
                               ,words: words
                               ,lines: lines
                               ,slice: slice
                               ,left: left
                               ,right: right
                               ,dropLeft: dropLeft
                               ,dropRight: dropRight
                               ,contains: contains
                               ,startsWith: startsWith
                               ,endsWith: endsWith
                               ,indexes: indexes
                               ,indices: indices
                               ,toInt: toInt
                               ,toFloat: toFloat
                               ,toList: toList
                               ,fromList: fromList
                               ,toUpper: toUpper
                               ,toLower: toLower
                               ,pad: pad
                               ,padLeft: padLeft
                               ,padRight: padRight
                               ,trim: trim
                               ,trimLeft: trimLeft
                               ,trimRight: trimRight
                               ,map: map
                               ,filter: filter
                               ,foldl: foldl
                               ,foldr: foldr
                               ,any: any
                               ,all: all};
};
Elm.Dict = Elm.Dict || {};
Elm.Dict.make = function (_elm) {
   "use strict";
   _elm.Dict = _elm.Dict || {};
   if (_elm.Dict.values) return _elm.Dict.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Debug = Elm.Native.Debug.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var foldr = F3(function (f,acc,t) {
      foldr: while (true) {
         var _p0 = t;
         if (_p0.ctor === "RBEmpty_elm_builtin") {
               return acc;
            } else {
               var _v1 = f,_v2 = A3(f,_p0._1,_p0._2,A3(foldr,f,acc,_p0._4)),_v3 = _p0._3;
               f = _v1;
               acc = _v2;
               t = _v3;
               continue foldr;
            }
      }
   });
   var keys = function (dict) {    return A3(foldr,F3(function (key,value,keyList) {    return A2($List._op["::"],key,keyList);}),_U.list([]),dict);};
   var values = function (dict) {    return A3(foldr,F3(function (key,value,valueList) {    return A2($List._op["::"],value,valueList);}),_U.list([]),dict);};
   var toList = function (dict) {
      return A3(foldr,F3(function (key,value,list) {    return A2($List._op["::"],{ctor: "_Tuple2",_0: key,_1: value},list);}),_U.list([]),dict);
   };
   var foldl = F3(function (f,acc,dict) {
      foldl: while (true) {
         var _p1 = dict;
         if (_p1.ctor === "RBEmpty_elm_builtin") {
               return acc;
            } else {
               var _v5 = f,_v6 = A3(f,_p1._1,_p1._2,A3(foldl,f,acc,_p1._3)),_v7 = _p1._4;
               f = _v5;
               acc = _v6;
               dict = _v7;
               continue foldl;
            }
      }
   });
   var reportRemBug = F4(function (msg,c,lgot,rgot) {
      return $Native$Debug.crash($String.concat(_U.list(["Internal red-black tree invariant violated, expected "
                                                        ,msg
                                                        ," and got "
                                                        ,$Basics.toString(c)
                                                        ,"/"
                                                        ,lgot
                                                        ,"/"
                                                        ,rgot
                                                        ,"\nPlease report this bug to <https://github.com/elm-lang/core/issues>"])));
   });
   var isBBlack = function (dict) {
      var _p2 = dict;
      _v8_2: do {
         if (_p2.ctor === "RBNode_elm_builtin") {
               if (_p2._0.ctor === "BBlack") {
                     return true;
                  } else {
                     break _v8_2;
                  }
            } else {
               if (_p2._0.ctor === "LBBlack") {
                     return true;
                  } else {
                     break _v8_2;
                  }
            }
      } while (false);
      return false;
   };
   var Same = {ctor: "Same"};
   var Remove = {ctor: "Remove"};
   var Insert = {ctor: "Insert"};
   var sizeHelp = F2(function (n,dict) {
      sizeHelp: while (true) {
         var _p3 = dict;
         if (_p3.ctor === "RBEmpty_elm_builtin") {
               return n;
            } else {
               var _v10 = A2(sizeHelp,n + 1,_p3._4),_v11 = _p3._3;
               n = _v10;
               dict = _v11;
               continue sizeHelp;
            }
      }
   });
   var size = function (dict) {    return A2(sizeHelp,0,dict);};
   var get = F2(function (targetKey,dict) {
      get: while (true) {
         var _p4 = dict;
         if (_p4.ctor === "RBEmpty_elm_builtin") {
               return $Maybe.Nothing;
            } else {
               var _p5 = A2($Basics.compare,targetKey,_p4._1);
               switch (_p5.ctor)
               {case "LT": var _v14 = targetKey,_v15 = _p4._3;
                    targetKey = _v14;
                    dict = _v15;
                    continue get;
                  case "EQ": return $Maybe.Just(_p4._2);
                  default: var _v16 = targetKey,_v17 = _p4._4;
                    targetKey = _v16;
                    dict = _v17;
                    continue get;}
            }
      }
   });
   var member = F2(function (key,dict) {    var _p6 = A2(get,key,dict);if (_p6.ctor === "Just") {    return true;} else {    return false;}});
   var maxWithDefault = F3(function (k,v,r) {
      maxWithDefault: while (true) {
         var _p7 = r;
         if (_p7.ctor === "RBEmpty_elm_builtin") {
               return {ctor: "_Tuple2",_0: k,_1: v};
            } else {
               var _v20 = _p7._1,_v21 = _p7._2,_v22 = _p7._4;
               k = _v20;
               v = _v21;
               r = _v22;
               continue maxWithDefault;
            }
      }
   });
   var RBEmpty_elm_builtin = function (a) {    return {ctor: "RBEmpty_elm_builtin",_0: a};};
   var RBNode_elm_builtin = F5(function (a,b,c,d,e) {    return {ctor: "RBNode_elm_builtin",_0: a,_1: b,_2: c,_3: d,_4: e};});
   var LBBlack = {ctor: "LBBlack"};
   var LBlack = {ctor: "LBlack"};
   var empty = RBEmpty_elm_builtin(LBlack);
   var isEmpty = function (dict) {    return _U.eq(dict,empty);};
   var map = F2(function (f,dict) {
      var _p8 = dict;
      if (_p8.ctor === "RBEmpty_elm_builtin") {
            return RBEmpty_elm_builtin(LBlack);
         } else {
            var _p9 = _p8._1;
            return A5(RBNode_elm_builtin,_p8._0,_p9,A2(f,_p9,_p8._2),A2(map,f,_p8._3),A2(map,f,_p8._4));
         }
   });
   var NBlack = {ctor: "NBlack"};
   var BBlack = {ctor: "BBlack"};
   var Black = {ctor: "Black"};
   var ensureBlackRoot = function (dict) {
      var _p10 = dict;
      if (_p10.ctor === "RBNode_elm_builtin" && _p10._0.ctor === "Red") {
            return A5(RBNode_elm_builtin,Black,_p10._1,_p10._2,_p10._3,_p10._4);
         } else {
            return dict;
         }
   };
   var blackish = function (t) {
      var _p11 = t;
      if (_p11.ctor === "RBNode_elm_builtin") {
            var _p12 = _p11._0;
            return _U.eq(_p12,Black) || _U.eq(_p12,BBlack);
         } else {
            return true;
         }
   };
   var blacken = function (t) {
      var _p13 = t;
      if (_p13.ctor === "RBEmpty_elm_builtin") {
            return RBEmpty_elm_builtin(LBlack);
         } else {
            return A5(RBNode_elm_builtin,Black,_p13._1,_p13._2,_p13._3,_p13._4);
         }
   };
   var Red = {ctor: "Red"};
   var moreBlack = function (color) {
      var _p14 = color;
      switch (_p14.ctor)
      {case "Black": return BBlack;
         case "Red": return Black;
         case "NBlack": return Red;
         default: return $Native$Debug.crash("Can\'t make a double black node more black!");}
   };
   var lessBlack = function (color) {
      var _p15 = color;
      switch (_p15.ctor)
      {case "BBlack": return Black;
         case "Black": return Red;
         case "Red": return NBlack;
         default: return $Native$Debug.crash("Can\'t make a negative black node less black!");}
   };
   var lessBlackTree = function (dict) {
      var _p16 = dict;
      if (_p16.ctor === "RBNode_elm_builtin") {
            return A5(RBNode_elm_builtin,lessBlack(_p16._0),_p16._1,_p16._2,_p16._3,_p16._4);
         } else {
            return RBEmpty_elm_builtin(LBlack);
         }
   };
   var balancedTree = function (col) {
      return function (xk) {
         return function (xv) {
            return function (yk) {
               return function (yv) {
                  return function (zk) {
                     return function (zv) {
                        return function (a) {
                           return function (b) {
                              return function (c) {
                                 return function (d) {
                                    return A5(RBNode_elm_builtin,
                                    lessBlack(col),
                                    yk,
                                    yv,
                                    A5(RBNode_elm_builtin,Black,xk,xv,a,b),
                                    A5(RBNode_elm_builtin,Black,zk,zv,c,d));
                                 };
                              };
                           };
                        };
                     };
                  };
               };
            };
         };
      };
   };
   var redden = function (t) {
      var _p17 = t;
      if (_p17.ctor === "RBEmpty_elm_builtin") {
            return $Native$Debug.crash("can\'t make a Leaf red");
         } else {
            return A5(RBNode_elm_builtin,Red,_p17._1,_p17._2,_p17._3,_p17._4);
         }
   };
   var balanceHelp = function (tree) {
      var _p18 = tree;
      _v31_6: do {
         _v31_5: do {
            _v31_4: do {
               _v31_3: do {
                  _v31_2: do {
                     _v31_1: do {
                        _v31_0: do {
                           if (_p18.ctor === "RBNode_elm_builtin") {
                                 if (_p18._3.ctor === "RBNode_elm_builtin") {
                                       if (_p18._4.ctor === "RBNode_elm_builtin") {
                                             switch (_p18._3._0.ctor)
                                             {case "Red": switch (_p18._4._0.ctor)
                                                  {case "Red": if (_p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Red") {
                                                             break _v31_0;
                                                          } else {
                                                             if (_p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Red") {
                                                                   break _v31_1;
                                                                } else {
                                                                   if (_p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Red") {
                                                                         break _v31_2;
                                                                      } else {
                                                                         if (_p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Red") {
                                                                               break _v31_3;
                                                                            } else {
                                                                               break _v31_6;
                                                                            }
                                                                      }
                                                                }
                                                          }
                                                     case "NBlack": if (_p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Red") {
                                                             break _v31_0;
                                                          } else {
                                                             if (_p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Red") {
                                                                   break _v31_1;
                                                                } else {
                                                                   if (_p18._0.ctor === "BBlack" && _p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Black" && _p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Black")
                                                                   {
                                                                         break _v31_4;
                                                                      } else {
                                                                         break _v31_6;
                                                                      }
                                                                }
                                                          }
                                                     default: if (_p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Red") {
                                                             break _v31_0;
                                                          } else {
                                                             if (_p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Red") {
                                                                   break _v31_1;
                                                                } else {
                                                                   break _v31_6;
                                                                }
                                                          }}
                                                case "NBlack": switch (_p18._4._0.ctor)
                                                  {case "Red": if (_p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Red") {
                                                             break _v31_2;
                                                          } else {
                                                             if (_p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Red") {
                                                                   break _v31_3;
                                                                } else {
                                                                   if (_p18._0.ctor === "BBlack" && _p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Black" && _p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Black")
                                                                   {
                                                                         break _v31_5;
                                                                      } else {
                                                                         break _v31_6;
                                                                      }
                                                                }
                                                          }
                                                     case "NBlack": if (_p18._0.ctor === "BBlack") {
                                                             if (_p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Black" && _p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Black")
                                                             {
                                                                   break _v31_4;
                                                                } else {
                                                                   if (_p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Black" && _p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Black")
                                                                   {
                                                                         break _v31_5;
                                                                      } else {
                                                                         break _v31_6;
                                                                      }
                                                                }
                                                          } else {
                                                             break _v31_6;
                                                          }
                                                     default:
                                                     if (_p18._0.ctor === "BBlack" && _p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Black" && _p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Black")
                                                       {
                                                             break _v31_5;
                                                          } else {
                                                             break _v31_6;
                                                          }}
                                                default: switch (_p18._4._0.ctor)
                                                  {case "Red": if (_p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Red") {
                                                             break _v31_2;
                                                          } else {
                                                             if (_p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Red") {
                                                                   break _v31_3;
                                                                } else {
                                                                   break _v31_6;
                                                                }
                                                          }
                                                     case "NBlack":
                                                     if (_p18._0.ctor === "BBlack" && _p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Black" && _p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Black")
                                                       {
                                                             break _v31_4;
                                                          } else {
                                                             break _v31_6;
                                                          }
                                                     default: break _v31_6;}}
                                          } else {
                                             switch (_p18._3._0.ctor)
                                             {case "Red": if (_p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Red") {
                                                        break _v31_0;
                                                     } else {
                                                        if (_p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Red") {
                                                              break _v31_1;
                                                           } else {
                                                              break _v31_6;
                                                           }
                                                     }
                                                case "NBlack":
                                                if (_p18._0.ctor === "BBlack" && _p18._3._3.ctor === "RBNode_elm_builtin" && _p18._3._3._0.ctor === "Black" && _p18._3._4.ctor === "RBNode_elm_builtin" && _p18._3._4._0.ctor === "Black")
                                                  {
                                                        break _v31_5;
                                                     } else {
                                                        break _v31_6;
                                                     }
                                                default: break _v31_6;}
                                          }
                                    } else {
                                       if (_p18._4.ctor === "RBNode_elm_builtin") {
                                             switch (_p18._4._0.ctor)
                                             {case "Red": if (_p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Red") {
                                                        break _v31_2;
                                                     } else {
                                                        if (_p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Red") {
                                                              break _v31_3;
                                                           } else {
                                                              break _v31_6;
                                                           }
                                                     }
                                                case "NBlack":
                                                if (_p18._0.ctor === "BBlack" && _p18._4._3.ctor === "RBNode_elm_builtin" && _p18._4._3._0.ctor === "Black" && _p18._4._4.ctor === "RBNode_elm_builtin" && _p18._4._4._0.ctor === "Black")
                                                  {
                                                        break _v31_4;
                                                     } else {
                                                        break _v31_6;
                                                     }
                                                default: break _v31_6;}
                                          } else {
                                             break _v31_6;
                                          }
                                    }
                              } else {
                                 break _v31_6;
                              }
                        } while (false);
                        return balancedTree(_p18._0)(_p18._3._3._1)(_p18._3._3._2)(_p18._3._1)(_p18._3._2)(_p18._1)(_p18._2)(_p18._3._3._3)(_p18._3._3._4)(_p18._3._4)(_p18._4);
                     } while (false);
                     return balancedTree(_p18._0)(_p18._3._1)(_p18._3._2)(_p18._3._4._1)(_p18._3._4._2)(_p18._1)(_p18._2)(_p18._3._3)(_p18._3._4._3)(_p18._3._4._4)(_p18._4);
                  } while (false);
                  return balancedTree(_p18._0)(_p18._1)(_p18._2)(_p18._4._3._1)(_p18._4._3._2)(_p18._4._1)(_p18._4._2)(_p18._3)(_p18._4._3._3)(_p18._4._3._4)(_p18._4._4);
               } while (false);
               return balancedTree(_p18._0)(_p18._1)(_p18._2)(_p18._4._1)(_p18._4._2)(_p18._4._4._1)(_p18._4._4._2)(_p18._3)(_p18._4._3)(_p18._4._4._3)(_p18._4._4._4);
            } while (false);
            return A5(RBNode_elm_builtin,
            Black,
            _p18._4._3._1,
            _p18._4._3._2,
            A5(RBNode_elm_builtin,Black,_p18._1,_p18._2,_p18._3,_p18._4._3._3),
            A5(balance,Black,_p18._4._1,_p18._4._2,_p18._4._3._4,redden(_p18._4._4)));
         } while (false);
         return A5(RBNode_elm_builtin,
         Black,
         _p18._3._4._1,
         _p18._3._4._2,
         A5(balance,Black,_p18._3._1,_p18._3._2,redden(_p18._3._3),_p18._3._4._3),
         A5(RBNode_elm_builtin,Black,_p18._1,_p18._2,_p18._3._4._4,_p18._4));
      } while (false);
      return tree;
   };
   var balance = F5(function (c,k,v,l,r) {    var tree = A5(RBNode_elm_builtin,c,k,v,l,r);return blackish(tree) ? balanceHelp(tree) : tree;});
   var bubble = F5(function (c,k,v,l,r) {
      return isBBlack(l) || isBBlack(r) ? A5(balance,moreBlack(c),k,v,lessBlackTree(l),lessBlackTree(r)) : A5(RBNode_elm_builtin,c,k,v,l,r);
   });
   var removeMax = F5(function (c,k,v,l,r) {
      var _p19 = r;
      if (_p19.ctor === "RBEmpty_elm_builtin") {
            return A3(rem,c,l,r);
         } else {
            return A5(bubble,c,k,v,l,A5(removeMax,_p19._0,_p19._1,_p19._2,_p19._3,_p19._4));
         }
   });
   var rem = F3(function (c,l,r) {
      var _p20 = {ctor: "_Tuple2",_0: l,_1: r};
      if (_p20._0.ctor === "RBEmpty_elm_builtin") {
            if (_p20._1.ctor === "RBEmpty_elm_builtin") {
                  var _p21 = c;
                  switch (_p21.ctor)
                  {case "Red": return RBEmpty_elm_builtin(LBlack);
                     case "Black": return RBEmpty_elm_builtin(LBBlack);
                     default: return $Native$Debug.crash("cannot have bblack or nblack nodes at this point");}
               } else {
                  var _p24 = _p20._1._0;
                  var _p23 = _p20._0._0;
                  var _p22 = {ctor: "_Tuple3",_0: c,_1: _p23,_2: _p24};
                  if (_p22.ctor === "_Tuple3" && _p22._0.ctor === "Black" && _p22._1.ctor === "LBlack" && _p22._2.ctor === "Red") {
                        return A5(RBNode_elm_builtin,Black,_p20._1._1,_p20._1._2,_p20._1._3,_p20._1._4);
                     } else {
                        return A4(reportRemBug,"Black/LBlack/Red",c,$Basics.toString(_p23),$Basics.toString(_p24));
                     }
               }
         } else {
            if (_p20._1.ctor === "RBEmpty_elm_builtin") {
                  var _p27 = _p20._1._0;
                  var _p26 = _p20._0._0;
                  var _p25 = {ctor: "_Tuple3",_0: c,_1: _p26,_2: _p27};
                  if (_p25.ctor === "_Tuple3" && _p25._0.ctor === "Black" && _p25._1.ctor === "Red" && _p25._2.ctor === "LBlack") {
                        return A5(RBNode_elm_builtin,Black,_p20._0._1,_p20._0._2,_p20._0._3,_p20._0._4);
                     } else {
                        return A4(reportRemBug,"Black/Red/LBlack",c,$Basics.toString(_p26),$Basics.toString(_p27));
                     }
               } else {
                  var _p31 = _p20._0._2;
                  var _p30 = _p20._0._4;
                  var _p29 = _p20._0._1;
                  var l$ = A5(removeMax,_p20._0._0,_p29,_p31,_p20._0._3,_p30);
                  var _p28 = A3(maxWithDefault,_p29,_p31,_p30);
                  var k = _p28._0;
                  var v = _p28._1;
                  return A5(bubble,c,k,v,l$,r);
               }
         }
   });
   var update = F3(function (k,alter,dict) {
      var up = function (dict) {
         var _p32 = dict;
         if (_p32.ctor === "RBEmpty_elm_builtin") {
               var _p33 = alter($Maybe.Nothing);
               if (_p33.ctor === "Nothing") {
                     return {ctor: "_Tuple2",_0: Same,_1: empty};
                  } else {
                     return {ctor: "_Tuple2",_0: Insert,_1: A5(RBNode_elm_builtin,Red,k,_p33._0,empty,empty)};
                  }
            } else {
               var _p44 = _p32._2;
               var _p43 = _p32._4;
               var _p42 = _p32._3;
               var _p41 = _p32._1;
               var _p40 = _p32._0;
               var _p34 = A2($Basics.compare,k,_p41);
               switch (_p34.ctor)
               {case "EQ": var _p35 = alter($Maybe.Just(_p44));
                    if (_p35.ctor === "Nothing") {
                          return {ctor: "_Tuple2",_0: Remove,_1: A3(rem,_p40,_p42,_p43)};
                       } else {
                          return {ctor: "_Tuple2",_0: Same,_1: A5(RBNode_elm_builtin,_p40,_p41,_p35._0,_p42,_p43)};
                       }
                  case "LT": var _p36 = up(_p42);
                    var flag = _p36._0;
                    var newLeft = _p36._1;
                    var _p37 = flag;
                    switch (_p37.ctor)
                    {case "Same": return {ctor: "_Tuple2",_0: Same,_1: A5(RBNode_elm_builtin,_p40,_p41,_p44,newLeft,_p43)};
                       case "Insert": return {ctor: "_Tuple2",_0: Insert,_1: A5(balance,_p40,_p41,_p44,newLeft,_p43)};
                       default: return {ctor: "_Tuple2",_0: Remove,_1: A5(bubble,_p40,_p41,_p44,newLeft,_p43)};}
                  default: var _p38 = up(_p43);
                    var flag = _p38._0;
                    var newRight = _p38._1;
                    var _p39 = flag;
                    switch (_p39.ctor)
                    {case "Same": return {ctor: "_Tuple2",_0: Same,_1: A5(RBNode_elm_builtin,_p40,_p41,_p44,_p42,newRight)};
                       case "Insert": return {ctor: "_Tuple2",_0: Insert,_1: A5(balance,_p40,_p41,_p44,_p42,newRight)};
                       default: return {ctor: "_Tuple2",_0: Remove,_1: A5(bubble,_p40,_p41,_p44,_p42,newRight)};}}
            }
      };
      var _p45 = up(dict);
      var flag = _p45._0;
      var updatedDict = _p45._1;
      var _p46 = flag;
      switch (_p46.ctor)
      {case "Same": return updatedDict;
         case "Insert": return ensureBlackRoot(updatedDict);
         default: return blacken(updatedDict);}
   });
   var insert = F3(function (key,value,dict) {    return A3(update,key,$Basics.always($Maybe.Just(value)),dict);});
   var singleton = F2(function (key,value) {    return A3(insert,key,value,empty);});
   var union = F2(function (t1,t2) {    return A3(foldl,insert,t2,t1);});
   var fromList = function (assocs) {
      return A3($List.foldl,F2(function (_p47,dict) {    var _p48 = _p47;return A3(insert,_p48._0,_p48._1,dict);}),empty,assocs);
   };
   var filter = F2(function (predicate,dictionary) {
      var add = F3(function (key,value,dict) {    return A2(predicate,key,value) ? A3(insert,key,value,dict) : dict;});
      return A3(foldl,add,empty,dictionary);
   });
   var intersect = F2(function (t1,t2) {    return A2(filter,F2(function (k,_p49) {    return A2(member,k,t2);}),t1);});
   var partition = F2(function (predicate,dict) {
      var add = F3(function (key,value,_p50) {
         var _p51 = _p50;
         var _p53 = _p51._1;
         var _p52 = _p51._0;
         return A2(predicate,key,value) ? {ctor: "_Tuple2",_0: A3(insert,key,value,_p52),_1: _p53} : {ctor: "_Tuple2",_0: _p52,_1: A3(insert,key,value,_p53)};
      });
      return A3(foldl,add,{ctor: "_Tuple2",_0: empty,_1: empty},dict);
   });
   var remove = F2(function (key,dict) {    return A3(update,key,$Basics.always($Maybe.Nothing),dict);});
   var diff = F2(function (t1,t2) {    return A3(foldl,F3(function (k,v,t) {    return A2(remove,k,t);}),t1,t2);});
   return _elm.Dict.values = {_op: _op
                             ,empty: empty
                             ,singleton: singleton
                             ,insert: insert
                             ,update: update
                             ,isEmpty: isEmpty
                             ,get: get
                             ,remove: remove
                             ,member: member
                             ,size: size
                             ,filter: filter
                             ,partition: partition
                             ,foldl: foldl
                             ,foldr: foldr
                             ,map: map
                             ,union: union
                             ,intersect: intersect
                             ,diff: diff
                             ,keys: keys
                             ,values: values
                             ,toList: toList
                             ,fromList: fromList};
};
Elm.Json = Elm.Json || {};
Elm.Json.Encode = Elm.Json.Encode || {};
Elm.Json.Encode.make = function (_elm) {
   "use strict";
   _elm.Json = _elm.Json || {};
   _elm.Json.Encode = _elm.Json.Encode || {};
   if (_elm.Json.Encode.values) return _elm.Json.Encode.values;
   var _U = Elm.Native.Utils.make(_elm),$Array = Elm.Array.make(_elm),$Native$Json = Elm.Native.Json.make(_elm);
   var _op = {};
   var list = $Native$Json.encodeList;
   var array = $Native$Json.encodeArray;
   var object = $Native$Json.encodeObject;
   var $null = $Native$Json.encodeNull;
   var bool = $Native$Json.identity;
   var $float = $Native$Json.identity;
   var $int = $Native$Json.identity;
   var string = $Native$Json.identity;
   var encode = $Native$Json.encode;
   var Value = {ctor: "Value"};
   return _elm.Json.Encode.values = {_op: _op
                                    ,encode: encode
                                    ,string: string
                                    ,$int: $int
                                    ,$float: $float
                                    ,bool: bool
                                    ,$null: $null
                                    ,list: list
                                    ,array: array
                                    ,object: object};
};
Elm.Json = Elm.Json || {};
Elm.Json.Decode = Elm.Json.Decode || {};
Elm.Json.Decode.make = function (_elm) {
   "use strict";
   _elm.Json = _elm.Json || {};
   _elm.Json.Decode = _elm.Json.Decode || {};
   if (_elm.Json.Decode.values) return _elm.Json.Decode.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Array = Elm.Array.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Json$Encode = Elm.Json.Encode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Json = Elm.Native.Json.make(_elm),
   $Result = Elm.Result.make(_elm);
   var _op = {};
   var tuple8 = $Native$Json.decodeTuple8;
   var tuple7 = $Native$Json.decodeTuple7;
   var tuple6 = $Native$Json.decodeTuple6;
   var tuple5 = $Native$Json.decodeTuple5;
   var tuple4 = $Native$Json.decodeTuple4;
   var tuple3 = $Native$Json.decodeTuple3;
   var tuple2 = $Native$Json.decodeTuple2;
   var tuple1 = $Native$Json.decodeTuple1;
   var succeed = $Native$Json.succeed;
   var fail = $Native$Json.fail;
   var andThen = $Native$Json.andThen;
   var customDecoder = $Native$Json.customDecoder;
   var decodeValue = $Native$Json.runDecoderValue;
   var value = $Native$Json.decodeValue;
   var maybe = $Native$Json.decodeMaybe;
   var $null = $Native$Json.decodeNull;
   var array = $Native$Json.decodeArray;
   var list = $Native$Json.decodeList;
   var bool = $Native$Json.decodeBool;
   var $int = $Native$Json.decodeInt;
   var $float = $Native$Json.decodeFloat;
   var string = $Native$Json.decodeString;
   var oneOf = $Native$Json.oneOf;
   var keyValuePairs = $Native$Json.decodeKeyValuePairs;
   var object8 = $Native$Json.decodeObject8;
   var object7 = $Native$Json.decodeObject7;
   var object6 = $Native$Json.decodeObject6;
   var object5 = $Native$Json.decodeObject5;
   var object4 = $Native$Json.decodeObject4;
   var object3 = $Native$Json.decodeObject3;
   var object2 = $Native$Json.decodeObject2;
   var object1 = $Native$Json.decodeObject1;
   _op[":="] = $Native$Json.decodeField;
   var at = F2(function (fields,decoder) {    return A3($List.foldr,F2(function (x,y) {    return A2(_op[":="],x,y);}),decoder,fields);});
   var decodeString = $Native$Json.runDecoderString;
   var map = $Native$Json.decodeObject1;
   var dict = function (decoder) {    return A2(map,$Dict.fromList,keyValuePairs(decoder));};
   var Decoder = {ctor: "Decoder"};
   return _elm.Json.Decode.values = {_op: _op
                                    ,decodeString: decodeString
                                    ,decodeValue: decodeValue
                                    ,string: string
                                    ,$int: $int
                                    ,$float: $float
                                    ,bool: bool
                                    ,$null: $null
                                    ,list: list
                                    ,array: array
                                    ,tuple1: tuple1
                                    ,tuple2: tuple2
                                    ,tuple3: tuple3
                                    ,tuple4: tuple4
                                    ,tuple5: tuple5
                                    ,tuple6: tuple6
                                    ,tuple7: tuple7
                                    ,tuple8: tuple8
                                    ,at: at
                                    ,object1: object1
                                    ,object2: object2
                                    ,object3: object3
                                    ,object4: object4
                                    ,object5: object5
                                    ,object6: object6
                                    ,object7: object7
                                    ,object8: object8
                                    ,keyValuePairs: keyValuePairs
                                    ,dict: dict
                                    ,maybe: maybe
                                    ,oneOf: oneOf
                                    ,map: map
                                    ,fail: fail
                                    ,succeed: succeed
                                    ,andThen: andThen
                                    ,value: value
                                    ,customDecoder: customDecoder};
};
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":1}],3:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],4:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],5:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":13,"is-object":3}],6:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":11,"../vnode/is-vnode.js":14,"../vnode/is-vtext.js":15,"../vnode/is-widget.js":16,"./apply-properties":5,"global/document":2}],7:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],8:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":16,"../vnode/vpatch.js":19,"./apply-properties":5,"./create-element":6,"./update-widget":10}],9:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches) {
    return patchRecursive(rootNode, patches)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions) {
        renderOptions = { patch: patchRecursive }
        if (ownerDocument !== document) {
            renderOptions.document = ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":7,"./patch-op":8,"global/document":2,"x-is-array":4}],10:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":16}],11:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":12,"./is-vnode":14,"./is-vtext":15,"./is-widget":16}],12:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],13:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],14:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":17}],15:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":17}],16:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],17:[function(require,module,exports){
module.exports = "2"

},{}],18:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":12,"./is-vhook":13,"./is-vnode":14,"./is-widget":16,"./version":17}],19:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":17}],20:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":17}],21:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":13,"is-object":3}],22:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free,     // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":11,"../vnode/is-thunk":12,"../vnode/is-vnode":14,"../vnode/is-vtext":15,"../vnode/is-widget":16,"../vnode/vpatch":19,"./diff-props":21,"x-is-array":4}],23:[function(require,module,exports){
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var diff = require('virtual-dom/vtree/diff');
var patch = require('virtual-dom/vdom/patch');
var createElement = require('virtual-dom/vdom/create-element');
var isHook = require("virtual-dom/vnode/is-vhook");


Elm.Native.VirtualDom = {};
Elm.Native.VirtualDom.make = function(elm)
{
	elm.Native = elm.Native || {};
	elm.Native.VirtualDom = elm.Native.VirtualDom || {};
	if (elm.Native.VirtualDom.values)
	{
		return elm.Native.VirtualDom.values;
	}

	var Element = Elm.Native.Graphics.Element.make(elm);
	var Json = Elm.Native.Json.make(elm);
	var List = Elm.Native.List.make(elm);
	var Signal = Elm.Native.Signal.make(elm);
	var Utils = Elm.Native.Utils.make(elm);

	var ATTRIBUTE_KEY = 'UniqueNameThatOthersAreVeryUnlikelyToUse';



	// VIRTUAL DOM NODES


	function text(string)
	{
		return new VText(string);
	}

	function node(name)
	{
		return F2(function(propertyList, contents) {
			return makeNode(name, propertyList, contents);
		});
	}


	// BUILD VIRTUAL DOME NODES


	function makeNode(name, propertyList, contents)
	{
		var props = listToProperties(propertyList);

		var key, namespace;
		// support keys
		if (props.key !== undefined)
		{
			key = props.key;
			props.key = undefined;
		}

		// support namespace
		if (props.namespace !== undefined)
		{
			namespace = props.namespace;
			props.namespace = undefined;
		}

		// ensure that setting text of an input does not move the cursor
		var useSoftSet =
			(name === 'input' || name === 'textarea')
			&& props.value !== undefined
			&& !isHook(props.value);

		if (useSoftSet)
		{
			props.value = SoftSetHook(props.value);
		}

		return new VNode(name, props, List.toArray(contents), key, namespace);
	}

	function listToProperties(list)
	{
		var object = {};
		while (list.ctor !== '[]')
		{
			var entry = list._0;
			if (entry.key === ATTRIBUTE_KEY)
			{
				object.attributes = object.attributes || {};
				object.attributes[entry.value.attrKey] = entry.value.attrValue;
			}
			else
			{
				object[entry.key] = entry.value;
			}
			list = list._1;
		}
		return object;
	}



	// PROPERTIES AND ATTRIBUTES


	function property(key, value)
	{
		return {
			key: key,
			value: value
		};
	}

	function attribute(key, value)
	{
		return {
			key: ATTRIBUTE_KEY,
			value: {
				attrKey: key,
				attrValue: value
			}
		};
	}



	// NAMESPACED ATTRIBUTES


	function attributeNS(namespace, key, value)
	{
		return {
			key: key,
			value: new AttributeHook(namespace, key, value)
		};
	}

	function AttributeHook(namespace, key, value)
	{
		if (!(this instanceof AttributeHook))
		{
			return new AttributeHook(namespace, key, value);
		}

		this.namespace = namespace;
		this.key = key;
		this.value = value;
	}

	AttributeHook.prototype.hook = function (node, prop, prev)
	{
		if (prev
			&& prev.type === 'AttributeHook'
			&& prev.value === this.value
			&& prev.namespace === this.namespace)
		{
			return;
		}

		node.setAttributeNS(this.namespace, prop, this.value);
	};

	AttributeHook.prototype.unhook = function (node, prop, next)
	{
		if (next
			&& next.type === 'AttributeHook'
			&& next.namespace === this.namespace)
		{
			return;
		}

		node.removeAttributeNS(this.namespace, this.key);
	};

	AttributeHook.prototype.type = 'AttributeHook';



	// EVENTS


	function on(name, options, decoder, createMessage)
	{
		function eventHandler(event)
		{
			var value = A2(Json.runDecoderValue, decoder, event);
			if (value.ctor === 'Ok')
			{
				if (options.stopPropagation)
				{
					event.stopPropagation();
				}
				if (options.preventDefault)
				{
					event.preventDefault();
				}
				Signal.sendMessage(createMessage(value._0));
			}
		}
		return property('on' + name, eventHandler);
	}

	function SoftSetHook(value)
	{
		if (!(this instanceof SoftSetHook))
		{
			return new SoftSetHook(value);
		}

		this.value = value;
	}

	SoftSetHook.prototype.hook = function (node, propertyName)
	{
		if (node[propertyName] !== this.value)
		{
			node[propertyName] = this.value;
		}
	};



	// INTEGRATION WITH ELEMENTS


	function ElementWidget(element)
	{
		this.element = element;
	}

	ElementWidget.prototype.type = "Widget";

	ElementWidget.prototype.init = function init()
	{
		return Element.render(this.element);
	};

	ElementWidget.prototype.update = function update(previous, node)
	{
		return Element.update(node, previous.element, this.element);
	};

	function fromElement(element)
	{
		return new ElementWidget(element);
	}

	function toElement(width, height, html)
	{
		return A3(Element.newElement, width, height, {
			ctor: 'Custom',
			type: 'evancz/elm-html',
			render: render,
			update: update,
			model: html
		});
	}



	// RENDER AND UPDATE


	function render(model)
	{
		var element = Element.createNode('div');
		element.appendChild(createElement(model));
		return element;
	}

	function update(node, oldModel, newModel)
	{
		updateAndReplace(node.firstChild, oldModel, newModel);
		return node;
	}

	function updateAndReplace(node, oldModel, newModel)
	{
		var patches = diff(oldModel, newModel);
		var newNode = patch(node, patches);
		return newNode;
	}



	// LAZINESS


	function lazyRef(fn, a)
	{
		function thunk()
		{
			return fn(a);
		}
		return new Thunk(fn, [a], thunk);
	}

	function lazyRef2(fn, a, b)
	{
		function thunk()
		{
			return A2(fn, a, b);
		}
		return new Thunk(fn, [a,b], thunk);
	}

	function lazyRef3(fn, a, b, c)
	{
		function thunk()
		{
			return A3(fn, a, b, c);
		}
		return new Thunk(fn, [a,b,c], thunk);
	}

	function Thunk(fn, args, thunk)
	{
		/* public (used by VirtualDom.js) */
		this.vnode = null;
		this.key = undefined;

		/* private */
		this.fn = fn;
		this.args = args;
		this.thunk = thunk;
	}

	Thunk.prototype.type = "Thunk";
	Thunk.prototype.render = renderThunk;

	function shouldUpdate(current, previous)
	{
		if (current.fn !== previous.fn)
		{
			return true;
		}

		// if it's the same function, we know the number of args must match
		var cargs = current.args;
		var pargs = previous.args;

		for (var i = cargs.length; i--; )
		{
			if (cargs[i] !== pargs[i])
			{
				return true;
			}
		}

		return false;
	}

	function renderThunk(previous)
	{
		if (previous == null || shouldUpdate(this, previous))
		{
			return this.thunk();
		}
		else
		{
			return previous.vnode;
		}
	}


	return elm.Native.VirtualDom.values = Elm.Native.VirtualDom.values = {
		node: node,
		text: text,
		on: F4(on),

		property: F2(property),
		attribute: F2(attribute),
		attributeNS: F3(attributeNS),

		lazy: F2(lazyRef),
		lazy2: F3(lazyRef2),
		lazy3: F4(lazyRef3),

		toElement: F3(toElement),
		fromElement: fromElement,

		render: createElement,
		updateAndReplace: updateAndReplace
	};
};

},{"virtual-dom/vdom/create-element":6,"virtual-dom/vdom/patch":9,"virtual-dom/vnode/is-vhook":13,"virtual-dom/vnode/vnode":18,"virtual-dom/vnode/vtext":20,"virtual-dom/vtree/diff":22}]},{},[23]);

Elm.VirtualDom = Elm.VirtualDom || {};
Elm.VirtualDom.make = function (_elm) {
   "use strict";
   _elm.VirtualDom = _elm.VirtualDom || {};
   if (_elm.VirtualDom.values) return _elm.VirtualDom.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$VirtualDom = Elm.Native.VirtualDom.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var lazy3 = $Native$VirtualDom.lazy3;
   var lazy2 = $Native$VirtualDom.lazy2;
   var lazy = $Native$VirtualDom.lazy;
   var defaultOptions = {stopPropagation: false,preventDefault: false};
   var Options = F2(function (a,b) {    return {stopPropagation: a,preventDefault: b};});
   var onWithOptions = $Native$VirtualDom.on;
   var on = F3(function (eventName,decoder,toMessage) {    return A4($Native$VirtualDom.on,eventName,defaultOptions,decoder,toMessage);});
   var attributeNS = $Native$VirtualDom.attributeNS;
   var attribute = $Native$VirtualDom.attribute;
   var property = $Native$VirtualDom.property;
   var Property = {ctor: "Property"};
   var fromElement = $Native$VirtualDom.fromElement;
   var toElement = $Native$VirtualDom.toElement;
   var text = $Native$VirtualDom.text;
   var node = $Native$VirtualDom.node;
   var Node = {ctor: "Node"};
   return _elm.VirtualDom.values = {_op: _op
                                   ,text: text
                                   ,node: node
                                   ,toElement: toElement
                                   ,fromElement: fromElement
                                   ,property: property
                                   ,attribute: attribute
                                   ,attributeNS: attributeNS
                                   ,on: on
                                   ,onWithOptions: onWithOptions
                                   ,defaultOptions: defaultOptions
                                   ,lazy: lazy
                                   ,lazy2: lazy2
                                   ,lazy3: lazy3
                                   ,Options: Options};
};
Elm.Html = Elm.Html || {};
Elm.Html.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   if (_elm.Html.values) return _elm.Html.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $VirtualDom = Elm.VirtualDom.make(_elm);
   var _op = {};
   var fromElement = $VirtualDom.fromElement;
   var toElement = $VirtualDom.toElement;
   var text = $VirtualDom.text;
   var node = $VirtualDom.node;
   var body = node("body");
   var section = node("section");
   var nav = node("nav");
   var article = node("article");
   var aside = node("aside");
   var h1 = node("h1");
   var h2 = node("h2");
   var h3 = node("h3");
   var h4 = node("h4");
   var h5 = node("h5");
   var h6 = node("h6");
   var header = node("header");
   var footer = node("footer");
   var address = node("address");
   var main$ = node("main");
   var p = node("p");
   var hr = node("hr");
   var pre = node("pre");
   var blockquote = node("blockquote");
   var ol = node("ol");
   var ul = node("ul");
   var li = node("li");
   var dl = node("dl");
   var dt = node("dt");
   var dd = node("dd");
   var figure = node("figure");
   var figcaption = node("figcaption");
   var div = node("div");
   var a = node("a");
   var em = node("em");
   var strong = node("strong");
   var small = node("small");
   var s = node("s");
   var cite = node("cite");
   var q = node("q");
   var dfn = node("dfn");
   var abbr = node("abbr");
   var time = node("time");
   var code = node("code");
   var $var = node("var");
   var samp = node("samp");
   var kbd = node("kbd");
   var sub = node("sub");
   var sup = node("sup");
   var i = node("i");
   var b = node("b");
   var u = node("u");
   var mark = node("mark");
   var ruby = node("ruby");
   var rt = node("rt");
   var rp = node("rp");
   var bdi = node("bdi");
   var bdo = node("bdo");
   var span = node("span");
   var br = node("br");
   var wbr = node("wbr");
   var ins = node("ins");
   var del = node("del");
   var img = node("img");
   var iframe = node("iframe");
   var embed = node("embed");
   var object = node("object");
   var param = node("param");
   var video = node("video");
   var audio = node("audio");
   var source = node("source");
   var track = node("track");
   var canvas = node("canvas");
   var svg = node("svg");
   var math = node("math");
   var table = node("table");
   var caption = node("caption");
   var colgroup = node("colgroup");
   var col = node("col");
   var tbody = node("tbody");
   var thead = node("thead");
   var tfoot = node("tfoot");
   var tr = node("tr");
   var td = node("td");
   var th = node("th");
   var form = node("form");
   var fieldset = node("fieldset");
   var legend = node("legend");
   var label = node("label");
   var input = node("input");
   var button = node("button");
   var select = node("select");
   var datalist = node("datalist");
   var optgroup = node("optgroup");
   var option = node("option");
   var textarea = node("textarea");
   var keygen = node("keygen");
   var output = node("output");
   var progress = node("progress");
   var meter = node("meter");
   var details = node("details");
   var summary = node("summary");
   var menuitem = node("menuitem");
   var menu = node("menu");
   return _elm.Html.values = {_op: _op
                             ,node: node
                             ,text: text
                             ,toElement: toElement
                             ,fromElement: fromElement
                             ,body: body
                             ,section: section
                             ,nav: nav
                             ,article: article
                             ,aside: aside
                             ,h1: h1
                             ,h2: h2
                             ,h3: h3
                             ,h4: h4
                             ,h5: h5
                             ,h6: h6
                             ,header: header
                             ,footer: footer
                             ,address: address
                             ,main$: main$
                             ,p: p
                             ,hr: hr
                             ,pre: pre
                             ,blockquote: blockquote
                             ,ol: ol
                             ,ul: ul
                             ,li: li
                             ,dl: dl
                             ,dt: dt
                             ,dd: dd
                             ,figure: figure
                             ,figcaption: figcaption
                             ,div: div
                             ,a: a
                             ,em: em
                             ,strong: strong
                             ,small: small
                             ,s: s
                             ,cite: cite
                             ,q: q
                             ,dfn: dfn
                             ,abbr: abbr
                             ,time: time
                             ,code: code
                             ,$var: $var
                             ,samp: samp
                             ,kbd: kbd
                             ,sub: sub
                             ,sup: sup
                             ,i: i
                             ,b: b
                             ,u: u
                             ,mark: mark
                             ,ruby: ruby
                             ,rt: rt
                             ,rp: rp
                             ,bdi: bdi
                             ,bdo: bdo
                             ,span: span
                             ,br: br
                             ,wbr: wbr
                             ,ins: ins
                             ,del: del
                             ,img: img
                             ,iframe: iframe
                             ,embed: embed
                             ,object: object
                             ,param: param
                             ,video: video
                             ,audio: audio
                             ,source: source
                             ,track: track
                             ,canvas: canvas
                             ,svg: svg
                             ,math: math
                             ,table: table
                             ,caption: caption
                             ,colgroup: colgroup
                             ,col: col
                             ,tbody: tbody
                             ,thead: thead
                             ,tfoot: tfoot
                             ,tr: tr
                             ,td: td
                             ,th: th
                             ,form: form
                             ,fieldset: fieldset
                             ,legend: legend
                             ,label: label
                             ,input: input
                             ,button: button
                             ,select: select
                             ,datalist: datalist
                             ,optgroup: optgroup
                             ,option: option
                             ,textarea: textarea
                             ,keygen: keygen
                             ,output: output
                             ,progress: progress
                             ,meter: meter
                             ,details: details
                             ,summary: summary
                             ,menuitem: menuitem
                             ,menu: menu};
};
Elm.Html = Elm.Html || {};
Elm.Html.Attributes = Elm.Html.Attributes || {};
Elm.Html.Attributes.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Attributes = _elm.Html.Attributes || {};
   if (_elm.Html.Attributes.values) return _elm.Html.Attributes.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Json$Encode = Elm.Json.Encode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $VirtualDom = Elm.VirtualDom.make(_elm);
   var _op = {};
   var attribute = $VirtualDom.attribute;
   var contextmenu = function (value) {    return A2(attribute,"contextmenu",value);};
   var property = $VirtualDom.property;
   var stringProperty = F2(function (name,string) {    return A2(property,name,$Json$Encode.string(string));});
   var $class = function (name) {    return A2(stringProperty,"className",name);};
   var id = function (name) {    return A2(stringProperty,"id",name);};
   var title = function (name) {    return A2(stringProperty,"title",name);};
   var accesskey = function ($char) {    return A2(stringProperty,"accessKey",$String.fromChar($char));};
   var dir = function (value) {    return A2(stringProperty,"dir",value);};
   var draggable = function (value) {    return A2(stringProperty,"draggable",value);};
   var dropzone = function (value) {    return A2(stringProperty,"dropzone",value);};
   var itemprop = function (value) {    return A2(stringProperty,"itemprop",value);};
   var lang = function (value) {    return A2(stringProperty,"lang",value);};
   var tabindex = function (n) {    return A2(stringProperty,"tabIndex",$Basics.toString(n));};
   var charset = function (value) {    return A2(stringProperty,"charset",value);};
   var content = function (value) {    return A2(stringProperty,"content",value);};
   var httpEquiv = function (value) {    return A2(stringProperty,"httpEquiv",value);};
   var language = function (value) {    return A2(stringProperty,"language",value);};
   var src = function (value) {    return A2(stringProperty,"src",value);};
   var height = function (value) {    return A2(stringProperty,"height",$Basics.toString(value));};
   var width = function (value) {    return A2(stringProperty,"width",$Basics.toString(value));};
   var alt = function (value) {    return A2(stringProperty,"alt",value);};
   var preload = function (value) {    return A2(stringProperty,"preload",value);};
   var poster = function (value) {    return A2(stringProperty,"poster",value);};
   var kind = function (value) {    return A2(stringProperty,"kind",value);};
   var srclang = function (value) {    return A2(stringProperty,"srclang",value);};
   var sandbox = function (value) {    return A2(stringProperty,"sandbox",value);};
   var srcdoc = function (value) {    return A2(stringProperty,"srcdoc",value);};
   var type$ = function (value) {    return A2(stringProperty,"type",value);};
   var value = function (value) {    return A2(stringProperty,"value",value);};
   var placeholder = function (value) {    return A2(stringProperty,"placeholder",value);};
   var accept = function (value) {    return A2(stringProperty,"accept",value);};
   var acceptCharset = function (value) {    return A2(stringProperty,"acceptCharset",value);};
   var action = function (value) {    return A2(stringProperty,"action",value);};
   var autocomplete = function (bool) {    return A2(stringProperty,"autocomplete",bool ? "on" : "off");};
   var autosave = function (value) {    return A2(stringProperty,"autosave",value);};
   var enctype = function (value) {    return A2(stringProperty,"enctype",value);};
   var formaction = function (value) {    return A2(stringProperty,"formAction",value);};
   var list = function (value) {    return A2(stringProperty,"list",value);};
   var minlength = function (n) {    return A2(stringProperty,"minLength",$Basics.toString(n));};
   var maxlength = function (n) {    return A2(stringProperty,"maxLength",$Basics.toString(n));};
   var method = function (value) {    return A2(stringProperty,"method",value);};
   var name = function (value) {    return A2(stringProperty,"name",value);};
   var pattern = function (value) {    return A2(stringProperty,"pattern",value);};
   var size = function (n) {    return A2(stringProperty,"size",$Basics.toString(n));};
   var $for = function (value) {    return A2(stringProperty,"htmlFor",value);};
   var form = function (value) {    return A2(stringProperty,"form",value);};
   var max = function (value) {    return A2(stringProperty,"max",value);};
   var min = function (value) {    return A2(stringProperty,"min",value);};
   var step = function (n) {    return A2(stringProperty,"step",n);};
   var cols = function (n) {    return A2(stringProperty,"cols",$Basics.toString(n));};
   var rows = function (n) {    return A2(stringProperty,"rows",$Basics.toString(n));};
   var wrap = function (value) {    return A2(stringProperty,"wrap",value);};
   var usemap = function (value) {    return A2(stringProperty,"useMap",value);};
   var shape = function (value) {    return A2(stringProperty,"shape",value);};
   var coords = function (value) {    return A2(stringProperty,"coords",value);};
   var challenge = function (value) {    return A2(stringProperty,"challenge",value);};
   var keytype = function (value) {    return A2(stringProperty,"keytype",value);};
   var align = function (value) {    return A2(stringProperty,"align",value);};
   var cite = function (value) {    return A2(stringProperty,"cite",value);};
   var href = function (value) {    return A2(stringProperty,"href",value);};
   var target = function (value) {    return A2(stringProperty,"target",value);};
   var downloadAs = function (value) {    return A2(stringProperty,"download",value);};
   var hreflang = function (value) {    return A2(stringProperty,"hreflang",value);};
   var media = function (value) {    return A2(stringProperty,"media",value);};
   var ping = function (value) {    return A2(stringProperty,"ping",value);};
   var rel = function (value) {    return A2(stringProperty,"rel",value);};
   var datetime = function (value) {    return A2(stringProperty,"datetime",value);};
   var pubdate = function (value) {    return A2(stringProperty,"pubdate",value);};
   var start = function (n) {    return A2(stringProperty,"start",$Basics.toString(n));};
   var colspan = function (n) {    return A2(stringProperty,"colSpan",$Basics.toString(n));};
   var headers = function (value) {    return A2(stringProperty,"headers",value);};
   var rowspan = function (n) {    return A2(stringProperty,"rowSpan",$Basics.toString(n));};
   var scope = function (value) {    return A2(stringProperty,"scope",value);};
   var manifest = function (value) {    return A2(stringProperty,"manifest",value);};
   var boolProperty = F2(function (name,bool) {    return A2(property,name,$Json$Encode.bool(bool));});
   var hidden = function (bool) {    return A2(boolProperty,"hidden",bool);};
   var contenteditable = function (bool) {    return A2(boolProperty,"contentEditable",bool);};
   var spellcheck = function (bool) {    return A2(boolProperty,"spellcheck",bool);};
   var async = function (bool) {    return A2(boolProperty,"async",bool);};
   var defer = function (bool) {    return A2(boolProperty,"defer",bool);};
   var scoped = function (bool) {    return A2(boolProperty,"scoped",bool);};
   var autoplay = function (bool) {    return A2(boolProperty,"autoplay",bool);};
   var controls = function (bool) {    return A2(boolProperty,"controls",bool);};
   var loop = function (bool) {    return A2(boolProperty,"loop",bool);};
   var $default = function (bool) {    return A2(boolProperty,"default",bool);};
   var seamless = function (bool) {    return A2(boolProperty,"seamless",bool);};
   var checked = function (bool) {    return A2(boolProperty,"checked",bool);};
   var selected = function (bool) {    return A2(boolProperty,"selected",bool);};
   var autofocus = function (bool) {    return A2(boolProperty,"autofocus",bool);};
   var disabled = function (bool) {    return A2(boolProperty,"disabled",bool);};
   var multiple = function (bool) {    return A2(boolProperty,"multiple",bool);};
   var novalidate = function (bool) {    return A2(boolProperty,"noValidate",bool);};
   var readonly = function (bool) {    return A2(boolProperty,"readOnly",bool);};
   var required = function (bool) {    return A2(boolProperty,"required",bool);};
   var ismap = function (value) {    return A2(boolProperty,"isMap",value);};
   var download = function (bool) {    return A2(boolProperty,"download",bool);};
   var reversed = function (bool) {    return A2(boolProperty,"reversed",bool);};
   var classList = function (list) {    return $class(A2($String.join," ",A2($List.map,$Basics.fst,A2($List.filter,$Basics.snd,list))));};
   var style = function (props) {
      return A2(property,
      "style",
      $Json$Encode.object(A2($List.map,function (_p0) {    var _p1 = _p0;return {ctor: "_Tuple2",_0: _p1._0,_1: $Json$Encode.string(_p1._1)};},props)));
   };
   var key = function (k) {    return A2(stringProperty,"key",k);};
   return _elm.Html.Attributes.values = {_op: _op
                                        ,key: key
                                        ,style: style
                                        ,$class: $class
                                        ,classList: classList
                                        ,id: id
                                        ,title: title
                                        ,hidden: hidden
                                        ,type$: type$
                                        ,value: value
                                        ,checked: checked
                                        ,placeholder: placeholder
                                        ,selected: selected
                                        ,accept: accept
                                        ,acceptCharset: acceptCharset
                                        ,action: action
                                        ,autocomplete: autocomplete
                                        ,autofocus: autofocus
                                        ,autosave: autosave
                                        ,disabled: disabled
                                        ,enctype: enctype
                                        ,formaction: formaction
                                        ,list: list
                                        ,maxlength: maxlength
                                        ,minlength: minlength
                                        ,method: method
                                        ,multiple: multiple
                                        ,name: name
                                        ,novalidate: novalidate
                                        ,pattern: pattern
                                        ,readonly: readonly
                                        ,required: required
                                        ,size: size
                                        ,$for: $for
                                        ,form: form
                                        ,max: max
                                        ,min: min
                                        ,step: step
                                        ,cols: cols
                                        ,rows: rows
                                        ,wrap: wrap
                                        ,href: href
                                        ,target: target
                                        ,download: download
                                        ,downloadAs: downloadAs
                                        ,hreflang: hreflang
                                        ,media: media
                                        ,ping: ping
                                        ,rel: rel
                                        ,ismap: ismap
                                        ,usemap: usemap
                                        ,shape: shape
                                        ,coords: coords
                                        ,src: src
                                        ,height: height
                                        ,width: width
                                        ,alt: alt
                                        ,autoplay: autoplay
                                        ,controls: controls
                                        ,loop: loop
                                        ,preload: preload
                                        ,poster: poster
                                        ,$default: $default
                                        ,kind: kind
                                        ,srclang: srclang
                                        ,sandbox: sandbox
                                        ,seamless: seamless
                                        ,srcdoc: srcdoc
                                        ,reversed: reversed
                                        ,start: start
                                        ,align: align
                                        ,colspan: colspan
                                        ,rowspan: rowspan
                                        ,headers: headers
                                        ,scope: scope
                                        ,async: async
                                        ,charset: charset
                                        ,content: content
                                        ,defer: defer
                                        ,httpEquiv: httpEquiv
                                        ,language: language
                                        ,scoped: scoped
                                        ,accesskey: accesskey
                                        ,contenteditable: contenteditable
                                        ,contextmenu: contextmenu
                                        ,dir: dir
                                        ,draggable: draggable
                                        ,dropzone: dropzone
                                        ,itemprop: itemprop
                                        ,lang: lang
                                        ,spellcheck: spellcheck
                                        ,tabindex: tabindex
                                        ,challenge: challenge
                                        ,keytype: keytype
                                        ,cite: cite
                                        ,datetime: datetime
                                        ,pubdate: pubdate
                                        ,manifest: manifest
                                        ,property: property
                                        ,attribute: attribute};
};
Elm.Html = Elm.Html || {};
Elm.Html.Attributes = Elm.Html.Attributes || {};
Elm.Html.Attributes.Extra = Elm.Html.Attributes.Extra || {};
Elm.Html.Attributes.Extra.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Attributes = _elm.Html.Attributes || {};
   _elm.Html.Attributes.Extra = _elm.Html.Attributes.Extra || {};
   if (_elm.Html.Attributes.Extra.values) return _elm.Html.Attributes.Extra.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Json$Encode = Elm.Json.Encode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var role = function (r) {    return A2($Html$Attributes.attribute,"role",r);};
   var intProperty = F2(function (name,$int) {    return A2($Html$Attributes.property,name,$Json$Encode.$int($int));});
   var valueAsInt = function (value) {    return A2(intProperty,"valueAsNumber",value);};
   var floatProperty = F2(function (name,$float) {    return A2($Html$Attributes.property,name,$Json$Encode.$float($float));});
   var valueAsFloat = function (value) {    return A2(floatProperty,"valueAsNumber",value);};
   var volume = floatProperty("volume");
   var boolProperty = F2(function (name,bool) {    return A2($Html$Attributes.property,name,$Json$Encode.bool(bool));});
   var stringProperty = F2(function (name,string) {    return A2($Html$Attributes.property,name,$Json$Encode.string(string));});
   var low = stringProperty("low");
   var high = stringProperty("high");
   var optimum = stringProperty("optimum");
   return _elm.Html.Attributes.Extra.values = {_op: _op
                                              ,stringProperty: stringProperty
                                              ,boolProperty: boolProperty
                                              ,floatProperty: floatProperty
                                              ,intProperty: intProperty
                                              ,valueAsFloat: valueAsFloat
                                              ,valueAsInt: valueAsInt
                                              ,role: role
                                              ,low: low
                                              ,high: high
                                              ,optimum: optimum
                                              ,volume: volume};
};
Elm.Html = Elm.Html || {};
Elm.Html.Events = Elm.Html.Events || {};
Elm.Html.Events.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Events = _elm.Html.Events || {};
   if (_elm.Html.Events.values) return _elm.Html.Events.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $VirtualDom = Elm.VirtualDom.make(_elm);
   var _op = {};
   var keyCode = A2($Json$Decode._op[":="],"keyCode",$Json$Decode.$int);
   var targetChecked = A2($Json$Decode.at,_U.list(["target","checked"]),$Json$Decode.bool);
   var targetValue = A2($Json$Decode.at,_U.list(["target","value"]),$Json$Decode.string);
   var defaultOptions = $VirtualDom.defaultOptions;
   var Options = F2(function (a,b) {    return {stopPropagation: a,preventDefault: b};});
   var onWithOptions = $VirtualDom.onWithOptions;
   var on = $VirtualDom.on;
   var messageOn = F3(function (name,addr,msg) {    return A3(on,name,$Json$Decode.value,function (_p0) {    return A2($Signal.message,addr,msg);});});
   var onClick = messageOn("click");
   var onDoubleClick = messageOn("dblclick");
   var onMouseMove = messageOn("mousemove");
   var onMouseDown = messageOn("mousedown");
   var onMouseUp = messageOn("mouseup");
   var onMouseEnter = messageOn("mouseenter");
   var onMouseLeave = messageOn("mouseleave");
   var onMouseOver = messageOn("mouseover");
   var onMouseOut = messageOn("mouseout");
   var onBlur = messageOn("blur");
   var onFocus = messageOn("focus");
   var onSubmit = messageOn("submit");
   var onKey = F3(function (name,addr,handler) {    return A3(on,name,keyCode,function (code) {    return A2($Signal.message,addr,handler(code));});});
   var onKeyUp = onKey("keyup");
   var onKeyDown = onKey("keydown");
   var onKeyPress = onKey("keypress");
   return _elm.Html.Events.values = {_op: _op
                                    ,onBlur: onBlur
                                    ,onFocus: onFocus
                                    ,onSubmit: onSubmit
                                    ,onKeyUp: onKeyUp
                                    ,onKeyDown: onKeyDown
                                    ,onKeyPress: onKeyPress
                                    ,onClick: onClick
                                    ,onDoubleClick: onDoubleClick
                                    ,onMouseMove: onMouseMove
                                    ,onMouseDown: onMouseDown
                                    ,onMouseUp: onMouseUp
                                    ,onMouseEnter: onMouseEnter
                                    ,onMouseLeave: onMouseLeave
                                    ,onMouseOver: onMouseOver
                                    ,onMouseOut: onMouseOut
                                    ,on: on
                                    ,onWithOptions: onWithOptions
                                    ,defaultOptions: defaultOptions
                                    ,targetValue: targetValue
                                    ,targetChecked: targetChecked
                                    ,keyCode: keyCode
                                    ,Options: Options};
};
Elm.Html = Elm.Html || {};
Elm.Html.Events = Elm.Html.Events || {};
Elm.Html.Events.Extra = Elm.Html.Events.Extra || {};
Elm.Html.Events.Extra.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Events = _elm.Html.Events || {};
   _elm.Html.Events.Extra = _elm.Html.Events.Extra || {};
   if (_elm.Html.Events.Extra.values) return _elm.Html.Events.Extra.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var targetValueIntParse = A2($Json$Decode.customDecoder,$Html$Events.targetValue,$String.toInt);
   var targetValueFloatParse = A2($Json$Decode.customDecoder,$Html$Events.targetValue,$String.toFloat);
   var targetValueMaybe = A2($Json$Decode.customDecoder,
   $Html$Events.targetValue,
   function (s) {
      return $Result.Ok(_U.eq(s,"") ? $Maybe.Nothing : $Maybe.Just(s));
   });
   var targetValueMaybeInt = function () {
      var traverse = F2(function (f,mx) {
         var _p0 = mx;
         if (_p0.ctor === "Nothing") {
               return $Result.Ok($Maybe.Nothing);
            } else {
               return A2($Result.map,$Maybe.Just,f(_p0._0));
            }
      });
      return A2($Json$Decode.customDecoder,targetValueMaybe,traverse($String.toInt));
   }();
   var targetValueMaybeFloatParse = function () {
      var traverse = F2(function (f,mx) {
         var _p1 = mx;
         if (_p1.ctor === "Nothing") {
               return $Result.Ok($Maybe.Nothing);
            } else {
               return A2($Result.map,$Maybe.Just,f(_p1._0));
            }
      });
      return A2($Json$Decode.customDecoder,targetValueMaybe,traverse($String.toFloat));
   }();
   var targetValueMaybeIntParse = function () {
      var traverse = F2(function (f,mx) {
         var _p2 = mx;
         if (_p2.ctor === "Nothing") {
               return $Result.Ok($Maybe.Nothing);
            } else {
               return A2($Result.map,$Maybe.Just,f(_p2._0));
            }
      });
      return A2($Json$Decode.customDecoder,targetValueMaybe,traverse($String.toInt));
   }();
   var targetValueInt = A2($Json$Decode.at,_U.list(["target","valueAsNumber"]),$Json$Decode.$int);
   var targetValueFloat = A2($Json$Decode.customDecoder,
   A2($Json$Decode.at,_U.list(["target","valueAsNumber"]),$Json$Decode.$float),
   function (v) {
      return $Basics.isNaN(v) ? $Result.Err("Not a number") : $Result.Ok(v);
   });
   var targetValueMaybeFloat = A2($Json$Decode.andThen,
   targetValueMaybe,
   function (mval) {
      var _p3 = mval;
      if (_p3.ctor === "Nothing") {
            return $Json$Decode.succeed($Maybe.Nothing);
         } else {
            return A2($Json$Decode.map,$Maybe.Just,targetValueFloat);
         }
   });
   var charCode = A2($Json$Decode.map,
   function (_p4) {
      return A2($Maybe.map,$Basics.fst,$String.uncons(_p4));
   },
   A2($Json$Decode._op[":="],"charCode",$Json$Decode.string));
   var onInput = F2(function (address,toAddressValue) {
      return A3($Html$Events.on,"input",$Html$Events.targetValue,function (str) {    return A2($Signal.message,address,toAddressValue(str));});
   });
   return _elm.Html.Events.Extra.values = {_op: _op
                                          ,onInput: onInput
                                          ,charCode: charCode
                                          ,targetValueFloat: targetValueFloat
                                          ,targetValueInt: targetValueInt
                                          ,targetValueMaybe: targetValueMaybe
                                          ,targetValueMaybeFloat: targetValueMaybeFloat
                                          ,targetValueMaybeInt: targetValueMaybeInt
                                          ,targetValueFloatParse: targetValueFloatParse
                                          ,targetValueIntParse: targetValueIntParse
                                          ,targetValueMaybeFloatParse: targetValueMaybeFloatParse
                                          ,targetValueMaybeIntParse: targetValueMaybeIntParse};
};
Elm.Html = Elm.Html || {};
Elm.Html.Shorthand = Elm.Html.Shorthand || {};
Elm.Html.Shorthand.Type = Elm.Html.Shorthand.Type || {};
Elm.Html.Shorthand.Type.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Shorthand = _elm.Html.Shorthand || {};
   _elm.Html.Shorthand.Type = _elm.Html.Shorthand.Type || {};
   if (_elm.Html.Shorthand.Type.values) return _elm.Html.Shorthand.Type.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var MeterParam = F7(function (a,b,c,d,e,f,g) {    return {$class: a,value: b,min: c,max: d,low: e,high: f,optimum: g};});
   var ProgressParam = F3(function (a,b,c) {    return {$class: a,value: b,max: c};});
   var OutputParam = F3(function (a,b,c) {    return {$class: a,name: b,$for: c};});
   var OptionParam = F3(function (a,b,c) {    return {label: a,value: b,selected: c};});
   var SelectParam = F3(function (a,b,c) {    return {$class: a,name: b,update: c};});
   var ButtonParam = F2(function (a,b) {    return {$class: a,update: b};});
   var InputMaybeIntParam = F8(function (a,b,c,d,e,f,g,h) {    return {$class: a,name: b,placeholder: c,value: d,min: e,max: f,step: g,update: h};});
   var InputIntParam = F8(function (a,b,c,d,e,f,g,h) {    return {$class: a,name: b,placeholder: c,value: d,min: e,max: f,step: g,update: h};});
   var InputMaybeFloatParam = F8(function (a,b,c,d,e,f,g,h) {    return {$class: a,name: b,placeholder: c,value: d,min: e,max: f,step: g,update: h};});
   var InputFloatParam = F8(function (a,b,c,d,e,f,g,h) {    return {$class: a,name: b,placeholder: c,value: d,min: e,max: f,step: g,update: h};});
   var InputMaybeUrlParam = F6(function (a,b,c,d,e,f) {    return {$class: a,name: b,placeholder: c,value: d,autocomplete: e,update: f};});
   var InputUrlParam = F7(function (a,b,c,d,e,f,g) {    return {$class: a,name: b,placeholder: c,value: d,required: e,autocomplete: f,update: g};});
   var InputMaybeTextParam = F6(function (a,b,c,d,e,f) {    return {$class: a,name: b,placeholder: c,value: d,autocomplete: e,update: f};});
   var InputTextParam = F7(function (a,b,c,d,e,f,g) {    return {$class: a,name: b,placeholder: c,value: d,required: e,autocomplete: f,update: g};});
   var InputFieldParam = F8(function (a,b,c,d,e,f,g,h) {    return {$class: a,name: b,placeholder: c,update: d,type$: e,pattern: f,required: g,decoder: h};});
   var LabelParam = F2(function (a,b) {    return {$class: a,$for: b};});
   var FieldsetParam = F2(function (a,b) {    return {$class: a,disabled: b};});
   var FormParam = F3(function (a,b,c) {    return {$class: a,novalidate: b,update: c};});
   var VideoParam = function (a) {
      return function (b) {
         return function (c) {
            return function (d) {
               return function (e) {
                  return function (f) {
                     return function (g) {
                        return function (h) {
                           return function (i) {
                              return function (j) {
                                 return function (k) {
                                    return function (l) {
                                       return {$class: a
                                              ,src: b
                                              ,width: c
                                              ,height: d
                                              ,videoHeight: e
                                              ,videoWidth: f
                                              ,autoplay: g
                                              ,controls: h
                                              ,loop: i
                                              ,preload: j
                                              ,poster: k
                                              ,volume: l};
                                    };
                                 };
                              };
                           };
                        };
                     };
                  };
               };
            };
         };
      };
   };
   var MediaParam = F8(function (a,b,c,d,e,f,g,h) {    return {$class: a,src: b,autoplay: c,controls: d,loop: e,preload: f,poster: g,volume: h};});
   var ObjectParam = F7(function (a,b,c,d,e,f,g) {    return {$class: a,name: b,data: c,type$: d,useMapName: e,height: f,width: g};});
   var EmbedParam = F7(function (a,b,c,d,e,f,g) {    return {$class: a,id: b,src: c,type$: d,useMapName: e,height: f,width: g};});
   var IframeParam = F7(function (a,b,c,d,e,f,g) {    return {$class: a,name: b,src: c,width: d,height: e,sandbox: f,seamless: g};});
   var ImgParam = F5(function (a,b,c,d,e) {    return {$class: a,src: b,width: c,height: d,alt: e};});
   var ModParam = F3(function (a,b,c) {    return {$class: a,cite: b,datetime: c};});
   var AnchorParam = F2(function (a,b) {    return {$class: a,href: b};});
   var ClassCiteParam = F2(function (a,b) {    return {$class: a,cite: b};});
   var ClassIdParam = F2(function (a,b) {    return {$class: a,id: b};});
   var ClassParam = function (a) {    return {$class: a};};
   var SelectUpdate = function (a) {    return {onSelect: a};};
   var ButtonUpdate = function (a) {    return {onClick: a};};
   var FieldUpdate = F3(function (a,b,c) {    return {onInput: a,onEnter: b,onKeyboardLost: c};});
   var FormUpdate = F2(function (a,b) {    return {onSubmit: a,onEnter: b};});
   var EventDecodeError = F2(function (a,b) {    return {event: a,reason: b};});
   return _elm.Html.Shorthand.Type.values = {_op: _op
                                            ,EventDecodeError: EventDecodeError
                                            ,FormUpdate: FormUpdate
                                            ,FieldUpdate: FieldUpdate
                                            ,ButtonUpdate: ButtonUpdate
                                            ,SelectUpdate: SelectUpdate
                                            ,ClassParam: ClassParam
                                            ,ClassIdParam: ClassIdParam
                                            ,ClassCiteParam: ClassCiteParam
                                            ,AnchorParam: AnchorParam
                                            ,ModParam: ModParam
                                            ,ImgParam: ImgParam
                                            ,IframeParam: IframeParam
                                            ,EmbedParam: EmbedParam
                                            ,ObjectParam: ObjectParam
                                            ,MediaParam: MediaParam
                                            ,VideoParam: VideoParam
                                            ,FormParam: FormParam
                                            ,FieldsetParam: FieldsetParam
                                            ,LabelParam: LabelParam
                                            ,InputFieldParam: InputFieldParam
                                            ,InputTextParam: InputTextParam
                                            ,InputMaybeTextParam: InputMaybeTextParam
                                            ,InputUrlParam: InputUrlParam
                                            ,InputMaybeUrlParam: InputMaybeUrlParam
                                            ,InputFloatParam: InputFloatParam
                                            ,InputMaybeFloatParam: InputMaybeFloatParam
                                            ,InputIntParam: InputIntParam
                                            ,InputMaybeIntParam: InputMaybeIntParam
                                            ,ButtonParam: ButtonParam
                                            ,SelectParam: SelectParam
                                            ,OptionParam: OptionParam
                                            ,OutputParam: OutputParam
                                            ,ProgressParam: ProgressParam
                                            ,MeterParam: MeterParam};
};
Elm.Html = Elm.Html || {};
Elm.Html.Shorthand = Elm.Html.Shorthand || {};
Elm.Html.Shorthand.Event = Elm.Html.Shorthand.Event || {};
Elm.Html.Shorthand.Event.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Shorthand = _elm.Html.Shorthand || {};
   _elm.Html.Shorthand.Event = _elm.Html.Shorthand.Event || {};
   if (_elm.Html.Shorthand.Event.values) return _elm.Html.Shorthand.Event.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Shorthand$Type = Elm.Html.Shorthand.Type.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var messageDecoder = F2(function (dec,f) {
      return A2($Json$Decode.customDecoder,
      $Json$Decode.value,
      function (event) {
         var r = A2($Json$Decode.decodeValue,dec,event);
         var r$ = A2($Result.formatError,$Html$Shorthand$Type.EventDecodeError(event),r);
         var _p0 = {ctor: "_Tuple2",_0: f(r$),_1: r};
         if (_p0._0.ctor === "Nothing") {
               if (_p0._1.ctor === "Err") {
                     return $Result.Err(_p0._1._0);
                  } else {
                     return $Result.Err("no message in response to event");
                  }
            } else {
               return $Result.Ok(_p0._0._0);
            }
      });
   });
   var onMouseLost = $Html$Events.on("mouseleave");
   var onKeyboardLost = $Html$Events.on("blur");
   var onEnter = F2(function (dec,f) {
      return A3($Html$Events.on,
      "keydown",
      A2($Json$Decode.customDecoder,
      A3($Json$Decode.object2,F2(function (v0,v1) {    return {ctor: "_Tuple2",_0: v0,_1: v1};}),$Html$Events.keyCode,dec),
      function (_p1) {
         var _p2 = _p1;
         return _U.eq(_p2._0,13) ? $Result.Ok(_p2._1) : $Result.Err("expected key code 13");
      }),
      f);
   });
   var onChange = $Html$Events.on("change");
   var onInput = $Html$Events.on("input");
   return _elm.Html.Shorthand.Event.values = {_op: _op
                                             ,onInput: onInput
                                             ,onChange: onChange
                                             ,onEnter: onEnter
                                             ,onKeyboardLost: onKeyboardLost
                                             ,onMouseLost: onMouseLost
                                             ,messageDecoder: messageDecoder};
};
Elm.Html = Elm.Html || {};
Elm.Html.Shorthand = Elm.Html.Shorthand || {};
Elm.Html.Shorthand.Internal = Elm.Html.Shorthand.Internal || {};
Elm.Html.Shorthand.Internal.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Shorthand = _elm.Html.Shorthand || {};
   _elm.Html.Shorthand.Internal = _elm.Html.Shorthand.Internal || {};
   if (_elm.Html.Shorthand.Internal.values) return _elm.Html.Shorthand.Internal.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Char = Elm.Char.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Shorthand$Type = Elm.Html.Shorthand.Type.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var encodeClass = function () {
      var isAlpha = function (c) {
         var cc = $Char.toCode($Char.toLower(c));
         return _U.cmp(cc,$Char.toCode(_U.chr("a"))) > -1 && _U.cmp(cc,$Char.toCode(_U.chr("z"))) < 1;
      };
      var startWithAlpha = function (s) {
         var _p0 = $String.uncons(s);
         if (_p0.ctor === "Just") {
               return $Basics.not(isAlpha(_p0._0._0)) ? A2($String.cons,_U.chr("x"),s) : s;
            } else {
               return s;
            }
      };
      var hu = _U.list([_U.chr("-"),_U.chr("_")]);
      var isClassChar = function (c) {    return $Char.isDigit(c) || (isAlpha(c) || A2($List.member,c,hu));};
      var smartTrimLeft = function (s) {
         var _p1 = $String.uncons(s);
         if (_p1.ctor === "Just") {
               return A2($List.member,_p1._0._0,hu) ? _p1._0._1 : s;
            } else {
               return s;
            }
      };
      var smartTrimRight = function (s) {
         var _p2 = $String.uncons($String.reverse(s));
         if (_p2.ctor === "Just") {
               return A2($List.member,_p2._0._0,hu) ? $String.reverse(_p2._0._1) : s;
            } else {
               return s;
            }
      };
      var smartTrim = function (_p3) {    return smartTrimRight(smartTrimLeft(_p3));};
      return function (_p4) {
         return A2($String.join,
         " ",
         A2($List.map,function (_p5) {    return startWithAlpha(smartTrim(A2($String.filter,isClassChar,$String.toLower(_p5))));},$String.words(_p4)));
      };
   }();
   var class$ = function (_p6) {    return $Html$Attributes.$class(encodeClass(_p6));};
   var encodeId = function () {
      var isAlpha = function (c) {
         var cc = $Char.toCode($Char.toLower(c));
         return _U.cmp(cc,$Char.toCode(_U.chr("a"))) > -1 && _U.cmp(cc,$Char.toCode(_U.chr("z"))) < 1;
      };
      var startWithAlpha = function (s) {
         var _p7 = $String.uncons(s);
         if (_p7.ctor === "Just") {
               return $Basics.not(isAlpha(_p7._0._0)) ? A2($String.cons,_U.chr("x"),s) : s;
            } else {
               return s;
            }
      };
      var hu = _U.list([_U.chr("-"),_U.chr("_")]);
      var isIdChar = function (c) {    return $Char.isDigit(c) || (isAlpha(c) || A2($List.member,c,hu));};
      var smartTrimLeft = function (s) {
         var _p8 = $String.uncons(s);
         if (_p8.ctor === "Just") {
               return A2($List.member,_p8._0._0,hu) ? _p8._0._1 : s;
            } else {
               return s;
            }
      };
      var smartTrimRight = function (s) {
         var _p9 = $String.uncons($String.reverse(s));
         if (_p9.ctor === "Just") {
               return A2($List.member,_p9._0._0,hu) ? $String.reverse(_p9._0._1) : s;
            } else {
               return s;
            }
      };
      var smartTrim = function (_p10) {    return smartTrimRight(smartTrimLeft(_p10));};
      return function (_p11) {
         return startWithAlpha(A2($String.join,
         "-",
         A2($List.map,function (_p12) {    return smartTrim(A2($String.filter,isIdChar,$String.toLower(_p12)));},$String.words(_p11))));
      };
   }();
   var id$ = function (_p13) {    return $Html$Attributes.id(encodeId(_p13));};
   return _elm.Html.Shorthand.Internal.values = {_op: _op,encodeId: encodeId,encodeClass: encodeClass,id$: id$,class$: class$};
};
Elm.Html = Elm.Html || {};
Elm.Html.Shorthand = Elm.Html.Shorthand || {};
Elm.Html.Shorthand.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Shorthand = _elm.Html.Shorthand || {};
   if (_elm.Html.Shorthand.values) return _elm.Html.Shorthand.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Attributes$Extra = Elm.Html.Attributes.Extra.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Events$Extra = Elm.Html.Events.Extra.make(_elm),
   $Html$Shorthand$Event = Elm.Html.Shorthand.Event.make(_elm),
   $Html$Shorthand$Internal = Elm.Html.Shorthand.Internal.make(_elm),
   $Html$Shorthand$Type = Elm.Html.Shorthand.Type.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var meter$ = F2(function (p,t) {
      var filterJust = $List.filterMap($Basics.identity);
      return A2($Html.meter,
      A2($Basics._op["++"],
      _U.list([$Html$Attributes.value($Basics.toString(p.value))
              ,$Html$Attributes.min($Basics.toString($Basics.min))
              ,$Html$Attributes.max($Basics.toString(p.max))]),
      filterJust(_U.list([A2($Maybe.map,function (_p0) {    return $Html$Attributes$Extra.low($Basics.toString(_p0));},p.low)
                         ,A2($Maybe.map,function (_p1) {    return $Html$Attributes$Extra.high($Basics.toString(_p1));},p.high)
                         ,A2($Maybe.map,function (_p2) {    return $Html$Attributes$Extra.optimum($Basics.toString(_p2));},p.optimum)]))),
      _U.list([$Html.text(t)]));
   });
   var progress$ = F2(function (p,t) {
      return A2($Html.progress,
      _U.list([$Html$Attributes.value($Basics.toString(p.value)),$Html$Attributes.max($Basics.toString(p.max))]),
      _U.list([$Html.text(t)]));
   });
   var option$ = function (p) {
      return A2($Html.option,
      _U.list([A2($Html$Attributes$Extra.stringProperty,"label",p.label)
              ,$Html$Attributes.value($Basics.toString(p.value))
              ,$Html$Attributes.selected(p.selected)]),
      _U.list([]));
   };
   var option_ = F2(function (val,sel) {    return A2($Html.option,_U.list([$Html$Attributes.selected(sel)]),_U.list([$Html.text(val)]));});
   var buttonReset_ = function (t) {    return A2($Html.button,_U.list([$Html$Attributes.type$("reset")]),_U.list([$Html.text(t)]));};
   var buttonSubmit_ = function (t) {    return A2($Html.button,_U.list([$Html$Attributes.type$("submit")]),_U.list([$Html.text(t)]));};
   var buttonLink_ = F3(function (t,clickAddr,click) {
      return A2($Html.button,_U.list([$Html$Attributes.type$("button"),A2($Html$Events.onClick,clickAddr,click)]),_U.list([$Html.text(t)]));
   });
   var button_ = F3(function (t,clickAddr,click) {
      return A2($Html.button,_U.list([$Html$Attributes.type$("button"),A2($Html$Events.onClick,clickAddr,click)]),_U.list([$Html.text(t)]));
   });
   var label_ = F2(function ($for,t) {    return A2($Html.label,_U.list([$Html$Attributes.$for($for)]),_U.list([$Html.text(t)]));});
   var legend_ = function (t) {    return A2($Html.legend,_U.list([]),_U.list([$Html.text(t)]));};
   var fieldset_ = function (disabled) {    return $Html.fieldset(_U.list([$Html$Attributes.disabled(disabled)]));};
   var th_ = $Html.th(_U.list([]));
   var td_ = $Html.td(_U.list([]));
   var tr_ = $Html.tr(_U.list([]));
   var tfoot_ = $Html.tfoot(_U.list([]));
   var thead_ = $Html.thead(_U.list([]));
   var tbody_ = $Html.tbody(_U.list([]));
   var caption_ = $Html.caption(_U.list([]));
   var table_ = $Html.table(_U.list([]));
   var audio_ = function (url) {    return A2($Html.audio,_U.list([$Html$Attributes.src(url)]),_U.list([]));};
   var video_ = function (url) {    return A2($Html.video,_U.list([$Html$Attributes.src(url)]),_U.list([]));};
   var param$ = F2(function (n,v) {    return A2($Html.param,_U.list([$Html$Attributes.name(n),$Html$Attributes.value(v)]),_U.list([]));});
   var img_ = F4(function (w,h,s,a) {
      return A2($Html.img,_U.list([$Html$Attributes.width(w),$Html$Attributes.height(h),$Html$Attributes.src(s),$Html$Attributes.alt(a)]),_U.list([]));
   });
   var del_ = $Html.del(_U.list([]));
   var ins_ = $Html.ins(_U.list([]));
   var wbr$ = A2($Html.wbr,_U.list([]),_U.list([]));
   var br$ = A2($Html.br,_U.list([]),_U.list([]));
   var span_ = $Html.span(_U.list([]));
   var bdo$ = function (dir) {
      return $Html.bdo(_U.list([$Html$Attributes.dir(function () {
         var _p3 = dir;
         switch (_p3.ctor)
         {case "LeftToRight": return "ltr";
            case "RightToLeft": return "rtl";
            default: return "auto";}
      }())]));
   };
   var bdi_ = function (t) {    return A2($Html.bdi,_U.list([]),_U.list([$Html.text(t)]));};
   var rp_ = function (t) {    return A2($Html.rp,_U.list([]),_U.list([$Html.text(t)]));};
   var rt_ = function (t) {    return A2($Html.rt,_U.list([]),_U.list([$Html.text(t)]));};
   var ruby_ = $Html.ruby(_U.list([]));
   var mark_ = $Html.mark(_U.list([]));
   var u_ = function (t) {    return A2($Html.u,_U.list([]),_U.list([$Html.text(t)]));};
   var b_ = function (t) {    return A2($Html.b,_U.list([]),_U.list([$Html.text(t)]));};
   var i_ = function (t) {    return A2($Html.i,_U.list([]),_U.list([$Html.text(t)]));};
   var sup_ = function (t) {    return A2($Html.sup,_U.list([]),_U.list([$Html.text(t)]));};
   var sub_ = function (t) {    return A2($Html.sub,_U.list([]),_U.list([$Html.text(t)]));};
   var kbd_ = $Html.kbd(_U.list([]));
   var samp_ = $Html.samp(_U.list([]));
   var var_ = function (t) {    return A2($Html.$var,_U.list([]),_U.list([$Html.text(t)]));};
   var code_ = $Html.code(_U.list([]));
   var abbr_ = function (t) {    return A2($Html.abbr,_U.list([]),_U.list([$Html.text(t)]));};
   var q_ = function (t) {    return A2($Html.q,_U.list([]),_U.list([$Html.text(t)]));};
   var cite_ = $Html.cite(_U.list([]));
   var s_ = function (t) {    return A2($Html.s,_U.list([]),_U.list([$Html.text(t)]));};
   var small_ = function (t) {    return A2($Html.small,_U.list([]),_U.list([$Html.text(t)]));};
   var strong_ = function (t) {    return A2($Html.strong,_U.list([]),_U.list([$Html.text(t)]));};
   var em_ = function (t) {    return A2($Html.em,_U.list([]),_U.list([$Html.text(t)]));};
   var a_ = F2(function (href,t) {    return A2($Html.a,_U.list([$Html$Attributes.href(href)]),_U.list([$Html.text(t)]));});
   var div_ = $Html.div(_U.list([]));
   var figcaption_ = $Html.figcaption(_U.list([]));
   var dd_ = $Html.dd(_U.list([]));
   var dl_ = $Html.dl(_U.list([]));
   var li_ = $Html.li(_U.list([]));
   var ul_ = $Html.ul(_U.list([]));
   var ol_ = $Html.ol(_U.list([]));
   var blockquote_ = $Html.blockquote(_U.list([]));
   var pre_ = $Html.pre(_U.list([]));
   var hr_ = A2($Html.hr,_U.list([]),_U.list([]));
   var p_ = $Html.p(_U.list([]));
   var main_ = $Html.main$(_U.list([]));
   var address_ = $Html.address(_U.list([]));
   var footer_ = $Html.footer(_U.list([]));
   var header_ = $Html.header(_U.list([]));
   var h6_ = function (t) {    return A2($Html.h6,_U.list([]),_U.list([$Html.text(t)]));};
   var h5_ = function (t) {    return A2($Html.h5,_U.list([]),_U.list([$Html.text(t)]));};
   var h4_ = function (t) {    return A2($Html.h4,_U.list([]),_U.list([$Html.text(t)]));};
   var h3_ = function (t) {    return A2($Html.h3,_U.list([]),_U.list([$Html.text(t)]));};
   var h2_ = function (t) {    return A2($Html.h2,_U.list([]),_U.list([$Html.text(t)]));};
   var h1_ = function (t) {    return A2($Html.h1,_U.list([]),_U.list([$Html.text(t)]));};
   var nav_ = $Html.nav(_U.list([]));
   var body_ = $Html.body(_U.list([]));
   var class$ = $Html$Shorthand$Internal.class$;
   var body$ = function (p) {    return $Html.body(_U.list([class$(p.$class)]));};
   var nav$ = function (p) {    return $Html.nav(_U.list([class$(p.$class)]));};
   var h1$ = function (p) {    return $Html.h1(_U.list([class$(p.$class)]));};
   var h2$ = function (p) {    return $Html.h2(_U.list([class$(p.$class)]));};
   var h3$ = function (p) {    return $Html.h3(_U.list([class$(p.$class)]));};
   var h4$ = function (p) {    return $Html.h4(_U.list([class$(p.$class)]));};
   var h5$ = function (p) {    return $Html.h5(_U.list([class$(p.$class)]));};
   var h6$ = function (p) {    return $Html.h6(_U.list([class$(p.$class)]));};
   var header$ = function (p) {    return $Html.header(_U.list([class$(p.$class)]));};
   var footer$ = function (p) {    return $Html.footer(_U.list([class$(p.$class)]));};
   var address$ = function (p) {    return $Html.address(_U.list([class$(p.$class)]));};
   var p$ = function (param) {    return $Html.p(_U.list([class$(param.$class)]));};
   var pre$ = function (p) {    return $Html.pre(_U.list([class$(p.$class)]));};
   var blockquote$ = function (p) {    return $Html.blockquote(_U.list([class$(p.$class),$Html$Attributes.cite(p.cite)]));};
   var ol$ = function (p) {    return $Html.ol(_U.list([class$(p.$class)]));};
   var ul$ = function (p) {    return $Html.ul(_U.list([class$(p.$class)]));};
   var li$ = function (p) {    return $Html.li(_U.list([class$(p.$class)]));};
   var dl$ = function (p) {    return $Html.dl(_U.list([class$(p.$class)]));};
   var dd$ = function (p) {    return $Html.dd(_U.list([class$(p.$class)]));};
   var figcaption$ = function (p) {    return $Html.figcaption(_U.list([class$(p.$class)]));};
   var div$ = function (p) {    return $Html.div(_U.list([class$(p.$class)]));};
   var a$ = function (p) {    return $Html.a(_U.list([class$(p.$class),$Html$Attributes.href(p.href)]));};
   var em$ = function (p) {    return $Html.em(_U.list([class$(p.$class)]));};
   var strong$ = function (p) {    return $Html.strong(_U.list([class$(p.$class)]));};
   var small$ = function (p) {    return $Html.small(_U.list([class$(p.$class)]));};
   var s$ = function (p) {    return $Html.s(_U.list([class$(p.$class)]));};
   var cite$ = function (p) {    return $Html.cite(_U.list([class$(p.$class)]));};
   var q$ = function (p) {    return $Html.q(_U.list([class$(p.$class),$Html$Attributes.cite(p.cite)]));};
   var abbr$ = function (p) {    return $Html.abbr(_U.list([class$(p.$class)]));};
   var code$ = function (p) {    return $Html.code(_U.list([class$(p.$class)]));};
   var var$ = function (p) {    return $Html.$var(_U.list([class$(p.$class)]));};
   var samp$ = function (p) {    return $Html.samp(_U.list([class$(p.$class)]));};
   var kbd$ = function (p) {    return $Html.kbd(_U.list([class$(p.$class)]));};
   var sub$ = function (p) {    return $Html.sub(_U.list([class$(p.$class)]));};
   var sup$ = function (p) {    return $Html.sup(_U.list([class$(p.$class)]));};
   var i$ = function (p) {    return $Html.i(_U.list([class$(p.$class)]));};
   var b$ = function (p) {    return $Html.b(_U.list([class$(p.$class)]));};
   var u$ = function (p) {    return $Html.u(_U.list([class$(p.$class)]));};
   var mark$ = function (p) {    return $Html.mark(_U.list([class$(p.$class)]));};
   var ruby$ = function (p) {    return $Html.ruby(_U.list([class$(p.$class)]));};
   var rt$ = function (p) {    return $Html.rt(_U.list([class$(p.$class)]));};
   var rp$ = function (p) {    return $Html.rp(_U.list([class$(p.$class)]));};
   var bdi$ = function (p) {    return $Html.bdi(_U.list([class$(p.$class)]));};
   var span$ = function (p) {    return $Html.span(_U.list([class$(p.$class)]));};
   var ins$ = function (p) {    return $Html.ins(_U.list([class$(p.$class),$Html$Attributes.cite(p.cite),$Html$Attributes.datetime(p.datetime)]));};
   var del$ = function (p) {    return $Html.del(_U.list([class$(p.$class),$Html$Attributes.cite(p.cite),$Html$Attributes.datetime(p.datetime)]));};
   var img$ = function (p) {
      return A2($Html.img,
      _U.list([class$(p.$class),$Html$Attributes.src(p.src),$Html$Attributes.width(p.width),$Html$Attributes.height(p.height),$Html$Attributes.alt(p.alt)]),
      _U.list([]));
   };
   var video$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      return $Html.video(A2($Basics._op["++"],
      _U.list([class$(p.$class)
              ,$Html$Attributes.width(p.width)
              ,$Html$Attributes.height(p.height)
              ,$Html$Attributes.autoplay(p.autoplay)
              ,$Html$Attributes.controls(p.controls)
              ,$Html$Attributes.loop(p.loop)]),
      filterJust(_U.list([A2($Maybe.map,$Html$Attributes.src,p.src)
                         ,A2($Maybe.map,$Html$Attributes$Extra.stringProperty("preload"),p.preload)
                         ,A2($Maybe.map,$Html$Attributes.poster,p.poster)
                         ,A2($Maybe.map,$Html$Attributes$Extra.volume,p.volume)]))));
   };
   var audio$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      return $Html.audio(A2($Basics._op["++"],
      _U.list([class$(p.$class),$Html$Attributes.autoplay(p.autoplay),$Html$Attributes.controls(p.controls),$Html$Attributes.loop(p.loop)]),
      filterJust(_U.list([A2($Maybe.map,$Html$Attributes.src,p.src)
                         ,A2($Maybe.map,$Html$Attributes$Extra.stringProperty("preload"),p.preload)
                         ,A2($Maybe.map,$Html$Attributes.poster,p.poster)
                         ,A2($Maybe.map,$Html$Attributes$Extra.volume,p.volume)]))));
   };
   var table$ = function (p) {    return $Html.table(_U.list([class$(p.$class)]));};
   var caption$ = function (p) {    return $Html.caption(_U.list([class$(p.$class)]));};
   var tbody$ = function (p) {    return $Html.tbody(_U.list([class$(p.$class)]));};
   var thead$ = function (p) {    return $Html.thead(_U.list([class$(p.$class)]));};
   var tfoot$ = function (p) {    return $Html.tfoot(_U.list([class$(p.$class)]));};
   var tr$ = function (p) {    return $Html.tr(_U.list([class$(p.$class)]));};
   var td$ = function (p) {    return $Html.td(_U.list([class$(p.$class)]));};
   var th$ = function (p) {    return $Html.th(_U.list([class$(p.$class)]));};
   var form$ = function (p) {
      var onEnter$ = function (msg) {
         return A3($Html$Events.on,
         "keypress",
         A2($Json$Decode.customDecoder,
         $Html$Events.keyCode,
         function (c) {
            return _U.eq(c,13) ? $Result.Ok({ctor: "_Tuple0"}) : $Result.Err("expected key code 13");
         }),
         $Basics.always(msg));
      };
      var filterJust = $List.filterMap($Basics.identity);
      return $Html.form(A2($List._op["::"],
      class$(p.$class),
      A2($List._op["::"],
      $Html$Attributes.novalidate(p.novalidate),
      filterJust(_U.list([A2($Maybe.map,function (_p4) {    return A3($Html$Events.on,"submit",$Json$Decode.value,$Basics.always(_p4));},p.update.onSubmit)
                         ,A2($Maybe.map,onEnter$,p.update.onSubmit)])))));
   };
   var fieldset$ = function (p) {    return $Html.fieldset(_U.list([class$(p.$class),$Html$Attributes.disabled(p.disabled)]));};
   var legend$ = function (p) {    return $Html.legend(_U.list([class$(p.$class)]));};
   var label$ = function (p) {    return $Html.label(_U.list([class$(p.$class),$Html$Attributes.$for(p.$for)]));};
   var button$ = function (p) {
      return $Html.button(_U.list([class$(p.$class)
                                  ,$Html$Attributes.type$("button")
                                  ,A3($Html$Events.on,"click",$Json$Decode.value,$Basics.always(p.update.onClick))]));
   };
   var buttonLink$ = function (p) {
      return $Html.a(_U.list([class$(p.$class),$Html$Attributes.href("#"),A3($Html$Events.on,"click",$Json$Decode.value,$Basics.always(p.update.onClick))]));
   };
   var buttonSubmit$ = function (p) {    return $Html.button(_U.list([class$(p.$class),$Html$Attributes.type$("submit")]));};
   var buttonReset$ = function (p) {    return $Html.button(_U.list([class$(p.$class),$Html$Attributes.type$("reset")]));};
   var id$ = $Html$Shorthand$Internal.id$;
   var section_ = function (i) {    return $Html.section(_U.list([id$(i)]));};
   var section$ = function (p) {    return $Html.section(_U.list([class$(p.$class),id$(p.id)]));};
   var article_ = function (i) {    return $Html.article(_U.list([id$(i)]));};
   var article$ = function (p) {    return $Html.article(_U.list([class$(p.$class),id$(p.id)]));};
   var aside$ = function (p) {    return $Html.aside(_U.list([class$(p.$class),id$(p.id)]));};
   var dt$ = function (p) {    return $Html.dt(_U.list([class$(p.$class),id$(p.id)]));};
   var figure$ = function (p) {    return $Html.figure(_U.list([class$(p.$class),id$(p.id)]));};
   var dfn$ = function (p) {    return $Html.dfn(_U.list([class$(p.$class),id$(p.id)]));};
   var embed$ = function (p) {
      return A2($Html.embed,
      _U.list([class$(p.$class)
              ,id$(p.id)
              ,$Html$Attributes.src(p.src)
              ,$Html$Attributes.type$(p.type$)
              ,$Html$Attributes.width(p.width)
              ,$Html$Attributes.height(p.height)]),
      _U.list([]));
   };
   var encodeClass = $Html$Shorthand$Internal.encodeClass;
   var encodeId = $Html$Shorthand$Internal.encodeId;
   var iframe$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      var i$ = encodeId(p.name);
      return A2($Html.iframe,
      A2($Basics._op["++"],
      _U.list([class$(p.$class)
              ,$Html$Attributes.id(i$)
              ,$Html$Attributes.name(i$)
              ,$Html$Attributes.src(p.src)
              ,$Html$Attributes.width(p.width)
              ,$Html$Attributes.height(p.height)
              ,$Html$Attributes.seamless(p.seamless)]),
      filterJust(_U.list([A2($Maybe.map,$Html$Attributes.sandbox,p.sandbox)]))),
      _U.list([]));
   };
   var object$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      var attrs = filterJust(_U.list([A2($Maybe.map,
      function (_p5) {
         return $Html$Attributes.usemap(A2($String.cons,_U.chr("#"),encodeId(_p5)));
      },
      p.useMapName)]));
      var i$ = encodeId(p.name);
      return $Html.object(A2($Basics._op["++"],
      _U.list([class$(p.$class)
              ,$Html$Attributes.id(i$)
              ,$Html$Attributes.name(i$)
              ,A2($Html$Attributes.attribute,"data",p.data)
              ,$Html$Attributes.type$(p.type$)]),
      A2($Basics._op["++"],attrs,_U.list([$Html$Attributes.height(p.height),$Html$Attributes.width(p.width)]))));
   };
   var inputField$ = F2(function (p,attrs) {
      var i$ = encodeId(p.name);
      var filterJust = $List.filterMap($Basics.identity);
      var pattrs = A2($Basics._op["++"],
      _U.list([$Html$Attributes.type$(p.type$),$Html$Attributes.id(i$),$Html$Attributes.name(i$),$Html$Attributes.required(p.required)]),
      filterJust(_U.list([A2($Maybe.map,class$,_U.eq(p.$class,"") ? $Maybe.Nothing : $Maybe.Just(p.$class))
                         ,A2($Maybe.map,
                         function (onEvent) {
                            return A2($Html$Shorthand$Event.onInput,A2($Html$Shorthand$Event.messageDecoder,p.decoder,onEvent),$Basics.identity);
                         },
                         p.update.onInput)
                         ,A2($Maybe.map,
                         function (onEvent) {
                            return A2($Html$Shorthand$Event.onEnter,A2($Html$Shorthand$Event.messageDecoder,p.decoder,onEvent),$Basics.identity);
                         },
                         p.update.onEnter)
                         ,A2($Maybe.map,
                         function (onEvent) {
                            return A2($Html$Shorthand$Event.onKeyboardLost,A2($Html$Shorthand$Event.messageDecoder,p.decoder,onEvent),$Basics.identity);
                         },
                         p.update.onKeyboardLost)
                         ,A2($Maybe.map,$Html$Attributes.placeholder,p.placeholder)
                         ,A2($Maybe.map,$Html$Attributes.pattern,p.pattern)])));
      return A2($Html.input,A2($Basics._op["++"],pattrs,attrs),_U.list([]));
   });
   var inputText$ = function (p) {
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "text"
      ,pattern: $Maybe.Nothing
      ,required: p.required
      ,decoder: $Html$Events.targetValue},
      _U.list([$Html$Attributes.value(p.value),$Html$Attributes.autocomplete(p.autocomplete)]));
   };
   var inputMaybeText$ = function (p) {
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "text"
      ,pattern: $Maybe.Nothing
      ,required: false
      ,decoder: $Html$Events$Extra.targetValueMaybe},
      _U.list([$Html$Attributes.value(A2($Maybe.withDefault,"",p.value)),$Html$Attributes.autocomplete(p.autocomplete)]));
   };
   var inputFloat$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "number"
      ,pattern: $Maybe.Nothing
      ,required: true
      ,decoder: function () {
         var _p6 = {ctor: "_Tuple2",_0: p.min,_1: p.max};
         if (_p6.ctor === "_Tuple2" && _p6._0.ctor === "Nothing" && _p6._1.ctor === "Nothing") {
               return $Html$Events$Extra.targetValueFloat;
            } else {
               return A2($Json$Decode.customDecoder,
               $Html$Events$Extra.targetValueFloat,
               function (v) {
                  return _U.cmp(v,A2($Maybe.withDefault,-1 / 0,p.min)) < 0 || _U.cmp(v,
                  A2($Maybe.withDefault,1 / 0,p.max)) > 0 ? $Result.Err("out of bounds") : $Result.Ok(v);
               });
            }
      }()},
      A2($List._op["::"],
      $Html$Attributes$Extra.valueAsFloat(p.value),
      A2($List._op["::"],
      A2($Html$Attributes$Extra.stringProperty,"step",A2($Maybe.withDefault,"any",A2($Maybe.map,$Basics.toString,p.step))),
      filterJust(_U.list([A2($Maybe.map,function (_p7) {    return $Html$Attributes.min($Basics.toString(_p7));},p.min)
                         ,A2($Maybe.map,function (_p8) {    return $Html$Attributes.max($Basics.toString(_p8));},p.max)])))));
   };
   var inputMaybeFloat$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "number"
      ,pattern: $Maybe.Nothing
      ,required: false
      ,decoder: function () {
         var _p9 = {ctor: "_Tuple2",_0: p.min,_1: p.max};
         if (_p9.ctor === "_Tuple2" && _p9._0.ctor === "Nothing" && _p9._1.ctor === "Nothing") {
               return $Html$Events$Extra.targetValueMaybeFloat;
            } else {
               return A2($Json$Decode.customDecoder,
               $Html$Events$Extra.targetValueMaybeFloat,
               function (mv) {
                  var _p10 = mv;
                  if (_p10.ctor === "Nothing") {
                        return $Result.Ok($Maybe.Nothing);
                     } else {
                        var _p11 = _p10._0;
                        return _U.cmp(_p11,A2($Maybe.withDefault,-1 / 0,p.min)) < 0 || _U.cmp(_p11,
                        A2($Maybe.withDefault,1 / 0,p.max)) > 0 ? $Result.Err("out of bounds") : $Result.Ok(mv);
                     }
               });
            }
      }()},
      A2($List._op["::"],
      function () {
         var _p12 = p.value;
         if (_p12.ctor === "Nothing") {
               return $Html$Attributes.value("");
            } else {
               return $Html$Attributes$Extra.valueAsFloat(_p12._0);
            }
      }(),
      A2($List._op["::"],
      A2($Html$Attributes$Extra.stringProperty,"step",A2($Maybe.withDefault,"any",A2($Maybe.map,$Basics.toString,p.step))),
      filterJust(_U.list([A2($Maybe.map,function (_p13) {    return $Html$Attributes.min($Basics.toString(_p13));},p.min)
                         ,A2($Maybe.map,function (_p14) {    return $Html$Attributes.max($Basics.toString(_p14));},p.max)])))));
   };
   var inputInt$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "number"
      ,pattern: $Maybe.Nothing
      ,required: true
      ,decoder: function () {
         var _p15 = {ctor: "_Tuple2",_0: p.min,_1: p.max};
         if (_p15.ctor === "_Tuple2" && _p15._0.ctor === "Nothing" && _p15._1.ctor === "Nothing") {
               return $Html$Events$Extra.targetValueInt;
            } else {
               return A2($Json$Decode.customDecoder,
               $Html$Events$Extra.targetValueInt,
               function (v) {
                  return _U.cmp(v,A2($Maybe.withDefault,$Basics.floor(-1 / 0),p.min)) < 0 || _U.cmp(v,
                  A2($Maybe.withDefault,$Basics.ceiling(1 / 0),p.max)) > 0 ? $Result.Err("out of bounds") : $Result.Ok(v);
               });
            }
      }()},
      A2($List._op["::"],
      $Html$Attributes$Extra.valueAsInt(p.value),
      filterJust(_U.list([A2($Maybe.map,function (_p16) {    return $Html$Attributes.min($Basics.toString(_p16));},p.min)
                         ,A2($Maybe.map,function (_p17) {    return $Html$Attributes.max($Basics.toString(_p17));},p.max)
                         ,A2($Maybe.map,function (_p18) {    return A2($Html$Attributes$Extra.stringProperty,"step",$Basics.toString(_p18));},p.step)]))));
   };
   var inputMaybeInt$ = function (p) {
      var filterJust = $List.filterMap($Basics.identity);
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "number"
      ,pattern: $Maybe.Nothing
      ,required: false
      ,decoder: function () {
         var _p19 = {ctor: "_Tuple2",_0: p.min,_1: p.max};
         if (_p19.ctor === "_Tuple2" && _p19._0.ctor === "Nothing" && _p19._1.ctor === "Nothing") {
               return $Html$Events$Extra.targetValueMaybeInt;
            } else {
               return A2($Json$Decode.customDecoder,
               $Html$Events$Extra.targetValueMaybeInt,
               function (mv) {
                  var _p20 = mv;
                  if (_p20.ctor === "Nothing") {
                        return $Result.Ok($Maybe.Nothing);
                     } else {
                        var _p21 = _p20._0;
                        return _U.cmp(_p21,A2($Maybe.withDefault,$Basics.floor(-1 / 0),p.min)) < 0 || _U.cmp(_p21,
                        A2($Maybe.withDefault,$Basics.ceiling(1 / 0),p.max)) > 0 ? $Result.Err("out of bounds") : $Result.Ok(mv);
                     }
               });
            }
      }()},
      A2($List._op["::"],
      function () {
         var _p22 = p.value;
         if (_p22.ctor === "Nothing") {
               return $Html$Attributes.value("");
            } else {
               return $Html$Attributes$Extra.valueAsInt(_p22._0);
            }
      }(),
      filterJust(_U.list([A2($Maybe.map,function (_p23) {    return $Html$Attributes.min($Basics.toString(_p23));},p.min)
                         ,A2($Maybe.map,function (_p24) {    return $Html$Attributes.max($Basics.toString(_p24));},p.max)
                         ,A2($Maybe.map,function (_p25) {    return A2($Html$Attributes$Extra.stringProperty,"step",$Basics.toString(_p25));},p.step)]))));
   };
   var inputUrl$ = function (p) {
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "url"
      ,pattern: $Maybe.Nothing
      ,required: p.required
      ,decoder: $Html$Events.targetValue},
      _U.list([$Html$Attributes.value(p.value),$Html$Attributes.autocomplete(p.autocomplete)]));
   };
   var inputMaybeUrl$ = function (p) {
      return A2(inputField$,
      {$class: p.$class
      ,name: p.name
      ,placeholder: p.placeholder
      ,update: p.update
      ,type$: "url"
      ,pattern: $Maybe.Nothing
      ,required: false
      ,decoder: $Html$Events$Extra.targetValueMaybe},
      _U.list([$Html$Attributes.value(A2($Maybe.withDefault,"",p.value)),$Html$Attributes.autocomplete(p.autocomplete)]));
   };
   var select$ = function (p) {
      var i$ = encodeId(p.name);
      return $Html.select(_U.list([class$(p.$class)
                                  ,$Html$Attributes.id(i$)
                                  ,$Html$Attributes.name(i$)
                                  ,A2($Html$Shorthand$Event.onChange,$Html$Events.targetValue,p.update.onSelect)]));
   };
   var output$ = function (p) {
      var i$ = encodeId(p.name);
      return $Html.output(_U.list([class$(p.$class)
                                  ,$Html$Attributes.id(i$)
                                  ,$Html$Attributes.name(i$)
                                  ,$Html$Attributes.$for(A2($String.join," ",A2($List.map,encodeId,p.$for)))]));
   };
   var fieldUpdateFallbackFocusLost = function (handler) {
      var doErr = function (r) {
         var _p26 = r;
         if (_p26.ctor === "Ok") {
               return $Maybe.Nothing;
            } else {
               var _p27 = A2($Json$Decode.decodeValue,$Html$Events.targetValue,_p26._0.event);
               if (_p27.ctor === "Ok") {
                     return $Maybe.Just(handler.onFallback(_p27._0));
                  } else {
                     return $Maybe.Nothing;
                  }
            }
      };
      var doOk = function (r) {    var _p28 = r;if (_p28.ctor === "Ok") {    return $Maybe.Just(handler.onInput(_p28._0));} else {    return $Maybe.Nothing;}};
      return {onInput: $Maybe.Just(doOk),onEnter: $Maybe.Just(doErr),onKeyboardLost: $Maybe.Just(doErr)};
   };
   var fieldUpdate = {onInput: $Maybe.Nothing,onEnter: $Maybe.Nothing,onKeyboardLost: $Maybe.Nothing};
   var fieldUpdateContinuous = function (handler) {
      var doOk = function (r) {    var _p29 = r;if (_p29.ctor === "Ok") {    return $Maybe.Just(handler.onInput(_p29._0));} else {    return $Maybe.Nothing;}};
      return _U.update(fieldUpdate,{onInput: $Maybe.Just(doOk)});
   };
   var fieldUpdateFocusLost = function (handler) {
      var doOk = function (r) {    var _p30 = r;if (_p30.ctor === "Ok") {    return $Maybe.Just(handler.onInput(_p30._0));} else {    return $Maybe.Nothing;}};
      return _U.update(fieldUpdate,{onEnter: $Maybe.Just(doOk),onKeyboardLost: $Maybe.Just(doOk)});
   };
   var fieldUpdateFallbackContinuous = function (handler) {
      var doOkErr = function (r) {
         var _p31 = r;
         if (_p31.ctor === "Ok") {
               return $Maybe.Just(handler.onInput(_p31._0));
            } else {
               var _p32 = A2($Json$Decode.decodeValue,$Html$Events.targetValue,_p31._0.event);
               if (_p32.ctor === "Ok") {
                     return $Maybe.Just(handler.onFallback(_p32._0));
                  } else {
                     return $Maybe.Nothing;
                  }
            }
      };
      return _U.update(fieldUpdate,{onInput: $Maybe.Just(doOkErr)});
   };
   var AutoDirection = {ctor: "AutoDirection"};
   var RightToLeft = {ctor: "RightToLeft"};
   var LeftToRight = {ctor: "LeftToRight"};
   return _elm.Html.Shorthand.values = {_op: _op
                                       ,LeftToRight: LeftToRight
                                       ,RightToLeft: RightToLeft
                                       ,AutoDirection: AutoDirection
                                       ,fieldUpdate: fieldUpdate
                                       ,fieldUpdateContinuous: fieldUpdateContinuous
                                       ,fieldUpdateFocusLost: fieldUpdateFocusLost
                                       ,fieldUpdateFallbackFocusLost: fieldUpdateFallbackFocusLost
                                       ,fieldUpdateFallbackContinuous: fieldUpdateFallbackContinuous
                                       ,encodeId: encodeId
                                       ,encodeClass: encodeClass
                                       ,id$: id$
                                       ,class$: class$
                                       ,body_: body_
                                       ,body$: body$
                                       ,section_: section_
                                       ,section$: section$
                                       ,nav_: nav_
                                       ,nav$: nav$
                                       ,article_: article_
                                       ,article$: article$
                                       ,aside$: aside$
                                       ,h1_: h1_
                                       ,h1$: h1$
                                       ,h2_: h2_
                                       ,h2$: h2$
                                       ,h3_: h3_
                                       ,h3$: h3$
                                       ,h4_: h4_
                                       ,h4$: h4$
                                       ,h5_: h5_
                                       ,h5$: h5$
                                       ,h6_: h6_
                                       ,h6$: h6$
                                       ,header_: header_
                                       ,header$: header$
                                       ,footer_: footer_
                                       ,footer$: footer$
                                       ,address_: address_
                                       ,address$: address$
                                       ,main_: main_
                                       ,p_: p_
                                       ,p$: p$
                                       ,hr_: hr_
                                       ,pre_: pre_
                                       ,pre$: pre$
                                       ,blockquote_: blockquote_
                                       ,blockquote$: blockquote$
                                       ,ol_: ol_
                                       ,ol$: ol$
                                       ,ul_: ul_
                                       ,ul$: ul$
                                       ,li_: li_
                                       ,li$: li$
                                       ,dl_: dl_
                                       ,dl$: dl$
                                       ,dt$: dt$
                                       ,dd_: dd_
                                       ,dd$: dd$
                                       ,figure$: figure$
                                       ,figcaption_: figcaption_
                                       ,figcaption$: figcaption$
                                       ,div_: div_
                                       ,div$: div$
                                       ,a_: a_
                                       ,a$: a$
                                       ,em_: em_
                                       ,em$: em$
                                       ,strong_: strong_
                                       ,strong$: strong$
                                       ,small_: small_
                                       ,small$: small$
                                       ,s_: s_
                                       ,s$: s$
                                       ,cite_: cite_
                                       ,cite$: cite$
                                       ,q_: q_
                                       ,q$: q$
                                       ,dfn$: dfn$
                                       ,abbr_: abbr_
                                       ,abbr$: abbr$
                                       ,code_: code_
                                       ,code$: code$
                                       ,var_: var_
                                       ,var$: var$
                                       ,samp_: samp_
                                       ,samp$: samp$
                                       ,kbd_: kbd_
                                       ,kbd$: kbd$
                                       ,sub_: sub_
                                       ,sub$: sub$
                                       ,sup_: sup_
                                       ,sup$: sup$
                                       ,i_: i_
                                       ,i$: i$
                                       ,b_: b_
                                       ,b$: b$
                                       ,u_: u_
                                       ,u$: u$
                                       ,mark_: mark_
                                       ,mark$: mark$
                                       ,ruby_: ruby_
                                       ,ruby$: ruby$
                                       ,rt_: rt_
                                       ,rt$: rt$
                                       ,rp_: rp_
                                       ,rp$: rp$
                                       ,bdi_: bdi_
                                       ,bdi$: bdi$
                                       ,bdo$: bdo$
                                       ,span_: span_
                                       ,span$: span$
                                       ,br$: br$
                                       ,wbr$: wbr$
                                       ,ins_: ins_
                                       ,ins$: ins$
                                       ,del_: del_
                                       ,del$: del$
                                       ,img$: img$
                                       ,img_: img_
                                       ,iframe$: iframe$
                                       ,embed$: embed$
                                       ,object$: object$
                                       ,param$: param$
                                       ,video_: video_
                                       ,video$: video$
                                       ,audio_: audio_
                                       ,audio$: audio$
                                       ,table_: table_
                                       ,table$: table$
                                       ,caption_: caption_
                                       ,caption$: caption$
                                       ,tbody_: tbody_
                                       ,tbody$: tbody$
                                       ,thead_: thead_
                                       ,thead$: thead$
                                       ,tfoot_: tfoot_
                                       ,tfoot$: tfoot$
                                       ,tr_: tr_
                                       ,tr$: tr$
                                       ,td_: td_
                                       ,td$: td$
                                       ,th_: th_
                                       ,th$: th$
                                       ,form$: form$
                                       ,fieldset_: fieldset_
                                       ,fieldset$: fieldset$
                                       ,legend_: legend_
                                       ,legend$: legend$
                                       ,label_: label_
                                       ,label$: label$
                                       ,inputField$: inputField$
                                       ,inputText$: inputText$
                                       ,inputMaybeText$: inputMaybeText$
                                       ,inputFloat$: inputFloat$
                                       ,inputMaybeFloat$: inputMaybeFloat$
                                       ,inputInt$: inputInt$
                                       ,inputMaybeInt$: inputMaybeInt$
                                       ,inputUrl$: inputUrl$
                                       ,inputMaybeUrl$: inputMaybeUrl$
                                       ,button_: button_
                                       ,button$: button$
                                       ,buttonLink_: buttonLink_
                                       ,buttonLink$: buttonLink$
                                       ,buttonSubmit_: buttonSubmit_
                                       ,buttonSubmit$: buttonSubmit$
                                       ,buttonReset_: buttonReset_
                                       ,buttonReset$: buttonReset$
                                       ,select$: select$
                                       ,option_: option_
                                       ,option$: option$
                                       ,output$: output$
                                       ,progress$: progress$
                                       ,meter$: meter$};
};
Elm.Bootstrap = Elm.Bootstrap || {};
Elm.Bootstrap.Html = Elm.Bootstrap.Html || {};
Elm.Bootstrap.Html.Internal = Elm.Bootstrap.Html.Internal || {};
Elm.Bootstrap.Html.Internal.make = function (_elm) {
   "use strict";
   _elm.Bootstrap = _elm.Bootstrap || {};
   _elm.Bootstrap.Html = _elm.Bootstrap.Html || {};
   _elm.Bootstrap.Html.Internal = _elm.Bootstrap.Html.Internal || {};
   if (_elm.Bootstrap.Html.Internal.values) return _elm.Bootstrap.Html.Internal.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Shorthand = Elm.Html.Shorthand.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var colOffset = F3(function (gridsize,colspan,offset) {
      var prefix = A2($Basics._op["++"],"col",A2($Basics._op["++"],A2($String.cons,_U.chr("-"),gridsize),"-"));
      return _U.cmp(offset,0) > 0 ? A2($Basics._op["++"],
      prefix,
      A2($Basics._op["++"],
      $Basics.toString(colspan),
      A2($Basics._op["++"],A2($String.cons,_U.chr(" "),prefix),A2($Basics._op["++"],"offset-",$Basics.toString(offset))))) : A2($Basics._op["++"],
      prefix,
      $Basics.toString(colspan));
   });
   var btncNoevent = F3(function (c,typ,_p0) {
      var _p1 = _p0;
      var filterJust = $List.filterMap($Basics.identity);
      return A2($Html.button,
      A2($List._op["::"],
      $Html$Attributes.type$(typ),
      A2($List._op["::"],$Html$Shorthand.class$(A2($Basics._op["++"],"btn ",c)),filterJust(_U.list([A2($Maybe.map,$Html$Attributes.title,_p1.tooltip)])))),
      function () {
         var _p2 = {ctor: "_Tuple2",_0: _p1.icon,_1: _p1.label};
         _v1_3: do {
            if (_p2.ctor === "_Tuple2") {
                  if (_p2._0.ctor === "Just") {
                        if (_p2._1.ctor === "Just") {
                              return _U.list([_p2._0._0,$Html.text(A2($String.cons,_U.chr(" "),_p2._1._0))]);
                           } else {
                              return _U.list([_p2._0._0]);
                           }
                     } else {
                        if (_p2._1.ctor === "Just") {
                              return _U.list([$Html.text(_p2._1._0)]);
                           } else {
                              break _v1_3;
                           }
                     }
               } else {
                  break _v1_3;
               }
         } while (false);
         return _U.list([]);
      }());
   });
   var btnc = F5(function (c,typ,_p3,addr,x) {
      var _p4 = _p3;
      var filterJust = $List.filterMap($Basics.identity);
      return A2($Html.button,
      A2($List._op["::"],
      $Html$Attributes.type$(typ),
      A2($List._op["::"],
      $Html$Shorthand.class$(A2($Basics._op["++"],"btn ",c)),
      A2($List._op["::"],A2($Html$Events.onClick,addr,x),filterJust(_U.list([A2($Maybe.map,$Html$Attributes.title,_p4.tooltip)]))))),
      function () {
         var _p5 = {ctor: "_Tuple2",_0: _p4.icon,_1: _p4.label};
         _v3_3: do {
            if (_p5.ctor === "_Tuple2") {
                  if (_p5._0.ctor === "Just") {
                        if (_p5._1.ctor === "Just") {
                              return _U.list([_p5._0._0,$Html.text(A2($String.cons,_U.chr(" "),_p5._1._0))]);
                           } else {
                              return _U.list([_p5._0._0]);
                           }
                     } else {
                        if (_p5._1.ctor === "Just") {
                              return _U.list([$Html.text(_p5._1._0)]);
                           } else {
                              break _v3_3;
                           }
                     }
               } else {
                  break _v3_3;
               }
         } while (false);
         return _U.list([]);
      }());
   });
   var BtnParam = F3(function (a,b,c) {    return {icon: a,label: b,tooltip: c};});
   return _elm.Bootstrap.Html.Internal.values = {_op: _op,BtnParam: BtnParam,btnc: btnc,btncNoevent: btncNoevent,colOffset: colOffset};
};
Elm.Bootstrap = Elm.Bootstrap || {};
Elm.Bootstrap.Html = Elm.Bootstrap.Html || {};
Elm.Bootstrap.Html.make = function (_elm) {
   "use strict";
   _elm.Bootstrap = _elm.Bootstrap || {};
   _elm.Bootstrap.Html = _elm.Bootstrap.Html || {};
   if (_elm.Bootstrap.Html.values) return _elm.Bootstrap.Html.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html$Internal = Elm.Bootstrap.Html.Internal.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Shorthand = Elm.Html.Shorthand.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var wellLg_ = $Html$Shorthand.div$({$class: "well well-lg"});
   var wellSm_ = $Html$Shorthand.div$({$class: "well well-sm"});
   var well_ = $Html$Shorthand.div$({$class: "well"});
   var embedResponsive4x3_ = $Html$Shorthand.div$({$class: "embed-responsive embed-responsive-4by3"});
   var embedResponsive16x9_ = $Html$Shorthand.div$({$class: "embed-responsive embed-responsive-16by9"});
   var panelTitle_ = function (t) {    return A2($Html$Shorthand.h2$,{$class: "panel-title"},_U.list([$Html.text(t)]));};
   var panelBody_ = $Html$Shorthand.div$({$class: "panel-body"});
   var panelHeading_ = $Html$Shorthand.div$({$class: "panel-heading"});
   var panelDefault_ = $Html$Shorthand.div$({$class: "panel panel-default"});
   var navbarHeader_ = $Html$Shorthand.div$({$class: "navbar-header"});
   var navbar$ = function (c) {    return $Html$Shorthand.nav$({$class: A2($Basics._op["++"],"navbar ",c)});};
   var navbarDefault$ = function (c) {    return navbar$(A2($Basics._op["++"],"navbar-default ",c));};
   var glyphiconTreeDeciduous$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-tree-deciduous ",c)},_U.list([]));
   };
   var glyphiconTreeDeciduous_ = glyphiconTreeDeciduous$("");
   var glyphiconTreeConifer$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-tree-conifer ",c)},_U.list([]));
   };
   var glyphiconTreeConifer_ = glyphiconTreeConifer$("");
   var glyphiconCloudUpload$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-cloud-upload ",c)},_U.list([]));
   };
   var glyphiconCloudUpload_ = glyphiconCloudUpload$("");
   var glyphiconCloudDownload$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-cloud-download ",c)},_U.list([]));
   };
   var glyphiconCloudDownload_ = glyphiconCloudDownload$("");
   var glyphiconRegistrationMark$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-registration-mark ",c)},_U.list([]));
   };
   var glyphiconRegistrationMark_ = glyphiconRegistrationMark$("");
   var glyphiconCopyrightMark$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-copyright-mark ",c)},_U.list([]));
   };
   var glyphiconCopyrightMark_ = glyphiconCopyrightMark$("");
   var glyphiconSound71$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sound-7-1 ",c)},_U.list([]));};
   var glyphiconSound71_ = glyphiconSound71$("");
   var glyphiconSound61$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sound-6-1 ",c)},_U.list([]));};
   var glyphiconSound61_ = glyphiconSound61$("");
   var glyphiconSound51$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sound-5-1 ",c)},_U.list([]));};
   var glyphiconSound51_ = glyphiconSound51$("");
   var glyphiconSoundDolby$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sound-dolby ",c)},_U.list([]));
   };
   var glyphiconSoundDolby_ = glyphiconSoundDolby$("");
   var glyphiconSoundStereo$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sound-stereo ",c)},_U.list([]));
   };
   var glyphiconSoundStereo_ = glyphiconSoundStereo$("");
   var glyphiconSubtitles$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-subtitles ",c)},_U.list([]));
   };
   var glyphiconSubtitles_ = glyphiconSubtitles$("");
   var glyphiconHdVideo$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-hd-video ",c)},_U.list([]));};
   var glyphiconHdVideo_ = glyphiconHdVideo$("");
   var glyphiconSdVideo$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sd-video ",c)},_U.list([]));};
   var glyphiconSdVideo_ = glyphiconSdVideo$("");
   var glyphiconStats$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-stats ",c)},_U.list([]));};
   var glyphiconStats_ = glyphiconStats$("");
   var glyphiconTower$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-tower ",c)},_U.list([]));};
   var glyphiconTower_ = glyphiconTower$("");
   var glyphiconPhoneAlt$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-phone-alt ",c)},_U.list([]));};
   var glyphiconPhoneAlt_ = glyphiconPhoneAlt$("");
   var glyphiconEarphone$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-earphone ",c)},_U.list([]));};
   var glyphiconEarphone_ = glyphiconEarphone$("");
   var glyphiconCompressed$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-compressed ",c)},_U.list([]));
   };
   var glyphiconCompressed_ = glyphiconCompressed$("");
   var glyphiconHeader$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-header ",c)},_U.list([]));};
   var glyphiconHeader_ = glyphiconHeader$("");
   var glyphiconCutlery$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-cutlery ",c)},_U.list([]));};
   var glyphiconCutlery_ = glyphiconCutlery$("");
   var glyphiconTransfer$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-transfer ",c)},_U.list([]));};
   var glyphiconTransfer_ = glyphiconTransfer$("");
   var glyphiconCreditCard$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-credit-card ",c)},_U.list([]));
   };
   var glyphiconCreditCard_ = glyphiconCreditCard$("");
   var glyphiconFloppyOpen$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-floppy-open ",c)},_U.list([]));
   };
   var glyphiconFloppyOpen_ = glyphiconFloppyOpen$("");
   var glyphiconFloppySave$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-floppy-save ",c)},_U.list([]));
   };
   var glyphiconFloppySave_ = glyphiconFloppySave$("");
   var glyphiconFloppyRemove$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-floppy-remove ",c)},_U.list([]));
   };
   var glyphiconFloppyRemove_ = glyphiconFloppyRemove$("");
   var glyphiconFloppySaved$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-floppy-saved ",c)},_U.list([]));
   };
   var glyphiconFloppySaved_ = glyphiconFloppySaved$("");
   var glyphiconFloppyDisk$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-floppy-disk ",c)},_U.list([]));
   };
   var glyphiconFloppyDisk_ = glyphiconFloppyDisk$("");
   var glyphiconSend$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-send ",c)},_U.list([]));};
   var glyphiconSend_ = glyphiconSend$("");
   var glyphiconExport$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-export ",c)},_U.list([]));};
   var glyphiconExport_ = glyphiconExport$("");
   var glyphiconImport$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-import ",c)},_U.list([]));};
   var glyphiconImport_ = glyphiconImport$("");
   var glyphiconSaved$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-saved ",c)},_U.list([]));};
   var glyphiconSaved_ = glyphiconSaved$("");
   var glyphiconOpen$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-open ",c)},_U.list([]));};
   var glyphiconOpen_ = glyphiconOpen$("");
   var glyphiconSave$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-save ",c)},_U.list([]));};
   var glyphiconSave_ = glyphiconSave$("");
   var glyphiconRecord$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-record ",c)},_U.list([]));};
   var glyphiconRecord_ = glyphiconRecord$("");
   var glyphiconNewWindow$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-new-window ",c)},_U.list([]));
   };
   var glyphiconNewWindow_ = glyphiconNewWindow$("");
   var glyphiconLogOut$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-log-out ",c)},_U.list([]));};
   var glyphiconLogOut_ = glyphiconLogOut$("");
   var glyphiconFlash$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-flash ",c)},_U.list([]));};
   var glyphiconFlash_ = glyphiconFlash$("");
   var glyphiconLogIn$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-log-in ",c)},_U.list([]));};
   var glyphiconLogIn_ = glyphiconLogIn$("");
   var glyphiconCollapseUp$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-collapse-up ",c)},_U.list([]));
   };
   var glyphiconCollapseUp_ = glyphiconCollapseUp$("");
   var glyphiconCollapseDown$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-collapse-down ",c)},_U.list([]));
   };
   var glyphiconCollapseDown_ = glyphiconCollapseDown$("");
   var glyphiconExpand$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-expand ",c)},_U.list([]));};
   var glyphiconExpand_ = glyphiconExpand$("");
   var glyphiconUnchecked$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-unchecked ",c)},_U.list([]));
   };
   var glyphiconUnchecked_ = glyphiconUnchecked$("");
   var glyphiconSortByAttributesAlt$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sort-by-attributes-alt ",c)},_U.list([]));
   };
   var glyphiconSortByAttributesAlt_ = glyphiconSortByAttributesAlt$("");
   var glyphiconSortByAttributes$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sort-by-attributes ",c)},_U.list([]));
   };
   var glyphiconSortByAttributes_ = glyphiconSortByAttributes$("");
   var glyphiconSortByOrderAlt$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sort-by-order-alt ",c)},_U.list([]));
   };
   var glyphiconSortByOrderAlt_ = glyphiconSortByOrderAlt$("");
   var glyphiconSortByOrder$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sort-by-order ",c)},_U.list([]));
   };
   var glyphiconSortByOrder_ = glyphiconSortByOrder$("");
   var glyphiconSortByAlphabetAlt$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sort-by-alphabet-alt ",c)},_U.list([]));
   };
   var glyphiconSortByAlphabetAlt_ = glyphiconSortByAlphabetAlt$("");
   var glyphiconSortByAlphabet$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sort-by-alphabet ",c)},_U.list([]));
   };
   var glyphiconSortByAlphabet_ = glyphiconSortByAlphabet$("");
   var glyphiconSort$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-sort ",c)},_U.list([]));};
   var glyphiconSort_ = glyphiconSort$("");
   var glyphiconGbp$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-gbp ",c)},_U.list([]));};
   var glyphiconGbp_ = glyphiconGbp$("");
   var glyphiconUsd$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-usd ",c)},_U.list([]));};
   var glyphiconUsd_ = glyphiconUsd$("");
   var glyphiconPushpin$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-pushpin ",c)},_U.list([]));};
   var glyphiconPushpin_ = glyphiconPushpin$("");
   var glyphiconPhone$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-phone ",c)},_U.list([]));};
   var glyphiconPhone_ = glyphiconPhone$("");
   var glyphiconLink$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-link ",c)},_U.list([]));};
   var glyphiconLink_ = glyphiconLink$("");
   var glyphiconHeartEmpty$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-heart-empty ",c)},_U.list([]));
   };
   var glyphiconHeartEmpty_ = glyphiconHeartEmpty$("");
   var glyphiconPaperclip$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-paperclip ",c)},_U.list([]));
   };
   var glyphiconPaperclip_ = glyphiconPaperclip$("");
   var glyphiconDashboard$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-dashboard ",c)},_U.list([]));
   };
   var glyphiconDashboard_ = glyphiconDashboard$("");
   var glyphiconFullscreen$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-fullscreen ",c)},_U.list([]));
   };
   var glyphiconFullscreen_ = glyphiconFullscreen$("");
   var glyphiconBriefcase$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-briefcase ",c)},_U.list([]));
   };
   var glyphiconBriefcase_ = glyphiconBriefcase$("");
   var glyphiconFilter$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-filter ",c)},_U.list([]));};
   var glyphiconFilter_ = glyphiconFilter$("");
   var glyphiconTasks$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-tasks ",c)},_U.list([]));};
   var glyphiconTasks_ = glyphiconTasks$("");
   var glyphiconWrench$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-wrench ",c)},_U.list([]));};
   var glyphiconWrench_ = glyphiconWrench$("");
   var glyphiconGlobe$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-globe ",c)},_U.list([]));};
   var glyphiconGlobe_ = glyphiconGlobe$("");
   var glyphiconCircleArrowDown$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-circle-arrow-down ",c)},_U.list([]));
   };
   var glyphiconCircleArrowDown_ = glyphiconCircleArrowDown$("");
   var glyphiconCircleArrowUp$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-circle-arrow-up ",c)},_U.list([]));
   };
   var glyphiconCircleArrowUp_ = glyphiconCircleArrowUp$("");
   var glyphiconCircleArrowLeft$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-circle-arrow-left ",c)},_U.list([]));
   };
   var glyphiconCircleArrowLeft_ = glyphiconCircleArrowLeft$("");
   var glyphiconCircleArrowRight$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-circle-arrow-right ",c)},_U.list([]));
   };
   var glyphiconCircleArrowRight_ = glyphiconCircleArrowRight$("");
   var glyphiconHandDown$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-hand-down ",c)},_U.list([]));};
   var glyphiconHandDown_ = glyphiconHandDown$("");
   var glyphiconHandUp$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-hand-up ",c)},_U.list([]));};
   var glyphiconHandUp_ = glyphiconHandUp$("");
   var glyphiconHandLeft$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-hand-left ",c)},_U.list([]));};
   var glyphiconHandLeft_ = glyphiconHandLeft$("");
   var glyphiconHandRight$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-hand-right ",c)},_U.list([]));
   };
   var glyphiconHandRight_ = glyphiconHandRight$("");
   var glyphiconThumbsDown$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-thumbs-down ",c)},_U.list([]));
   };
   var glyphiconThumbsDown_ = glyphiconThumbsDown$("");
   var glyphiconThumbsUp$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-thumbs-up ",c)},_U.list([]));};
   var glyphiconThumbsUp_ = glyphiconThumbsUp$("");
   var glyphiconCertificate$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-certificate ",c)},_U.list([]));
   };
   var glyphiconCertificate_ = glyphiconCertificate$("");
   var glyphiconBell$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-bell ",c)},_U.list([]));};
   var glyphiconBell_ = glyphiconBell$("");
   var glyphiconBullhorn$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-bullhorn ",c)},_U.list([]));};
   var glyphiconBullhorn_ = glyphiconBullhorn$("");
   var glyphiconHdd$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-hdd ",c)},_U.list([]));};
   var glyphiconHdd_ = glyphiconHdd$("");
   var glyphiconResizeHorizontal$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-resize-horizontal ",c)},_U.list([]));
   };
   var glyphiconResizeHorizontal_ = glyphiconResizeHorizontal$("");
   var glyphiconResizeVertical$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-resize-vertical ",c)},_U.list([]));
   };
   var glyphiconResizeVertical_ = glyphiconResizeVertical$("");
   var glyphiconFolderOpen$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-folder-open ",c)},_U.list([]));
   };
   var glyphiconFolderOpen_ = glyphiconFolderOpen$("");
   var glyphiconFolderClose$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-folder-close ",c)},_U.list([]));
   };
   var glyphiconFolderClose_ = glyphiconFolderClose$("");
   var glyphiconShoppingCart$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-shopping-cart ",c)},_U.list([]));
   };
   var glyphiconShoppingCart_ = glyphiconShoppingCart$("");
   var glyphiconRetweet$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-retweet ",c)},_U.list([]));};
   var glyphiconRetweet_ = glyphiconRetweet$("");
   var glyphiconChevronDown$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-chevron-down ",c)},_U.list([]));
   };
   var glyphiconChevronDown_ = glyphiconChevronDown$("");
   var glyphiconChevronUp$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-chevron-up ",c)},_U.list([]));
   };
   var glyphiconChevronUp_ = glyphiconChevronUp$("");
   var glyphiconMagnet$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-magnet ",c)},_U.list([]));};
   var glyphiconMagnet_ = glyphiconMagnet$("");
   var glyphiconComment$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-comment ",c)},_U.list([]));};
   var glyphiconComment_ = glyphiconComment$("");
   var glyphiconRandom$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-random ",c)},_U.list([]));};
   var glyphiconRandom_ = glyphiconRandom$("");
   var glyphiconCalendar$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-calendar ",c)},_U.list([]));};
   var glyphiconCalendar_ = glyphiconCalendar$("");
   var glyphiconPlane$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-plane ",c)},_U.list([]));};
   var glyphiconPlane_ = glyphiconPlane$("");
   var glyphiconWarningSign$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-warning-sign ",c)},_U.list([]));
   };
   var glyphiconWarningSign_ = glyphiconWarningSign$("");
   var glyphiconEyeClose$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-eye-close ",c)},_U.list([]));};
   var glyphiconEyeClose_ = glyphiconEyeClose$("");
   var glyphiconEyeOpen$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-eye-open ",c)},_U.list([]));};
   var glyphiconEyeOpen_ = glyphiconEyeOpen$("");
   var glyphiconFire$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-fire ",c)},_U.list([]));};
   var glyphiconFire_ = glyphiconFire$("");
   var glyphiconLeaf$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-leaf ",c)},_U.list([]));};
   var glyphiconLeaf_ = glyphiconLeaf$("");
   var glyphiconGift$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-gift ",c)},_U.list([]));};
   var glyphiconGift_ = glyphiconGift$("");
   var glyphiconExclamationSign$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-exclamation-sign ",c)},_U.list([]));
   };
   var glyphiconExclamationSign_ = glyphiconExclamationSign$("");
   var glyphiconResizeSmall$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-resize-small ",c)},_U.list([]));
   };
   var glyphiconResizeSmall_ = glyphiconResizeSmall$("");
   var glyphiconResizeFull$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-resize-full ",c)},_U.list([]));
   };
   var glyphiconResizeFull_ = glyphiconResizeFull$("");
   var glyphiconShareAlt$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-share-alt ",c)},_U.list([]));};
   var glyphiconShareAlt_ = glyphiconShareAlt$("");
   var glyphiconArrowDown$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-arrow-down ",c)},_U.list([]));
   };
   var glyphiconArrowDown_ = glyphiconArrowDown$("");
   var glyphiconArrowUp$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-arrow-up ",c)},_U.list([]));};
   var glyphiconArrowUp_ = glyphiconArrowUp$("");
   var glyphiconArrowRight$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-arrow-right ",c)},_U.list([]));
   };
   var glyphiconArrowRight_ = glyphiconArrowRight$("");
   var glyphiconArrowLeft$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-arrow-left ",c)},_U.list([]));
   };
   var glyphiconArrowLeft_ = glyphiconArrowLeft$("");
   var glyphiconBanCircle$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-ban-circle ",c)},_U.list([]));
   };
   var glyphiconBanCircle_ = glyphiconBanCircle$("");
   var glyphiconOkCircle$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-ok-circle ",c)},_U.list([]));};
   var glyphiconOkCircle_ = glyphiconOkCircle$("");
   var glyphiconRemoveCircle$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-remove-circle ",c)},_U.list([]));
   };
   var glyphiconRemoveCircle_ = glyphiconRemoveCircle$("");
   var glyphiconScreenshot$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-screenshot ",c)},_U.list([]));
   };
   var glyphiconScreenshot_ = glyphiconScreenshot$("");
   var glyphiconInfoSign$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-info-sign ",c)},_U.list([]));};
   var glyphiconInfoSign_ = glyphiconInfoSign$("");
   var glyphiconQuestionSign$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-question-sign ",c)},_U.list([]));
   };
   var glyphiconQuestionSign_ = glyphiconQuestionSign$("");
   var glyphiconOkSign$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-ok-sign ",c)},_U.list([]));};
   var glyphiconOkSign_ = glyphiconOkSign$("");
   var glyphiconRemoveSign$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-remove-sign ",c)},_U.list([]));
   };
   var glyphiconRemoveSign_ = glyphiconRemoveSign$("");
   var glyphiconMinusSign$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-minus-sign ",c)},_U.list([]));
   };
   var glyphiconMinusSign_ = glyphiconMinusSign$("");
   var glyphiconPlusSign$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-plus-sign ",c)},_U.list([]));};
   var glyphiconPlusSign_ = glyphiconPlusSign$("");
   var glyphiconChevronRight$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-chevron-right ",c)},_U.list([]));
   };
   var glyphiconChevronRight_ = glyphiconChevronRight$("");
   var glyphiconChevronLeft$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-chevron-left ",c)},_U.list([]));
   };
   var glyphiconChevronLeft_ = glyphiconChevronLeft$("");
   var glyphiconEject$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-eject ",c)},_U.list([]));};
   var glyphiconEject_ = glyphiconEject$("");
   var glyphiconStepForward$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-step-forward ",c)},_U.list([]));
   };
   var glyphiconStepForward_ = glyphiconStepForward$("");
   var glyphiconFastForward$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-fast-forward ",c)},_U.list([]));
   };
   var glyphiconFastForward_ = glyphiconFastForward$("");
   var glyphiconForward$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-forward ",c)},_U.list([]));};
   var glyphiconForward_ = glyphiconForward$("");
   var glyphiconStop$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-stop ",c)},_U.list([]));};
   var glyphiconStop_ = glyphiconStop$("");
   var glyphiconPause$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-pause ",c)},_U.list([]));};
   var glyphiconPause_ = glyphiconPause$("");
   var glyphiconPlay$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-play ",c)},_U.list([]));};
   var glyphiconPlay_ = glyphiconPlay$("");
   var glyphiconBackward$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-backward ",c)},_U.list([]));};
   var glyphiconBackward_ = glyphiconBackward$("");
   var glyphiconFastBackward$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-fast-backward ",c)},_U.list([]));
   };
   var glyphiconFastBackward_ = glyphiconFastBackward$("");
   var glyphiconStepBackward$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-step-backward ",c)},_U.list([]));
   };
   var glyphiconStepBackward_ = glyphiconStepBackward$("");
   var glyphiconMove$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-move ",c)},_U.list([]));};
   var glyphiconMove_ = glyphiconMove$("");
   var glyphiconCheck$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-check ",c)},_U.list([]));};
   var glyphiconCheck_ = glyphiconCheck$("");
   var glyphiconShare$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-share ",c)},_U.list([]));};
   var glyphiconShare_ = glyphiconShare$("");
   var glyphiconEdit$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-edit ",c)},_U.list([]));};
   var glyphiconEdit_ = glyphiconEdit$("");
   var glyphiconTint$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-tint ",c)},_U.list([]));};
   var glyphiconTint_ = glyphiconTint$("");
   var glyphiconAdjust$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-adjust ",c)},_U.list([]));};
   var glyphiconAdjust_ = glyphiconAdjust$("");
   var glyphiconMapMarker$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-map-marker ",c)},_U.list([]));
   };
   var glyphiconMapMarker_ = glyphiconMapMarker$("");
   var glyphiconPicture$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-picture ",c)},_U.list([]));};
   var glyphiconPicture_ = glyphiconPicture$("");
   var glyphiconFacetimeVideo$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-facetime-video ",c)},_U.list([]));
   };
   var glyphiconFacetimeVideo_ = glyphiconFacetimeVideo$("");
   var glyphiconIndentRight$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-indent-right ",c)},_U.list([]));
   };
   var glyphiconIndentRight_ = glyphiconIndentRight$("");
   var glyphiconIndentLeft$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-indent-left ",c)},_U.list([]));
   };
   var glyphiconIndentLeft_ = glyphiconIndentLeft$("");
   var glyphiconList$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-list ",c)},_U.list([]));};
   var glyphiconList_ = glyphiconList$("");
   var glyphiconAlignJustify$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-align-justify ",c)},_U.list([]));
   };
   var glyphiconAlignJustify_ = glyphiconAlignJustify$("");
   var glyphiconAlignRight$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-align-right ",c)},_U.list([]));
   };
   var glyphiconAlignRight_ = glyphiconAlignRight$("");
   var glyphiconAlignCenter$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-align-center ",c)},_U.list([]));
   };
   var glyphiconAlignCenter_ = glyphiconAlignCenter$("");
   var glyphiconAlignLeft$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-align-left ",c)},_U.list([]));
   };
   var glyphiconAlignLeft_ = glyphiconAlignLeft$("");
   var glyphiconTextWidth$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-text-width ",c)},_U.list([]));
   };
   var glyphiconTextWidth_ = glyphiconTextWidth$("");
   var glyphiconTextHeight$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-text-height ",c)},_U.list([]));
   };
   var glyphiconTextHeight_ = glyphiconTextHeight$("");
   var glyphiconItalic$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-italic ",c)},_U.list([]));};
   var glyphiconItalic_ = glyphiconItalic$("");
   var glyphiconBold$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-bold ",c)},_U.list([]));};
   var glyphiconBold_ = glyphiconBold$("");
   var glyphiconFont$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-font ",c)},_U.list([]));};
   var glyphiconFont_ = glyphiconFont$("");
   var glyphiconCamera$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-camera ",c)},_U.list([]));};
   var glyphiconCamera_ = glyphiconCamera$("");
   var glyphiconPrint$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-print ",c)},_U.list([]));};
   var glyphiconPrint_ = glyphiconPrint$("");
   var glyphiconBookmark$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-bookmark ",c)},_U.list([]));};
   var glyphiconBookmark_ = glyphiconBookmark$("");
   var glyphiconBook$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-book ",c)},_U.list([]));};
   var glyphiconBook_ = glyphiconBook$("");
   var glyphiconTags$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-tags ",c)},_U.list([]));};
   var glyphiconTags_ = glyphiconTags$("");
   var glyphiconTag$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-tag ",c)},_U.list([]));};
   var glyphiconTag_ = glyphiconTag$("");
   var glyphiconBarcode$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-barcode ",c)},_U.list([]));};
   var glyphiconBarcode_ = glyphiconBarcode$("");
   var glyphiconQrcode$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-qrcode ",c)},_U.list([]));};
   var glyphiconQrcode_ = glyphiconQrcode$("");
   var glyphiconVolumeUp$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-volume-up ",c)},_U.list([]));};
   var glyphiconVolumeUp_ = glyphiconVolumeUp$("");
   var glyphiconVolumeDown$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-volume-down ",c)},_U.list([]));
   };
   var glyphiconVolumeDown_ = glyphiconVolumeDown$("");
   var glyphiconVolumeOff$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-volume-off ",c)},_U.list([]));
   };
   var glyphiconVolumeOff_ = glyphiconVolumeOff$("");
   var glyphiconHeadphones$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-headphones ",c)},_U.list([]));
   };
   var glyphiconHeadphones_ = glyphiconHeadphones$("");
   var glyphiconFlag$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-flag ",c)},_U.list([]));};
   var glyphiconFlag_ = glyphiconFlag$("");
   var glyphiconLock$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-lock ",c)},_U.list([]));};
   var glyphiconLock_ = glyphiconLock$("");
   var glyphiconListAlt$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-list-alt ",c)},_U.list([]));};
   var glyphiconListAlt_ = glyphiconListAlt$("");
   var glyphiconRefresh$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-refresh ",c)},_U.list([]));};
   var glyphiconRefresh_ = glyphiconRefresh$("");
   var glyphiconRepeat$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-repeat ",c)},_U.list([]));};
   var glyphiconRepeat_ = glyphiconRepeat$("");
   var glyphiconPlayCircle$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-play-circle ",c)},_U.list([]));
   };
   var glyphiconPlayCircle_ = glyphiconPlayCircle$("");
   var glyphiconInbox$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-inbox ",c)},_U.list([]));};
   var glyphiconInbox_ = glyphiconInbox$("");
   var glyphiconUpload$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-upload ",c)},_U.list([]));};
   var glyphiconUpload_ = glyphiconUpload$("");
   var glyphiconDownload$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-download ",c)},_U.list([]));};
   var glyphiconDownload_ = glyphiconDownload$("");
   var glyphiconDownloadAlt$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-download-alt ",c)},_U.list([]));
   };
   var glyphiconDownloadAlt_ = glyphiconDownloadAlt$("");
   var glyphiconRoad$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-road ",c)},_U.list([]));};
   var glyphiconRoad_ = glyphiconRoad$("");
   var glyphiconTime$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-time ",c)},_U.list([]));};
   var glyphiconTime_ = glyphiconTime$("");
   var glyphiconFile$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-file ",c)},_U.list([]));};
   var glyphiconFile_ = glyphiconFile$("");
   var glyphiconHome$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-home ",c)},_U.list([]));};
   var glyphiconHome_ = glyphiconHome$("");
   var glyphiconTrash$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-trash ",c)},_U.list([]));};
   var glyphiconTrash_ = glyphiconTrash$("");
   var glyphiconCog$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-cog ",c)},_U.list([]));};
   var glyphiconCog_ = glyphiconCog$("");
   var glyphiconSignal$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-signal ",c)},_U.list([]));};
   var glyphiconSignal_ = glyphiconSignal$("");
   var glyphiconOff$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-off ",c)},_U.list([]));};
   var glyphiconOff_ = glyphiconOff$("");
   var glyphiconZoomOut$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-zoom-out ",c)},_U.list([]));};
   var glyphiconZoomOut_ = glyphiconZoomOut$("");
   var glyphiconZoomIn$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-zoom-in ",c)},_U.list([]));};
   var glyphiconZoomIn_ = glyphiconZoomIn$("");
   var glyphiconRemove$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-remove ",c)},_U.list([]));};
   var glyphiconRemove_ = glyphiconRemove$("");
   var glyphiconOk$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-ok ",c)},_U.list([]));};
   var glyphiconOk_ = glyphiconOk$("");
   var glyphiconThList$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-th-list ",c)},_U.list([]));};
   var glyphiconThList_ = glyphiconThList$("");
   var glyphiconTh$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-th ",c)},_U.list([]));};
   var glyphiconTh_ = glyphiconTh$("");
   var glyphiconThLarge$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-th-large ",c)},_U.list([]));};
   var glyphiconThLarge_ = glyphiconThLarge$("");
   var glyphiconFilm$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-film ",c)},_U.list([]));};
   var glyphiconFilm_ = glyphiconFilm$("");
   var glyphiconUser$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-user ",c)},_U.list([]));};
   var glyphiconUser_ = glyphiconUser$("");
   var glyphiconStarEmpty$ = function (c) {
      return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-star-empty ",c)},_U.list([]));
   };
   var glyphiconStarEmpty_ = glyphiconStarEmpty$("");
   var glyphiconStar$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-star ",c)},_U.list([]));};
   var glyphiconStar_ = glyphiconStar$("");
   var glyphiconHeart$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-heart ",c)},_U.list([]));};
   var glyphiconHeart_ = glyphiconHeart$("");
   var glyphiconSearch$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-search ",c)},_U.list([]));};
   var glyphiconSearch_ = glyphiconSearch$("");
   var glyphiconMusic$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-music ",c)},_U.list([]));};
   var glyphiconMusic_ = glyphiconMusic$("");
   var glyphiconGlass$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-glass ",c)},_U.list([]));};
   var glyphiconGlass_ = glyphiconGlass$("");
   var glyphiconPencil$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-pencil ",c)},_U.list([]));};
   var glyphiconPencil_ = glyphiconPencil$("");
   var glyphiconEnvelope$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-envelope ",c)},_U.list([]));};
   var glyphiconEnvelope_ = glyphiconEnvelope$("");
   var glyphiconCloud$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-cloud ",c)},_U.list([]));};
   var glyphiconCloud_ = glyphiconCloud$("");
   var glyphiconMinus$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-minus ",c)},_U.list([]));};
   var glyphiconMinus_ = glyphiconMinus$("");
   var glyphiconEuro$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-euro ",c)},_U.list([]));};
   var glyphiconEuro_ = glyphiconEuro$("");
   var glyphiconPlus$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-plus ",c)},_U.list([]));};
   var glyphiconPlus_ = glyphiconPlus$("");
   var glyphiconAsterisk$ = function (c) {    return A2($Html$Shorthand.span$,{$class: A2($Basics._op["++"],"glyphicon glyphicon-asterisk ",c)},_U.list([]));};
   var glyphiconAsterisk_ = glyphiconAsterisk$("");
   var skipNavigation_ = function (t) {    return A2($Html$Shorthand.a$,{$class: "sr-only sr-only-focusable",href: "#content"},_U.list([$Html.text(t)]));};
   var btnSubmitLgPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btncNoevent,"btn-lg btn-primary","submit",p);};
   var btnSubmitLgPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btncNoevent,A2($Basics._op["++"],"btn-lg btn-primary ",c),"submit",p);});
   var btnSubmitSmPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btncNoevent,"btn-sm btn-primary","submit",p);};
   var btnSubmitSmPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btncNoevent,A2($Basics._op["++"],"btn-sm btn-primary ",c),"submit",p);});
   var btnSubmitXsPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btncNoevent,"btn-xs btn-primary ","submit",p);};
   var btnSubmitXsPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btncNoevent,A2($Basics._op["++"],"btn-xs btn-primary ",c),"submit",p);});
   var btnSubmitPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btncNoevent,"btn-primary","submit",p);};
   var btnSubmitPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btncNoevent,A2($Basics._op["++"],"btn-primary ",c),"submit",p);});
   var btnLgDanger_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-lg btn-danger","button",p);};
   var btnLgDanger$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-lg btn-danger ",c),"button",p);});
   var btnSmDanger_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-sm btn-danger","button",p);};
   var btnSmDanger$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-sm btn-danger ",c),"button",p);});
   var btnXsDanger_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-xs btn-danger ","button",p);};
   var btnXsDanger$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-xs btn-danger ",c),"button",p);});
   var btnDanger_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-danger","button",p);};
   var btnDanger$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-danger ",c),"button",p);});
   var btnLgWarning_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-lg btn-warning","button",p);};
   var btnLgWarning$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-lg btn-warning ",c),"button",p);});
   var btnSmWarning_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-sm btn-warning","button",p);};
   var btnSmWarning$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-sm btn-warning ",c),"button",p);});
   var btnXsWarning_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-xs btn-warning ","button",p);};
   var btnXsWarning$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-xs btn-warning ",c),"button",p);});
   var btnWarning_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-warning","button",p);};
   var btnWarning$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-warning ",c),"button",p);});
   var btnLgInfo_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-lg btn-info","button",p);};
   var btnLgInfo$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-lg btn-info ",c),"button",p);});
   var btnSmInfo_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-sm btn-info","button",p);};
   var btnSmInfo$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-sm btn-info ",c),"button",p);});
   var btnXsInfo_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-xs btn-info ","button",p);};
   var btnXsInfo$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-xs btn-info ",c),"button",p);});
   var btnInfo_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-info","button",p);};
   var btnInfo$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-info ",c),"button",p);});
   var btnLgSuccess_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-lg btn-success","button",p);};
   var btnLgSuccess$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-lg btn-success ",c),"button",p);});
   var btnSmSuccess_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-sm btn-success","button",p);};
   var btnSmSuccess$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-sm btn-success ",c),"button",p);});
   var btnXsSuccess_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-xs btn-success ","button",p);};
   var btnXsSuccess$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-xs btn-success ",c),"button",p);});
   var panelDefault$ = F3(function (t,btns,bs) {
      var uncurry3 = F2(function (f,_p0) {    var _p1 = _p0;return A3(f,_p1._0,_p1._1._0,_p1._1._1);});
      return panelDefault_(_U.list([panelHeading_(A2($Basics._op["++"],
                                   A2($List.map,uncurry3(btnXsSuccess$("pull-right")),$List.reverse(btns)),
                                   _U.list([panelTitle_(t)])))
                                   ,panelBody_(bs)]));
   });
   var btnSuccess_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-success","button",p);};
   var btnSuccess$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-success ",c),"button",p);});
   var btnLgPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-lg btn-primary","button",p);};
   var btnLgPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-lg btn-primary ",c),"button",p);});
   var btnSmPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-sm btn-primary","button",p);};
   var btnSmPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-sm btn-primary ",c),"button",p);});
   var btnXsPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-xs btn-primary ","button",p);};
   var btnXsPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-xs btn-primary ",c),"button",p);});
   var btnPrimary_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-primary","button",p);};
   var btnPrimary$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-primary ",c),"button",p);});
   var btnLgDefault_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-lg btn-default","button",p);};
   var btnLgDefault$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-lg btn-default ",c),"button",p);});
   var btnSmDefault_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-sm btn-default","button",p);};
   var btnSmDefault$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-sm btn-default ",c),"button",p);});
   var btnXsDefault_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-xs btn-default ","button",p);};
   var btnXsDefault$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-xs btn-default  ",c),"button",p);});
   var btnDefault_ = function (p) {    return A3($Bootstrap$Html$Internal.btnc,"btn-default","button",p);};
   var btnDefault$ = F2(function (c,p) {    return A3($Bootstrap$Html$Internal.btnc,A2($Basics._op["++"],"btn-default ",c),"button",p);});
   var btnParam = {icon: $Maybe.Nothing,label: $Maybe.Nothing,tooltip: $Maybe.Nothing};
   var formGroup_ = $Html$Shorthand.div$({$class: "form-group"});
   var tableBodyStriped$ = function (c) {    return $Html$Shorthand.table$({$class: A2($Basics._op["++"],"table table-body-striped ",c)});};
   var tableBodyStriped_ = tableBodyStriped$("");
   var tableStriped$ = function (c) {    return $Html$Shorthand.table$({$class: A2($Basics._op["++"],"table table-striped ",c)});};
   var tableStriped_ = tableStriped$("");
   var colLgOffset_ = F8(function (xs,xsOffset,sm,smOffset,md,mdOffset,lg,lgOffset) {
      return $Html$Shorthand.div$({$class: A2($Basics._op["++"],
      A3($Bootstrap$Html$Internal.colOffset,"xs",xs,xsOffset),
      A2($Basics._op["++"],
      A2($String.cons,_U.chr(" "),A3($Bootstrap$Html$Internal.colOffset,"sm",sm,smOffset)),
      A2($Basics._op["++"],
      A2($String.cons,_U.chr(" "),A3($Bootstrap$Html$Internal.colOffset,"md",md,mdOffset)),
      A2($String.cons,_U.chr(" "),A3($Bootstrap$Html$Internal.colOffset,"lg",lg,lgOffset)))))});
   });
   var colMdOffset_ = F6(function (xs,xsOffset,sm,smOffset,md,mdOffset) {
      return $Html$Shorthand.div$({$class: A2($Basics._op["++"],
      A3($Bootstrap$Html$Internal.colOffset,"xs",xs,xsOffset),
      A2($Basics._op["++"],
      A2($String.cons,_U.chr(" "),A3($Bootstrap$Html$Internal.colOffset,"sm",sm,smOffset)),
      A2($String.cons,_U.chr(" "),A3($Bootstrap$Html$Internal.colOffset,"md",md,mdOffset))))});
   });
   var colSmOffset_ = F4(function (xs,xsOffset,sm,smOffset) {
      return $Html$Shorthand.div$({$class: A2($Basics._op["++"],
      A3($Bootstrap$Html$Internal.colOffset,"xs",xs,xsOffset),
      A2($String.cons,_U.chr(" "),A3($Bootstrap$Html$Internal.colOffset,"sm",sm,smOffset)))});
   });
   var colXsOffset_ = F2(function (xs,xsOffset) {    return $Html$Shorthand.div$({$class: A3($Bootstrap$Html$Internal.colOffset,"xs",xs,xsOffset)});});
   var colLg_ = F4(function (xs,sm,md,lg) {
      return $Html$Shorthand.div$({$class: A2($Basics._op["++"],
      "col-xs-",
      A2($Basics._op["++"],
      $Basics.toString(xs),
      A2($Basics._op["++"],
      " col-sm-",
      A2($Basics._op["++"],
      $Basics.toString(sm),
      A2($Basics._op["++"]," col-md-",A2($Basics._op["++"],$Basics.toString(md),A2($Basics._op["++"]," col-lg-",$Basics.toString(lg))))))))});
   });
   var colMd_ = F3(function (xs,sm,md) {
      return $Html$Shorthand.div$({$class: A2($Basics._op["++"],
      "col-xs-",
      A2($Basics._op["++"],
      $Basics.toString(xs),
      A2($Basics._op["++"]," col-sm-",A2($Basics._op["++"],$Basics.toString(sm),A2($Basics._op["++"]," col-md-",$Basics.toString(md))))))});
   });
   var colSm_ = F2(function (xs,sm) {
      return $Html$Shorthand.div$({$class: A2($Basics._op["++"],
      "col-xs-",
      A2($Basics._op["++"],$Basics.toString(xs),A2($Basics._op["++"]," col-sm-",$Basics.toString(sm))))});
   });
   var colXs_ = function (xs) {    return $Html$Shorthand.div$({$class: A2($Basics._op["++"],"col-xs-",$Basics.toString(xs))});};
   var row_ = $Html$Shorthand.div$({$class: "row"});
   var containerFluid_ = $Html$Shorthand.div$({$class: "container-fluid"});
   var container_ = $Html$Shorthand.div$({$class: "container"});
   return _elm.Bootstrap.Html.values = {_op: _op
                                       ,container_: container_
                                       ,containerFluid_: containerFluid_
                                       ,row_: row_
                                       ,colXs_: colXs_
                                       ,colSm_: colSm_
                                       ,colMd_: colMd_
                                       ,colLg_: colLg_
                                       ,colXsOffset_: colXsOffset_
                                       ,colSmOffset_: colSmOffset_
                                       ,colMdOffset_: colMdOffset_
                                       ,colLgOffset_: colLgOffset_
                                       ,tableStriped$: tableStriped$
                                       ,tableStriped_: tableStriped_
                                       ,tableBodyStriped$: tableBodyStriped$
                                       ,tableBodyStriped_: tableBodyStriped_
                                       ,formGroup_: formGroup_
                                       ,btnParam: btnParam
                                       ,btnDefault$: btnDefault$
                                       ,btnDefault_: btnDefault_
                                       ,btnXsDefault$: btnXsDefault$
                                       ,btnXsDefault_: btnXsDefault_
                                       ,btnSmDefault$: btnSmDefault$
                                       ,btnSmDefault_: btnSmDefault_
                                       ,btnLgDefault$: btnLgDefault$
                                       ,btnLgDefault_: btnLgDefault_
                                       ,btnPrimary$: btnPrimary$
                                       ,btnPrimary_: btnPrimary_
                                       ,btnXsPrimary$: btnXsPrimary$
                                       ,btnXsPrimary_: btnXsPrimary_
                                       ,btnSmPrimary$: btnSmPrimary$
                                       ,btnSmPrimary_: btnSmPrimary_
                                       ,btnLgPrimary$: btnLgPrimary$
                                       ,btnLgPrimary_: btnLgPrimary_
                                       ,btnSuccess$: btnSuccess$
                                       ,btnSuccess_: btnSuccess_
                                       ,btnXsSuccess$: btnXsSuccess$
                                       ,btnXsSuccess_: btnXsSuccess_
                                       ,btnSmSuccess$: btnSmSuccess$
                                       ,btnSmSuccess_: btnSmSuccess_
                                       ,btnLgSuccess$: btnLgSuccess$
                                       ,btnLgSuccess_: btnLgSuccess_
                                       ,btnInfo$: btnInfo$
                                       ,btnInfo_: btnInfo_
                                       ,btnXsInfo$: btnXsInfo$
                                       ,btnXsInfo_: btnXsInfo_
                                       ,btnSmInfo$: btnSmInfo$
                                       ,btnSmInfo_: btnSmInfo_
                                       ,btnLgInfo$: btnLgInfo$
                                       ,btnLgInfo_: btnLgInfo_
                                       ,btnWarning$: btnWarning$
                                       ,btnWarning_: btnWarning_
                                       ,btnXsWarning$: btnXsWarning$
                                       ,btnXsWarning_: btnXsWarning_
                                       ,btnSmWarning$: btnSmWarning$
                                       ,btnSmWarning_: btnSmWarning_
                                       ,btnLgWarning$: btnLgWarning$
                                       ,btnLgWarning_: btnLgWarning_
                                       ,btnDanger$: btnDanger$
                                       ,btnDanger_: btnDanger_
                                       ,btnXsDanger$: btnXsDanger$
                                       ,btnXsDanger_: btnXsDanger_
                                       ,btnSmDanger$: btnSmDanger$
                                       ,btnSmDanger_: btnSmDanger_
                                       ,btnLgDanger$: btnLgDanger$
                                       ,btnLgDanger_: btnLgDanger_
                                       ,btnSubmitPrimary$: btnSubmitPrimary$
                                       ,btnSubmitPrimary_: btnSubmitPrimary_
                                       ,btnSubmitXsPrimary$: btnSubmitXsPrimary$
                                       ,btnSubmitXsPrimary_: btnSubmitXsPrimary_
                                       ,btnSubmitSmPrimary$: btnSubmitSmPrimary$
                                       ,btnSubmitSmPrimary_: btnSubmitSmPrimary_
                                       ,btnSubmitLgPrimary$: btnSubmitLgPrimary$
                                       ,btnSubmitLgPrimary_: btnSubmitLgPrimary_
                                       ,skipNavigation_: skipNavigation_
                                       ,glyphiconAsterisk$: glyphiconAsterisk$
                                       ,glyphiconAsterisk_: glyphiconAsterisk_
                                       ,glyphiconPlus$: glyphiconPlus$
                                       ,glyphiconPlus_: glyphiconPlus_
                                       ,glyphiconEuro$: glyphiconEuro$
                                       ,glyphiconEuro_: glyphiconEuro_
                                       ,glyphiconMinus$: glyphiconMinus$
                                       ,glyphiconMinus_: glyphiconMinus_
                                       ,glyphiconCloud$: glyphiconCloud$
                                       ,glyphiconCloud_: glyphiconCloud_
                                       ,glyphiconEnvelope$: glyphiconEnvelope$
                                       ,glyphiconEnvelope_: glyphiconEnvelope_
                                       ,glyphiconPencil$: glyphiconPencil$
                                       ,glyphiconPencil_: glyphiconPencil_
                                       ,glyphiconGlass$: glyphiconGlass$
                                       ,glyphiconGlass_: glyphiconGlass_
                                       ,glyphiconMusic$: glyphiconMusic$
                                       ,glyphiconMusic_: glyphiconMusic_
                                       ,glyphiconSearch$: glyphiconSearch$
                                       ,glyphiconSearch_: glyphiconSearch_
                                       ,glyphiconHeart$: glyphiconHeart$
                                       ,glyphiconHeart_: glyphiconHeart_
                                       ,glyphiconStar$: glyphiconStar$
                                       ,glyphiconStar_: glyphiconStar_
                                       ,glyphiconStarEmpty$: glyphiconStarEmpty$
                                       ,glyphiconStarEmpty_: glyphiconStarEmpty_
                                       ,glyphiconUser$: glyphiconUser$
                                       ,glyphiconUser_: glyphiconUser_
                                       ,glyphiconFilm$: glyphiconFilm$
                                       ,glyphiconFilm_: glyphiconFilm_
                                       ,glyphiconThLarge$: glyphiconThLarge$
                                       ,glyphiconThLarge_: glyphiconThLarge_
                                       ,glyphiconTh$: glyphiconTh$
                                       ,glyphiconTh_: glyphiconTh_
                                       ,glyphiconThList$: glyphiconThList$
                                       ,glyphiconThList_: glyphiconThList_
                                       ,glyphiconOk$: glyphiconOk$
                                       ,glyphiconOk_: glyphiconOk_
                                       ,glyphiconRemove$: glyphiconRemove$
                                       ,glyphiconRemove_: glyphiconRemove_
                                       ,glyphiconZoomIn$: glyphiconZoomIn$
                                       ,glyphiconZoomIn_: glyphiconZoomIn_
                                       ,glyphiconZoomOut$: glyphiconZoomOut$
                                       ,glyphiconZoomOut_: glyphiconZoomOut_
                                       ,glyphiconOff$: glyphiconOff$
                                       ,glyphiconOff_: glyphiconOff_
                                       ,glyphiconSignal$: glyphiconSignal$
                                       ,glyphiconSignal_: glyphiconSignal_
                                       ,glyphiconCog$: glyphiconCog$
                                       ,glyphiconCog_: glyphiconCog_
                                       ,glyphiconTrash$: glyphiconTrash$
                                       ,glyphiconTrash_: glyphiconTrash_
                                       ,glyphiconHome$: glyphiconHome$
                                       ,glyphiconHome_: glyphiconHome_
                                       ,glyphiconFile$: glyphiconFile$
                                       ,glyphiconFile_: glyphiconFile_
                                       ,glyphiconTime$: glyphiconTime$
                                       ,glyphiconTime_: glyphiconTime_
                                       ,glyphiconRoad$: glyphiconRoad$
                                       ,glyphiconRoad_: glyphiconRoad_
                                       ,glyphiconDownloadAlt$: glyphiconDownloadAlt$
                                       ,glyphiconDownloadAlt_: glyphiconDownloadAlt_
                                       ,glyphiconDownload$: glyphiconDownload$
                                       ,glyphiconDownload_: glyphiconDownload_
                                       ,glyphiconUpload$: glyphiconUpload$
                                       ,glyphiconUpload_: glyphiconUpload_
                                       ,glyphiconInbox$: glyphiconInbox$
                                       ,glyphiconInbox_: glyphiconInbox_
                                       ,glyphiconPlayCircle$: glyphiconPlayCircle$
                                       ,glyphiconPlayCircle_: glyphiconPlayCircle_
                                       ,glyphiconRepeat$: glyphiconRepeat$
                                       ,glyphiconRepeat_: glyphiconRepeat_
                                       ,glyphiconRefresh$: glyphiconRefresh$
                                       ,glyphiconRefresh_: glyphiconRefresh_
                                       ,glyphiconListAlt$: glyphiconListAlt$
                                       ,glyphiconListAlt_: glyphiconListAlt_
                                       ,glyphiconLock$: glyphiconLock$
                                       ,glyphiconLock_: glyphiconLock_
                                       ,glyphiconFlag$: glyphiconFlag$
                                       ,glyphiconFlag_: glyphiconFlag_
                                       ,glyphiconHeadphones$: glyphiconHeadphones$
                                       ,glyphiconHeadphones_: glyphiconHeadphones_
                                       ,glyphiconVolumeOff$: glyphiconVolumeOff$
                                       ,glyphiconVolumeOff_: glyphiconVolumeOff_
                                       ,glyphiconVolumeDown$: glyphiconVolumeDown$
                                       ,glyphiconVolumeDown_: glyphiconVolumeDown_
                                       ,glyphiconVolumeUp$: glyphiconVolumeUp$
                                       ,glyphiconVolumeUp_: glyphiconVolumeUp_
                                       ,glyphiconQrcode$: glyphiconQrcode$
                                       ,glyphiconQrcode_: glyphiconQrcode_
                                       ,glyphiconBarcode$: glyphiconBarcode$
                                       ,glyphiconBarcode_: glyphiconBarcode_
                                       ,glyphiconTag$: glyphiconTag$
                                       ,glyphiconTag_: glyphiconTag_
                                       ,glyphiconTags$: glyphiconTags$
                                       ,glyphiconTags_: glyphiconTags_
                                       ,glyphiconBook$: glyphiconBook$
                                       ,glyphiconBook_: glyphiconBook_
                                       ,glyphiconBookmark$: glyphiconBookmark$
                                       ,glyphiconBookmark_: glyphiconBookmark_
                                       ,glyphiconPrint$: glyphiconPrint$
                                       ,glyphiconPrint_: glyphiconPrint_
                                       ,glyphiconCamera$: glyphiconCamera$
                                       ,glyphiconCamera_: glyphiconCamera_
                                       ,glyphiconFont$: glyphiconFont$
                                       ,glyphiconFont_: glyphiconFont_
                                       ,glyphiconBold$: glyphiconBold$
                                       ,glyphiconBold_: glyphiconBold_
                                       ,glyphiconItalic$: glyphiconItalic$
                                       ,glyphiconItalic_: glyphiconItalic_
                                       ,glyphiconTextHeight$: glyphiconTextHeight$
                                       ,glyphiconTextHeight_: glyphiconTextHeight_
                                       ,glyphiconTextWidth$: glyphiconTextWidth$
                                       ,glyphiconTextWidth_: glyphiconTextWidth_
                                       ,glyphiconAlignLeft$: glyphiconAlignLeft$
                                       ,glyphiconAlignLeft_: glyphiconAlignLeft_
                                       ,glyphiconAlignCenter$: glyphiconAlignCenter$
                                       ,glyphiconAlignCenter_: glyphiconAlignCenter_
                                       ,glyphiconAlignRight$: glyphiconAlignRight$
                                       ,glyphiconAlignRight_: glyphiconAlignRight_
                                       ,glyphiconAlignJustify$: glyphiconAlignJustify$
                                       ,glyphiconAlignJustify_: glyphiconAlignJustify_
                                       ,glyphiconList$: glyphiconList$
                                       ,glyphiconList_: glyphiconList_
                                       ,glyphiconIndentLeft$: glyphiconIndentLeft$
                                       ,glyphiconIndentLeft_: glyphiconIndentLeft_
                                       ,glyphiconIndentRight$: glyphiconIndentRight$
                                       ,glyphiconIndentRight_: glyphiconIndentRight_
                                       ,glyphiconFacetimeVideo$: glyphiconFacetimeVideo$
                                       ,glyphiconFacetimeVideo_: glyphiconFacetimeVideo_
                                       ,glyphiconPicture$: glyphiconPicture$
                                       ,glyphiconPicture_: glyphiconPicture_
                                       ,glyphiconMapMarker$: glyphiconMapMarker$
                                       ,glyphiconMapMarker_: glyphiconMapMarker_
                                       ,glyphiconAdjust$: glyphiconAdjust$
                                       ,glyphiconAdjust_: glyphiconAdjust_
                                       ,glyphiconTint$: glyphiconTint$
                                       ,glyphiconTint_: glyphiconTint_
                                       ,glyphiconEdit$: glyphiconEdit$
                                       ,glyphiconEdit_: glyphiconEdit_
                                       ,glyphiconShare$: glyphiconShare$
                                       ,glyphiconShare_: glyphiconShare_
                                       ,glyphiconCheck$: glyphiconCheck$
                                       ,glyphiconCheck_: glyphiconCheck_
                                       ,glyphiconMove$: glyphiconMove$
                                       ,glyphiconMove_: glyphiconMove_
                                       ,glyphiconStepBackward$: glyphiconStepBackward$
                                       ,glyphiconStepBackward_: glyphiconStepBackward_
                                       ,glyphiconFastBackward$: glyphiconFastBackward$
                                       ,glyphiconFastBackward_: glyphiconFastBackward_
                                       ,glyphiconBackward$: glyphiconBackward$
                                       ,glyphiconBackward_: glyphiconBackward_
                                       ,glyphiconPlay$: glyphiconPlay$
                                       ,glyphiconPlay_: glyphiconPlay_
                                       ,glyphiconPause$: glyphiconPause$
                                       ,glyphiconPause_: glyphiconPause_
                                       ,glyphiconStop$: glyphiconStop$
                                       ,glyphiconStop_: glyphiconStop_
                                       ,glyphiconForward$: glyphiconForward$
                                       ,glyphiconForward_: glyphiconForward_
                                       ,glyphiconFastForward$: glyphiconFastForward$
                                       ,glyphiconFastForward_: glyphiconFastForward_
                                       ,glyphiconStepForward$: glyphiconStepForward$
                                       ,glyphiconStepForward_: glyphiconStepForward_
                                       ,glyphiconEject$: glyphiconEject$
                                       ,glyphiconEject_: glyphiconEject_
                                       ,glyphiconChevronLeft$: glyphiconChevronLeft$
                                       ,glyphiconChevronLeft_: glyphiconChevronLeft_
                                       ,glyphiconChevronRight$: glyphiconChevronRight$
                                       ,glyphiconChevronRight_: glyphiconChevronRight_
                                       ,glyphiconPlusSign$: glyphiconPlusSign$
                                       ,glyphiconPlusSign_: glyphiconPlusSign_
                                       ,glyphiconMinusSign$: glyphiconMinusSign$
                                       ,glyphiconMinusSign_: glyphiconMinusSign_
                                       ,glyphiconRemoveSign$: glyphiconRemoveSign$
                                       ,glyphiconRemoveSign_: glyphiconRemoveSign_
                                       ,glyphiconOkSign$: glyphiconOkSign$
                                       ,glyphiconOkSign_: glyphiconOkSign_
                                       ,glyphiconQuestionSign$: glyphiconQuestionSign$
                                       ,glyphiconQuestionSign_: glyphiconQuestionSign_
                                       ,glyphiconInfoSign$: glyphiconInfoSign$
                                       ,glyphiconInfoSign_: glyphiconInfoSign_
                                       ,glyphiconScreenshot$: glyphiconScreenshot$
                                       ,glyphiconScreenshot_: glyphiconScreenshot_
                                       ,glyphiconRemoveCircle$: glyphiconRemoveCircle$
                                       ,glyphiconRemoveCircle_: glyphiconRemoveCircle_
                                       ,glyphiconOkCircle$: glyphiconOkCircle$
                                       ,glyphiconOkCircle_: glyphiconOkCircle_
                                       ,glyphiconBanCircle$: glyphiconBanCircle$
                                       ,glyphiconBanCircle_: glyphiconBanCircle_
                                       ,glyphiconArrowLeft$: glyphiconArrowLeft$
                                       ,glyphiconArrowLeft_: glyphiconArrowLeft_
                                       ,glyphiconArrowRight$: glyphiconArrowRight$
                                       ,glyphiconArrowRight_: glyphiconArrowRight_
                                       ,glyphiconArrowUp$: glyphiconArrowUp$
                                       ,glyphiconArrowUp_: glyphiconArrowUp_
                                       ,glyphiconArrowDown$: glyphiconArrowDown$
                                       ,glyphiconArrowDown_: glyphiconArrowDown_
                                       ,glyphiconShareAlt$: glyphiconShareAlt$
                                       ,glyphiconShareAlt_: glyphiconShareAlt_
                                       ,glyphiconResizeFull$: glyphiconResizeFull$
                                       ,glyphiconResizeFull_: glyphiconResizeFull_
                                       ,glyphiconResizeSmall$: glyphiconResizeSmall$
                                       ,glyphiconResizeSmall_: glyphiconResizeSmall_
                                       ,glyphiconExclamationSign$: glyphiconExclamationSign$
                                       ,glyphiconExclamationSign_: glyphiconExclamationSign_
                                       ,glyphiconGift$: glyphiconGift$
                                       ,glyphiconGift_: glyphiconGift_
                                       ,glyphiconLeaf$: glyphiconLeaf$
                                       ,glyphiconLeaf_: glyphiconLeaf_
                                       ,glyphiconFire$: glyphiconFire$
                                       ,glyphiconFire_: glyphiconFire_
                                       ,glyphiconEyeOpen$: glyphiconEyeOpen$
                                       ,glyphiconEyeOpen_: glyphiconEyeOpen_
                                       ,glyphiconEyeClose$: glyphiconEyeClose$
                                       ,glyphiconEyeClose_: glyphiconEyeClose_
                                       ,glyphiconWarningSign$: glyphiconWarningSign$
                                       ,glyphiconWarningSign_: glyphiconWarningSign_
                                       ,glyphiconPlane$: glyphiconPlane$
                                       ,glyphiconPlane_: glyphiconPlane_
                                       ,glyphiconCalendar$: glyphiconCalendar$
                                       ,glyphiconCalendar_: glyphiconCalendar_
                                       ,glyphiconRandom$: glyphiconRandom$
                                       ,glyphiconRandom_: glyphiconRandom_
                                       ,glyphiconComment$: glyphiconComment$
                                       ,glyphiconComment_: glyphiconComment_
                                       ,glyphiconMagnet$: glyphiconMagnet$
                                       ,glyphiconMagnet_: glyphiconMagnet_
                                       ,glyphiconChevronUp$: glyphiconChevronUp$
                                       ,glyphiconChevronUp_: glyphiconChevronUp_
                                       ,glyphiconChevronDown$: glyphiconChevronDown$
                                       ,glyphiconChevronDown_: glyphiconChevronDown_
                                       ,glyphiconRetweet$: glyphiconRetweet$
                                       ,glyphiconRetweet_: glyphiconRetweet_
                                       ,glyphiconShoppingCart$: glyphiconShoppingCart$
                                       ,glyphiconShoppingCart_: glyphiconShoppingCart_
                                       ,glyphiconFolderClose$: glyphiconFolderClose$
                                       ,glyphiconFolderClose_: glyphiconFolderClose_
                                       ,glyphiconFolderOpen$: glyphiconFolderOpen$
                                       ,glyphiconFolderOpen_: glyphiconFolderOpen_
                                       ,glyphiconResizeVertical$: glyphiconResizeVertical$
                                       ,glyphiconResizeVertical_: glyphiconResizeVertical_
                                       ,glyphiconResizeHorizontal$: glyphiconResizeHorizontal$
                                       ,glyphiconResizeHorizontal_: glyphiconResizeHorizontal_
                                       ,glyphiconHdd$: glyphiconHdd$
                                       ,glyphiconHdd_: glyphiconHdd_
                                       ,glyphiconBullhorn$: glyphiconBullhorn$
                                       ,glyphiconBullhorn_: glyphiconBullhorn_
                                       ,glyphiconBell$: glyphiconBell$
                                       ,glyphiconBell_: glyphiconBell_
                                       ,glyphiconCertificate$: glyphiconCertificate$
                                       ,glyphiconCertificate_: glyphiconCertificate_
                                       ,glyphiconThumbsUp$: glyphiconThumbsUp$
                                       ,glyphiconThumbsUp_: glyphiconThumbsUp_
                                       ,glyphiconThumbsDown$: glyphiconThumbsDown$
                                       ,glyphiconThumbsDown_: glyphiconThumbsDown_
                                       ,glyphiconHandRight$: glyphiconHandRight$
                                       ,glyphiconHandRight_: glyphiconHandRight_
                                       ,glyphiconHandLeft$: glyphiconHandLeft$
                                       ,glyphiconHandLeft_: glyphiconHandLeft_
                                       ,glyphiconHandUp$: glyphiconHandUp$
                                       ,glyphiconHandUp_: glyphiconHandUp_
                                       ,glyphiconHandDown$: glyphiconHandDown$
                                       ,glyphiconHandDown_: glyphiconHandDown_
                                       ,glyphiconCircleArrowRight$: glyphiconCircleArrowRight$
                                       ,glyphiconCircleArrowRight_: glyphiconCircleArrowRight_
                                       ,glyphiconCircleArrowLeft$: glyphiconCircleArrowLeft$
                                       ,glyphiconCircleArrowLeft_: glyphiconCircleArrowLeft_
                                       ,glyphiconCircleArrowUp$: glyphiconCircleArrowUp$
                                       ,glyphiconCircleArrowUp_: glyphiconCircleArrowUp_
                                       ,glyphiconCircleArrowDown$: glyphiconCircleArrowDown$
                                       ,glyphiconCircleArrowDown_: glyphiconCircleArrowDown_
                                       ,glyphiconGlobe$: glyphiconGlobe$
                                       ,glyphiconGlobe_: glyphiconGlobe_
                                       ,glyphiconWrench$: glyphiconWrench$
                                       ,glyphiconWrench_: glyphiconWrench_
                                       ,glyphiconTasks$: glyphiconTasks$
                                       ,glyphiconTasks_: glyphiconTasks_
                                       ,glyphiconFilter$: glyphiconFilter$
                                       ,glyphiconFilter_: glyphiconFilter_
                                       ,glyphiconBriefcase$: glyphiconBriefcase$
                                       ,glyphiconBriefcase_: glyphiconBriefcase_
                                       ,glyphiconFullscreen$: glyphiconFullscreen$
                                       ,glyphiconFullscreen_: glyphiconFullscreen_
                                       ,glyphiconDashboard$: glyphiconDashboard$
                                       ,glyphiconDashboard_: glyphiconDashboard_
                                       ,glyphiconPaperclip$: glyphiconPaperclip$
                                       ,glyphiconPaperclip_: glyphiconPaperclip_
                                       ,glyphiconHeartEmpty$: glyphiconHeartEmpty$
                                       ,glyphiconHeartEmpty_: glyphiconHeartEmpty_
                                       ,glyphiconLink$: glyphiconLink$
                                       ,glyphiconLink_: glyphiconLink_
                                       ,glyphiconPhone$: glyphiconPhone$
                                       ,glyphiconPhone_: glyphiconPhone_
                                       ,glyphiconPushpin$: glyphiconPushpin$
                                       ,glyphiconPushpin_: glyphiconPushpin_
                                       ,glyphiconUsd$: glyphiconUsd$
                                       ,glyphiconUsd_: glyphiconUsd_
                                       ,glyphiconGbp$: glyphiconGbp$
                                       ,glyphiconGbp_: glyphiconGbp_
                                       ,glyphiconSort$: glyphiconSort$
                                       ,glyphiconSort_: glyphiconSort_
                                       ,glyphiconSortByAlphabet$: glyphiconSortByAlphabet$
                                       ,glyphiconSortByAlphabet_: glyphiconSortByAlphabet_
                                       ,glyphiconSortByAlphabetAlt$: glyphiconSortByAlphabetAlt$
                                       ,glyphiconSortByAlphabetAlt_: glyphiconSortByAlphabetAlt_
                                       ,glyphiconSortByOrder$: glyphiconSortByOrder$
                                       ,glyphiconSortByOrder_: glyphiconSortByOrder_
                                       ,glyphiconSortByOrderAlt$: glyphiconSortByOrderAlt$
                                       ,glyphiconSortByOrderAlt_: glyphiconSortByOrderAlt_
                                       ,glyphiconSortByAttributes$: glyphiconSortByAttributes$
                                       ,glyphiconSortByAttributes_: glyphiconSortByAttributes_
                                       ,glyphiconSortByAttributesAlt$: glyphiconSortByAttributesAlt$
                                       ,glyphiconSortByAttributesAlt_: glyphiconSortByAttributesAlt_
                                       ,glyphiconUnchecked$: glyphiconUnchecked$
                                       ,glyphiconUnchecked_: glyphiconUnchecked_
                                       ,glyphiconExpand$: glyphiconExpand$
                                       ,glyphiconExpand_: glyphiconExpand_
                                       ,glyphiconCollapseDown$: glyphiconCollapseDown$
                                       ,glyphiconCollapseDown_: glyphiconCollapseDown_
                                       ,glyphiconCollapseUp$: glyphiconCollapseUp$
                                       ,glyphiconCollapseUp_: glyphiconCollapseUp_
                                       ,glyphiconLogIn$: glyphiconLogIn$
                                       ,glyphiconLogIn_: glyphiconLogIn_
                                       ,glyphiconFlash$: glyphiconFlash$
                                       ,glyphiconFlash_: glyphiconFlash_
                                       ,glyphiconLogOut$: glyphiconLogOut$
                                       ,glyphiconLogOut_: glyphiconLogOut_
                                       ,glyphiconNewWindow$: glyphiconNewWindow$
                                       ,glyphiconNewWindow_: glyphiconNewWindow_
                                       ,glyphiconRecord$: glyphiconRecord$
                                       ,glyphiconRecord_: glyphiconRecord_
                                       ,glyphiconSave$: glyphiconSave$
                                       ,glyphiconSave_: glyphiconSave_
                                       ,glyphiconOpen$: glyphiconOpen$
                                       ,glyphiconOpen_: glyphiconOpen_
                                       ,glyphiconSaved$: glyphiconSaved$
                                       ,glyphiconSaved_: glyphiconSaved_
                                       ,glyphiconImport$: glyphiconImport$
                                       ,glyphiconImport_: glyphiconImport_
                                       ,glyphiconExport$: glyphiconExport$
                                       ,glyphiconExport_: glyphiconExport_
                                       ,glyphiconSend$: glyphiconSend$
                                       ,glyphiconSend_: glyphiconSend_
                                       ,glyphiconFloppyDisk$: glyphiconFloppyDisk$
                                       ,glyphiconFloppyDisk_: glyphiconFloppyDisk_
                                       ,glyphiconFloppySaved$: glyphiconFloppySaved$
                                       ,glyphiconFloppySaved_: glyphiconFloppySaved_
                                       ,glyphiconFloppyRemove$: glyphiconFloppyRemove$
                                       ,glyphiconFloppyRemove_: glyphiconFloppyRemove_
                                       ,glyphiconFloppySave$: glyphiconFloppySave$
                                       ,glyphiconFloppySave_: glyphiconFloppySave_
                                       ,glyphiconFloppyOpen$: glyphiconFloppyOpen$
                                       ,glyphiconFloppyOpen_: glyphiconFloppyOpen_
                                       ,glyphiconCreditCard$: glyphiconCreditCard$
                                       ,glyphiconCreditCard_: glyphiconCreditCard_
                                       ,glyphiconTransfer$: glyphiconTransfer$
                                       ,glyphiconTransfer_: glyphiconTransfer_
                                       ,glyphiconCutlery$: glyphiconCutlery$
                                       ,glyphiconCutlery_: glyphiconCutlery_
                                       ,glyphiconHeader$: glyphiconHeader$
                                       ,glyphiconHeader_: glyphiconHeader_
                                       ,glyphiconCompressed$: glyphiconCompressed$
                                       ,glyphiconCompressed_: glyphiconCompressed_
                                       ,glyphiconEarphone$: glyphiconEarphone$
                                       ,glyphiconEarphone_: glyphiconEarphone_
                                       ,glyphiconPhoneAlt$: glyphiconPhoneAlt$
                                       ,glyphiconPhoneAlt_: glyphiconPhoneAlt_
                                       ,glyphiconTower$: glyphiconTower$
                                       ,glyphiconTower_: glyphiconTower_
                                       ,glyphiconStats$: glyphiconStats$
                                       ,glyphiconStats_: glyphiconStats_
                                       ,glyphiconSdVideo$: glyphiconSdVideo$
                                       ,glyphiconSdVideo_: glyphiconSdVideo_
                                       ,glyphiconHdVideo$: glyphiconHdVideo$
                                       ,glyphiconHdVideo_: glyphiconHdVideo_
                                       ,glyphiconSubtitles$: glyphiconSubtitles$
                                       ,glyphiconSubtitles_: glyphiconSubtitles_
                                       ,glyphiconSoundStereo$: glyphiconSoundStereo$
                                       ,glyphiconSoundStereo_: glyphiconSoundStereo_
                                       ,glyphiconSoundDolby$: glyphiconSoundDolby$
                                       ,glyphiconSoundDolby_: glyphiconSoundDolby_
                                       ,glyphiconSound51$: glyphiconSound51$
                                       ,glyphiconSound51_: glyphiconSound51_
                                       ,glyphiconSound61$: glyphiconSound61$
                                       ,glyphiconSound61_: glyphiconSound61_
                                       ,glyphiconSound71$: glyphiconSound71$
                                       ,glyphiconSound71_: glyphiconSound71_
                                       ,glyphiconCopyrightMark$: glyphiconCopyrightMark$
                                       ,glyphiconCopyrightMark_: glyphiconCopyrightMark_
                                       ,glyphiconRegistrationMark$: glyphiconRegistrationMark$
                                       ,glyphiconRegistrationMark_: glyphiconRegistrationMark_
                                       ,glyphiconCloudDownload$: glyphiconCloudDownload$
                                       ,glyphiconCloudDownload_: glyphiconCloudDownload_
                                       ,glyphiconCloudUpload$: glyphiconCloudUpload$
                                       ,glyphiconCloudUpload_: glyphiconCloudUpload_
                                       ,glyphiconTreeConifer$: glyphiconTreeConifer$
                                       ,glyphiconTreeConifer_: glyphiconTreeConifer_
                                       ,glyphiconTreeDeciduous$: glyphiconTreeDeciduous$
                                       ,glyphiconTreeDeciduous_: glyphiconTreeDeciduous_
                                       ,navbar$: navbar$
                                       ,navbarDefault$: navbarDefault$
                                       ,navbarHeader_: navbarHeader_
                                       ,panelDefault_: panelDefault_
                                       ,panelHeading_: panelHeading_
                                       ,panelBody_: panelBody_
                                       ,panelTitle_: panelTitle_
                                       ,panelDefault$: panelDefault$
                                       ,embedResponsive16x9_: embedResponsive16x9_
                                       ,embedResponsive4x3_: embedResponsive4x3_
                                       ,well_: well_
                                       ,wellSm_: wellSm_
                                       ,wellLg_: wellLg_};
};
Elm.Native.Date = {};
Elm.Native.Date.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Date = localRuntime.Native.Date || {};
	if (localRuntime.Native.Date.values)
	{
		return localRuntime.Native.Date.values;
	}

	var Result = Elm.Result.make(localRuntime);

	function readDate(str)
	{
		var date = new Date(str);
		return isNaN(date.getTime())
			? Result.Err('unable to parse \'' + str + '\' as a date')
			: Result.Ok(date);
	}

	var dayTable = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var monthTable =
		['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


	return localRuntime.Native.Date.values = {
		read: readDate,
		year: function(d) { return d.getFullYear(); },
		month: function(d) { return { ctor: monthTable[d.getMonth()] }; },
		day: function(d) { return d.getDate(); },
		hour: function(d) { return d.getHours(); },
		minute: function(d) { return d.getMinutes(); },
		second: function(d) { return d.getSeconds(); },
		millisecond: function(d) { return d.getMilliseconds(); },
		toTime: function(d) { return d.getTime(); },
		fromTime: function(t) { return new Date(t); },
		dayOfWeek: function(d) { return { ctor: dayTable[d.getDay()] }; }
	};
};

Elm.Native.Time = {};

Elm.Native.Time.make = function(localRuntime)
{
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Time = localRuntime.Native.Time || {};
	if (localRuntime.Native.Time.values)
	{
		return localRuntime.Native.Time.values;
	}

	var NS = Elm.Native.Signal.make(localRuntime);
	var Maybe = Elm.Maybe.make(localRuntime);


	// FRAMES PER SECOND

	function fpsWhen(desiredFPS, isOn)
	{
		var msPerFrame = 1000 / desiredFPS;
		var ticker = NS.input('fps-' + desiredFPS, null);

		function notifyTicker()
		{
			localRuntime.notify(ticker.id, null);
		}

		function firstArg(x, y)
		{
			return x;
		}

		// input fires either when isOn changes, or when ticker fires.
		// Its value is a tuple with the current timestamp, and the state of isOn
		var input = NS.timestamp(A3(NS.map2, F2(firstArg), NS.dropRepeats(isOn), ticker));

		var initialState = {
			isOn: false,
			time: localRuntime.timer.programStart,
			delta: 0
		};

		var timeoutId;

		function update(input, state)
		{
			var currentTime = input._0;
			var isOn = input._1;
			var wasOn = state.isOn;
			var previousTime = state.time;

			if (isOn)
			{
				timeoutId = localRuntime.setTimeout(notifyTicker, msPerFrame);
			}
			else if (wasOn)
			{
				clearTimeout(timeoutId);
			}

			return {
				isOn: isOn,
				time: currentTime,
				delta: (isOn && !wasOn) ? 0 : currentTime - previousTime
			};
		}

		return A2(
			NS.map,
			function(state) { return state.delta; },
			A3(NS.foldp, F2(update), update(input.value, initialState), input)
		);
	}


	// EVERY

	function every(t)
	{
		var ticker = NS.input('every-' + t, null);
		function tellTime()
		{
			localRuntime.notify(ticker.id, null);
		}
		var clock = A2(NS.map, fst, NS.timestamp(ticker));
		setInterval(tellTime, t);
		return clock;
	}


	function fst(pair)
	{
		return pair._0;
	}


	function read(s)
	{
		var t = Date.parse(s);
		return isNaN(t) ? Maybe.Nothing : Maybe.Just(t);
	}

	return localRuntime.Native.Time.values = {
		fpsWhen: F2(fpsWhen),
		every: every,
		toDate: function(t) { return new Date(t); },
		read: read
	};
};

Elm.Time = Elm.Time || {};
Elm.Time.make = function (_elm) {
   "use strict";
   _elm.Time = _elm.Time || {};
   if (_elm.Time.values) return _elm.Time.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Native$Signal = Elm.Native.Signal.make(_elm),
   $Native$Time = Elm.Native.Time.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var delay = $Native$Signal.delay;
   var since = F2(function (time,signal) {
      var stop = A2($Signal.map,$Basics.always(-1),A2(delay,time,signal));
      var start = A2($Signal.map,$Basics.always(1),signal);
      var delaydiff = A3($Signal.foldp,F2(function (x,y) {    return x + y;}),0,A2($Signal.merge,start,stop));
      return A2($Signal.map,F2(function (x,y) {    return !_U.eq(x,y);})(0),delaydiff);
   });
   var timestamp = $Native$Signal.timestamp;
   var every = $Native$Time.every;
   var fpsWhen = $Native$Time.fpsWhen;
   var fps = function (targetFrames) {    return A2(fpsWhen,targetFrames,$Signal.constant(true));};
   var inMilliseconds = function (t) {    return t;};
   var millisecond = 1;
   var second = 1000 * millisecond;
   var minute = 60 * second;
   var hour = 60 * minute;
   var inHours = function (t) {    return t / hour;};
   var inMinutes = function (t) {    return t / minute;};
   var inSeconds = function (t) {    return t / second;};
   return _elm.Time.values = {_op: _op
                             ,millisecond: millisecond
                             ,second: second
                             ,minute: minute
                             ,hour: hour
                             ,inMilliseconds: inMilliseconds
                             ,inSeconds: inSeconds
                             ,inMinutes: inMinutes
                             ,inHours: inHours
                             ,fps: fps
                             ,fpsWhen: fpsWhen
                             ,every: every
                             ,timestamp: timestamp
                             ,delay: delay
                             ,since: since};
};
Elm.Date = Elm.Date || {};
Elm.Date.make = function (_elm) {
   "use strict";
   _elm.Date = _elm.Date || {};
   if (_elm.Date.values) return _elm.Date.values;
   var _U = Elm.Native.Utils.make(_elm),$Native$Date = Elm.Native.Date.make(_elm),$Result = Elm.Result.make(_elm),$Time = Elm.Time.make(_elm);
   var _op = {};
   var millisecond = $Native$Date.millisecond;
   var second = $Native$Date.second;
   var minute = $Native$Date.minute;
   var hour = $Native$Date.hour;
   var dayOfWeek = $Native$Date.dayOfWeek;
   var day = $Native$Date.day;
   var month = $Native$Date.month;
   var year = $Native$Date.year;
   var fromTime = $Native$Date.fromTime;
   var toTime = $Native$Date.toTime;
   var fromString = $Native$Date.read;
   var Dec = {ctor: "Dec"};
   var Nov = {ctor: "Nov"};
   var Oct = {ctor: "Oct"};
   var Sep = {ctor: "Sep"};
   var Aug = {ctor: "Aug"};
   var Jul = {ctor: "Jul"};
   var Jun = {ctor: "Jun"};
   var May = {ctor: "May"};
   var Apr = {ctor: "Apr"};
   var Mar = {ctor: "Mar"};
   var Feb = {ctor: "Feb"};
   var Jan = {ctor: "Jan"};
   var Sun = {ctor: "Sun"};
   var Sat = {ctor: "Sat"};
   var Fri = {ctor: "Fri"};
   var Thu = {ctor: "Thu"};
   var Wed = {ctor: "Wed"};
   var Tue = {ctor: "Tue"};
   var Mon = {ctor: "Mon"};
   var Date = {ctor: "Date"};
   return _elm.Date.values = {_op: _op
                             ,fromString: fromString
                             ,toTime: toTime
                             ,fromTime: fromTime
                             ,year: year
                             ,month: month
                             ,day: day
                             ,dayOfWeek: dayOfWeek
                             ,hour: hour
                             ,minute: minute
                             ,second: second
                             ,millisecond: millisecond
                             ,Jan: Jan
                             ,Feb: Feb
                             ,Mar: Mar
                             ,Apr: Apr
                             ,May: May
                             ,Jun: Jun
                             ,Jul: Jul
                             ,Aug: Aug
                             ,Sep: Sep
                             ,Oct: Oct
                             ,Nov: Nov
                             ,Dec: Dec
                             ,Mon: Mon
                             ,Tue: Tue
                             ,Wed: Wed
                             ,Thu: Thu
                             ,Fri: Fri
                             ,Sat: Sat
                             ,Sun: Sun};
};
Elm.Set = Elm.Set || {};
Elm.Set.make = function (_elm) {
   "use strict";
   _elm.Set = _elm.Set || {};
   if (_elm.Set.values) return _elm.Set.values;
   var _U = Elm.Native.Utils.make(_elm),$Basics = Elm.Basics.make(_elm),$Dict = Elm.Dict.make(_elm),$List = Elm.List.make(_elm);
   var _op = {};
   var foldr = F3(function (f,b,_p0) {    var _p1 = _p0;return A3($Dict.foldr,F3(function (k,_p2,b) {    return A2(f,k,b);}),b,_p1._0);});
   var foldl = F3(function (f,b,_p3) {    var _p4 = _p3;return A3($Dict.foldl,F3(function (k,_p5,b) {    return A2(f,k,b);}),b,_p4._0);});
   var toList = function (_p6) {    var _p7 = _p6;return $Dict.keys(_p7._0);};
   var size = function (_p8) {    var _p9 = _p8;return $Dict.size(_p9._0);};
   var member = F2(function (k,_p10) {    var _p11 = _p10;return A2($Dict.member,k,_p11._0);});
   var isEmpty = function (_p12) {    var _p13 = _p12;return $Dict.isEmpty(_p13._0);};
   var Set_elm_builtin = function (a) {    return {ctor: "Set_elm_builtin",_0: a};};
   var empty = Set_elm_builtin($Dict.empty);
   var singleton = function (k) {    return Set_elm_builtin(A2($Dict.singleton,k,{ctor: "_Tuple0"}));};
   var insert = F2(function (k,_p14) {    var _p15 = _p14;return Set_elm_builtin(A3($Dict.insert,k,{ctor: "_Tuple0"},_p15._0));});
   var fromList = function (xs) {    return A3($List.foldl,insert,empty,xs);};
   var map = F2(function (f,s) {    return fromList(A2($List.map,f,toList(s)));});
   var remove = F2(function (k,_p16) {    var _p17 = _p16;return Set_elm_builtin(A2($Dict.remove,k,_p17._0));});
   var union = F2(function (_p19,_p18) {    var _p20 = _p19;var _p21 = _p18;return Set_elm_builtin(A2($Dict.union,_p20._0,_p21._0));});
   var intersect = F2(function (_p23,_p22) {    var _p24 = _p23;var _p25 = _p22;return Set_elm_builtin(A2($Dict.intersect,_p24._0,_p25._0));});
   var diff = F2(function (_p27,_p26) {    var _p28 = _p27;var _p29 = _p26;return Set_elm_builtin(A2($Dict.diff,_p28._0,_p29._0));});
   var filter = F2(function (p,_p30) {    var _p31 = _p30;return Set_elm_builtin(A2($Dict.filter,F2(function (k,_p32) {    return p(k);}),_p31._0));});
   var partition = F2(function (p,_p33) {
      var _p34 = _p33;
      var _p35 = A2($Dict.partition,F2(function (k,_p36) {    return p(k);}),_p34._0);
      var p1 = _p35._0;
      var p2 = _p35._1;
      return {ctor: "_Tuple2",_0: Set_elm_builtin(p1),_1: Set_elm_builtin(p2)};
   });
   return _elm.Set.values = {_op: _op
                            ,empty: empty
                            ,singleton: singleton
                            ,insert: insert
                            ,remove: remove
                            ,isEmpty: isEmpty
                            ,member: member
                            ,size: size
                            ,foldl: foldl
                            ,foldr: foldr
                            ,map: map
                            ,filter: filter
                            ,partition: partition
                            ,union: union
                            ,intersect: intersect
                            ,diff: diff
                            ,toList: toList
                            ,fromList: fromList};
};
Elm.Native.Regex = {};
Elm.Native.Regex.make = function(localRuntime) {
	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Regex = localRuntime.Native.Regex || {};
	if (localRuntime.Native.Regex.values)
	{
		return localRuntime.Native.Regex.values;
	}
	if ('values' in Elm.Native.Regex)
	{
		return localRuntime.Native.Regex.values = Elm.Native.Regex.values;
	}

	var List = Elm.Native.List.make(localRuntime);
	var Maybe = Elm.Maybe.make(localRuntime);

	function escape(str)
	{
		return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}
	function caseInsensitive(re)
	{
		return new RegExp(re.source, 'gi');
	}
	function regex(raw)
	{
		return new RegExp(raw, 'g');
	}

	function contains(re, string)
	{
		return string.match(re) !== null;
	}

	function find(n, re, str)
	{
		n = n.ctor === 'All' ? Infinity : n._0;
		var out = [];
		var number = 0;
		var string = str;
		var lastIndex = re.lastIndex;
		var prevLastIndex = -1;
		var result;
		while (number++ < n && (result = re.exec(string)))
		{
			if (prevLastIndex === re.lastIndex) break;
			var i = result.length - 1;
			var subs = new Array(i);
			while (i > 0)
			{
				var submatch = result[i];
				subs[--i] = submatch === undefined
					? Maybe.Nothing
					: Maybe.Just(submatch);
			}
			out.push({
				match: result[0],
				submatches: List.fromArray(subs),
				index: result.index,
				number: number
			});
			prevLastIndex = re.lastIndex;
		}
		re.lastIndex = lastIndex;
		return List.fromArray(out);
	}

	function replace(n, re, replacer, string)
	{
		n = n.ctor === 'All' ? Infinity : n._0;
		var count = 0;
		function jsReplacer(match)
		{
			if (count++ >= n)
			{
				return match;
			}
			var i = arguments.length - 3;
			var submatches = new Array(i);
			while (i > 0)
			{
				var submatch = arguments[i];
				submatches[--i] = submatch === undefined
					? Maybe.Nothing
					: Maybe.Just(submatch);
			}
			return replacer({
				match: match,
				submatches: List.fromArray(submatches),
				index: arguments[i - 1],
				number: count
			});
		}
		return string.replace(re, jsReplacer);
	}

	function split(n, re, str)
	{
		n = n.ctor === 'All' ? Infinity : n._0;
		if (n === Infinity)
		{
			return List.fromArray(str.split(re));
		}
		var string = str;
		var result;
		var out = [];
		var start = re.lastIndex;
		while (n--)
		{
			if (!(result = re.exec(string))) break;
			out.push(string.slice(start, result.index));
			start = re.lastIndex;
		}
		out.push(string.slice(start));
		return List.fromArray(out);
	}

	return Elm.Native.Regex.values = {
		regex: regex,
		caseInsensitive: caseInsensitive,
		escape: escape,

		contains: F2(contains),
		find: F3(find),
		replace: F4(replace),
		split: F3(split)
	};
};

Elm.Regex = Elm.Regex || {};
Elm.Regex.make = function (_elm) {
   "use strict";
   _elm.Regex = _elm.Regex || {};
   if (_elm.Regex.values) return _elm.Regex.values;
   var _U = Elm.Native.Utils.make(_elm),$Maybe = Elm.Maybe.make(_elm),$Native$Regex = Elm.Native.Regex.make(_elm);
   var _op = {};
   var split = $Native$Regex.split;
   var replace = $Native$Regex.replace;
   var find = $Native$Regex.find;
   var AtMost = function (a) {    return {ctor: "AtMost",_0: a};};
   var All = {ctor: "All"};
   var Match = F4(function (a,b,c,d) {    return {match: a,submatches: b,index: c,number: d};});
   var contains = $Native$Regex.contains;
   var caseInsensitive = $Native$Regex.caseInsensitive;
   var regex = $Native$Regex.regex;
   var escape = $Native$Regex.escape;
   var Regex = {ctor: "Regex"};
   return _elm.Regex.values = {_op: _op
                              ,regex: regex
                              ,escape: escape
                              ,caseInsensitive: caseInsensitive
                              ,contains: contains
                              ,find: find
                              ,replace: replace
                              ,split: split
                              ,Match: Match
                              ,All: All
                              ,AtMost: AtMost};
};
Elm.Native.Effects = {};
Elm.Native.Effects.make = function(localRuntime) {

	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Effects = localRuntime.Native.Effects || {};
	if (localRuntime.Native.Effects.values)
	{
		return localRuntime.Native.Effects.values;
	}

	var Task = Elm.Native.Task.make(localRuntime);
	var Utils = Elm.Native.Utils.make(localRuntime);
	var Signal = Elm.Signal.make(localRuntime);
	var List = Elm.Native.List.make(localRuntime);


	// polyfill so things will work even if rAF is not available for some reason
	var _requestAnimationFrame =
		typeof requestAnimationFrame !== 'undefined'
			? requestAnimationFrame
			: function(cb) { setTimeout(cb, 1000 / 60); }
			;


	// batchedSending and sendCallback implement a small state machine in order
	// to schedule only one send(time) call per animation frame.
	//
	// Invariants:
	// 1. In the NO_REQUEST state, there is never a scheduled sendCallback.
	// 2. In the PENDING_REQUEST and EXTRA_REQUEST states, there is always exactly
	//    one scheduled sendCallback.
	var NO_REQUEST = 0;
	var PENDING_REQUEST = 1;
	var EXTRA_REQUEST = 2;
	var state = NO_REQUEST;
	var messageArray = [];


	function batchedSending(address, tickMessages)
	{
		// insert ticks into the messageArray
		var foundAddress = false;

		for (var i = messageArray.length; i--; )
		{
			if (messageArray[i].address === address)
			{
				foundAddress = true;
				messageArray[i].tickMessages = A3(List.foldl, List.cons, messageArray[i].tickMessages, tickMessages);
				break;
			}
		}

		if (!foundAddress)
		{
			messageArray.push({ address: address, tickMessages: tickMessages });
		}

		// do the appropriate state transition
		switch (state)
		{
			case NO_REQUEST:
				_requestAnimationFrame(sendCallback);
				state = PENDING_REQUEST;
				break;
			case PENDING_REQUEST:
				state = PENDING_REQUEST;
				break;
			case EXTRA_REQUEST:
				state = PENDING_REQUEST;
				break;
		}
	}


	function sendCallback(time)
	{
		switch (state)
		{
			case NO_REQUEST:
				// This state should not be possible. How can there be no
				// request, yet somehow we are actively fulfilling a
				// request?
				throw new Error(
					'Unexpected send callback.\n' +
					'Please report this to <https://github.com/evancz/elm-effects/issues>.'
				);

			case PENDING_REQUEST:
				// At this point, we do not *know* that another frame is
				// needed, but we make an extra request to rAF just in
				// case. It's possible to drop a frame if rAF is called
				// too late, so we just do it preemptively.
				_requestAnimationFrame(sendCallback);
				state = EXTRA_REQUEST;

				// There's also stuff we definitely need to send.
				send(time);
				return;

			case EXTRA_REQUEST:
				// Turns out the extra request was not needed, so we will
				// stop calling rAF. No reason to call it all the time if
				// no one needs it.
				state = NO_REQUEST;
				return;
		}
	}


	function send(time)
	{
		for (var i = messageArray.length; i--; )
		{
			var messages = A3(
				List.foldl,
				F2( function(toAction, list) { return List.Cons(toAction(time), list); } ),
				List.Nil,
				messageArray[i].tickMessages
			);
			Task.perform( A2(Signal.send, messageArray[i].address, messages) );
		}
		messageArray = [];
	}


	function requestTickSending(address, tickMessages)
	{
		return Task.asyncFunction(function(callback) {
			batchedSending(address, tickMessages);
			callback(Task.succeed(Utils.Tuple0));
		});
	}


	return localRuntime.Native.Effects.values = {
		requestTickSending: F2(requestTickSending)
	};

};

Elm.Effects = Elm.Effects || {};
Elm.Effects.make = function (_elm) {
   "use strict";
   _elm.Effects = _elm.Effects || {};
   if (_elm.Effects.values) return _elm.Effects.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Effects = Elm.Native.Effects.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Task = Elm.Task.make(_elm),
   $Time = Elm.Time.make(_elm);
   var _op = {};
   var ignore = function (task) {    return A2($Task.map,$Basics.always({ctor: "_Tuple0"}),task);};
   var requestTickSending = $Native$Effects.requestTickSending;
   var toTaskHelp = F3(function (address,effect,_p0) {
      var _p1 = _p0;
      var _p5 = _p1._1;
      var _p4 = _p1;
      var _p3 = _p1._0;
      var _p2 = effect;
      switch (_p2.ctor)
      {case "Task": var reporter = A2($Task.andThen,_p2._0,function (answer) {    return A2($Signal.send,address,_U.list([answer]));});
           return {ctor: "_Tuple2",_0: A2($Task.andThen,_p3,$Basics.always(ignore($Task.spawn(reporter)))),_1: _p5};
         case "Tick": return {ctor: "_Tuple2",_0: _p3,_1: A2($List._op["::"],_p2._0,_p5)};
         case "None": return _p4;
         default: return A3($List.foldl,toTaskHelp(address),_p4,_p2._0);}
   });
   var toTask = F2(function (address,effect) {
      var _p6 = A3(toTaskHelp,address,effect,{ctor: "_Tuple2",_0: $Task.succeed({ctor: "_Tuple0"}),_1: _U.list([])});
      var combinedTask = _p6._0;
      var tickMessages = _p6._1;
      return $List.isEmpty(tickMessages) ? combinedTask : A2($Task.andThen,combinedTask,$Basics.always(A2(requestTickSending,address,tickMessages)));
   });
   var Never = function (a) {    return {ctor: "Never",_0: a};};
   var Batch = function (a) {    return {ctor: "Batch",_0: a};};
   var batch = Batch;
   var None = {ctor: "None"};
   var none = None;
   var Tick = function (a) {    return {ctor: "Tick",_0: a};};
   var tick = Tick;
   var Task = function (a) {    return {ctor: "Task",_0: a};};
   var task = Task;
   var map = F2(function (func,effect) {
      var _p7 = effect;
      switch (_p7.ctor)
      {case "Task": return Task(A2($Task.map,func,_p7._0));
         case "Tick": return Tick(function (_p8) {    return func(_p7._0(_p8));});
         case "None": return None;
         default: return Batch(A2($List.map,map(func),_p7._0));}
   });
   return _elm.Effects.values = {_op: _op,none: none,task: task,tick: tick,map: map,batch: batch,toTask: toTask};
};
Elm.StartApp = Elm.StartApp || {};
Elm.StartApp.make = function (_elm) {
   "use strict";
   _elm.StartApp = _elm.StartApp || {};
   if (_elm.StartApp.values) return _elm.StartApp.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var start = function (config) {
      var updateStep = F2(function (action,_p0) {
         var _p1 = _p0;
         var _p2 = A2(config.update,action,_p1._0);
         var newModel = _p2._0;
         var additionalEffects = _p2._1;
         return {ctor: "_Tuple2",_0: newModel,_1: $Effects.batch(_U.list([_p1._1,additionalEffects]))};
      });
      var update = F2(function (actions,_p3) {    var _p4 = _p3;return A3($List.foldl,updateStep,{ctor: "_Tuple2",_0: _p4._0,_1: $Effects.none},actions);});
      var messages = $Signal.mailbox(_U.list([]));
      var singleton = function (action) {    return _U.list([action]);};
      var address = A2($Signal.forwardTo,messages.address,singleton);
      var inputs = $Signal.mergeMany(A2($List._op["::"],messages.signal,A2($List.map,$Signal.map(singleton),config.inputs)));
      var effectsAndModel = A3($Signal.foldp,update,config.init,inputs);
      var model = A2($Signal.map,$Basics.fst,effectsAndModel);
      return {html: A2($Signal.map,config.view(address),model)
             ,model: model
             ,tasks: A2($Signal.map,function (_p5) {    return A2($Effects.toTask,messages.address,$Basics.snd(_p5));},effectsAndModel)};
   };
   var App = F3(function (a,b,c) {    return {html: a,model: b,tasks: c};});
   var Config = F4(function (a,b,c,d) {    return {init: a,update: b,view: c,inputs: d};});
   return _elm.StartApp.values = {_op: _op,start: start,Config: Config,App: App};
};
Elm.Date = Elm.Date || {};
Elm.Date.Format = Elm.Date.Format || {};
Elm.Date.Format.make = function (_elm) {
   "use strict";
   _elm.Date = _elm.Date || {};
   _elm.Date.Format = _elm.Date.Format || {};
   if (_elm.Date.Format.values) return _elm.Date.Format.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Date = Elm.Date.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Regex = Elm.Regex.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var padWith = function (c) {    return function (_p0) {    return A3($String.padLeft,2,c,$Basics.toString(_p0));};};
   var mod12 = function (h) {    return A2($Basics._op["%"],h,12);};
   var fullDayOfWeek = function (dow) {
      var _p1 = dow;
      switch (_p1.ctor)
      {case "Mon": return "Monday";
         case "Tue": return "Tuesday";
         case "Wed": return "Wednesday";
         case "Thu": return "Thursday";
         case "Fri": return "Friday";
         case "Sat": return "Saturday";
         default: return "Sunday";}
   };
   var monthToFullName = function (m) {
      var _p2 = m;
      switch (_p2.ctor)
      {case "Jan": return "January";
         case "Feb": return "February";
         case "Mar": return "March";
         case "Apr": return "April";
         case "May": return "May";
         case "Jun": return "June";
         case "Jul": return "July";
         case "Aug": return "August";
         case "Sep": return "September";
         case "Oct": return "October";
         case "Nov": return "November";
         default: return "December";}
   };
   var monthToInt = function (m) {
      var _p3 = m;
      switch (_p3.ctor)
      {case "Jan": return 1;
         case "Feb": return 2;
         case "Mar": return 3;
         case "Apr": return 4;
         case "May": return 5;
         case "Jun": return 6;
         case "Jul": return 7;
         case "Aug": return 8;
         case "Sep": return 9;
         case "Oct": return 10;
         case "Nov": return 11;
         default: return 12;}
   };
   var collapse = function (m) {    return A2($Maybe.andThen,m,$Basics.identity);};
   var formatToken = F2(function (d,m) {
      var symbol = A2($Maybe.withDefault," ",collapse(A2($Maybe.andThen,$List.tail(m.submatches),$List.head)));
      var prefix = A2($Maybe.withDefault," ",collapse($List.head(m.submatches)));
      return A2($Basics._op["++"],
      prefix,
      function () {
         var _p4 = symbol;
         switch (_p4)
         {case "Y": return $Basics.toString($Date.year(d));
            case "m": return A3($String.padLeft,2,_U.chr("0"),$Basics.toString(monthToInt($Date.month(d))));
            case "B": return monthToFullName($Date.month(d));
            case "b": return $Basics.toString($Date.month(d));
            case "d": return A2(padWith,_U.chr("0"),$Date.day(d));
            case "e": return A2(padWith,_U.chr(" "),$Date.day(d));
            case "a": return $Basics.toString($Date.dayOfWeek(d));
            case "A": return fullDayOfWeek($Date.dayOfWeek(d));
            case "H": return A2(padWith,_U.chr("0"),$Date.hour(d));
            case "k": return A2(padWith,_U.chr(" "),$Date.hour(d));
            case "I": return A2(padWith,_U.chr("0"),mod12($Date.hour(d)));
            case "l": return A2(padWith,_U.chr(" "),mod12($Date.hour(d)));
            case "p": return _U.cmp($Date.hour(d),13) < 0 ? "AM" : "PM";
            case "P": return _U.cmp($Date.hour(d),13) < 0 ? "am" : "pm";
            case "M": return A2(padWith,_U.chr("0"),$Date.minute(d));
            case "S": return A2(padWith,_U.chr("0"),$Date.second(d));
            default: return "";}
      }());
   });
   var re = $Regex.regex("(^|[^%])%(Y|m|B|b|d|e|a|A|H|k|I|l|p|P|M|S)");
   var format = F2(function (s,d) {    return A4($Regex.replace,$Regex.All,re,formatToken(d),s);});
   return _elm.Date.Format.values = {_op: _op,format: format};
};
Elm.Native.Http = {};
Elm.Native.Http.make = function(localRuntime) {

	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Http = localRuntime.Native.Http || {};
	if (localRuntime.Native.Http.values)
	{
		return localRuntime.Native.Http.values;
	}

	var Dict = Elm.Dict.make(localRuntime);
	var List = Elm.List.make(localRuntime);
	var Maybe = Elm.Maybe.make(localRuntime);
	var Task = Elm.Native.Task.make(localRuntime);


	function send(settings, request)
	{
		return Task.asyncFunction(function(callback) {
			var req = new XMLHttpRequest();

			// start
			if (settings.onStart.ctor === 'Just')
			{
				req.addEventListener('loadStart', function() {
					var task = settings.onStart._0;
					Task.spawn(task);
				});
			}

			// progress
			if (settings.onProgress.ctor === 'Just')
			{
				req.addEventListener('progress', function(event) {
					var progress = !event.lengthComputable
						? Maybe.Nothing
						: Maybe.Just({
							_: {},
							loaded: event.loaded,
							total: event.total
						});
					var task = settings.onProgress._0(progress);
					Task.spawn(task);
				});
			}

			// end
			req.addEventListener('error', function() {
				return callback(Task.fail({ ctor: 'RawNetworkError' }));
			});

			req.addEventListener('timeout', function() {
				return callback(Task.fail({ ctor: 'RawTimeout' }));
			});

			req.addEventListener('load', function() {
				return callback(Task.succeed(toResponse(req)));
			});

			req.open(request.verb, request.url, true);

			// set all the headers
			function setHeader(pair) {
				req.setRequestHeader(pair._0, pair._1);
			}
			A2(List.map, setHeader, request.headers);

			// set the timeout
			req.timeout = settings.timeout;

			// enable this withCredentials thing
			req.withCredentials = settings.withCredentials;

			// ask for a specific MIME type for the response
			if (settings.desiredResponseType.ctor === 'Just')
			{
				req.overrideMimeType(settings.desiredResponseType._0);
			}

			// actuall send the request
			if(request.body.ctor === "BodyFormData")
			{
				req.send(request.body.formData)
			}
			else
			{
				req.send(request.body._0);
			}
		});
	}


	// deal with responses

	function toResponse(req)
	{
		var tag = req.responseType === 'blob' ? 'Blob' : 'Text'
		var response = tag === 'Blob' ? req.response : req.responseText;
		return {
			_: {},
			status: req.status,
			statusText: req.statusText,
			headers: parseHeaders(req.getAllResponseHeaders()),
			url: req.responseURL,
			value: { ctor: tag, _0: response }
		};
	}


	function parseHeaders(rawHeaders)
	{
		var headers = Dict.empty;

		if (!rawHeaders)
		{
			return headers;
		}

		var headerPairs = rawHeaders.split('\u000d\u000a');
		for (var i = headerPairs.length; i--; )
		{
			var headerPair = headerPairs[i];
			var index = headerPair.indexOf('\u003a\u0020');
			if (index > 0)
			{
				var key = headerPair.substring(0, index);
				var value = headerPair.substring(index + 2);

				headers = A3(Dict.update, key, function(oldValue) {
					if (oldValue.ctor === 'Just')
					{
						return Maybe.Just(value + ', ' + oldValue._0);
					}
					return Maybe.Just(value);
				}, headers);
			}
		}

		return headers;
	}


	function multipart(dataList)
	{
		var formData = new FormData();

		while (dataList.ctor !== '[]')
		{
			var data = dataList._0;
			if (data.ctor === 'StringData')
			{
				formData.append(data._0, data._1);
			}
			else
			{
				var fileName = data._1.ctor === 'Nothing'
					? undefined
					: data._1._0;
				formData.append(data._0, data._2, fileName);
			}
			dataList = dataList._1;
		}

		return { ctor: 'BodyFormData', formData: formData };
	}


	function uriEncode(string)
	{
		return encodeURIComponent(string);
	}

	function uriDecode(string)
	{
		return decodeURIComponent(string);
	}

	return localRuntime.Native.Http.values = {
		send: F2(send),
		multipart: multipart,
		uriEncode: uriEncode,
		uriDecode: uriDecode
	};
};

Elm.Http = Elm.Http || {};
Elm.Http.make = function (_elm) {
   "use strict";
   _elm.Http = _elm.Http || {};
   if (_elm.Http.values) return _elm.Http.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Http = Elm.Native.Http.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Task = Elm.Task.make(_elm),
   $Time = Elm.Time.make(_elm);
   var _op = {};
   var send = $Native$Http.send;
   var BadResponse = F3(function (a,b,c) {    return {ctor: "BadResponse",_0: a,_1: b,_2: c};});
   var UnexpectedPayload = function (a) {    return {ctor: "UnexpectedPayload",_0: a};};
   var handleResponse = F2(function (handle,response) {
      if (_U.cmp(200,response.status) < 1 && _U.cmp(response.status,300) < 0) {
            var _p0 = response.value;
            if (_p0.ctor === "Text") {
                  return handle(_p0._0);
               } else {
                  return $Task.fail(UnexpectedPayload("Response body is a blob, expecting a string."));
               }
         } else return $Task.fail(A3(BadResponse,response.status,response.statusText,response.value));
   });
   var NetworkError = {ctor: "NetworkError"};
   var Timeout = {ctor: "Timeout"};
   var promoteError = function (rawError) {    var _p1 = rawError;if (_p1.ctor === "RawTimeout") {    return Timeout;} else {    return NetworkError;}};
   var fromJson = F2(function (decoder,response) {
      var decode = function (str) {
         var _p2 = A2($Json$Decode.decodeString,decoder,str);
         if (_p2.ctor === "Ok") {
               return $Task.succeed(_p2._0);
            } else {
               return $Task.fail(UnexpectedPayload(_p2._0));
            }
      };
      return A2($Task.andThen,A2($Task.mapError,promoteError,response),handleResponse(decode));
   });
   var RawNetworkError = {ctor: "RawNetworkError"};
   var RawTimeout = {ctor: "RawTimeout"};
   var Blob = function (a) {    return {ctor: "Blob",_0: a};};
   var Text = function (a) {    return {ctor: "Text",_0: a};};
   var Response = F5(function (a,b,c,d,e) {    return {status: a,statusText: b,headers: c,url: d,value: e};});
   var defaultSettings = {timeout: 0,onStart: $Maybe.Nothing,onProgress: $Maybe.Nothing,desiredResponseType: $Maybe.Nothing,withCredentials: false};
   var post = F3(function (decoder,url,body) {
      var request = {verb: "POST",headers: _U.list([]),url: url,body: body};
      return A2(fromJson,decoder,A2(send,defaultSettings,request));
   });
   var Settings = F5(function (a,b,c,d,e) {    return {timeout: a,onStart: b,onProgress: c,desiredResponseType: d,withCredentials: e};});
   var multipart = $Native$Http.multipart;
   var FileData = F3(function (a,b,c) {    return {ctor: "FileData",_0: a,_1: b,_2: c};});
   var BlobData = F3(function (a,b,c) {    return {ctor: "BlobData",_0: a,_1: b,_2: c};});
   var blobData = BlobData;
   var StringData = F2(function (a,b) {    return {ctor: "StringData",_0: a,_1: b};});
   var stringData = StringData;
   var BodyBlob = function (a) {    return {ctor: "BodyBlob",_0: a};};
   var BodyFormData = {ctor: "BodyFormData"};
   var ArrayBuffer = {ctor: "ArrayBuffer"};
   var BodyString = function (a) {    return {ctor: "BodyString",_0: a};};
   var string = BodyString;
   var Empty = {ctor: "Empty"};
   var empty = Empty;
   var getString = function (url) {
      var request = {verb: "GET",headers: _U.list([]),url: url,body: empty};
      return A2($Task.andThen,A2($Task.mapError,promoteError,A2(send,defaultSettings,request)),handleResponse($Task.succeed));
   };
   var get = F2(function (decoder,url) {
      var request = {verb: "GET",headers: _U.list([]),url: url,body: empty};
      return A2(fromJson,decoder,A2(send,defaultSettings,request));
   });
   var Request = F4(function (a,b,c,d) {    return {verb: a,headers: b,url: c,body: d};});
   var uriDecode = $Native$Http.uriDecode;
   var uriEncode = $Native$Http.uriEncode;
   var queryEscape = function (string) {    return A2($String.join,"+",A2($String.split,"%20",uriEncode(string)));};
   var queryPair = function (_p3) {    var _p4 = _p3;return A2($Basics._op["++"],queryEscape(_p4._0),A2($Basics._op["++"],"=",queryEscape(_p4._1)));};
   var url = F2(function (baseUrl,args) {
      var _p5 = args;
      if (_p5.ctor === "[]") {
            return baseUrl;
         } else {
            return A2($Basics._op["++"],baseUrl,A2($Basics._op["++"],"?",A2($String.join,"&",A2($List.map,queryPair,args))));
         }
   });
   var TODO_implement_file_in_another_library = {ctor: "TODO_implement_file_in_another_library"};
   var TODO_implement_blob_in_another_library = {ctor: "TODO_implement_blob_in_another_library"};
   return _elm.Http.values = {_op: _op
                             ,getString: getString
                             ,get: get
                             ,post: post
                             ,send: send
                             ,url: url
                             ,uriEncode: uriEncode
                             ,uriDecode: uriDecode
                             ,empty: empty
                             ,string: string
                             ,multipart: multipart
                             ,stringData: stringData
                             ,defaultSettings: defaultSettings
                             ,fromJson: fromJson
                             ,Request: Request
                             ,Settings: Settings
                             ,Response: Response
                             ,Text: Text
                             ,Blob: Blob
                             ,Timeout: Timeout
                             ,NetworkError: NetworkError
                             ,UnexpectedPayload: UnexpectedPayload
                             ,BadResponse: BadResponse
                             ,RawTimeout: RawTimeout
                             ,RawNetworkError: RawNetworkError};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Model = Elm.Systems.Model || {};
Elm.Systems.Model.AWS = Elm.Systems.Model.AWS || {};
Elm.Systems.Model.AWS.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Model = _elm.Systems.Model || {};
   _elm.Systems.Model.AWS = _elm.Systems.Model.AWS || {};
   if (_elm.Systems.Model.AWS.values) return _elm.Systems.Model.AWS.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var endpoints = $Dict.fromList(_U.list([{ctor: "_Tuple2"
                                           ,_0: "us-east-1"
                                           ,_1: {ctor: "_Tuple3",_0: "US East (N. Virginia)",_1: "ec2.us-east-1.amazonaws.com",_2: _U.list(["a","b","d","e"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "us-west-1"
                                           ,_1: {ctor: "_Tuple3",_0: "US West (N. California)",_1: "ec2.us-west-1.amazonaws.com",_2: _U.list(["a","b"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "us-west-2"
                                           ,_1: {ctor: "_Tuple3",_0: "US West (Oregon)",_1: "ec2.us-west-2.amazonaws.com",_2: _U.list(["a","b","c"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "eu-west-1"
                                           ,_1: {ctor: "_Tuple3",_0: "EU (Ireland)",_1: "ec2.eu-west-1.amazonaws.com",_2: _U.list(["a","b","c"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "eu-central-1"
                                           ,_1: {ctor: "_Tuple3",_0: "EU (Frankfurt)",_1: "ec2.eu-central-1.amazonaws.com",_2: _U.list(["a","b"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "ap-southeast-1"
                                           ,_1: {ctor: "_Tuple3",_0: "Asia Pacific (Singapore)",_1: "ec2.ap-southeast-1.amazonaws.com",_2: _U.list(["a","b"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "ap-southeast-2"
                                           ,_1: {ctor: "_Tuple3",_0: "Asia Pacific (Sydney)",_1: "ec2.ap-southeast-2.amazonaws.com",_2: _U.list(["a","b"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "ap-northeast-1"
                                           ,_1: {ctor: "_Tuple3",_0: "Asia Pacific (Tokyo)",_1: "ec2.ap-northeast-1.amazonaws.com",_2: _U.list(["a","c"])}}
                                          ,{ctor: "_Tuple2"
                                           ,_0: "sa-east-1"
                                           ,_1: {ctor: "_Tuple3"
                                                ,_0: "South America (Sao Paulo)"
                                                ,_1: "ec2.sa-east-1.amazonaws.com"
                                                ,_2: _U.list(["a","b","c"])}}]));
   var instanceTypes = _U.list(["t1.micro"
                               ,"m1.small"
                               ,"m1.medium"
                               ,"m1.large"
                               ,"m1.xlarge"
                               ,"m3.medium"
                               ,"m3.large"
                               ,"m3.xlarge"
                               ,"m3.2xlarge"
                               ,"c1.medium"
                               ,"c1.xlarge"
                               ,"c1.xlarge"
                               ,"cc2.8xlarge"
                               ,"c3.large"
                               ,"c3.xlarge"
                               ,"c3.2xlarge"
                               ,"c3.4xlarge"
                               ,"c3.8xlarge"
                               ,"r3.large"
                               ,"r3.xlarge"
                               ,"r3.2xlarge"
                               ,"r3.4xlarge"
                               ,"r3.8xlarge"
                               ,"m2.xlarge"
                               ,"m2.2xlarge"
                               ,"m2.4xlarge"
                               ,"cr1.8xlarge"
                               ,"hi1.4xlarge"
                               ,"cg1.4xlarge"]);
   var AWS = function (a) {
      return function (b) {
         return function (c) {
            return function (d) {
               return function (e) {
                  return function (f) {
                     return function (g) {
                        return function (h) {
                           return function (i) {
                              return function (j) {
                                 return {instanceType: a
                                        ,instanceId: b
                                        ,keyName: c
                                        ,endpoint: d
                                        ,availabilityZone: e
                                        ,securityGroups: f
                                        ,ebsOptimized: g
                                        ,volumes: h
                                        ,blockDevices: i
                                        ,vpc: j};
                              };
                           };
                        };
                     };
                  };
               };
            };
         };
      };
   };
   var VPC = F3(function (a,b,c) {    return {subnetId: a,vpcId: b,assignPublic: c};});
   var emptyVpc = A3(VPC,"","",false);
   var emptyAws = function () {
      var instanceType = function () {    var _p0 = $List.head(instanceTypes);if (_p0.ctor === "Just") {    return _p0._0;} else {    return "";}}();
      var _p1 = A2($Maybe.withDefault,{ctor: "_Tuple3",_0: "",_1: "",_2: _U.list([])},A2($Dict.get,"us-east-1",endpoints));
      var url = _p1._1;
      var justString = $Maybe.Just("");
      return AWS(instanceType)($Maybe.Nothing)("")(url)($Maybe.Nothing)($Maybe.Just(_U.list([])))($Maybe.Just(false))($Maybe.Just(_U.list([])))($Maybe.Just(_U.list([])))($Maybe.Just(emptyVpc));
   }();
   var Block = F2(function (a,b) {    return {volume: a,device: b};});
   var emptyBlock = A2(Block,"","");
   var Volume = F5(function (a,b,c,d,e) {    return {type$: a,size: b,iops: c,device: d,clear: e};});
   var emptyVolume = A5(Volume,"Magnetic",50,$Maybe.Just(50),"",false);
   return _elm.Systems.Model.AWS.values = {_op: _op
                                          ,Volume: Volume
                                          ,Block: Block
                                          ,VPC: VPC
                                          ,AWS: AWS
                                          ,emptyVolume: emptyVolume
                                          ,emptyBlock: emptyBlock
                                          ,emptyVpc: emptyVpc
                                          ,emptyAws: emptyAws
                                          ,instanceTypes: instanceTypes
                                          ,endpoints: endpoints};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Model = Elm.Systems.Model || {};
Elm.Systems.Model.GCE = Elm.Systems.Model.GCE || {};
Elm.Systems.Model.GCE.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Model = _elm.Systems.Model || {};
   _elm.Systems.Model.GCE = _elm.Systems.Model.GCE || {};
   if (_elm.Systems.Model.GCE.values) return _elm.Systems.Model.GCE.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var zones = _U.list(["us-east1-b"
                       ,"us-east1-c"
                       ,"us-east1-d"
                       ,"us-central1-a"
                       ,"us-central1-b"
                       ,"us-central1-c"
                       ,"us-central1-f"
                       ,"europe-west1-b"
                       ,"europe-west1-c"
                       ,"europe-west1-d"
                       ,"asia-east1-a"
                       ,"asia-east1-b"
                       ,"asia-east1-c"]);
   var machineTypes = _U.list(["n1-standard-1","n1-standard-2","n1-standard-4","n1-standard-8","n1-standard-16","n1-standard-32"]);
   var GCE = F5(function (a,b,c,d,e) {    return {machineType: a,zone: b,tags: c,projectId: d,staticIp: e};});
   var emptyGce = function () {
      var zone = A2($Maybe.withDefault,"",$List.head(zones));
      var type$ = A2($Maybe.withDefault,"",$List.head(machineTypes));
      return A5(GCE,type$,zone,$Maybe.Just(_U.list([])),"",$Maybe.Just(""));
   }();
   return _elm.Systems.Model.GCE.values = {_op: _op,GCE: GCE,emptyGce: emptyGce,machineTypes: machineTypes,zones: zones};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Model = Elm.Systems.Model || {};
Elm.Systems.Model.Common = Elm.Systems.Model.Common || {};
Elm.Systems.Model.Common.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Model = _elm.Systems.Model || {};
   _elm.Systems.Model.Common = _elm.Systems.Model.Common || {};
   if (_elm.Systems.Model.Common.values) return _elm.Systems.Model.Common.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Systems$Model$AWS = Elm.Systems.Model.AWS.make(_elm),
   $Systems$Model$GCE = Elm.Systems.Model.GCE.make(_elm);
   var _op = {};
   var System = F6(function (a,b,c,d,e,f) {    return {owner: a,env: b,type$: c,machine: d,aws: e,gce: f};});
   var Machine = F5(function (a,b,c,d,e) {    return {user: a,hostname: b,domain: c,ip: d,os: e};});
   var emptyMachine = A5(Machine,"","","",$Maybe.Just(""),"");
   return _elm.Systems.Model.Common.values = {_op: _op,Machine: Machine,System: System,emptyMachine: emptyMachine};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Decoders = Elm.Systems.Decoders || {};
Elm.Systems.Decoders.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Decoders = _elm.Systems.Decoders || {};
   if (_elm.Systems.Decoders.values) return _elm.Systems.Decoders.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Systems$Model$AWS = Elm.Systems.Model.AWS.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm),
   $Systems$Model$GCE = Elm.Systems.Model.GCE.make(_elm);
   var _op = {};
   var machineDecoder = A6($Json$Decode.object5,
   $Systems$Model$Common.Machine,
   A2($Json$Decode._op[":="],"user",$Json$Decode.string),
   A2($Json$Decode._op[":="],"hostname",$Json$Decode.string),
   A2($Json$Decode._op[":="],"domain",$Json$Decode.string),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"ip",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"os",$Json$Decode.string));
   var gceDecoder = A6($Json$Decode.object5,
   $Systems$Model$GCE.GCE,
   A2($Json$Decode._op[":="],"machine-type",$Json$Decode.string),
   A2($Json$Decode._op[":="],"zone",$Json$Decode.string),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"tags",$Json$Decode.list($Json$Decode.string))),
   A2($Json$Decode._op[":="],"project-id",$Json$Decode.string),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"static-ip",$Json$Decode.string)));
   var volumeDecoder = A6($Json$Decode.object5,
   $Systems$Model$AWS.Volume,
   A2($Json$Decode._op[":="],"volume-type",$Json$Decode.string),
   A2($Json$Decode._op[":="],"size",$Json$Decode.$int),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"iops",$Json$Decode.$int)),
   A2($Json$Decode._op[":="],"device",$Json$Decode.string),
   A2($Json$Decode._op[":="],"clear",$Json$Decode.bool));
   var blockDecoder = A3($Json$Decode.object2,
   $Systems$Model$AWS.Block,
   A2($Json$Decode._op[":="],"volume",$Json$Decode.string),
   A2($Json$Decode._op[":="],"device",$Json$Decode.string));
   var vpcDecoder = A4($Json$Decode.object3,
   $Systems$Model$AWS.VPC,
   A2($Json$Decode._op[":="],"subnetId",$Json$Decode.string),
   A2($Json$Decode._op[":="],"vpcId",$Json$Decode.string),
   A2($Json$Decode._op[":="],"assignIp",$Json$Decode.bool));
   var apply = F2(function (func,value) {    return A3($Json$Decode.object2,F2(function (x,y) {    return x(y);}),func,value);});
   var awsDecoder = A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2($Json$Decode.map,$Systems$Model$AWS.AWS,A2($Json$Decode._op[":="],"instance-type",$Json$Decode.string)),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"instance-id",$Json$Decode.string))),
   A2($Json$Decode._op[":="],"key-name",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"endpoint",$Json$Decode.string)),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"availability-zone",$Json$Decode.string))),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"security-groups",$Json$Decode.list($Json$Decode.string)))),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"ebs-optimized",$Json$Decode.bool))),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"volumes",$Json$Decode.list(volumeDecoder)))),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"block-devices",$Json$Decode.list(blockDecoder)))),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"vpc",vpcDecoder)));
   var systemDecoder = A7($Json$Decode.object6,
   $Systems$Model$Common.System,
   A2($Json$Decode._op[":="],"owner",$Json$Decode.string),
   A2($Json$Decode._op[":="],"env",$Json$Decode.string),
   A2($Json$Decode._op[":="],"type",$Json$Decode.string),
   A2($Json$Decode._op[":="],"machine",machineDecoder),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"aws",awsDecoder)),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"gce",gceDecoder)));
   return _elm.Systems.Decoders.values = {_op: _op
                                         ,apply: apply
                                         ,vpcDecoder: vpcDecoder
                                         ,blockDecoder: blockDecoder
                                         ,volumeDecoder: volumeDecoder
                                         ,awsDecoder: awsDecoder
                                         ,gceDecoder: gceDecoder
                                         ,machineDecoder: machineDecoder
                                         ,systemDecoder: systemDecoder};
};
Elm.Common = Elm.Common || {};
Elm.Common.Redirect = Elm.Common.Redirect || {};
Elm.Common.Redirect.make = function (_elm) {
   "use strict";
   _elm.Common = _elm.Common || {};
   _elm.Common.Redirect = _elm.Common.Redirect || {};
   if (_elm.Common.Redirect.values) return _elm.Common.Redirect.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var identityFail = F2(function (model,res) {
      return A2($Debug.log,A2($Basics._op["++"],"request failed",$Basics.toString(res)),{ctor: "_Tuple2",_0: model,_1: $Effects.none});
   });
   var identitySuccess = F2(function (model,res) {    return {ctor: "_Tuple2",_0: model,_1: $Effects.none};});
   var Errors = F2(function (a,b) {    return {type$: a,keyValues: b};});
   var Value = function (a) {    return {ctor: "Value",_0: a};};
   var NestedList = function (a) {    return {ctor: "NestedList",_0: a};};
   var DeepNestedList = function (a) {    return {ctor: "DeepNestedList",_0: a};};
   var Nested = function (a) {    return {ctor: "Nested",_0: a};};
   var errorDecoder = function () {
      var options = _U.list([A2($Json$Decode.map,Value,$Json$Decode.string)
                            ,A2($Json$Decode.map,Nested,$Json$Decode.dict($Json$Decode.string))
                            ,A2($Json$Decode.map,DeepNestedList,$Json$Decode.dict($Json$Decode.list($Json$Decode.dict($Json$Decode.dict($Json$Decode.string)))))
                            ,A2($Json$Decode.map,NestedList,$Json$Decode.dict($Json$Decode.list($Json$Decode.dict($Json$Decode.string))))]);
      return A3($Json$Decode.object2,
      Errors,
      A2($Json$Decode.at,_U.list(["object","type"]),$Json$Decode.string),
      A2($Json$Decode.at,_U.list(["object","errors"]),$Json$Decode.dict($Json$Decode.oneOf(options))));
   }();
   var decodeError = function (error) {
      var _p0 = error;
      if (_p0.ctor === "Text") {
            var _p1 = A2($Json$Decode.decodeString,errorDecoder,_p0._0);
            if (_p1.ctor === "Ok") {
                  return _p1._0;
               } else {
                  return A2($Debug.log,_p1._0,A2(Errors,"",$Dict.empty));
               }
         } else {
            return A2(Errors,"",$Dict.empty);
         }
   };
   var Prompt = {ctor: "Prompt"};
   var NoOp = {ctor: "NoOp"};
   var redirectActions = $Signal.mailbox(NoOp);
   var redirect = function (noop) {    return $Effects.task(A2($Task.map,$Basics.always(noop),A2($Signal.send,redirectActions.address,Prompt)));};
   var resultHandler = F5(function (result,model,success,fail,noop) {
      var _p2 = result;
      if (_p2.ctor === "Ok") {
            return success(_p2._0);
         } else {
            var _p4 = _p2._0;
            var _p3 = _p4;
            _v3_2: do {
               if (_p3.ctor === "BadResponse") {
                     switch (_p3._0)
                     {case 401: return A2($Debug.log,$Basics.toString(_p4),{ctor: "_Tuple2",_0: model,_1: redirect(noop)});
                        case 400: return fail(decodeError(_p3._2));
                        default: break _v3_2;}
                  } else {
                     break _v3_2;
                  }
            } while (false);
            return A2($Debug.log,$Basics.toString(_p4),{ctor: "_Tuple2",_0: model,_1: $Effects.none});
         }
   });
   var successHandler = F4(function (result,model,success,noop) {    return A5(resultHandler,result,model,success,identityFail(model),noop);});
   var failHandler = F4(function (result,model,fail,noop) {    return A5(resultHandler,result,model,identitySuccess(model),fail,noop);});
   return _elm.Common.Redirect.values = {_op: _op
                                        ,NoOp: NoOp
                                        ,Prompt: Prompt
                                        ,redirectActions: redirectActions
                                        ,redirect: redirect
                                        ,Nested: Nested
                                        ,DeepNestedList: DeepNestedList
                                        ,NestedList: NestedList
                                        ,Value: Value
                                        ,Errors: Errors
                                        ,errorDecoder: errorDecoder
                                        ,decodeError: decodeError
                                        ,identitySuccess: identitySuccess
                                        ,identityFail: identityFail
                                        ,resultHandler: resultHandler
                                        ,successHandler: successHandler
                                        ,failHandler: failHandler};
};
Elm.Pager = Elm.Pager || {};
Elm.Pager.make = function (_elm) {
   "use strict";
   _elm.Pager = _elm.Pager || {};
   if (_elm.Pager.values) return _elm.Pager.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Array = Elm.Array.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Shorthand = Elm.Html.Shorthand.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var pageCount = function (model) {    return $Basics.ceiling(model.total / model.offset);};
   var update = F2(function (action,_p0) {
      var _p1 = _p0;
      var _p8 = _p1.slice;
      var _p7 = _p1.page;
      var _p6 = _p1;
      var _p5 = _p1.maxButtons;
      var _p2 = action;
      switch (_p2.ctor)
      {case "NextPage": var _p3 = _p2._0;
           var newModel = _U.update(_p6,{page: _p3});
           var end = _p8 + _p5;
           var start = _p8;
           return _U.cmp(start,_p3) < 0 && _U.cmp(_p3,end) < 0 ? newModel : _U.cmp(_p3,end) > -1 && _U.cmp(_p3 + _p5,pageCount(_p6)) > -1 ? _U.update(newModel,
           {slice: _p3 - _p5}) : _U.cmp(_p3,end) > -1 ? _U.update(newModel,{slice: _p3 - 1}) : _U.eq(_p3,1) ? _U.update(newModel,{slice: 0}) : _U.cmp(_p3,
           start) < 1 ? _U.update(newModel,{slice: _p3 - 1}) : newModel;
         case "UpdateTotal": var _p4 = _p2._0;
           return _U.cmp(_p4,$Basics.toFloat(_p7)) < 0 ? _U.update(_p6,{total: _p4,page: 1}) : _U.update(_p6,{total: _p4,page: _p7});
         default: return _p6;}
   });
   var init = {total: 0,page: 1,offset: 10,maxButtons: 5,slice: 0};
   var NoOp = {ctor: "NoOp"};
   var UpdateTotal = function (a) {    return {ctor: "UpdateTotal",_0: a};};
   var NextPage = function (a) {    return {ctor: "NextPage",_0: a};};
   var arrows = F3(function (address,shapes,active) {
      var _p9 = shapes;
      var firstShape = _p9._0._0;
      var firstPos = _p9._0._1;
      var secondShape = _p9._1._0;
      var secondPos = _p9._1._1;
      var isActive = active ? "" : "disabled";
      var operation = function (p) {    return active ? NextPage(p) : NoOp;};
      return _U.list([A2($Html.li,
                     _U.list([$Html$Attributes.$class(isActive)]),
                     _U.list([A2($Html.a,_U.list([A2($Html$Events.onClick,address,operation(firstPos))]),_U.list([$Html.text(firstShape)]))]))
                     ,A2($Html.li,
                     _U.list([$Html$Attributes.$class(isActive)]),
                     _U.list([A2($Html.a,_U.list([A2($Html$Events.onClick,address,operation(secondPos))]),_U.list([$Html.text(secondShape)]))]))]);
   });
   var pageLinks = F2(function (address,_p10) {
      var _p11 = _p10;
      var _p14 = _p11.slice;
      var _p13 = _p11;
      var _p12 = _p11.maxButtons;
      var last = A3(arrows,
      address,
      {ctor: "_Tuple2",_0: {ctor: "_Tuple2",_0: "<<",_1: 1},_1: {ctor: "_Tuple2",_0: "<",_1: _p13.page - 1}},
      _U.cmp(_p13.page,1) > 0);
      var next = A3(arrows,
      address,
      {ctor: "_Tuple2",_0: {ctor: "_Tuple2",_0: ">",_1: _p13.page + 1},_1: {ctor: "_Tuple2",_0: ">>",_1: pageCount(_p13)}},
      _U.cmp(_p13.page,pageCount(_p13)) < 0);
      var isActive = function (page) {    return _U.eq(_p13.page,page) ? "active" : "";};
      var pageLink = function (page) {
         return A2($Html.li,
         _U.list([$Html$Attributes.$class(isActive(page))]),
         _U.list([A2($Html.a,_U.list([A2($Html$Events.onClick,address,NextPage(page))]),_U.list([$Html.text($Basics.toString(page))]))]));
      };
      var links = A2($Array.map,function (p) {    return pageLink(p + 1);},A2($Array.initialize,pageCount(_p13),$Basics.identity));
      var sliced = A3($Array.slice,_p14,_p14 + _p12,links);
      var windowed = _U.cmp($Array.length(links),_p12) > 0 ? sliced : links;
      return $List.concat(_U.list([last,$Array.toList(windowed),next]));
   });
   var view = F2(function (address,model) {
      return A2($Html$Shorthand.p$,
      {$class: "text-center"},
      _U.list([$Html$Shorthand.nav_(_U.list([A2($Html$Shorthand.ul$,{$class: "pagination"},A2(pageLinks,address,model))]))]));
   });
   var Model = F5(function (a,b,c,d,e) {    return {total: a,page: b,offset: c,maxButtons: d,slice: e};});
   return _elm.Pager.values = {_op: _op
                              ,Model: Model
                              ,NextPage: NextPage
                              ,UpdateTotal: UpdateTotal
                              ,NoOp: NoOp
                              ,init: init
                              ,update: update
                              ,pageCount: pageCount
                              ,arrows: arrows
                              ,pageLinks: pageLinks
                              ,view: view};
};
Elm.Table = Elm.Table || {};
Elm.Table.make = function (_elm) {
   "use strict";
   _elm.Table = _elm.Table || {};
   if (_elm.Table.values) return _elm.Table.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Shorthand = Elm.Html.Shorthand.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Set = Elm.Set.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var withCaption = F3(function (enabled,title,body) {
      return enabled ? A2($List.append,_U.list([A2($Html.caption,_U.list([]),_U.list([$Html.text(title)]))]),body) : body;
   });
   var headersMap = function (keys) {    return A2($List.map,function (k) {    return $Html$Shorthand.th_(_U.list([$Html.text(k)]));},keys);};
   var update = F2(function (action,_p0) {
      var _p1 = _p0;
      var _p7 = _p1.selected;
      var _p6 = _p1;
      var _p2 = action;
      switch (_p2.ctor)
      {case "UpdateRows": return _U.update(_p6,{rows: _p2._0,selected: $Set.empty});
         case "SelectAll": var all = $Set.fromList(A2($List.map,function (_p3) {    var _p4 = _p3;return _p4._0;},_p1.rows));
           return _U.eq(_p7,all) ? _U.update(_p6,{selected: $Set.empty}) : _U.update(_p6,{selected: all});
         case "Select": var _p5 = _p2._0;
           return A2($Set.member,_p5,_p6.selected) ? _U.update(_p6,{selected: A2($Set.remove,_p5,_p7)}) : _U.update(_p6,{selected: A2($Set.insert,_p5,_p7)});
         default: return _p6;}
   });
   var NoOp = {ctor: "NoOp"};
   var UpdateRows = function (a) {    return {ctor: "UpdateRows",_0: a};};
   var SelectAll = {ctor: "SelectAll"};
   var View = function (a) {    return {ctor: "View",_0: a};};
   var Select = function (a) {    return {ctor: "Select",_0: a};};
   var applySelect = F4(function (address,model,id,cols) {
      var background = A2($Set.member,id,model.selected) ? "#e7e7e7" : "";
      return A2($Html.tr,
      _U.list([$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "background",_1: background}]))
              ,A2($Html$Events.onClick,address,Select(id))
              ,A2($Html$Events.onDoubleClick,address,View(id))]),
      cols);
   });
   var view = F2(function (address,model) {
      return _U.list([A2($Html.table,
      _U.list([$Html$Attributes.$class("table table-bordered"),$Html$Attributes.id(model.id)]),
      A3(withCaption,
      model.caption,
      model.title,
      _U.list([$Html$Shorthand.thead_(_U.list([A2($Html.tr,_U.list([A2($Html$Events.onClick,address,SelectAll)]),headersMap(model.headers))]))
              ,$Html$Shorthand.tbody_(A2($List.map,
              function (_p8) {
                 var _p9 = _p8;
                 var _p10 = _p9._0;
                 return A4(applySelect,address,model,_p10,A2(model.rowFn,_p10,_p9._1));
              },
              model.rows))])))]);
   });
   var Model = F7(function (a,b,c,d,e,f,g) {    return {id: a,caption: b,rows: c,headers: d,selected: e,title: f,rowFn: g};});
   var init = F5(function (id,caption,hs,f,title) {    return A7(Model,id,caption,_U.list([]),hs,$Set.empty,title,f);});
   return _elm.Table.values = {_op: _op
                              ,Model: Model
                              ,Select: Select
                              ,View: View
                              ,SelectAll: SelectAll
                              ,UpdateRows: UpdateRows
                              ,NoOp: NoOp
                              ,init: init
                              ,update: update
                              ,headersMap: headersMap
                              ,applySelect: applySelect
                              ,withCaption: withCaption
                              ,view: view};
};
Elm.Search = Elm.Search || {};
Elm.Search.make = function (_elm) {
   "use strict";
   _elm.Search = _elm.Search || {};
   if (_elm.Search.values) return _elm.Search.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var onInput = F2(function (address,contentToValue) {
      return A3($Html$Events.on,"input",$Html$Events.targetValue,function (str) {    return A2($Signal.message,address,contentToValue(str));});
   });
   var update = F2(function (action,model) {
      var _p0 = action;
      if (_p0.ctor === "Result") {
            if (_p0._0 === true) {
                  return _U.update(model,{parsed: _p0._1.result,input: _p0._1.source,error: ""});
               } else {
                  return _U.update(model,{error: _p0._1.message,input: _p0._1.source});
               }
         } else {
            return model;
         }
   });
   var NoOp = {ctor: "NoOp"};
   var Result = F2(function (a,b) {    return {ctor: "Result",_0: a,_1: b};});
   var Parse = function (a) {    return {ctor: "Parse",_0: a};};
   var ParseResult = F3(function (a,b,c) {    return {message: a,source: b,result: c};});
   var init = {input: "",parsed: "",error: ""};
   var Model = F3(function (a,b,c) {    return {input: a,parsed: b,error: c};});
   var searchActions = $Signal.mailbox(NoOp);
   var searchForm = F2(function (address,model) {
      return A2($Html.form,
      _U.list([$Html$Attributes.$class("form-horizontal")]),
      _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-group"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Html.label,
              _U.list([$Html$Attributes.$for("systemSearch"),$Html$Attributes.$class("col-sm-1 control-label")]),
              _U.list([$Html.text("Filter:")]))
              ,A2($Html.div,
              _U.list([$Html$Attributes.$class("col-sm-6")]),
              _U.list([A2($Html.input,
              _U.list([$Html$Attributes.$class("form-control")
                      ,$Html$Attributes.type$("search")
                      ,$Html$Attributes.id("systemSearch")
                      ,$Html$Attributes.placeholder("")
                      ,A2(onInput,searchActions.address,Parse)]),
              _U.list([]))]))]))]));
   });
   var view = F2(function (address,model) {
      return A2($Html.div,
      _U.list([$Html$Attributes.$class("container-fluid")]),
      _U.list([$Bootstrap$Html.row_(_U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("col-md-8 col-md-offset-2")]),
      _U.list([A2(searchForm,address,model)]))]))]));
   });
   return _elm.Search.values = {_op: _op
                               ,searchActions: searchActions
                               ,Model: Model
                               ,init: init
                               ,ParseResult: ParseResult
                               ,Parse: Parse
                               ,Result: Result
                               ,NoOp: NoOp
                               ,update: update
                               ,onInput: onInput
                               ,searchForm: searchForm
                               ,view: view};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.List = Elm.Systems.List || {};
Elm.Systems.List.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.List = _elm.Systems.List || {};
   if (_elm.Systems.List.values) return _elm.Systems.List.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Shorthand = Elm.Html.Shorthand.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Pager = Elm.Pager.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Search = Elm.Search.make(_elm),
   $Set = Elm.Set.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Systems$Decoders = Elm.Systems.Decoders.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm),
   $Table = Elm.Table.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var systemPair = A3($Json$Decode.tuple2,
   F2(function (v0,v1) {    return {ctor: "_Tuple2",_0: v0,_1: v1};}),
   $Json$Decode.string,
   $Systems$Decoders.systemDecoder);
   var systemPage = A3($Json$Decode.object2,
   F2(function (v0,v1) {    return {ctor: "_Tuple2",_0: v0,_1: v1};}),
   A2($Json$Decode._op[":="],"meta",$Json$Decode.dict($Json$Decode.$int)),
   A2($Json$Decode._op[":="],"systems",$Json$Decode.list(systemPair)));
   var flash = function (model) {
      var result = $Html.div(_U.list([$Html$Attributes.$class("callout callout-danger")]));
      var _p0 = model.error;
      switch (_p0.ctor)
      {case "NoError": return A2($Html.div,_U.list([]),_U.list([]));
         case "NoSystemSelected": return result(_U.list([A2($Html.p,_U.list([]),_U.list([$Html.text("Please select a system first")]))]));
         default: return result(_U.list([$Html.text(_p0._0)]));}
   };
   var systemRow = F2(function (id,_p1) {
      var _p2 = _p1;
      return _U.list([$Html$Shorthand.td_(_U.list([$Html.text(id)]))
                     ,$Html$Shorthand.td_(_U.list([$Html.text(function (_) {    return _.hostname;}(_p2.machine))]))
                     ,$Html$Shorthand.td_(_U.list([$Html.text(_p2.type$)]))
                     ,$Html$Shorthand.td_(_U.list([$Html.text(_p2.env)]))
                     ,$Html$Shorthand.td_(_U.list([$Html.text(_p2.owner)]))]);
   });
   var setSystems = F2(function (model,_p3) {
      var _p4 = _p3;
      var newTable = A2($Table.update,$Table.UpdateRows(_p4._1),model.table);
      var total = A2($Maybe.withDefault,0,A2($Dict.get,"total",_p4._0));
      var newPager = A2($Pager.update,$Pager.UpdateTotal($Basics.toFloat(total)),model.pager);
      return {ctor: "_Tuple2",_0: _U.update(model,{systems: _p4,pager: newPager,table: newTable}),_1: $Effects.none};
   });
   var NoOp = {ctor: "NoOp"};
   var Searching = function (a) {    return {ctor: "Searching",_0: a};};
   var LoadPage = function (a) {    return {ctor: "LoadPage",_0: a};};
   var GotoPage = function (a) {    return {ctor: "GotoPage",_0: a};};
   var view = F2(function (address,model) {
      var _p5 = model.systems;
      var meta = _p5._0;
      var systems = _p5._1;
      return _U.list([$Bootstrap$Html.row_(_U.list([A2($Html.div,
                     _U.list([$Html$Attributes.$class("col-md-12")]),
                     _U.list([A2($Search.view,A2($Signal.forwardTo,address,Searching),model.search)]))]))
                     ,$Bootstrap$Html.row_(_U.list([flash(model)
                                                   ,A2($Html.div,
                                                   _U.list([$Html$Attributes.$class("col-md-offset-1 col-md-10")]),
                                                   _U.list([$Bootstrap$Html.panelDefault_(A2($Table.view,
                                                   A2($Signal.forwardTo,address,LoadPage),
                                                   model.table))]))]))
                     ,$Bootstrap$Html.row_(_U.list([A2($Pager.view,A2($Signal.forwardTo,address,GotoPage),model.pager)]))]);
   });
   var SetSystems = function (a) {    return {ctor: "SetSystems",_0: a};};
   var getSystems = F2(function (page,offset) {
      return $Effects.task(A2($Task.map,
      SetSystems,
      $Task.toResult(A2($Http.get,
      systemPage,
      A2($Basics._op["++"],"/systems?page=",A2($Basics._op["++"],$Basics.toString(page),A2($Basics._op["++"],"&offset=",$Basics.toString(offset))))))));
   });
   var getSystemsQuery = F3(function (page,offset,query) {
      return $Effects.task(A2($Task.map,
      SetSystems,
      $Task.toResult(A2($Http.get,
      systemPage,
      A2($Basics._op["++"],
      "/systems/query?page=",
      A2($Basics._op["++"],
      $Basics.toString(page),
      A2($Basics._op["++"],"&offset=",A2($Basics._op["++"],$Basics.toString(offset),A2($Basics._op["++"],"&query=",query)))))))));
   });
   var Model = F5(function (a,b,c,d,e) {    return {error: a,systems: b,pager: c,table: d,search: e};});
   var NoError = {ctor: "NoError"};
   var init = function () {
      var search = $Search.init;
      var table = A5($Table.init,"systemsListing",true,_U.list(["#","Hostname","Type","Env","Owner"]),systemRow,"Systems");
      var emptySystem = A6($Systems$Model$Common.System,"","","",A5($Systems$Model$Common.Machine,"","","",$Maybe.Just(""),""),$Maybe.Nothing,$Maybe.Nothing);
      var systems = {ctor: "_Tuple2",_0: $Dict.empty,_1: _U.list([{ctor: "_Tuple2",_0: "",_1: emptySystem}])};
      return {ctor: "_Tuple2",_0: A5(Model,NoError,systems,$Pager.init,table,search),_1: A2(getSystems,1,10)};
   }();
   var SearchParseFailed = function (a) {    return {ctor: "SearchParseFailed",_0: a};};
   var NoSystemSelected = {ctor: "NoSystemSelected"};
   var update = F2(function (action,_p6) {
      var _p7 = _p6;
      var _p14 = _p7;
      var _p8 = action;
      switch (_p8.ctor)
      {case "SetSystems": return A4($Common$Redirect.successHandler,_p8._0,_p14,setSystems(_p14),NoOp);
         case "GotoPage": var _p11 = _p8._0;
           var _p9 = _p11;
           if (_p9.ctor === "NextPage") {
                 var _p10 = _p9._0;
                 var newPager = A2($Pager.update,_p11,_p14.pager);
                 return $String.isEmpty(_p14.search.input) ? {ctor: "_Tuple2"
                                                             ,_0: _U.update(_p14,{pager: newPager})
                                                             ,_1: A2(getSystems,_p10,10)} : {ctor: "_Tuple2"
                                                                                            ,_0: _U.update(_p14,{pager: newPager})
                                                                                            ,_1: A3(getSystemsQuery,_p10,10,_p14.search.parsed)};
              } else {
                 return {ctor: "_Tuple2",_0: _p14,_1: $Effects.none};
              }
         case "Searching": var _p13 = _p8._0;
           var newSearch = A2($Search.update,_p13,_p14.search);
           var _p12 = _p13;
           if (_p12.ctor === "Result") {
                 if (_p12._0 === true) {
                       return {ctor: "_Tuple2"
                              ,_0: _U.update(_p14,{search: newSearch,error: NoError})
                              ,_1: A3(getSystemsQuery,_p14.pager.page,10,newSearch.parsed)};
                    } else {
                       return $String.isEmpty(newSearch.input) ? {ctor: "_Tuple2"
                                                                 ,_0: _U.update(_p14,{search: newSearch,error: NoError})
                                                                 ,_1: A2(getSystems,_p14.pager.page,10)} : {ctor: "_Tuple2"
                                                                                                           ,_0: _U.update(_p14,
                                                                                                           {search: newSearch
                                                                                                           ,error: SearchParseFailed(newSearch.error)})
                                                                                                           ,_1: $Effects.none};
                    }
              } else {
                 return {ctor: "_Tuple2",_0: _p14,_1: $Effects.none};
              }
         case "LoadPage": var newTable = A2($Table.update,_p8._0,_p14.table);
           return _U.eq(_p7.error,NoSystemSelected) && !_U.eq(newTable.selected,$Set.empty) ? {ctor: "_Tuple2"
                                                                                              ,_0: _U.update(_p14,{table: newTable,error: NoError})
                                                                                              ,_1: $Effects.none} : {ctor: "_Tuple2"
                                                                                                                    ,_0: _U.update(_p14,{table: newTable})
                                                                                                                    ,_1: $Effects.none};
         default: return {ctor: "_Tuple2",_0: _p14,_1: $Effects.none};}
   });
   return _elm.Systems.List.values = {_op: _op
                                     ,NoSystemSelected: NoSystemSelected
                                     ,SearchParseFailed: SearchParseFailed
                                     ,NoError: NoError
                                     ,Model: Model
                                     ,init: init
                                     ,SetSystems: SetSystems
                                     ,GotoPage: GotoPage
                                     ,LoadPage: LoadPage
                                     ,Searching: Searching
                                     ,NoOp: NoOp
                                     ,setSystems: setSystems
                                     ,update: update
                                     ,systemRow: systemRow
                                     ,flash: flash
                                     ,view: view
                                     ,systemPair: systemPair
                                     ,systemPage: systemPage
                                     ,getSystems: getSystems
                                     ,getSystemsQuery: getSystemsQuery};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.Validations = Elm.Systems.Add.Validations || {};
Elm.Systems.Add.Validations.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   _elm.Systems.Add.Validations = _elm.Systems.Add.Validations || {};
   if (_elm.Systems.Add.Validations.values) return _elm.Systems.Add.Validations.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Regex = Elm.Regex.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm);
   var _op = {};
   var vpair = F2(function (step,validations) {    return {ctor: "_Tuple2",_0: $Basics.toString(step),_1: $Dict.fromList(validations)};});
   var Invalid = function (a) {    return {ctor: "Invalid",_0: a};};
   var None = {ctor: "None"};
   var notEmpty = function (value) {    return $String.isEmpty(value) ? Invalid("cannot be empty") : None;};
   var hasItems = function (value) {    return $List.isEmpty(value) ? Invalid("cannot be empty") : None;};
   var notContained = function (_p0) {
      var _p1 = _p0;
      var _p3 = _p1._0;
      var _p2 = notEmpty(_p3);
      if (_p2.ctor === "Invalid") {
            return Invalid(_p2._0);
         } else {
            return A2($List.member,_p3,_p1._1) ? Invalid("cannot add twice") : None;
         }
   };
   var validIp = function (value) {
      return $Basics.not($String.isEmpty(value)) && !_U.eq($List.length(A3($Regex.find,$Regex.All,$Regex.regex("\\d+\\.\\d+\\.\\d+\\.\\d+$"),value)),
      1) ? Invalid("non legal ip address") : None;
   };
   var validId = F4(function (length,prefix,allowEmpty,value) {
      return $String.isEmpty(value) && allowEmpty ? None : $Basics.not(A2($String.contains,prefix,value)) ? Invalid(A2($Basics._op["++"],
      "Id should start with ",
      prefix)) : !_U.eq($String.length(value),length) ? Invalid(A2($Basics._op["++"],
      "Id should have ",
      A2($Basics._op["++"],$Basics.toString(length)," characthers"))) : None;
   });
   return _elm.Systems.Add.Validations.values = {_op: _op
                                                ,None: None
                                                ,Invalid: Invalid
                                                ,notEmpty: notEmpty
                                                ,hasItems: hasItems
                                                ,notContained: notContained
                                                ,validIp: validIp
                                                ,validId: validId
                                                ,vpair: vpair};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.Common = Elm.Systems.Add.Common || {};
Elm.Systems.Add.Common.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   _elm.Systems.Add.Common = _elm.Systems.Add.Common || {};
   if (_elm.Systems.Add.Common.values) return _elm.Systems.Add.Common.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Systems$Add$Validations = Elm.Systems.Add.Validations.make(_elm);
   var _op = {};
   var checkbox = F3(function (address,action,currentValue) {
      return A2($Html.input,
      _U.list([$Html$Attributes.type$("checkbox")
              ,A2($Html$Attributes.attribute,"aria-label","...")
              ,$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "margin",_1: "10px 0 0"}]))
              ,A2($Html$Events.onClick,address,action)
              ,$Html$Attributes.checked(currentValue)]),
      _U.list([]));
   });
   var onInput = F2(function (address,action) {
      return A3($Html$Events.on,
      "input",
      A2($Json$Decode.at,_U.list(["target","value"]),$Json$Decode.string),
      function (_p0) {
         return A2($Signal.message,address,action(_p0));
      });
   });
   var typedInput = F5(function (address,action,place,currentValue,typed) {
      return A2($Html.input,
      _U.list([$Html$Attributes.$class("form-control")
              ,$Html$Attributes.type$(typed)
              ,$Html$Attributes.placeholder(place)
              ,$Html$Attributes.value(currentValue)
              ,A2(onInput,address,action)]),
      _U.list([]));
   });
   var inputNumber = F4(function (address,action,place,currentValue) {    return A5(typedInput,address,action,place,currentValue,"number");});
   var inputText = F4(function (address,action,place,currentValue) {    return A5(typedInput,address,action,place,currentValue,"text");});
   var onSelect = F2(function (address,action) {
      return A3($Html$Events.on,
      "change",
      A2($Json$Decode.at,_U.list(["target","value"]),$Json$Decode.string),
      function (_p1) {
         return A2($Signal.message,address,action(_p1));
      });
   });
   var selected = F2(function (value,$default) {    return _U.eq(value,$default) ? _U.list([A2($Html$Attributes.attribute,"selected","true")]) : _U.list([]);});
   var selector = F4(function (address,action,options,$default) {
      return A2($Html.select,
      _U.list([$Html$Attributes.$class("form-control"),A2(onSelect,address,action)]),
      A2($List.map,function (opt) {    return A2($Html.option,A2(selected,opt,$default),_U.list([$Html.text(opt)]));},options));
   });
   var toHtml = function (error) {
      var _p2 = error;
      if (_p2.ctor === "Invalid") {
            return A2($Html.span,_U.list([$Html$Attributes.$class("help-block")]),_U.list([$Html.text(_p2._0)]));
         } else {
            return A2($Html.span,_U.list([$Html$Attributes.$class("help-block")]),_U.list([]));
         }
   };
   var withMessage = function (errors) {
      if ($List.isEmpty(errors)) return A2($Html.div,_U.list([]),_U.list([])); else {
            var messages = A2($List.map,toHtml,errors);
            return A2($Maybe.withDefault,A2($Html.div,_U.list([]),_U.list([])),$List.head(messages));
         }
   };
   var withError = F2(function (errors,$class) {    return $List.isEmpty(errors) ? $class : A2($Basics._op["++"],$class," has-error");});
   var group = F3(function (title,widget,errors) {
      return A2($Html.div,
      _U.list([$Html$Attributes.$class(A2(withError,errors,"form-group"))]),
      _U.list([A2($Html.label,_U.list([$Html$Attributes.$for(title),$Html$Attributes.$class("col-sm-3 control-label")]),_U.list([$Html.text(title)]))
              ,A2($Html.div,_U.list([$Html$Attributes.$class("col-sm-6")]),_U.list([widget]))
              ,withMessage(errors)]));
   });
   var group$ = F2(function (title,widget) {    return A3(group,title,widget,_U.list([]));});
   return _elm.Systems.Add.Common.values = {_op: _op
                                           ,withError: withError
                                           ,toHtml: toHtml
                                           ,withMessage: withMessage
                                           ,group: group
                                           ,group$: group$
                                           ,selected: selected
                                           ,onSelect: onSelect
                                           ,selector: selector
                                           ,onInput: onInput
                                           ,typedInput: typedInput
                                           ,inputNumber: inputNumber
                                           ,inputText: inputText
                                           ,checkbox: checkbox};
};
Elm.Common = Elm.Common || {};
Elm.Common.Utils = Elm.Common.Utils || {};
Elm.Common.Utils.make = function (_elm) {
   "use strict";
   _elm.Common = _elm.Common || {};
   _elm.Common.Utils = _elm.Common.Utils || {};
   if (_elm.Common.Utils.values) return _elm.Common.Utils.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var defaultEmpty = function (list) {    var _p0 = list;if (_p0.ctor === "Just") {    return _p0._0;} else {    return _U.list([]);}};
   var withDefaultProp = F3(function (parent,$default,prop) {
      var _p1 = parent;
      if (_p1.ctor === "Just") {
            return prop(_p1._0);
         } else {
            return $default;
         }
   });
   var partition = F2(function (n,list) {
      var $catch = A2($List.take,n,list);
      return _U.eq(n,$List.length($catch)) ? A2($Basics._op["++"],_U.list([$catch]),A2(partition,n,A2($List.drop,n,list))) : _U.list([$catch]);
   });
   return _elm.Common.Utils.values = {_op: _op,partition: partition,withDefaultProp: withDefaultProp,defaultEmpty: defaultEmpty};
};
Elm.Common = Elm.Common || {};
Elm.Common.Components = Elm.Common.Components || {};
Elm.Common.Components.make = function (_elm) {
   "use strict";
   _elm.Common = _elm.Common || {};
   _elm.Common.Components = _elm.Common.Components || {};
   if (_elm.Common.Components.values) return _elm.Common.Components.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var panelContents = F2(function (title,body) {
      var height = "550px";
      return _U.list([A2($Html.div,_U.list([$Html$Attributes.$class("panel-heading")]),_U.list([$Html.text(title)]))
                     ,A2($Html.div,
                     _U.list([$Html$Attributes.$class("panel-body")
                             ,$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "height",_1: "auto !important"}
                                                             ,{ctor: "_Tuple2",_0: "overflow",_1: "auto"}
                                                             ,{ctor: "_Tuple2",_0: "min-height",_1: height}
                                                             ,{ctor: "_Tuple2",_0: "height",_1: height}]))]),
                     _U.list([body]))]);
   });
   return _elm.Common.Components.values = {_op: _op,panelContents: panelContents};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.View = Elm.Systems.View || {};
Elm.Systems.View.AWS = Elm.Systems.View.AWS || {};
Elm.Systems.View.AWS.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.View = _elm.Systems.View || {};
   _elm.Systems.View.AWS = _elm.Systems.View.AWS || {};
   if (_elm.Systems.View.AWS.values) return _elm.Systems.View.AWS.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Common$Components = Elm.Common.Components.make(_elm),
   $Common$Utils = Elm.Common.Utils.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Systems$Model$AWS = Elm.Systems.Model.AWS.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm);
   var _op = {};
   var view = F2(function (address,model) {
      return A2($Html.div,_U.list([]),A2($Common$Components.panelContents,"System",A2($Html.div,_U.list([]),_U.list([]))));
   });
   var summaryPanel = function (contents) {
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("panel col-md-4 col-md-offset-1")]),
      _U.list([A2($Html.div,_U.list([$Html$Attributes.$class("panel-body")]),contents)]))]);
   };
   var tablizedRow = F2(function (props,v) {
      return A2($Html.tr,_U.list([]),A2($List.map,function (prop) {    return A2($Html.td,_U.list([]),_U.list([$Html.text(prop(v))]));},props));
   });
   var tablizedSection = F4(function (title,headers,rows,props) {
      return $Basics.not($List.isEmpty(rows)) ? _U.list([$Html.text(title)
                                                        ,A2($Html.table,
                                                        _U.list([$Html$Attributes.$class("table"),$Html$Attributes.id(title)]),
                                                        _U.list([A2($Html.thead,
                                                                _U.list([]),
                                                                _U.list([A2($Html.tr,
                                                                _U.list([]),
                                                                A2($List.map,
                                                                function (k) {
                                                                   return A2($Html.th,_U.list([]),_U.list([$Html.text(k)]));
                                                                },
                                                                headers))]))
                                                                ,A2($Html.tbody,
                                                                _U.list([]),
                                                                A2($List.map,
                                                                function (value) {
                                                                   return A2(tablizedRow,props,value);
                                                                },
                                                                rows))]))]) : _U.list([]);
   });
   var overviewSection = F3(function (title,headers,values) {
      return _U.list([$Html.text(title)
                     ,A2($Html.ul,
                     _U.list([$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "list-style-type",_1: "none"}]))]),
                     A3($List.map2,
                     F2(function (title,value) {
                        return A2($Html.li,_U.list([]),_U.list([$Html.text(A2($Basics._op["++"],title,A2($Basics._op["++"],": ",value)))]));
                     }),
                     headers,
                     values))]);
   });
   var optionalSection = F4(function (title,headers,values,pred) {    return pred ? A3(overviewSection,title,headers,values) : _U.list([]);});
   var summarySections = function (_p0) {
      var _p1 = _p0;
      var _p6 = _p1._1;
      var _p5 = _p1._0;
      return A2($List.filter,
      function (_p2) {
         return $Basics.not($List.isEmpty(_p2));
      },
      _U.list([A3(overviewSection,
              "Instance",
              _U.list(["type","os","endpoint","availability zone"]),
              _U.list([_p5.instanceType,_p6.os,_p5.endpoint,A2($Maybe.withDefault,"",_p5.availabilityZone)]))
              ,A3(overviewSection,
              "Security",
              _U.list(["user","keypair","security groups"]),
              _U.list([_p6.user,_p5.keyName,A2($String.join," ",A2($Maybe.withDefault,_U.list([]),_p5.securityGroups))]))
              ,A3(overviewSection,"DNS",_U.list(["hostname","domain","ip"]),_U.list([_p6.hostname,_p6.domain,A2($Maybe.withDefault,"",_p6.ip)]))
              ,A4(optionalSection,
              "VPC",
              _U.list(["VPC id","Subnet id","Assign IP"]),
              A2($List.map,A2($Common$Utils.withDefaultProp,_p5.vpc,""),_U.list([function (_) {    return _.vpcId;},function (_) {    return _.subnetId;}])),
              !_U.eq(_p5.vpc,$Maybe.Nothing))
              ,A4(tablizedSection,
              "EBS volumes",
              _U.list(["device","size","type","clear"]),
              A2($Maybe.withDefault,_U.list([]),_p5.volumes),
              _U.list([function (_) {
                         return _.device;
                      }
                      ,function (_p3) {
                         return $Basics.toString(function (_) {    return _.size;}(_p3));
                      }
                      ,function (_) {
                         return _.type$;
                      }
                      ,function (_p4) {
                         return $Basics.toString(function (_) {    return _.clear;}(_p4));
                      }]))
              ,A4(tablizedSection,
              "Instance store blocks",
              _U.list(["device","volume"]),
              A2($Maybe.withDefault,_U.list([]),_p5.blockDevices),
              _U.list([function (_) {    return _.device;},function (_) {    return _.volume;}]))]));
   };
   var summarize = function (model) {
      return _U.list([A2($Html.div,
      _U.list([]),
      _U.list([A2($Html.h4,_U.list([]),_U.list([$Html.text("System overview")]))
              ,A2($Html.div,
              _U.list([$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "line-height",_1: "1.8"},{ctor: "_Tuple2",_0: "list-style-type",_1: "none"}]))]),
              A2($List.map,
              $Bootstrap$Html.row_,
              A2($List.map,$List.concat,A2($Common$Utils.partition,2,A2($List.map,summaryPanel,summarySections(model))))))]))]);
   };
   var NoOp = {ctor: "NoOp"};
   var Model = function (a) {    return {id: a};};
   var init = {ctor: "_Tuple2",_0: Model(0),_1: $Effects.none};
   return _elm.Systems.View.AWS.values = {_op: _op
                                         ,Model: Model
                                         ,init: init
                                         ,NoOp: NoOp
                                         ,overviewSection: overviewSection
                                         ,tablizedRow: tablizedRow
                                         ,tablizedSection: tablizedSection
                                         ,optionalSection: optionalSection
                                         ,summaryPanel: summaryPanel
                                         ,summarySections: summarySections
                                         ,summarize: summarize
                                         ,view: view};
};
Elm.Environments = Elm.Environments || {};
Elm.Environments.List = Elm.Environments.List || {};
Elm.Environments.List.make = function (_elm) {
   "use strict";
   _elm.Environments = _elm.Environments || {};
   _elm.Environments.List = _elm.Environments.List || {};
   if (_elm.Environments.List.values) return _elm.Environments.List.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var node = $Json$Decode.dict($Json$Decode.string);
   var template = $Json$Decode.dict($Json$Decode.string);
   var Empty = {ctor: "Empty"};
   var Physical = {ctor: "Physical"};
   var Proxmox = F2(function (a,b) {    return {ctor: "Proxmox",_0: a,_1: b};});
   var OSTemplates = function (a) {    return {ctor: "OSTemplates",_0: a};};
   var hypervisor = $Json$Decode.oneOf(_U.list([A2($Json$Decode.object1,OSTemplates,A2($Json$Decode._op[":="],"ostemplates",$Json$Decode.dict(template)))
                                               ,A3($Json$Decode.object2,
                                               Proxmox,
                                               A2($Json$Decode._op[":="],"nodes",$Json$Decode.dict(node)),
                                               A2($Json$Decode._op[":="],"ostemplates",$Json$Decode.dict(template)))
                                               ,$Json$Decode.succeed(Physical)]));
   var environment = $Json$Decode.dict(hypervisor);
   var environmentsList = A2($Json$Decode.at,_U.list(["environments"]),$Json$Decode.dict(environment));
   var getEnvironments = function (action) {    return $Effects.task(A2($Task.map,action,$Task.toResult(A2($Http.get,environmentsList,"/environments"))));};
   return _elm.Environments.List.values = {_op: _op
                                          ,OSTemplates: OSTemplates
                                          ,Proxmox: Proxmox
                                          ,Physical: Physical
                                          ,Empty: Empty
                                          ,template: template
                                          ,node: node
                                          ,hypervisor: hypervisor
                                          ,environment: environment
                                          ,environmentsList: environmentsList
                                          ,getEnvironments: getEnvironments};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.AWS = Elm.Systems.Add.AWS || {};
Elm.Systems.Add.AWS.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   _elm.Systems.Add.AWS = _elm.Systems.Add.AWS || {};
   if (_elm.Systems.Add.AWS.values) return _elm.Systems.Add.AWS.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$Components = Elm.Common.Components.make(_elm),
   $Common$Utils = Elm.Common.Utils.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Environments$List = Elm.Environments.List.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Shorthand = Elm.Html.Shorthand.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Systems$Add$Common = Elm.Systems.Add.Common.make(_elm),
   $Systems$Add$Validations = Elm.Systems.Add.Validations.make(_elm),
   $Systems$Model$AWS = Elm.Systems.Model.AWS.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm),
   $Systems$View$AWS = Elm.Systems.View.AWS.make(_elm);
   var _op = {};
   var ebsTypes = $Dict.fromList(_U.list([{ctor: "_Tuple2",_0: "Magnetic",_1: "standard"}
                                         ,{ctor: "_Tuple2",_0: "General Purpose (SSD)",_1: "gp2"}
                                         ,{ctor: "_Tuple2",_0: "Provisioned IOPS (SSD)",_1: "io1"}]));
   var withErrors = F3(function (errors,key,widget) {
      return A3($Systems$Add$Common.group,key,widget,$Common$Utils.defaultEmpty(A2($Dict.get,key,errors)));
   });
   var getOses = function (model) {
      var hypervisor = A2($Maybe.withDefault,$Environments$List.OSTemplates($Dict.empty),A2($Dict.get,"aws",model.environment));
      var _p0 = hypervisor;
      if (_p0.ctor === "OSTemplates") {
            return _p0._0;
         } else {
            return $Dict.empty;
         }
   };
   var hasPrev = function (model) {    return $Basics.not($List.isEmpty(model.prev));};
   var hasNext = function (model) {    return $Basics.not($List.isEmpty(model.next));};
   var ignoreDevices = function (_p1) {
      var _p2 = _p1;
      var ignored = A2($Dict.remove,"Volume",A2($Dict.remove,"Instance Device",A2($Dict.remove,"EBS Device",_p2.errors)));
      return _U.update(_p2,{errors: ignored});
   };
   var notAny = function (errors) {    return $List.isEmpty(A2($List.filter,function (e) {    return $Basics.not($List.isEmpty(e));},$Dict.values(errors)));};
   var validate = F3(function (step,key,validations) {
      var stepValidations = A2($Maybe.withDefault,$Dict.empty,A2($Dict.get,$Basics.toString(step),validations));
      return A2($Maybe.withDefault,$Basics.identity,A2($Dict.get,key,stepValidations));
   });
   var extractIp = function (_p3) {    var _p4 = _p3;var _p5 = _p4.machine.ip;if (_p5.ctor === "Just") {    return _p5._0;} else {    return "";}};
   var validationOf = F4(function (key,validations,value,_p6) {
      var _p7 = _p6;
      var _p9 = _p7;
      var res = A2($List.filter,
      function (error) {
         return !_U.eq(error,$Systems$Add$Validations.None);
      },
      A2($List.map,function (validation) {    return validation(value(_p9));},validations));
      var newErrors = A3($Dict.update,key,function (_p8) {    return $Maybe.Just(res);},_p7.errors);
      return _U.update(_p9,{errors: newErrors});
   });
   var setBlock = F2(function (f,_p10) {    var _p11 = _p10;var newBlock = f(_p11.block);return _U.update(_p11,{block: newBlock});});
   var setVolume = F2(function (f,_p12) {    var _p13 = _p12;var newVolume = f(_p13.volume);return _U.update(_p13,{volume: newVolume});});
   var setMachine = F2(function (f,_p14) {    var _p15 = _p14;var newMachine = f(_p15.machine);return _U.update(_p15,{machine: newMachine});});
   var setAWS = F2(function (f,_p16) {    var _p17 = _p16;var newAws = f(_p17.aws);return _U.update(_p17,{aws: newAws});});
   var Summary = {ctor: "Summary"};
   var Store = {ctor: "Store"};
   var EBS = {ctor: "EBS"};
   var tupleValidations = $Dict.fromList(_U.list([A2($Systems$Add$Validations.vpair,
                                                 EBS,
                                                 _U.list([{ctor: "_Tuple2"
                                                          ,_0: "EBS Device"
                                                          ,_1: A3(validationOf,
                                                          "EBS Device",
                                                          _U.list([$Systems$Add$Validations.notContained]),
                                                          function (_p18) {
                                                             var _p19 = _p18;
                                                             return {ctor: "_Tuple2"
                                                                    ,_0: _p19.volume.device
                                                                    ,_1: A2($List.map,
                                                                    function (_) {
                                                                       return _.device;
                                                                    },
                                                                    $Common$Utils.defaultEmpty(_p19.aws.volumes))};
                                                          })}]))
                                                 ,A2($Systems$Add$Validations.vpair,
                                                 Store,
                                                 _U.list([{ctor: "_Tuple2"
                                                          ,_0: "Instance Device"
                                                          ,_1: A3(validationOf,
                                                          "Instance Device",
                                                          _U.list([$Systems$Add$Validations.notContained]),
                                                          function (_p20) {
                                                             var _p21 = _p20;
                                                             return {ctor: "_Tuple2"
                                                                    ,_0: _p21.block.device
                                                                    ,_1: A2($List.map,
                                                                    function (_) {
                                                                       return _.device;
                                                                    },
                                                                    $Common$Utils.defaultEmpty(_p21.aws.blockDevices))};
                                                          })}
                                                         ,{ctor: "_Tuple2"
                                                          ,_0: "Volume"
                                                          ,_1: A3(validationOf,
                                                          "Volume",
                                                          _U.list([$Systems$Add$Validations.notContained]),
                                                          function (_p22) {
                                                             var _p23 = _p22;
                                                             return {ctor: "_Tuple2"
                                                                    ,_0: _p23.block.volume
                                                                    ,_1: A2($List.map,
                                                                    function (_) {
                                                                       return _.volume;
                                                                    },
                                                                    A2($Maybe.withDefault,_U.list([]),_p23.aws.blockDevices))};
                                                          })}]))]));
   var Networking = {ctor: "Networking"};
   var Instance = {ctor: "Instance"};
   var stringValidations = $Dict.fromList(_U.list([A2($Systems$Add$Validations.vpair,
                                                  Networking,
                                                  _U.list([{ctor: "_Tuple2"
                                                           ,_0: "Hostname"
                                                           ,_1: A3(validationOf,
                                                           "Hostname",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p24) {
                                                              var _p25 = _p24;
                                                              return _p25.machine.hostname;
                                                           })}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "Domain"
                                                           ,_1: A3(validationOf,
                                                           "Domain",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p26) {
                                                              var _p27 = _p26;
                                                              return _p27.machine.domain;
                                                           })}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "IP"
                                                           ,_1: A3(validationOf,"IP",_U.list([$Systems$Add$Validations.validIp]),extractIp)}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "VPC Id"
                                                           ,_1: A3(validationOf,
                                                           "VPC Id",
                                                           _U.list([A3($Systems$Add$Validations.validId,12,"vpc-",true)]),
                                                           function (_p28) {
                                                              var _p29 = _p28;
                                                              return A3($Common$Utils.withDefaultProp,_p29.aws.vpc,"",function (_) {    return _.vpcId;});
                                                           })}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "Subnet Id"
                                                           ,_1: A3(validationOf,
                                                           "Subnet Id",
                                                           _U.list([A3($Systems$Add$Validations.validId,15,"subnet-",true)]),
                                                           function (_p30) {
                                                              var _p31 = _p30;
                                                              return A3($Common$Utils.withDefaultProp,_p31.aws.vpc,"",function (_) {    return _.subnetId;});
                                                           })}]))
                                                  ,A2($Systems$Add$Validations.vpair,
                                                  Instance,
                                                  _U.list([{ctor: "_Tuple2"
                                                           ,_0: "User"
                                                           ,_1: A3(validationOf,
                                                           "User",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p32) {
                                                              var _p33 = _p32;
                                                              return _p33.machine.user;
                                                           })}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "Keypair"
                                                           ,_1: A3(validationOf,
                                                           "Keypair",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p34) {
                                                              var _p35 = _p34;
                                                              return _p35.aws.keyName;
                                                           })}]))]));
   var listValidations = $Dict.fromList(_U.list([A2($Systems$Add$Validations.vpair,
   Instance,
   _U.list([{ctor: "_Tuple2"
            ,_0: "Security groups"
            ,_1: A3(validationOf,
            "Security groups",
            _U.list([$Systems$Add$Validations.hasItems]),
            function (_p36) {
               var _p37 = _p36;
               return $Common$Utils.defaultEmpty(_p37.aws.securityGroups);
            })}]))]));
   var validateAll = F2(function (step,model) {
      var validations = _U.list([listValidations,stringValidations]);
      var stepValues = A2($List.map,function (vs) {    return A2($Maybe.withDefault,$Dict.empty,A2($Dict.get,$Basics.toString(step),vs));},validations);
      return A3($List.foldl,F2(function (v,m) {    return v(m);}),model,$List.concat(A2($List.map,$Dict.values,stepValues)));
   });
   var Zero = {ctor: "Zero"};
   var update = F2(function (action,_p38) {
      var _p39 = _p38;
      var _p56 = _p39.step;
      var _p55 = _p39.prev;
      var _p54 = _p39.next;
      var _p53 = _p39;
      var _p52 = _p39.machine;
      var _p51 = _p39.aws;
      var _p40 = action;
      switch (_p40.ctor)
      {case "Next": var _p41 = ignoreDevices(A2(validateAll,_p56,_p53));
           var newModel = _p41;
           var errors = _p41.errors;
           var prevSteps = !_U.eq(_p56,Zero) ? A2($List.append,_p55,_U.list([_p56])) : _p55;
           var nextSteps = $Common$Utils.defaultEmpty($List.tail(_p54));
           var nextStep = A2($Maybe.withDefault,Instance,$List.head(_p54));
           return notAny(errors) ? _U.update(newModel,{step: nextStep,next: nextSteps,prev: prevSteps}) : newModel;
         case "Back": var _p42 = ignoreDevices(A2(validateAll,_p56,_p53));
           var newModel = _p42;
           var errors = _p42.errors;
           var nextSteps = !_U.eq(_p56,Zero) ? A2($List.append,_U.list([_p56]),_p54) : _p54;
           var prevSteps = A2($List.take,$List.length(_p55) - 1,_p55);
           var prevStep = A2($Maybe.withDefault,Zero,$List.head($List.reverse(_p55)));
           return notAny(errors) ? _U.update(_p53,{step: prevStep,next: nextSteps,prev: prevSteps}) : _p53;
         case "Update": var newModel = _U.update(_p53,{environment: _p40._0});
           var _p43 = $List.head($Dict.keys(getOses(newModel)));
           if (_p43.ctor === "Just") {
                 return $String.isEmpty(_p52.os) ? _U.update(newModel,{machine: _U.update(_p52,{os: _p43._0})}) : newModel;
              } else {
                 return newModel;
              }
         case "SelectInstanceType": return A2(setAWS,function (aws) {    return _U.update(aws,{instanceType: _p40._0});},_p53);
         case "SelectOS": return A2(setMachine,function (machine) {    return _U.update(machine,{os: _p40._0});},_p53);
         case "SelectEndpoint": var _p44 = A2($Maybe.withDefault,
           {ctor: "_Tuple3",_0: "",_1: "",_2: _U.list([])},
           $List.head(A2($List.filter,function (_p45) {    var _p46 = _p45;return _U.eq(_p46._0,_p40._0);},$Dict.values($Systems$Model$AWS.endpoints))));
           var url = _p44._1;
           return A2(setAWS,function (aws) {    return _U.update(aws,{endpoint: url});},_p53);
         case "SelectZone": return A2(setAWS,function (aws) {    return _U.update(aws,{availabilityZone: $Maybe.Just(_p40._0)});},_p53);
         case "KeyPairInput": return A4(validate,
           _p56,
           "Keypair",
           stringValidations,
           A2(setAWS,function (aws) {    return _U.update(aws,{keyName: _p40._0});},_p53));
         case "SecurityGroupsInput": var splited = A2($String.split," ",_p40._0);
           return A4(validate,
           _p56,
           "Security groups",
           listValidations,
           A2(setAWS,function (aws) {    return _U.update(aws,{securityGroups: $Maybe.Just(_U.eq(splited,_U.list([""])) ? _U.list([]) : splited)});},_p53));
         case "UserInput": return A4(validate,
           _p56,
           "User",
           stringValidations,
           A2(setMachine,function (machine) {    return _U.update(machine,{user: _p40._0});},_p53));
         case "HostnameInput": return A4(validate,
           _p56,
           "Hostname",
           stringValidations,
           A2(setMachine,function (machine) {    return _U.update(machine,{hostname: _p40._0});},_p53));
         case "DomainInput": return A4(validate,
           _p56,
           "Domain",
           stringValidations,
           A2(setMachine,function (machine) {    return _U.update(machine,{domain: _p40._0});},_p53));
         case "IPInput": return A4(validate,
           _p56,
           "IP",
           stringValidations,
           A2(setMachine,function (machine) {    return _U.update(machine,{ip: $Maybe.Just(_p40._0)});},_p53));
         case "VPCIdInput": var newVpc = A2($Maybe.withDefault,$Systems$Model$AWS.emptyVpc,_p51.vpc);
           return A4(validate,
           _p56,
           "VPC Id",
           stringValidations,
           A2(setAWS,function (aws) {    return _U.update(aws,{vpc: $Maybe.Just(_U.update(newVpc,{vpcId: _p40._0}))});},_p53));
         case "SubnetIdInput": var newVpc = A2($Maybe.withDefault,$Systems$Model$AWS.emptyVpc,_p51.vpc);
           return A4(validate,
           _p56,
           "Subnet Id",
           stringValidations,
           A2(setAWS,function (aws) {    return _U.update(aws,{vpc: $Maybe.Just(_U.update(newVpc,{subnetId: _p40._0}))});},_p53));
         case "AssignIp": var newVpc = A2($Maybe.withDefault,$Systems$Model$AWS.emptyVpc,_p51.vpc);
           return A2(setAWS,
           function (aws) {
              return _U.update(aws,{vpc: $Maybe.Just(_U.update(newVpc,{assignPublic: $Basics.not(newVpc.assignPublic)}))});
           },
           _p53);
         case "SelectEBSType": return A2(setVolume,function (volume) {    return _U.update(volume,{type$: _p40._0});},_p53);
         case "EBSSizeInput": var _p47 = $String.toInt(_p40._0);
           if (_p47.ctor === "Ok") {
                 return A2(setVolume,function (volume) {    return _U.update(volume,{size: _p47._0});},_p53);
              } else {
                 return _p53;
              }
         case "EBSIOPSInput": var _p48 = $String.toInt(_p40._0);
           if (_p48.ctor === "Ok") {
                 return A2(setVolume,function (volume) {    return _U.update(volume,{iops: $Maybe.Just(_p48._0)});},_p53);
              } else {
                 return _p53;
              }
         case "EBSDeviceInput": return A4(validate,
           _p56,
           "EBS Device",
           tupleValidations,
           A2(setVolume,function (volume) {    return _U.update(volume,{device: _p40._0});},_p53));
         case "EBSOptimized": return A2(setAWS,
           function (aws) {
              return _U.update(aws,{ebsOptimized: $Maybe.Just($Basics.not(A2($Maybe.withDefault,false,aws.ebsOptimized)))});
           },
           _p53);
         case "EBSClear": return A2(setVolume,function (volume) {    return _U.update(volume,{clear: $Basics.not(volume.clear)});},_p53);
         case "VolumeAdd": var newAws = _U.update(_p51,
           {volumes: $Maybe.Just(A2($List.append,_U.list([_p39.volume]),$Common$Utils.defaultEmpty(_p51.volumes)))});
           var _p49 = A4(validate,_p56,"EBS Device",tupleValidations,_p53);
           var newModel = _p49;
           var errors = _p49.errors;
           return notAny(errors) ? _U.update(newModel,{volume: $Systems$Model$AWS.emptyVolume,aws: newAws}) : _U.update(newModel,{aws: _p51});
         case "InstanceDeviceInput": return A4(validate,
           _p56,
           "Instance Device",
           tupleValidations,
           A2(setBlock,function (block) {    return _U.update(block,{device: _p40._0});},_p53));
         case "InstanceVolumeInput": return A4(validate,
           _p56,
           "Volume",
           tupleValidations,
           A2(setBlock,function (block) {    return _U.update(block,{volume: _p40._0});},_p53));
         case "BlockAdd": var newAws = _U.update(_p51,
           {blockDevices: $Maybe.Just(A2($List.append,_U.list([_p39.block]),$Common$Utils.defaultEmpty(_p51.blockDevices)))});
           var _p50 = A4(validate,_p56,"Volume",tupleValidations,A4(validate,_p56,"Instance Device",tupleValidations,_p53));
           var newModel = _p50;
           var errors = _p50.errors;
           return notAny(errors) ? _U.update(newModel,{block: $Systems$Model$AWS.emptyBlock,aws: newAws}) : _U.update(newModel,{aws: _p51});
         case "VolumeRemove": var newVolumes = A2($List.filter,
           function (volume) {
              return !_U.eq(volume.device,_p40._0);
           },
           $Common$Utils.defaultEmpty(_p51.volumes));
           var newAws = _U.update(_p51,{volumes: $Maybe.Just(newVolumes)});
           return _U.update(_p53,{aws: newAws});
         default: var newBlocks = A2($List.filter,function (block) {    return !_U.eq(block.device,_p40._0);},$Common$Utils.defaultEmpty(_p51.blockDevices));
           var newAws = _U.update(_p51,{blockDevices: $Maybe.Just(newBlocks)});
           return _U.update(_p53,{aws: newAws});}
   });
   var BlockRemove = function (a) {    return {ctor: "BlockRemove",_0: a};};
   var blockRow = F2(function (address,_p57) {
      var _p58 = _p57;
      var props = _U.list([function (_) {    return _.device;},function (_) {    return _.volume;}]);
      var remove = A2($Html.span,
      _U.list([$Html$Attributes.$class("glyphicon glyphicon-remove")
              ,A2($Html$Attributes.attribute,"aria-hidden","true")
              ,$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "top",_1: "5px"}]))
              ,A2($Html$Events.onClick,address,BlockRemove(_p58.device))]),
      _U.list([]));
      return A2($Html.tr,
      _U.list([]),
      A2($List.append,A2($List.map,function (prop) {    return A2($Html.td,_U.list([]),_U.list([$Html.text(prop(_p58))]));},props),_U.list([remove])));
   });
   var blocks = F2(function (address,bs) {
      return A2($Html.div,
      _U.list([$Html$Attributes.$class("col-md-8 col-md-offset-2 ")]),
      _U.list([A2($Html.table,
      _U.list([$Html$Attributes.$class("table"),$Html$Attributes.id("instanceVolumes")]),
      _U.list([$Html$Shorthand.thead_(_U.list([A2($Html.tr,
              _U.list([]),
              A2($List.map,function (k) {    return A2($Html.th,_U.list([]),_U.list([$Html.text(k)]));},_U.list(["device","volume",""])))]))
              ,A2($Html.tbody,_U.list([]),A2($List.map,function (block) {    return A2(blockRow,address,block);},bs))]))]));
   });
   var BlockAdd = {ctor: "BlockAdd"};
   var InstanceVolumeInput = function (a) {    return {ctor: "InstanceVolumeInput",_0: a};};
   var InstanceDeviceInput = function (a) {    return {ctor: "InstanceDeviceInput",_0: a};};
   var store = F2(function (address,_p59) {
      var _p60 = _p59;
      var _p61 = _p60.block;
      var check = withErrors(_p60.errors);
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-horizontal"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Html.legend,_U.list([]),_U.list([$Html.text("Instance Store")]))
              ,A2(check,"Instance Device",A4($Systems$Add$Common.inputText,address,InstanceDeviceInput,"sdb",_p61.device))
              ,A2(check,"Volume",A4($Systems$Add$Common.inputText,address,InstanceVolumeInput,"ephemeral0",_p61.volume))
              ,A2($Systems$Add$Common.group$,
              "",
              A2($Html.button,_U.list([$Html$Attributes.$class("btn btn-sm col-md-2"),A2($Html$Events.onClick,address,BlockAdd)]),_U.list([$Html.text("Add")])))
              ,A2(blocks,address,$Common$Utils.defaultEmpty(_p60.aws.blockDevices))]))]);
   });
   var AssignIp = {ctor: "AssignIp"};
   var SubnetIdInput = function (a) {    return {ctor: "SubnetIdInput",_0: a};};
   var VPCIdInput = function (a) {    return {ctor: "VPCIdInput",_0: a};};
   var EBSClear = {ctor: "EBSClear"};
   var EBSOptimized = {ctor: "EBSOptimized"};
   var VolumeRemove = function (a) {    return {ctor: "VolumeRemove",_0: a};};
   var volumeRow = F2(function (address,_p62) {
      var _p63 = _p62;
      var props = _U.list([function (_) {
                             return _.device;
                          }
                          ,function (_p64) {
                             return $Basics.toString(function (_) {    return _.size;}(_p64));
                          }
                          ,function (_) {
                             return _.type$;
                          }
                          ,function (_p65) {
                             return $Basics.toString(function (_) {    return _.clear;}(_p65));
                          }]);
      var remove = A2($Html.span,
      _U.list([$Html$Attributes.$class("glyphicon glyphicon-remove")
              ,A2($Html$Attributes.attribute,"aria-hidden","true")
              ,$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "top",_1: "5px"}]))
              ,A2($Html$Events.onClick,address,VolumeRemove(_p63.device))]),
      _U.list([]));
      return A2($Html.tr,
      _U.list([]),
      A2($List.append,A2($List.map,function (prop) {    return A2($Html.td,_U.list([]),_U.list([$Html.text(prop(_p63))]));},props),_U.list([remove])));
   });
   var volumes = F2(function (address,vs) {
      return A2($Html.div,
      _U.list([$Html$Attributes.$class("col-md-8 col-md-offset-2 ")]),
      _U.list([A2($Html.table,
      _U.list([$Html$Attributes.$class("table"),$Html$Attributes.id("ebsVolumes")]),
      _U.list([A2($Html.thead,
              _U.list([]),
              _U.list([A2($Html.tr,
              _U.list([]),
              A2($List.map,function (k) {    return A2($Html.th,_U.list([]),_U.list([$Html.text(k)]));},_U.list(["device","size","type","clear",""])))]))
              ,A2($Html.tbody,_U.list([]),A2($List.map,function (volume) {    return A2(volumeRow,address,volume);},vs))]))]));
   });
   var VolumeAdd = {ctor: "VolumeAdd"};
   var EBSDeviceInput = function (a) {    return {ctor: "EBSDeviceInput",_0: a};};
   var EBSIOPSInput = function (a) {    return {ctor: "EBSIOPSInput",_0: a};};
   var EBSSizeInput = function (a) {    return {ctor: "EBSSizeInput",_0: a};};
   var SelectEBSType = function (a) {    return {ctor: "SelectEBSType",_0: a};};
   var ebs = F2(function (address,_p66) {
      var _p67 = _p66;
      var _p69 = _p67.volume;
      var _p68 = _p67.aws;
      var check = withErrors(_p67.errors);
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-horizontal"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Html.legend,_U.list([]),_U.list([$Html.text("Global")]))
              ,A2($Systems$Add$Common.group$,
              "EBS Optimized",
              A3($Systems$Add$Common.checkbox,address,EBSOptimized,A2($Maybe.withDefault,false,_p68.ebsOptimized)))
              ,A2($Html.legend,_U.list([]),_U.list([$Html.text("Devices")]))
              ,A2(check,"EBS Device",A4($Systems$Add$Common.inputText,address,EBSDeviceInput,"sdh",_p69.device))
              ,A2($Systems$Add$Common.group$,"Size",A4($Systems$Add$Common.inputNumber,address,EBSSizeInput,"",$Basics.toString(_p69.size)))
              ,A2($Systems$Add$Common.group$,"Type",A4($Systems$Add$Common.selector,address,SelectEBSType,$Dict.keys(ebsTypes),_p69.type$))
              ,_U.eq(_p69.type$,"Provisioned IOPS (SSD)") ? A2($Systems$Add$Common.group$,
              "IOPS",
              A4($Systems$Add$Common.inputNumber,address,EBSIOPSInput,"50",$Basics.toString(A2($Maybe.withDefault,50,_p69.iops)))) : A2($Html.div,
              _U.list([]),
              _U.list([]))
              ,A2($Systems$Add$Common.group$,"Clear",A3($Systems$Add$Common.checkbox,address,EBSClear,_p69.clear))
              ,A2($Systems$Add$Common.group$,
              "",
              A2($Html.button,
              _U.list([$Html$Attributes.$class("btn btn-sm col-md-2"),A2($Html$Events.onClick,address,VolumeAdd)]),
              _U.list([$Html.text("Add")])))
              ,A2($Html.legend,_U.list([]),_U.list([$Html.text("Volumes")]))
              ,A2(volumes,address,$Common$Utils.defaultEmpty(_p68.volumes))]))]);
   });
   var IPInput = function (a) {    return {ctor: "IPInput",_0: a};};
   var DomainInput = function (a) {    return {ctor: "DomainInput",_0: a};};
   var HostnameInput = function (a) {    return {ctor: "HostnameInput",_0: a};};
   var networking = F2(function (address,_p70) {
      var _p71 = _p70;
      var _p73 = _p71.machine;
      var _p72 = _p71.aws;
      var check = withErrors(_p71.errors);
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-horizontal"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Html.legend,_U.list([]),_U.list([$Html.text("DNS")]))
              ,A2(check,"Hostname",A4($Systems$Add$Common.inputText,address,HostnameInput,"",_p73.hostname))
              ,A2(check,"Domain",A4($Systems$Add$Common.inputText,address,DomainInput,"",_p73.domain))
              ,A2(check,"IP",A4($Systems$Add$Common.inputText,address,IPInput,"",A2($Maybe.withDefault,"",_p73.ip)))
              ,A2($Html.legend,_U.list([]),_U.list([$Html.text("VPC")]))
              ,A2(check,
              "VPC Id",
              A4($Systems$Add$Common.inputText,address,VPCIdInput,"",A3($Common$Utils.withDefaultProp,_p72.vpc,"",function (_) {    return _.vpcId;})))
              ,A2(check,
              "Subnet Id",
              A4($Systems$Add$Common.inputText,address,SubnetIdInput,"",A3($Common$Utils.withDefaultProp,_p72.vpc,"",function (_) {    return _.subnetId;})))
              ,A2($Systems$Add$Common.group$,
              "Assign public IP",
              A3($Systems$Add$Common.checkbox,
              address,
              AssignIp,
              A3($Common$Utils.withDefaultProp,_p72.vpc,false,function (_) {    return _.assignPublic;})))]))]);
   });
   var UserInput = function (a) {    return {ctor: "UserInput",_0: a};};
   var SecurityGroupsInput = function (a) {    return {ctor: "SecurityGroupsInput",_0: a};};
   var KeyPairInput = function (a) {    return {ctor: "KeyPairInput",_0: a};};
   var SelectZone = function (a) {    return {ctor: "SelectZone",_0: a};};
   var SelectEndpoint = function (a) {    return {ctor: "SelectEndpoint",_0: a};};
   var SelectOS = function (a) {    return {ctor: "SelectOS",_0: a};};
   var SelectInstanceType = function (a) {    return {ctor: "SelectInstanceType",_0: a};};
   var instance = F2(function (address,_p74) {
      var _p75 = _p74;
      var _p82 = _p75;
      var _p81 = _p75.aws;
      var zone = A2($Maybe.withDefault,
      "",
      $List.head($Dict.keys(A2($Dict.filter,F2(function (k,_p76) {    var _p77 = _p76;return _U.eq(_p77._1,_p81.endpoint);}),$Systems$Model$AWS.endpoints))));
      var _p78 = A2($Maybe.withDefault,{ctor: "_Tuple3",_0: "",_1: "",_2: _U.list([])},A2($Dict.get,zone,$Systems$Model$AWS.endpoints));
      var name = _p78._0;
      var zones = _p78._2;
      var zoneOptions = A2($List.append,_U.list([""]),A2($List.map,function (k) {    return A2($Basics._op["++"],zone,k);},zones));
      var points = A2($List.map,function (_p79) {    var _p80 = _p79;return _p80._0;},$Dict.values($Systems$Model$AWS.endpoints));
      var groups = A2($String.join," ",$Common$Utils.defaultEmpty(_p81.securityGroups));
      var check = withErrors(_p75.errors);
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-horizontal"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Html.legend,_U.list([]),_U.list([$Html.text("Properties")]))
              ,A2($Systems$Add$Common.group$,
              "Instance type",
              A4($Systems$Add$Common.selector,address,SelectInstanceType,$Systems$Model$AWS.instanceTypes,_p81.instanceType))
              ,A2($Systems$Add$Common.group$,"OS",A4($Systems$Add$Common.selector,address,SelectOS,$Dict.keys(getOses(_p82)),_p75.machine.os))
              ,A2($Systems$Add$Common.group$,"Endpoint",A4($Systems$Add$Common.selector,address,SelectEndpoint,points,name))
              ,A2($Systems$Add$Common.group$,
              "Availability Zone",
              A4($Systems$Add$Common.selector,address,SelectZone,zoneOptions,A2($Maybe.withDefault,"",_p81.availabilityZone)))
              ,A2($Html.legend,_U.list([]),_U.list([$Html.text("Security")]))
              ,A2(check,"User",A4($Systems$Add$Common.inputText,address,UserInput,"",_p82.machine.user))
              ,A2(check,"Keypair",A4($Systems$Add$Common.inputText,address,KeyPairInput,"",_p81.keyName))
              ,A2(check,"Security groups",A4($Systems$Add$Common.inputText,address,SecurityGroupsInput," ",groups))]))]);
   });
   var stepView = F2(function (address,_p83) {
      var _p84 = _p83;
      var _p86 = _p84;
      var _p85 = _p86.step;
      switch (_p85.ctor)
      {case "Instance": return A2(instance,address,_p86);
         case "Networking": return A2(networking,address,_p86);
         case "EBS": return A2(ebs,address,_p86);
         case "Store": return A2(store,address,_p86);
         case "Summary": return $Systems$View$AWS.summarize({ctor: "_Tuple2",_0: _p84.aws,_1: _p84.machine});
         default: return A2($Debug.log,$Basics.toString(_p86.step),_U.list([A2($Html.div,_U.list([]),_U.list([]))]));}
   });
   var view = F2(function (address,_p87) {
      var _p88 = _p87;
      return A2($Common$Components.panelContents,$Basics.toString(_p88.step),A2($Html.form,_U.list([]),A2(stepView,address,_p88)));
   });
   var Update = function (a) {    return {ctor: "Update",_0: a};};
   var Back = {ctor: "Back"};
   var Next = {ctor: "Next"};
   var Model = F9(function (a,b,c,d,e,f,g,h,i) {    return {step: a,prev: b,next: c,aws: d,machine: e,environment: f,errors: g,volume: h,block: i};});
   var init = function () {
      var steps = _U.list([Instance,Networking,EBS,Store,Summary]);
      return {ctor: "_Tuple2"
             ,_0: A9(Model,
             Zero,
             _U.list([]),
             steps,
             $Systems$Model$AWS.emptyAws,
             $Systems$Model$Common.emptyMachine,
             $Dict.empty,
             $Dict.empty,
             $Systems$Model$AWS.emptyVolume,
             $Systems$Model$AWS.emptyBlock)
             ,_1: $Effects.none};
   }();
   return _elm.Systems.Add.AWS.values = {_op: _op
                                        ,Model: Model
                                        ,init: init
                                        ,Next: Next
                                        ,Back: Back
                                        ,Update: Update
                                        ,SelectInstanceType: SelectInstanceType
                                        ,SelectOS: SelectOS
                                        ,SelectEndpoint: SelectEndpoint
                                        ,SelectZone: SelectZone
                                        ,KeyPairInput: KeyPairInput
                                        ,SecurityGroupsInput: SecurityGroupsInput
                                        ,UserInput: UserInput
                                        ,HostnameInput: HostnameInput
                                        ,DomainInput: DomainInput
                                        ,IPInput: IPInput
                                        ,SelectEBSType: SelectEBSType
                                        ,EBSSizeInput: EBSSizeInput
                                        ,EBSIOPSInput: EBSIOPSInput
                                        ,EBSDeviceInput: EBSDeviceInput
                                        ,VolumeAdd: VolumeAdd
                                        ,VolumeRemove: VolumeRemove
                                        ,EBSOptimized: EBSOptimized
                                        ,EBSClear: EBSClear
                                        ,VPCIdInput: VPCIdInput
                                        ,SubnetIdInput: SubnetIdInput
                                        ,AssignIp: AssignIp
                                        ,InstanceDeviceInput: InstanceDeviceInput
                                        ,InstanceVolumeInput: InstanceVolumeInput
                                        ,BlockAdd: BlockAdd
                                        ,BlockRemove: BlockRemove
                                        ,Zero: Zero
                                        ,Instance: Instance
                                        ,Networking: Networking
                                        ,EBS: EBS
                                        ,Store: Store
                                        ,Summary: Summary
                                        ,setAWS: setAWS
                                        ,setMachine: setMachine
                                        ,setVolume: setVolume
                                        ,setBlock: setBlock
                                        ,validationOf: validationOf
                                        ,extractIp: extractIp
                                        ,stringValidations: stringValidations
                                        ,listValidations: listValidations
                                        ,tupleValidations: tupleValidations
                                        ,validate: validate
                                        ,validateAll: validateAll
                                        ,notAny: notAny
                                        ,ignoreDevices: ignoreDevices
                                        ,update: update
                                        ,hasNext: hasNext
                                        ,hasPrev: hasPrev
                                        ,getOses: getOses
                                        ,instance: instance
                                        ,withErrors: withErrors
                                        ,networking: networking
                                        ,ebsTypes: ebsTypes
                                        ,volumeRow: volumeRow
                                        ,volumes: volumes
                                        ,blockRow: blockRow
                                        ,blocks: blocks
                                        ,ebs: ebs
                                        ,store: store
                                        ,stepView: stepView
                                        ,view: view};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.View = Elm.Systems.View || {};
Elm.Systems.View.GCE = Elm.Systems.View.GCE || {};
Elm.Systems.View.GCE.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.View = _elm.Systems.View || {};
   _elm.Systems.View.GCE = _elm.Systems.View.GCE || {};
   if (_elm.Systems.View.GCE.values) return _elm.Systems.View.GCE.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Common$Components = Elm.Common.Components.make(_elm),
   $Common$Utils = Elm.Common.Utils.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm),
   $Systems$Model$GCE = Elm.Systems.Model.GCE.make(_elm);
   var _op = {};
   var view = F2(function (address,model) {
      return A2($Html.div,_U.list([]),A2($Common$Components.panelContents,"System",A2($Html.div,_U.list([]),_U.list([]))));
   });
   var summaryPanel = function (contents) {
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("panel col-md-4 col-md-offset-1")]),
      _U.list([A2($Html.div,_U.list([$Html$Attributes.$class("panel-body")]),contents)]))]);
   };
   var tablizedRow = F2(function (props,v) {
      return A2($Html.tr,_U.list([]),A2($List.map,function (prop) {    return A2($Html.td,_U.list([]),_U.list([$Html.text(prop(v))]));},props));
   });
   var tablizedSection = F4(function (title,headers,rows,props) {
      return $Basics.not($List.isEmpty(rows)) ? _U.list([$Html.text(title)
                                                        ,A2($Html.table,
                                                        _U.list([$Html$Attributes.$class("table"),$Html$Attributes.id(title)]),
                                                        _U.list([A2($Html.thead,
                                                                _U.list([]),
                                                                _U.list([A2($Html.tr,
                                                                _U.list([]),
                                                                A2($List.map,
                                                                function (k) {
                                                                   return A2($Html.th,_U.list([]),_U.list([$Html.text(k)]));
                                                                },
                                                                headers))]))
                                                                ,A2($Html.tbody,
                                                                _U.list([]),
                                                                A2($List.map,
                                                                function (value) {
                                                                   return A2(tablizedRow,props,value);
                                                                },
                                                                rows))]))]) : _U.list([]);
   });
   var overviewSection = F3(function (title,headers,values) {
      return _U.list([$Html.text(title)
                     ,A2($Html.ul,
                     _U.list([$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "list-style-type",_1: "none"}]))]),
                     A3($List.map2,
                     F2(function (title,value) {
                        return A2($Html.li,_U.list([]),_U.list([$Html.text(A2($Basics._op["++"],title,A2($Basics._op["++"],": ",value)))]));
                     }),
                     headers,
                     values))]);
   });
   var optionalSection = F4(function (title,headers,values,pred) {    return pred ? A3(overviewSection,title,headers,values) : _U.list([]);});
   var summarySections = function (_p0) {
      var _p1 = _p0;
      var _p4 = _p1._1;
      var _p3 = _p1._0;
      return A2($List.filter,
      function (_p2) {
         return $Basics.not($List.isEmpty(_p2));
      },
      _U.list([A3(overviewSection,"Instance",_U.list(["type","os","zone","project id"]),_U.list([_p3.machineType,_p4.os,_p3.zone,_p3.projectId]))
              ,A3(overviewSection,"Security",_U.list(["user","tags"]),_U.list([_p4.user,A2($String.join," ",A2($Maybe.withDefault,_U.list([]),_p3.tags))]))
              ,A3(overviewSection,
              "Networking",
              _U.list(["hostname","domain","ip","static ip"]),
              _U.list([_p4.hostname,_p4.domain,A2($Maybe.withDefault,"",_p4.ip),A2($Maybe.withDefault,"",_p3.staticIp)]))]));
   };
   var summarize = function (model) {
      return _U.list([A2($Html.div,
      _U.list([]),
      _U.list([A2($Html.h4,_U.list([]),_U.list([$Html.text("System overview")]))
              ,A2($Html.div,
              _U.list([$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "line-height",_1: "1.8"},{ctor: "_Tuple2",_0: "list-style-type",_1: "none"}]))]),
              A2($List.map,
              $Bootstrap$Html.row_,
              A2($List.map,$List.concat,A2($Common$Utils.partition,2,A2($List.map,summaryPanel,summarySections(model))))))]))]);
   };
   var NoOp = {ctor: "NoOp"};
   var Model = function (a) {    return {id: a};};
   var init = {ctor: "_Tuple2",_0: Model(0),_1: $Effects.none};
   return _elm.Systems.View.GCE.values = {_op: _op
                                         ,Model: Model
                                         ,init: init
                                         ,NoOp: NoOp
                                         ,overviewSection: overviewSection
                                         ,tablizedRow: tablizedRow
                                         ,tablizedSection: tablizedSection
                                         ,optionalSection: optionalSection
                                         ,summaryPanel: summaryPanel
                                         ,summarySections: summarySections
                                         ,summarize: summarize
                                         ,view: view};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.GCE = Elm.Systems.Add.GCE || {};
Elm.Systems.Add.GCE.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   _elm.Systems.Add.GCE = _elm.Systems.Add.GCE || {};
   if (_elm.Systems.Add.GCE.values) return _elm.Systems.Add.GCE.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$Components = Elm.Common.Components.make(_elm),
   $Common$Utils = Elm.Common.Utils.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Environments$List = Elm.Environments.List.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Systems$Add$Common = Elm.Systems.Add.Common.make(_elm),
   $Systems$Add$Validations = Elm.Systems.Add.Validations.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm),
   $Systems$Model$GCE = Elm.Systems.Model.GCE.make(_elm),
   $Systems$View$GCE = Elm.Systems.View.GCE.make(_elm);
   var _op = {};
   var withErrors = F3(function (errors,key,widget) {
      return A3($Systems$Add$Common.group,key,widget,$Common$Utils.defaultEmpty(A2($Dict.get,key,errors)));
   });
   var getOses = function (model) {
      var hypervisor = A2($Maybe.withDefault,$Environments$List.OSTemplates($Dict.empty),A2($Dict.get,"gce",model.environment));
      var _p0 = hypervisor;
      if (_p0.ctor === "OSTemplates") {
            return _p0._0;
         } else {
            return $Dict.empty;
         }
   };
   var hasPrev = function (model) {    return $Basics.not($List.isEmpty(model.prev));};
   var hasNext = function (model) {    return $Basics.not($List.isEmpty(model.next));};
   var notAny = function (errors) {    return $List.isEmpty(A2($List.filter,function (e) {    return $Basics.not($List.isEmpty(e));},$Dict.values(errors)));};
   var validate = F3(function (step,key,validations) {
      var stepValidations = A2($Maybe.withDefault,$Dict.empty,A2($Dict.get,$Basics.toString(step),validations));
      return A2($Maybe.withDefault,$Basics.identity,A2($Dict.get,key,stepValidations));
   });
   var extractIp = function (_p1) {    var _p2 = _p1;var _p3 = _p2.gce.staticIp;if (_p3.ctor === "Just") {    return _p3._0;} else {    return "";}};
   var validationOf = F4(function (key,validations,value,_p4) {
      var _p5 = _p4;
      var _p7 = _p5;
      var res = A2($List.filter,
      function (error) {
         return !_U.eq(error,$Systems$Add$Validations.None);
      },
      A2($List.map,function (validation) {    return validation(value(_p7));},validations));
      var newErrors = A3($Dict.update,key,function (_p6) {    return $Maybe.Just(res);},_p5.errors);
      return _U.update(_p7,{errors: newErrors});
   });
   var setMachine = F2(function (f,_p8) {    var _p9 = _p8;var newMachine = f(_p9.machine);return _U.update(_p9,{machine: newMachine});});
   var setGCE = F2(function (f,_p10) {    var _p11 = _p10;var newGce = f(_p11.gce);return _U.update(_p11,{gce: newGce});});
   var Summary = {ctor: "Summary"};
   var Networking = {ctor: "Networking"};
   var Instance = {ctor: "Instance"};
   var stringValidations = $Dict.fromList(_U.list([A2($Systems$Add$Validations.vpair,
                                                  Networking,
                                                  _U.list([{ctor: "_Tuple2"
                                                           ,_0: "Hostname"
                                                           ,_1: A3(validationOf,
                                                           "Hostname",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p12) {
                                                              var _p13 = _p12;
                                                              return _p13.machine.hostname;
                                                           })}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "Domain"
                                                           ,_1: A3(validationOf,
                                                           "Domain",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p14) {
                                                              var _p15 = _p14;
                                                              return _p15.machine.domain;
                                                           })}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "IP"
                                                           ,_1: A3(validationOf,"IP",_U.list([$Systems$Add$Validations.validIp]),extractIp)}]))
                                                  ,A2($Systems$Add$Validations.vpair,
                                                  Instance,
                                                  _U.list([{ctor: "_Tuple2"
                                                           ,_0: "User"
                                                           ,_1: A3(validationOf,
                                                           "User",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p16) {
                                                              var _p17 = _p16;
                                                              return _p17.machine.user;
                                                           })}
                                                          ,{ctor: "_Tuple2"
                                                           ,_0: "Project id"
                                                           ,_1: A3(validationOf,
                                                           "Project id",
                                                           _U.list([$Systems$Add$Validations.notEmpty]),
                                                           function (_p18) {
                                                              var _p19 = _p18;
                                                              return _p19.gce.projectId;
                                                           })}]))]));
   var listValidations = $Dict.fromList(_U.list([A2($Systems$Add$Validations.vpair,
   Instance,
   _U.list([{ctor: "_Tuple2"
            ,_0: "Tags"
            ,_1: A3(validationOf,
            "Tags",
            _U.list([$Systems$Add$Validations.hasItems]),
            function (_p20) {
               var _p21 = _p20;
               return $Common$Utils.defaultEmpty(_p21.gce.tags);
            })}]))]));
   var validateAll = F2(function (step,model) {
      var validations = _U.list([listValidations,stringValidations]);
      var stepValues = A2($List.map,function (vs) {    return A2($Maybe.withDefault,$Dict.empty,A2($Dict.get,$Basics.toString(step),vs));},validations);
      return A3($List.foldl,F2(function (v,m) {    return v(m);}),model,$List.concat(A2($List.map,$Dict.values,stepValues)));
   });
   var Zero = {ctor: "Zero"};
   var update = F2(function (action,_p22) {
      var _p23 = _p22;
      var _p32 = _p23.step;
      var _p31 = _p23.prev;
      var _p30 = _p23.next;
      var _p29 = _p23;
      var _p28 = _p23.machine;
      var _p24 = action;
      switch (_p24.ctor)
      {case "Next": var _p25 = A2(validateAll,_p32,_p29);
           var newModel = _p25;
           var errors = _p25.errors;
           var prevSteps = !_U.eq(_p32,Zero) ? A2($List.append,_p31,_U.list([_p32])) : _p31;
           var nextSteps = $Common$Utils.defaultEmpty($List.tail(_p30));
           var nextStep = A2($Maybe.withDefault,Instance,$List.head(_p30));
           return notAny(errors) ? _U.update(newModel,{step: nextStep,next: nextSteps,prev: prevSteps}) : newModel;
         case "Back": var _p26 = A2(validateAll,_p32,_p29);
           var newModel = _p26;
           var errors = _p26.errors;
           var nextSteps = !_U.eq(_p32,Zero) ? A2($List.append,_U.list([_p32]),_p30) : _p30;
           var prevSteps = A2($List.take,$List.length(_p31) - 1,_p31);
           var prevStep = A2($Maybe.withDefault,Zero,$List.head($List.reverse(_p31)));
           return notAny(errors) ? _U.update(_p29,{step: prevStep,next: nextSteps,prev: prevSteps}) : _p29;
         case "Update": var newModel = _U.update(_p29,{environment: _p24._0});
           var _p27 = $List.head($Dict.keys(getOses(newModel)));
           if (_p27.ctor === "Just") {
                 return $String.isEmpty(_p28.os) ? _U.update(newModel,{machine: _U.update(_p28,{os: _p27._0})}) : newModel;
              } else {
                 return newModel;
              }
         case "SelectMachineType": return A2(setGCE,function (gce) {    return _U.update(gce,{machineType: _p24._0});},_p29);
         case "SelectOS": return A2(setMachine,function (machine) {    return _U.update(machine,{os: _p24._0});},_p29);
         case "SelectZone": return A2(setGCE,function (gce) {    return _U.update(gce,{zone: _p24._0});},_p29);
         case "UserInput": return A4(validate,
           _p32,
           "User",
           stringValidations,
           A2(setMachine,function (machine) {    return _U.update(machine,{user: _p24._0});},_p29));
         case "HostnameInput": return A4(validate,
           _p32,
           "Hostname",
           stringValidations,
           A2(setMachine,function (machine) {    return _U.update(machine,{hostname: _p24._0});},_p29));
         case "ProjectIdInput": return A4(validate,
           _p32,
           "Project id",
           stringValidations,
           A2(setGCE,function (gce) {    return _U.update(gce,{projectId: _p24._0});},_p29));
         case "TagsInput": var splited = A2($String.split," ",_p24._0);
           return A4(validate,
           _p32,
           "Tags",
           listValidations,
           A2(setGCE,function (gce) {    return _U.update(gce,{tags: $Maybe.Just(_U.eq(splited,_U.list([""])) ? _U.list([]) : splited)});},_p29));
         case "DomainInput": return A4(validate,
           _p32,
           "Domain",
           stringValidations,
           A2(setMachine,function (machine) {    return _U.update(machine,{domain: _p24._0});},_p29));
         default: return A4(validate,_p32,"IP",stringValidations,A2(setGCE,function (gce) {    return _U.update(gce,{staticIp: $Maybe.Just(_p24._0)});},_p29));}
   });
   var IPInput = function (a) {    return {ctor: "IPInput",_0: a};};
   var DomainInput = function (a) {    return {ctor: "DomainInput",_0: a};};
   var HostnameInput = function (a) {    return {ctor: "HostnameInput",_0: a};};
   var networking = F2(function (address,_p33) {
      var _p34 = _p33;
      var _p35 = _p34.machine;
      var check = withErrors(_p34.errors);
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-horizontal"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Html.legend,_U.list([]),_U.list([$Html.text("DNS")]))
              ,A2(check,"Hostname",A4($Systems$Add$Common.inputText,address,HostnameInput,"",_p35.hostname))
              ,A2(check,"Domain",A4($Systems$Add$Common.inputText,address,DomainInput,"",_p35.domain))
              ,A2(check,"IP",A4($Systems$Add$Common.inputText,address,IPInput,"",A2($Maybe.withDefault,"",_p34.gce.staticIp)))]))]);
   });
   var TagsInput = function (a) {    return {ctor: "TagsInput",_0: a};};
   var ProjectIdInput = function (a) {    return {ctor: "ProjectIdInput",_0: a};};
   var UserInput = function (a) {    return {ctor: "UserInput",_0: a};};
   var SelectZone = function (a) {    return {ctor: "SelectZone",_0: a};};
   var SelectOS = function (a) {    return {ctor: "SelectOS",_0: a};};
   var SelectMachineType = function (a) {    return {ctor: "SelectMachineType",_0: a};};
   var instance = F2(function (address,_p36) {
      var _p37 = _p36;
      var _p39 = _p37;
      var _p38 = _p37.gce;
      var zone = A2($Maybe.withDefault,"",$List.head($Systems$Model$GCE.zones));
      var tags = A2($String.join," ",$Common$Utils.defaultEmpty(_p38.tags));
      var check = withErrors(_p37.errors);
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-horizontal"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Html.legend,_U.list([]),_U.list([$Html.text("Properties")]))
              ,A2($Systems$Add$Common.group$,
              "Machine type",
              A4($Systems$Add$Common.selector,address,SelectMachineType,$Systems$Model$GCE.machineTypes,_p38.machineType))
              ,A2($Systems$Add$Common.group$,"OS",A4($Systems$Add$Common.selector,address,SelectOS,$Dict.keys(getOses(_p39)),_p37.machine.os))
              ,A2($Systems$Add$Common.group$,"Zone",A4($Systems$Add$Common.selector,address,SelectZone,$Systems$Model$GCE.zones,_p38.zone))
              ,A2(check,"Project id",A4($Systems$Add$Common.inputText,address,ProjectIdInput,"",_p38.projectId))
              ,A2($Html.legend,_U.list([]),_U.list([$Html.text("Security")]))
              ,A2(check,"User",A4($Systems$Add$Common.inputText,address,UserInput,"",_p39.machine.user))
              ,A2(check,"Tags",A4($Systems$Add$Common.inputText,address,TagsInput," ",tags))]))]);
   });
   var stepView = F2(function (address,_p40) {
      var _p41 = _p40;
      var _p43 = _p41;
      var _p42 = _p43.step;
      switch (_p42.ctor)
      {case "Instance": return A2(instance,address,_p43);
         case "Networking": return A2(networking,address,_p43);
         case "Summary": return $Systems$View$GCE.summarize({ctor: "_Tuple2",_0: _p41.gce,_1: _p41.machine});
         default: return A2($Debug.log,$Basics.toString(_p43.step),_U.list([A2($Html.div,_U.list([]),_U.list([]))]));}
   });
   var view = F2(function (address,_p44) {
      var _p45 = _p44;
      return A2($Common$Components.panelContents,$Basics.toString(_p45.step),A2($Html.form,_U.list([]),A2(stepView,address,_p45)));
   });
   var Update = function (a) {    return {ctor: "Update",_0: a};};
   var Back = {ctor: "Back"};
   var Next = {ctor: "Next"};
   var Model = F7(function (a,b,c,d,e,f,g) {    return {step: a,prev: b,next: c,gce: d,machine: e,environment: f,errors: g};});
   var init = function () {
      var steps = _U.list([Instance,Networking,Summary]);
      return {ctor: "_Tuple2"
             ,_0: A7(Model,Zero,_U.list([]),steps,$Systems$Model$GCE.emptyGce,$Systems$Model$Common.emptyMachine,$Dict.empty,$Dict.empty)
             ,_1: $Effects.none};
   }();
   return _elm.Systems.Add.GCE.values = {_op: _op
                                        ,Model: Model
                                        ,init: init
                                        ,Next: Next
                                        ,Back: Back
                                        ,Update: Update
                                        ,SelectMachineType: SelectMachineType
                                        ,SelectOS: SelectOS
                                        ,SelectZone: SelectZone
                                        ,UserInput: UserInput
                                        ,ProjectIdInput: ProjectIdInput
                                        ,TagsInput: TagsInput
                                        ,HostnameInput: HostnameInput
                                        ,DomainInput: DomainInput
                                        ,IPInput: IPInput
                                        ,Zero: Zero
                                        ,Instance: Instance
                                        ,Networking: Networking
                                        ,Summary: Summary
                                        ,setGCE: setGCE
                                        ,setMachine: setMachine
                                        ,validationOf: validationOf
                                        ,extractIp: extractIp
                                        ,stringValidations: stringValidations
                                        ,listValidations: listValidations
                                        ,validate: validate
                                        ,validateAll: validateAll
                                        ,notAny: notAny
                                        ,update: update
                                        ,hasNext: hasNext
                                        ,hasPrev: hasPrev
                                        ,getOses: getOses
                                        ,networking: networking
                                        ,instance: instance
                                        ,withErrors: withErrors
                                        ,stepView: stepView
                                        ,view: view};
};
Elm.Users = Elm.Users || {};
Elm.Users.List = Elm.Users.List || {};
Elm.Users.List.make = function (_elm) {
   "use strict";
   _elm.Users = _elm.Users || {};
   _elm.Users.List = _elm.Users.List || {};
   if (_elm.Users.List.values) return _elm.Users.List.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var User = F4(function (a,b,c,d) {    return {username: a,operations: b,roles: c,envs: d};});
   var user = A5($Json$Decode.object4,
   User,
   A2($Json$Decode._op[":="],"username",$Json$Decode.string),
   A2($Json$Decode._op[":="],"operations",$Json$Decode.list($Json$Decode.string)),
   A2($Json$Decode._op[":="],"roles",$Json$Decode.list($Json$Decode.string)),
   A2($Json$Decode._op[":="],"envs",$Json$Decode.list($Json$Decode.string)));
   var usersList = $Json$Decode.list(user);
   var getUsers = function (action) {    return $Effects.task(A2($Task.map,action,$Task.toResult(A2($Http.get,usersList,"/users"))));};
   return _elm.Users.List.values = {_op: _op,User: User,user: user,usersList: usersList,getUsers: getUsers};
};
Elm.Types = Elm.Types || {};
Elm.Types.List = Elm.Types.List || {};
Elm.Types.List.make = function (_elm) {
   "use strict";
   _elm.Types = _elm.Types || {};
   _elm.Types.List = _elm.Types.List || {};
   if (_elm.Types.List.values) return _elm.Types.List.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Pager = Elm.Pager.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Table = Elm.Table.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var setTypes = F2(function (model,types) {
      var typePairs = A2($List.map,function (_p0) {    var _p1 = _p0;return {ctor: "_Tuple2",_0: _p1.type$,_1: _p1};},types);
      var newTable = A2($Table.update,$Table.UpdateRows(typePairs),model.table);
      var total = $List.length(types);
      var newPager = A2($Pager.update,$Pager.UpdateTotal($Basics.toFloat(total)),model.pager);
      return A2($Debug.log,"",{ctor: "_Tuple2",_0: _U.update(model,{types: types,pager: newPager,table: newTable}),_1: $Effects.none});
   });
   var NoOp = {ctor: "NoOp"};
   var update = F2(function (action,model) {
      var _p2 = action;
      if (_p2.ctor === "SetTypes") {
            return A4($Common$Redirect.successHandler,_p2._0,model,setTypes(model),NoOp);
         } else {
            return {ctor: "_Tuple2",_0: model,_1: $Effects.none};
         }
   });
   var SetTypes = function (a) {    return {ctor: "SetTypes",_0: a};};
   var GotoPage = function (a) {    return {ctor: "GotoPage",_0: a};};
   var LoadPage = function (a) {    return {ctor: "LoadPage",_0: a};};
   var view = F2(function (address,_p3) {
      var _p4 = _p3;
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("box box-info")]),
      _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("box-body")]),
      _U.list([$Bootstrap$Html.row_(_U.list([A2($Html.div,
              _U.list([$Html$Attributes.$class("col-md-offset-1 col-md-10")]),
              _U.list([$Bootstrap$Html.panelDefault_(A2($Table.view,A2($Signal.forwardTo,address,LoadPage),_p4.table))]))]))
              ,$Bootstrap$Html.row_(_U.list([A2($Pager.view,A2($Signal.forwardTo,address,GotoPage),_p4.pager)]))]))]))]);
   });
   var typeRow = F2(function (id,_p5) {
      var _p6 = _p5;
      return _U.list([A2($Html.td,_U.list([]),_U.list([$Html.text(_p6.type$)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text("Puppet standalone")]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(A2($Maybe.withDefault,"",_p6.description))]))]);
   });
   var Model = F3(function (a,b,c) {    return {types: a,table: b,pager: c};});
   var Type = F3(function (a,b,c) {    return {type$: a,description: b,puppetStd: c};});
   var PuppetStd = function (a) {    return {module$: a};};
   var Module = F2(function (a,b) {    return {name: a,src: b};});
   var module$ = A3($Json$Decode.object2,Module,A2($Json$Decode._op[":="],"name",$Json$Decode.string),A2($Json$Decode._op[":="],"src",$Json$Decode.string));
   var puppetStd = A2($Json$Decode.object1,PuppetStd,A2($Json$Decode._op[":="],"module",module$));
   var type$ = A4($Json$Decode.object3,
   Type,
   A2($Json$Decode._op[":="],"type",$Json$Decode.string),
   $Json$Decode.maybe(A2($Json$Decode._op[":="],"description",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"puppet-std",$Json$Decode.dict(puppetStd)));
   var typesList = A2($Json$Decode.at,_U.list(["types"]),$Json$Decode.list(type$));
   var getTypes = function (action) {    return $Effects.task(A2($Task.map,action,$Task.toResult(A2($Http.get,typesList,"/types"))));};
   var init = function () {
      var table = A5($Table.init,"typesListing",true,_U.list(["Name","Provisioner","Description"]),typeRow,"Types");
      return {ctor: "_Tuple2",_0: A3(Model,_U.list([]),table,$Pager.init),_1: getTypes(SetTypes)};
   }();
   return _elm.Types.List.values = {_op: _op
                                   ,Module: Module
                                   ,PuppetStd: PuppetStd
                                   ,Type: Type
                                   ,Model: Model
                                   ,typeRow: typeRow
                                   ,init: init
                                   ,LoadPage: LoadPage
                                   ,GotoPage: GotoPage
                                   ,SetTypes: SetTypes
                                   ,NoOp: NoOp
                                   ,setTypes: setTypes
                                   ,update: update
                                   ,view: view
                                   ,module$: module$
                                   ,puppetStd: puppetStd
                                   ,type$: type$
                                   ,typesList: typesList
                                   ,getTypes: getTypes};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.General = Elm.Systems.Add.General || {};
Elm.Systems.Add.General.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   _elm.Systems.Add.General = _elm.Systems.Add.General || {};
   if (_elm.Systems.Add.General.values) return _elm.Systems.Add.General.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$Components = Elm.Common.Components.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Environments$List = Elm.Environments.List.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Http = Elm.Http.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Systems$Add$Common = Elm.Systems.Add.Common.make(_elm),
   $Types$List = Elm.Types.List.make(_elm),
   $Users$List = Elm.Users.List.make(_elm);
   var _op = {};
   var setOwners = F2(function (model,owners) {
      var users = A2($List.map,function (_) {    return _.username;},owners);
      var user = A2($Maybe.withDefault,"",$List.head(users));
      return {ctor: "_Tuple2",_0: _U.update(model,{owners: users,owner: user}),_1: $Effects.none};
   });
   var setTypes = F2(function (model,types) {
      var typesList = A2($List.map,function (_) {    return _.type$;},types);
      var firstType = A2($Maybe.withDefault,"",$List.head(typesList));
      return {ctor: "_Tuple2",_0: _U.update(model,{types: typesList,type$: firstType}),_1: $Effects.none};
   });
   var withoutEffects = function (_p0) {    var _p1 = _p0;return _p1._0;};
   var updateHypervisors = F3(function (model,es,environment) {
      var hypervisors = $Dict.keys(A2($Maybe.withDefault,$Dict.empty,A2($Dict.get,environment,es)));
      var hypervisor = A2($Maybe.withDefault,"",$List.head(hypervisors));
      return _U.update(model,{hypervisors: hypervisors,hypervisor: hypervisor});
   });
   var setEnvironments = F2(function (model,es) {
      var environment = A2($Maybe.withDefault,"",$List.head($Dict.keys(es)));
      var withEnvironment = _U.update(model,{environments: $Dict.keys(es),environment: environment,rawEnvironments: es});
      var updated = A3(updateHypervisors,withEnvironment,es,environment);
      return {ctor: "_Tuple2",_0: updated,_1: $Effects.none};
   });
   var SelectHypervisor = function (a) {    return {ctor: "SelectHypervisor",_0: a};};
   var SelectEnvironment = function (a) {    return {ctor: "SelectEnvironment",_0: a};};
   var SetEnvironments = function (a) {    return {ctor: "SetEnvironments",_0: a};};
   var SelectType = function (a) {    return {ctor: "SelectType",_0: a};};
   var SetTypes = function (a) {    return {ctor: "SetTypes",_0: a};};
   var SelectOwner = function (a) {    return {ctor: "SelectOwner",_0: a};};
   var view = F2(function (address,model) {
      return A2($Common$Components.panelContents,
      "General Information",
      A2($Html.form,
      _U.list([]),
      _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("form-horizontal"),A2($Html$Attributes.attribute,"onkeypress","return event.keyCode != 13;")]),
      _U.list([A2($Systems$Add$Common.group$,"Owner",A4($Systems$Add$Common.selector,address,SelectOwner,model.owners,model.owner))
              ,A2($Systems$Add$Common.group$,"Type",A4($Systems$Add$Common.selector,address,SelectType,model.types,model.type$))
              ,A2($Systems$Add$Common.group$,"Environment",A4($Systems$Add$Common.selector,address,SelectEnvironment,model.environments,model.environment))
              ,A2($Systems$Add$Common.group$,"Hypervisor",A4($Systems$Add$Common.selector,address,SelectHypervisor,model.hypervisors,model.hypervisor))]))])));
   });
   var SetOwners = function (a) {    return {ctor: "SetOwners",_0: a};};
   var NoOp = {ctor: "NoOp"};
   var update = F2(function (action,model) {
      var _p2 = action;
      switch (_p2.ctor)
      {case "SetOwners": return withoutEffects(A4($Common$Redirect.successHandler,_p2._0,model,setOwners(model),NoOp));
         case "SelectOwner": return _U.update(model,{owner: _p2._0});
         case "SetEnvironments": return withoutEffects(A4($Common$Redirect.successHandler,_p2._0,model,setEnvironments(model),NoOp));
         case "SelectEnvironment": var _p3 = _p2._0;
           return A3(updateHypervisors,_U.update(model,{environment: _p3}),model.rawEnvironments,_p3);
         case "SelectHypervisor": return _U.update(model,{hypervisor: _p2._0});
         case "SetTypes": return withoutEffects(A4($Common$Redirect.successHandler,_p2._0,model,setTypes(model),NoOp));
         case "SelectType": return _U.update(model,{type$: _p2._0});
         default: return model;}
   });
   var Model = F9(function (a,b,c,d,e,f,g,h,i) {
      return {owners: a,owner: b,types: c,type$: d,environments: e,environment: f,hypervisors: g,hypervisor: h,rawEnvironments: i};
   });
   var init = function () {
      var loadEffects = _U.list([$Users$List.getUsers(SetOwners),$Types$List.getTypes(SetTypes),$Environments$List.getEnvironments(SetEnvironments)]);
      return {ctor: "_Tuple2",_0: A9(Model,_U.list([]),"",_U.list([]),"",_U.list([]),"",_U.list([]),"",$Dict.empty),_1: $Effects.batch(loadEffects)};
   }();
   return _elm.Systems.Add.General.values = {_op: _op
                                            ,Model: Model
                                            ,NoOp: NoOp
                                            ,SetOwners: SetOwners
                                            ,SelectOwner: SelectOwner
                                            ,SetTypes: SetTypes
                                            ,SelectType: SelectType
                                            ,SetEnvironments: SetEnvironments
                                            ,SelectEnvironment: SelectEnvironment
                                            ,SelectHypervisor: SelectHypervisor
                                            ,init: init
                                            ,updateHypervisors: updateHypervisors
                                            ,setEnvironments: setEnvironments
                                            ,withoutEffects: withoutEffects
                                            ,setTypes: setTypes
                                            ,setOwners: setOwners
                                            ,update: update
                                            ,view: view};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.Errors = Elm.Systems.Add.Errors || {};
Elm.Systems.Add.Errors.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   _elm.Systems.Add.Errors = _elm.Systems.Add.Errors || {};
   if (_elm.Systems.Add.Errors.values) return _elm.Systems.Add.Errors.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$Components = Elm.Common.Components.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var mapValues = F2(function (f,d) {    return $Dict.values(A2($Dict.map,f,d));});
   var nestedSection = F2(function (key,errors) {
      return A2($Html.div,
      _U.list([]),
      _U.list([$Html.text(key)
              ,A2($Html.ul,
              _U.list([]),
              A2(mapValues,
              F2(function (k,v) {    return A2($Html.li,_U.list([]),_U.list([$Html.text(A2($Basics._op["++"],k,A2($Basics._op["++"],": ",v)))]));}),
              errors))]));
   });
   var nestedList = F2(function (prop,nested) {
      return A2($Html.div,_U.list([]),A2($List.map,function (section) {    return A2(nestedSection,prop,section);},nested));
   });
   var deepNestedList = F2(function (prop,nested) {
      return A2($Html.div,
      _U.list([]),
      $List.concat(A2($List.map,
      function (parent) {
         return A2(mapValues,F2(function (key,errors) {    return A2(nestedSection,A2($Basics._op["++"],prop,A2($Basics._op["++"],".",key)),errors);}),parent);
      },
      nested)));
   });
   var toText = F2(function (key,error) {
      var _p0 = error;
      switch (_p0.ctor)
      {case "Nested": return A2(nestedSection,key,_p0._0);
         case "DeepNestedList": return A2($Html.div,
           _U.list([]),
           A2(mapValues,F2(function (prop,nested) {    return A2(deepNestedList,A2($Basics._op["++"],key,A2($Basics._op["++"],".",prop)),nested);}),_p0._0));
         case "NestedList": return A2($Html.div,
           _U.list([]),
           A2(mapValues,F2(function (prop,nested) {    return A2(nestedList,A2($Basics._op["++"],key,A2($Basics._op["++"],".",prop)),nested);}),_p0._0));
         default: return $Html.text(A2($Basics._op["++"],key,A2($Basics._op["++"],": ",_p0._0)));}
   });
   var view = F2(function (address,_p1) {
      var _p2 = _p1;
      return A2($Common$Components.panelContents,
      "Errors",
      A2($Html.div,
      _U.list([]),
      _U.list([A2($Html.h4,_U.list([]),_U.list([$Html.text("The following errors found (please move back and fix them):")]))
              ,A2($Html.ul,
              _U.list([$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "list-style-type",_1: "none"}]))]),
              $Dict.values(A2($Dict.map,F2(function (k,v) {    return A2($Html.li,_U.list([]),_U.list([A2(toText,k,v)]));}),_p2.errors.keyValues)))])));
   });
   var NoOp = {ctor: "NoOp"};
   var Model = function (a) {    return {errors: a};};
   var init = {ctor: "_Tuple2",_0: Model(A2($Common$Redirect.Errors,"",$Dict.empty)),_1: $Effects.none};
   return _elm.Systems.Add.Errors.values = {_op: _op
                                           ,Model: Model
                                           ,init: init
                                           ,NoOp: NoOp
                                           ,mapValues: mapValues
                                           ,nestedSection: nestedSection
                                           ,deepNestedList: deepNestedList
                                           ,nestedList: nestedList
                                           ,toText: toText
                                           ,view: view};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.Encoders = Elm.Systems.Add.Encoders || {};
Elm.Systems.Add.Encoders.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   _elm.Systems.Add.Encoders = _elm.Systems.Add.Encoders || {};
   if (_elm.Systems.Add.Encoders.values) return _elm.Systems.Add.Encoders.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$Utils = Elm.Common.Utils.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Json$Encode = Elm.Json.Encode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Systems$Add$AWS = Elm.Systems.Add.AWS.make(_elm),
   $Systems$Add$GCE = Elm.Systems.Add.GCE.make(_elm),
   $Systems$Model$AWS = Elm.Systems.Model.AWS.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm);
   var _op = {};
   var machineEncoder = function (machine) {
      return $Json$Encode.object(_U.list([{ctor: "_Tuple2",_0: "domain",_1: $Json$Encode.string(machine.domain)}
                                         ,{ctor: "_Tuple2",_0: "hostname",_1: $Json$Encode.string(machine.hostname)}
                                         ,{ctor: "_Tuple2",_0: "os",_1: $Json$Encode.string(machine.os)}
                                         ,{ctor: "_Tuple2",_0: "user",_1: $Json$Encode.string(machine.user)}]));
   };
   var gceEncoder = function (_p0) {
      var _p1 = _p0;
      var _p2 = _p1.gce;
      return $Json$Encode.object(_U.list([{ctor: "_Tuple2",_0: "machine-type",_1: $Json$Encode.string(_p2.machineType)}
                                         ,{ctor: "_Tuple2",_0: "zone",_1: $Json$Encode.string(_p2.zone)}
                                         ,{ctor: "_Tuple2"
                                          ,_0: "tags"
                                          ,_1: $Json$Encode.list(A2($List.map,$Json$Encode.string,$Common$Utils.defaultEmpty(_p2.tags)))}
                                         ,{ctor: "_Tuple2",_0: "project-id",_1: $Json$Encode.string(_p2.projectId)}]));
   };
   var vpcEncoder = function (_p3) {
      var _p4 = _p3;
      var _p5 = _p4;
      return $String.isEmpty(_p4.vpcId) ? $Json$Encode.$null : $Json$Encode.object(_U.list([{ctor: "_Tuple2"
                                                                                            ,_0: "subnet-id"
                                                                                            ,_1: $Json$Encode.string(_p5.subnetId)}
                                                                                           ,{ctor: "_Tuple2",_0: "vpc-id",_1: $Json$Encode.string(_p5.vpcId)}
                                                                                           ,{ctor: "_Tuple2"
                                                                                            ,_0: "assign-public"
                                                                                            ,_1: $Json$Encode.bool(_p5.assignPublic)}]));
   };
   var blockEncoder = function (block) {
      return $Json$Encode.object(_U.list([{ctor: "_Tuple2",_0: "volume",_1: $Json$Encode.string(block.volume)}
                                         ,{ctor: "_Tuple2",_0: "device",_1: $Json$Encode.string(block.device)}]));
   };
   var volumeEncoder = function (volume) {
      return $Json$Encode.object(_U.list([{ctor: "_Tuple2"
                                          ,_0: "volume-type"
                                          ,_1: $Json$Encode.string(A2($Maybe.withDefault,"",A2($Dict.get,volume.type$,$Systems$Add$AWS.ebsTypes)))}
                                         ,{ctor: "_Tuple2",_0: "size",_1: $Json$Encode.$int(volume.size)}
                                         ,{ctor: "_Tuple2",_0: "iops",_1: $Json$Encode.$int(A2($Maybe.withDefault,0,volume.iops))}
                                         ,{ctor: "_Tuple2",_0: "device",_1: $Json$Encode.string(volume.device)}
                                         ,{ctor: "_Tuple2",_0: "clear",_1: $Json$Encode.bool(volume.clear)}]));
   };
   var awsEncoder = function (_p6) {
      var _p7 = _p6;
      var _p8 = _p7.aws;
      return $Json$Encode.object(_U.list([{ctor: "_Tuple2",_0: "key-name",_1: $Json$Encode.string(_p8.keyName)}
                                         ,{ctor: "_Tuple2",_0: "endpoint",_1: $Json$Encode.string(_p8.endpoint)}
                                         ,{ctor: "_Tuple2",_0: "instance-type",_1: $Json$Encode.string(_p8.instanceType)}
                                         ,{ctor: "_Tuple2",_0: "ebs-optimized",_1: $Json$Encode.bool(A2($Maybe.withDefault,false,_p8.ebsOptimized))}
                                         ,{ctor: "_Tuple2",_0: "availability-zone",_1: $Json$Encode.string(A2($Maybe.withDefault,"",_p8.availabilityZone))}
                                         ,{ctor: "_Tuple2"
                                          ,_0: "security-groups"
                                          ,_1: $Json$Encode.list(A2($List.map,$Json$Encode.string,$Common$Utils.defaultEmpty(_p8.securityGroups)))}
                                         ,{ctor: "_Tuple2",_0: "vpc",_1: vpcEncoder(A2($Maybe.withDefault,$Systems$Model$AWS.emptyVpc,_p8.vpc))}
                                         ,{ctor: "_Tuple2"
                                          ,_0: "block-devices"
                                          ,_1: $Json$Encode.list(A2($List.map,blockEncoder,$Common$Utils.defaultEmpty(_p8.blockDevices)))}
                                         ,{ctor: "_Tuple2"
                                          ,_0: "volumes"
                                          ,_1: $Json$Encode.list(A2($List.map,volumeEncoder,$Common$Utils.defaultEmpty(_p8.volumes)))}]));
   };
   return _elm.Systems.Add.Encoders.values = {_op: _op
                                             ,volumeEncoder: volumeEncoder
                                             ,blockEncoder: blockEncoder
                                             ,vpcEncoder: vpcEncoder
                                             ,awsEncoder: awsEncoder
                                             ,gceEncoder: gceEncoder
                                             ,machineEncoder: machineEncoder};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Launch = Elm.Systems.Launch || {};
Elm.Systems.Launch.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Launch = _elm.Systems.Launch || {};
   if (_elm.Systems.Launch.values) return _elm.Systems.Launch.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm),
   $Table = Elm.Table.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var JobResponse = F3(function (a,b,c) {    return {message: a,id: b,job: c};});
   var jobResponse = A4($Json$Decode.object3,
   JobResponse,
   A2($Json$Decode._op[":="],"message",$Json$Decode.string),
   A2($Json$Decode._op[":="],"id",$Json$Decode.string),
   A2($Json$Decode._op[":="],"job",$Json$Decode.string));
   var runJob = F3(function (id,job,action) {
      return $Effects.task(A2($Task.map,
      action,
      $Task.toResult(A3($Http.post,jobResponse,A2($Basics._op["++"],"/jobs/",A2($Basics._op["++"],job,A2($Basics._op["++"],"/",id))),$Http.empty))));
   });
   var systemRow = F2(function (id,_p0) {
      var _p1 = _p0;
      return _U.list([A2($Html.td,_U.list([]),_U.list([$Html.text(id)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(function (_) {    return _.hostname;}(_p1.machine))]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p1.type$)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p1.env)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p1.owner)]))]);
   });
   var Cancel = {ctor: "Cancel"};
   var NoOp = {ctor: "NoOp"};
   var Run = function (a) {    return {ctor: "Run",_0: a};};
   var JobLaunched = function (a) {    return {ctor: "JobLaunched",_0: a};};
   var update = F2(function (action,model) {
      var _p2 = action;
      switch (_p2.ctor)
      {case "JobLaunched": return A4($Common$Redirect.successHandler,
           _p2._0,
           model,
           function (res) {
              return {ctor: "_Tuple2",_0: model,_1: $Effects.none};
           },
           NoOp);
         case "SetupJob": return {ctor: "_Tuple2",_0: _U.update(model,{job: _p2._0}),_1: $Effects.none};
         case "LoadPage": var newTable = A2($Table.update,_p2._0,model.table);
           return {ctor: "_Tuple2",_0: _U.update(model,{table: newTable}),_1: $Effects.none};
         case "Run": var runAll = $Effects.batch(A2($List.map,
           function (id) {
              return A3(runJob,id,_p2._0,JobLaunched);
           },
           A2($List.map,function (_p3) {    var _p4 = _p3;return _p4._0;},model.table.rows)));
           return {ctor: "_Tuple2",_0: model,_1: runAll};
         case "Cancel": return {ctor: "_Tuple2",_0: model,_1: $Effects.none};
         default: return {ctor: "_Tuple2",_0: model,_1: $Effects.none};}
   });
   var LoadPage = function (a) {    return {ctor: "LoadPage",_0: a};};
   var view = F2(function (address,model) {
      return _U.list([$Bootstrap$Html.row_(_U.list([A2($Html.div,
                     _U.list([$Html$Attributes.$class("col-md-offset-1 col-md-10")]),
                     _U.list([A2($Html.div,
                     _U.list([$Html$Attributes.$class("panel panel-default")]),
                     _U.list([A2($Html.div,
                     _U.list([$Html$Attributes.$class("panel-body")]),
                     _U.list([A2($Html.span,
                     _U.list([]),
                     _U.list([$Html.text("A ")
                             ,A2($Html.strong,_U.list([]),_U.list([$Html.text(model.job)]))
                             ,$Html.text(" operation ")
                             ,$Html.text("will be performed on the following systems:")]))]))]))]))]))
                     ,$Bootstrap$Html.row_(_U.list([A2($Html.div,
                     _U.list([$Html$Attributes.$class("col-md-offset-1 col-md-10")]),
                     _U.list([$Bootstrap$Html.panelDefault_(A2($Table.view,A2($Signal.forwardTo,address,LoadPage),model.table))]))]))
                     ,$Bootstrap$Html.row_(_U.list([A2($Html.div,
                     _U.list([$Html$Attributes.$class("btn-group col-md-offset-5 col-md-10")]),
                     _U.list([A2($Html.button,
                             _U.list([$Html$Attributes.$class("btn btn-danger btn-sm col-md-1 col-md-offset-1"),A2($Html$Events.onClick,address,Cancel)]),
                             _U.list([$Html.text("Cancel")]))
                             ,A2($Html.button,
                             _U.list([$Html$Attributes.$class("btn btn-primary btn-sm col-md-1"),A2($Html$Events.onClick,address,Run(model.job))]),
                             _U.list([$Html.text("Ok")]))]))]))]);
   });
   var SetupJob = function (a) {    return {ctor: "SetupJob",_0: a};};
   var Model = F2(function (a,b) {    return {job: a,table: b};});
   var init = function () {
      var table = A5($Table.init,"launchListing",false,_U.list(["#","Hostname","Type","Env","Owner"]),systemRow,"Systems");
      return {ctor: "_Tuple2",_0: A2(Model,"",table),_1: $Effects.none};
   }();
   return _elm.Systems.Launch.values = {_op: _op
                                       ,Model: Model
                                       ,SetupJob: SetupJob
                                       ,LoadPage: LoadPage
                                       ,JobLaunched: JobLaunched
                                       ,Run: Run
                                       ,NoOp: NoOp
                                       ,Cancel: Cancel
                                       ,systemRow: systemRow
                                       ,init: init
                                       ,update: update
                                       ,view: view
                                       ,JobResponse: JobResponse
                                       ,jobResponse: jobResponse
                                       ,runJob: runJob};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.Add = Elm.Systems.Add || {};
Elm.Systems.Add.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.Add = _elm.Systems.Add || {};
   if (_elm.Systems.Add.values) return _elm.Systems.Add.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Dict = Elm.Dict.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $Json$Encode = Elm.Json.Encode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Systems$Add$AWS = Elm.Systems.Add.AWS.make(_elm),
   $Systems$Add$Encoders = Elm.Systems.Add.Encoders.make(_elm),
   $Systems$Add$Errors = Elm.Systems.Add.Errors.make(_elm),
   $Systems$Add$GCE = Elm.Systems.Add.GCE.make(_elm),
   $Systems$Add$General = Elm.Systems.Add.General.make(_elm),
   $Systems$Launch = Elm.Systems.Launch.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var postJson = F3(function (decoder,url,body) {
      var request = {verb: "POST"
                    ,headers: _U.list([{ctor: "_Tuple2",_0: "Content-Type",_1: "application/json;charset=UTF-8"}
                                      ,{ctor: "_Tuple2",_0: "Accept",_1: "application/json, text/plain, */*"}])
                    ,url: url
                    ,body: body};
      return A2($Http.fromJson,decoder,A2($Http.send,$Http.defaultSettings,request));
   });
   var SaveResponse = F2(function (a,b) {    return {message: a,id: b};});
   var saveResponse = A3($Json$Decode.object2,
   SaveResponse,
   A2($Json$Decode._op[":="],"message",$Json$Decode.string),
   A2($Json$Decode._op[":="],"id",$Json$Decode.$int));
   var encodeGceModel = function (_p0) {
      var _p1 = _p0;
      var _p3 = _p1.general;
      var _p2 = _p1.gce;
      return $Json$Encode.object(_U.list([{ctor: "_Tuple2",_0: "type",_1: $Json$Encode.string(_p3.type$)}
                                         ,{ctor: "_Tuple2",_0: "owner",_1: $Json$Encode.string(_p3.owner)}
                                         ,{ctor: "_Tuple2",_0: "env",_1: $Json$Encode.string(_p3.environment)}
                                         ,{ctor: "_Tuple2",_0: "gce",_1: $Systems$Add$Encoders.gceEncoder(_p2)}
                                         ,{ctor: "_Tuple2",_0: "machine",_1: $Systems$Add$Encoders.machineEncoder(_p2.machine)}]));
   };
   var encodeAwsModel = function (_p4) {
      var _p5 = _p4;
      var _p7 = _p5.general;
      var _p6 = _p5.aws;
      return $Json$Encode.object(_U.list([{ctor: "_Tuple2",_0: "type",_1: $Json$Encode.string(_p7.type$)}
                                         ,{ctor: "_Tuple2",_0: "owner",_1: $Json$Encode.string(_p7.owner)}
                                         ,{ctor: "_Tuple2",_0: "env",_1: $Json$Encode.string(_p7.environment)}
                                         ,{ctor: "_Tuple2",_0: "aws",_1: $Systems$Add$Encoders.awsEncoder(_p6)}
                                         ,{ctor: "_Tuple2",_0: "machine",_1: $Systems$Add$Encoders.machineEncoder(_p6.machine)}]));
   };
   var setErrors = F2(function (_p8,es) {
      var _p9 = _p8;
      var newErrors = _U.update(_p9.saveErrors,{errors: es});
      return {ctor: "_Tuple2",_0: _U.update(_p9,{saveErrors: newErrors}),_1: $Effects.none};
   });
   var JobLaunched = function (a) {    return {ctor: "JobLaunched",_0: a};};
   var setSaved = F3(function (next,model,_p10) {
      var _p11 = _p10;
      return {ctor: "_Tuple2",_0: model,_1: A3($Systems$Launch.runJob,$Basics.toString(_p11.id),$String.toLower($Basics.toString(next)),JobLaunched)};
   });
   var SystemSaved = F2(function (a,b) {    return {ctor: "SystemSaved",_0: a,_1: b};});
   var saveSystem = F2(function (model,next) {
      return $Effects.task(A2($Task.map,SystemSaved(next),$Task.toResult(A3(postJson,saveResponse,"/systems",$Http.string(model)))));
   });
   var encodeModel = F2(function (_p12,action) {
      var _p13 = _p12;
      var _p15 = _p13;
      var _p14 = _p13.stage;
      switch (_p14.ctor)
      {case "AWS": return {ctor: "_Tuple2",_0: _p15,_1: A2(saveSystem,A2($Json$Encode.encode,0,encodeAwsModel(_p15)),action)};
         case "GCE": return {ctor: "_Tuple2",_0: _p15,_1: A2(saveSystem,A2($Json$Encode.encode,0,encodeGceModel(_p15)),action)};
         default: return {ctor: "_Tuple2",_0: _p15,_1: $Effects.none};}
   });
   var ErrorsView = function (a) {    return {ctor: "ErrorsView",_0: a};};
   var GeneralView = function (a) {    return {ctor: "GeneralView",_0: a};};
   var GCEView = function (a) {    return {ctor: "GCEView",_0: a};};
   var AWSView = function (a) {    return {ctor: "AWSView",_0: a};};
   var currentView = F2(function (address,model) {
      var _p16 = model.stage;
      switch (_p16.ctor)
      {case "General": return A2($Systems$Add$General.view,A2($Signal.forwardTo,address,GeneralView),model.general);
         case "AWS": return A2($Systems$Add$AWS.view,A2($Signal.forwardTo,address,AWSView),model.aws);
         case "GCE": return A2($Systems$Add$GCE.view,A2($Signal.forwardTo,address,GCEView),model.gce);
         case "Error": return A2($Systems$Add$Errors.view,A2($Signal.forwardTo,address,ErrorsView),model.saveErrors);
         default: return _U.list([A2($Html.div,_U.list([]),_U.list([]))]);}
   });
   var NoOp = {ctor: "NoOp"};
   var Back = {ctor: "Back"};
   var Stage = {ctor: "Stage"};
   var Templatize = {ctor: "Templatize"};
   var Create = {ctor: "Create"};
   var Save = {ctor: "Save"};
   var saveDropdown = function (address) {
      return A2($Html.ul,
      _U.list([$Html$Attributes.$class("dropdown-menu")]),
      _U.list([A2($Html.li,
              _U.list([]),
              _U.list([A2($Html.a,_U.list([$Html$Attributes.href("#"),A2($Html$Events.onClick,address,Save)]),_U.list([$Html.text("Save only")]))]))
              ,A2($Html.li,
              _U.list([]),
              _U.list([A2($Html.a,_U.list([$Html$Attributes.href("#"),A2($Html$Events.onClick,address,Create)]),_U.list([$Html.text("Create System")]))]))]));
   };
   var Next = {ctor: "Next"};
   var buttons = F2(function (address,_p17) {
      var _p18 = _p17;
      var click = $Html$Events.onClick(address);
      var margin = $Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "margin-left",_1: "30%"}]));
      return _U.list([A2($Html.button,_U.list([$Html$Attributes.$class("btn btn-primary"),margin,click(Back)]),_U.list([$Html.text("<< Back")]))
                     ,_p18.hasNext ? A2($Html.div,
                     _U.list([$Html$Attributes.$class("btn-group"),margin]),
                     _U.list([A2($Html.button,
                     _U.list([$Html$Attributes.$class("btn btn-primary"),click(Next)]),
                     _U.list([$Html.text("Next >>")]))])) : A2($Html.div,
                     _U.list([$Html$Attributes.$class("btn-group"),margin]),
                     _U.list([A2($Html.button,
                             _U.list([$Html$Attributes.type$("button"),$Html$Attributes.$class("btn btn-primary"),click(Stage)]),
                             _U.list([$Html.text("Stage")]))
                             ,A2($Html.button,
                             _U.list([$Html$Attributes.$class("btn btn-primary dropdown-toggle")
                                     ,A2($Html$Attributes.attribute,"data-toggle","dropdown")
                                     ,A2($Html$Attributes.attribute,"aria-haspopup","true")
                                     ,A2($Html$Attributes.attribute,"aria-expanded","false")]),
                             _U.list([A2($Html.span,_U.list([$Html$Attributes.$class("caret")]),_U.list([]))
                                     ,A2($Html.span,_U.list([$Html$Attributes.$class("sr-only")]),_U.list([]))]))
                             ,saveDropdown(address)]))]);
   });
   var view = F2(function (address,model) {
      return _U.list([$Bootstrap$Html.row_(_U.list([A2($Html.div,
                     _U.list([$Html$Attributes.$class("col-md-offset-2 col-md-8")]),
                     _U.list([A2($Html.div,_U.list([$Html$Attributes.$class("panel panel-default")]),A2(currentView,address,model))]))]))
                     ,$Bootstrap$Html.row_(A2(buttons,address,model))]);
   });
   var Model = F6(function (a,b,c,d,e,f) {    return {stage: a,aws: b,gce: c,general: d,hasNext: e,saveErrors: f};});
   var GCE = {ctor: "GCE"};
   var Openstack = {ctor: "Openstack"};
   var AWS = {ctor: "AWS"};
   var Proxmox = {ctor: "Proxmox"};
   var Error = {ctor: "Error"};
   var General = {ctor: "General"};
   var init = function () {
      var _p19 = $Systems$Add$General.init;
      var general = _p19._0;
      var effects = _p19._1;
      var _p20 = $Systems$Add$Errors.init;
      var errors = _p20._0;
      var _p21 = $Systems$Add$GCE.init;
      var gce = _p21._0;
      var _p22 = $Systems$Add$AWS.init;
      var aws = _p22._0;
      return {ctor: "_Tuple2",_0: A6(Model,General,aws,gce,general,true,errors),_1: A2($Effects.map,GeneralView,effects)};
   }();
   var update = F2(function (action,_p23) {
      var _p24 = _p23;
      var _p32 = _p24;
      var _p31 = _p24.general;
      var _p30 = _p24.gce;
      var _p29 = _p24.aws;
      var _p25 = action;
      switch (_p25.ctor)
      {case "Next": var _p26 = _p31.hypervisor;
           switch (_p26)
           {case "aws": var current = A2($Maybe.withDefault,$Dict.empty,A2($Dict.get,_p31.environment,_p31.rawEnvironments));
                var newAws = A2($Systems$Add$AWS.update,$Systems$Add$AWS.Next,A2($Systems$Add$AWS.update,$Systems$Add$AWS.Update(current),_p29));
                return {ctor: "_Tuple2",_0: _U.update(_p32,{stage: AWS,aws: newAws,hasNext: $Systems$Add$AWS.hasNext(newAws)}),_1: $Effects.none};
              case "gce": var current = A2($Maybe.withDefault,$Dict.empty,A2($Dict.get,_p31.environment,_p31.rawEnvironments));
                var newGce = A2($Systems$Add$GCE.update,$Systems$Add$GCE.Next,A2($Systems$Add$GCE.update,$Systems$Add$GCE.Update(current),_p30));
                return {ctor: "_Tuple2",_0: _U.update(_p32,{stage: GCE,gce: newGce,hasNext: $Systems$Add$GCE.hasNext(newGce)}),_1: $Effects.none};
              default: return {ctor: "_Tuple2",_0: _p32,_1: $Effects.none};}
         case "Back": var _p27 = _p31.hypervisor;
           switch (_p27)
           {case "aws": var newAws = A2($Systems$Add$AWS.update,$Systems$Add$AWS.Back,_p29);
                return $Systems$Add$AWS.hasPrev(_p29) ? {ctor: "_Tuple2"
                                                        ,_0: _U.update(_p32,{stage: AWS,aws: newAws,hasNext: true})
                                                        ,_1: $Effects.none} : {ctor: "_Tuple2"
                                                                              ,_0: _U.update(_p32,{stage: General,aws: newAws,hasNext: true})
                                                                              ,_1: $Effects.none};
              case "gce": var newGCE = A2($Systems$Add$GCE.update,$Systems$Add$GCE.Back,_p30);
                return $Systems$Add$GCE.hasPrev(_p30) ? {ctor: "_Tuple2"
                                                        ,_0: _U.update(_p32,{stage: GCE,gce: newGCE,hasNext: true})
                                                        ,_1: $Effects.none} : {ctor: "_Tuple2"
                                                                              ,_0: _U.update(_p32,{stage: General,gce: newGCE,hasNext: true})
                                                                              ,_1: $Effects.none};
              default: return {ctor: "_Tuple2",_0: _p32,_1: $Effects.none};}
         case "AWSView": var newAws = A2($Systems$Add$AWS.update,_p25._0,_p29);
           return {ctor: "_Tuple2",_0: _U.update(_p32,{aws: newAws}),_1: $Effects.none};
         case "GCEView": var newGce = A2($Systems$Add$GCE.update,_p25._0,_p30);
           return {ctor: "_Tuple2",_0: _U.update(_p32,{gce: newGce}),_1: $Effects.none};
         case "GeneralView": var newGeneral = A2($Systems$Add$General.update,_p25._0,_p31);
           return {ctor: "_Tuple2",_0: _U.update(_p32,{general: newGeneral}),_1: $Effects.none};
         case "Stage": return A2(encodeModel,_p32,Stage);
         case "Save": return A2(encodeModel,_p32,NoOp);
         case "Create": return A2(encodeModel,_p32,Create);
         case "SystemSaved": var success = A2(setSaved,_p25._0,_p32);
           var _p28 = A5($Common$Redirect.resultHandler,_p25._1,_p32,success,setErrors(_p32),NoOp);
           var newModel = _p28._0;
           var saveErrors = _p28._0.saveErrors;
           var effects = _p28._1;
           return $Basics.not($Dict.isEmpty(saveErrors.errors.keyValues)) ? {ctor: "_Tuple2"
                                                                            ,_0: _U.update(newModel,{stage: Error})
                                                                            ,_1: $Effects.none} : {ctor: "_Tuple2",_0: _p32,_1: effects};
         default: return {ctor: "_Tuple2",_0: _p32,_1: $Effects.none};}
   });
   return _elm.Systems.Add.values = {_op: _op
                                    ,General: General
                                    ,Error: Error
                                    ,Proxmox: Proxmox
                                    ,AWS: AWS
                                    ,Openstack: Openstack
                                    ,GCE: GCE
                                    ,Model: Model
                                    ,Next: Next
                                    ,Save: Save
                                    ,Create: Create
                                    ,Templatize: Templatize
                                    ,Stage: Stage
                                    ,Back: Back
                                    ,NoOp: NoOp
                                    ,AWSView: AWSView
                                    ,GCEView: GCEView
                                    ,GeneralView: GeneralView
                                    ,ErrorsView: ErrorsView
                                    ,SystemSaved: SystemSaved
                                    ,JobLaunched: JobLaunched
                                    ,init: init
                                    ,setErrors: setErrors
                                    ,setSaved: setSaved
                                    ,encodeAwsModel: encodeAwsModel
                                    ,encodeGceModel: encodeGceModel
                                    ,encodeModel: encodeModel
                                    ,update: update
                                    ,currentView: currentView
                                    ,saveDropdown: saveDropdown
                                    ,buttons: buttons
                                    ,view: view
                                    ,SaveResponse: SaveResponse
                                    ,saveResponse: saveResponse
                                    ,saveSystem: saveSystem
                                    ,postJson: postJson};
};
Elm.Systems = Elm.Systems || {};
Elm.Systems.View = Elm.Systems.View || {};
Elm.Systems.View.make = function (_elm) {
   "use strict";
   _elm.Systems = _elm.Systems || {};
   _elm.Systems.View = _elm.Systems.View || {};
   if (_elm.Systems.View.values) return _elm.Systems.View.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$Components = Elm.Common.Components.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Http = Elm.Http.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Systems$Decoders = Elm.Systems.Decoders.make(_elm),
   $Systems$Model$Common = Elm.Systems.Model.Common.make(_elm),
   $Systems$View$AWS = Elm.Systems.View.AWS.make(_elm),
   $Systems$View$GCE = Elm.Systems.View.GCE.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var view = F2(function (address,_p0) {
      var _p1 = _p0;
      var _p4 = _p1.system;
      var _p2 = _p4.aws;
      if (_p2.ctor === "Just") {
            return A2($Common$Components.panelContents,
            "AWS system",
            A2($Html.div,_U.list([]),$Systems$View$AWS.summarize({ctor: "_Tuple2",_0: _p2._0,_1: _p4.machine})));
         } else {
            var _p3 = _p4.gce;
            if (_p3.ctor === "Just") {
                  return A2($Common$Components.panelContents,
                  "GCE system",
                  A2($Html.div,_U.list([]),$Systems$View$GCE.summarize({ctor: "_Tuple2",_0: _p3._0,_1: _p4.machine})));
               } else {
                  return _U.list([A2($Html.div,_U.list([]),_U.list([$Html.text("not implemented")]))]);
               }
         }
   });
   var setSystem = F2(function (model,system) {    return {ctor: "_Tuple2",_0: _U.update(model,{system: system}),_1: $Effects.none};});
   var NoOp = {ctor: "NoOp"};
   var SetSystem = function (a) {    return {ctor: "SetSystem",_0: a};};
   var getSystem = function (id) {
      return $Effects.task(A2($Task.map,SetSystem,$Task.toResult(A2($Http.get,$Systems$Decoders.systemDecoder,A2($Basics._op["++"],"/systems/",id)))));
   };
   var update = F2(function (action,model) {
      var _p5 = action;
      switch (_p5.ctor)
      {case "ViewSystem": return {ctor: "_Tuple2",_0: model,_1: getSystem(_p5._0)};
         case "SetSystem": return A4($Common$Redirect.successHandler,_p5._0,model,setSystem(model),NoOp);
         default: return {ctor: "_Tuple2",_0: model,_1: $Effects.none};}
   });
   var ViewSystem = function (a) {    return {ctor: "ViewSystem",_0: a};};
   var Model = function (a) {    return {system: a};};
   var init = function () {
      var emptySystem = A6($Systems$Model$Common.System,"","","",A5($Systems$Model$Common.Machine,"","","",$Maybe.Just(""),""),$Maybe.Nothing,$Maybe.Nothing);
      return {ctor: "_Tuple2",_0: Model(emptySystem),_1: $Effects.none};
   }();
   return _elm.Systems.View.values = {_op: _op
                                     ,Model: Model
                                     ,init: init
                                     ,ViewSystem: ViewSystem
                                     ,SetSystem: SetSystem
                                     ,NoOp: NoOp
                                     ,setSystem: setSystem
                                     ,update: update
                                     ,view: view
                                     ,getSystem: getSystem};
};
Elm.Common = Elm.Common || {};
Elm.Common.NewTab = Elm.Common.NewTab || {};
Elm.Common.NewTab.make = function (_elm) {
   "use strict";
   _elm.Common = _elm.Common || {};
   _elm.Common.NewTab = _elm.Common.NewTab || {};
   if (_elm.Common.NewTab.values) return _elm.Common.NewTab.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var Open = function (a) {    return {ctor: "Open",_0: a};};
   var NoOp = {ctor: "NoOp"};
   var newtabActions = $Signal.mailbox(NoOp);
   var newtab = F2(function (noop,url) {    return $Effects.task(A2($Task.map,$Basics.always(noop),A2($Signal.send,newtabActions.address,Open(url))));});
   return _elm.Common.NewTab.values = {_op: _op,NoOp: NoOp,Open: Open,newtabActions: newtabActions,newtab: newtab};
};
Elm.Jobs = Elm.Jobs || {};
Elm.Jobs.List = Elm.Jobs.List || {};
Elm.Jobs.List.make = function (_elm) {
   "use strict";
   _elm.Jobs = _elm.Jobs || {};
   _elm.Jobs.List = _elm.Jobs.List || {};
   if (_elm.Jobs.List.values) return _elm.Jobs.List.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Common$NewTab = Elm.Common.NewTab.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Date = Elm.Date.make(_elm),
   $Date$Format = Elm.Date.Format.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Pager = Elm.Pager.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Table = Elm.Table.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var apply = F2(function (func,value) {    return A3($Json$Decode.object2,F2(function (x,y) {    return x(y);}),func,value);});
   var accordionPanel = F3(function (active,ident,body) {
      var enabled = active ? " in" : "";
      return A2($Html.div,
      _U.list([$Html$Attributes.$class("panel panel-default")]),
      _U.list([A2($Html.div,
              _U.list([$Html$Attributes.$class("panel panel-heading")
                      ,$Html$Attributes.id(A2($Basics._op["++"],"heading",ident))
                      ,A2($Html$Attributes.attribute,"role","tab")]),
              _U.list([A2($Html.h4,
              _U.list([$Html$Attributes.$class("panel-title")]),
              _U.list([A2($Html.a,
              _U.list([A2($Html$Attributes.attribute,"role","button")
                      ,A2($Html$Attributes.attribute,"data-toggle","collapse")
                      ,A2($Html$Attributes.attribute,"data-parent","#accordion")
                      ,$Html$Attributes.href(A2($Basics._op["++"],"#collapse",ident))
                      ,A2($Html$Attributes.attribute,"aria-expanded",$Basics.toString(active))
                      ,A2($Html$Attributes.attribute,"aria-controls",A2($Basics._op["++"],"collapse",ident))]),
              _U.list([$Html.text(ident)]))]))]))
              ,A2($Html.div,
              _U.list([$Html$Attributes.id(A2($Basics._op["++"],"collapse",ident))
                      ,$Html$Attributes.$class(A2($Basics._op["++"],"panel-collapse collapse",enabled))
                      ,A2($Html$Attributes.attribute,"role","tabpanel")
                      ,A2($Html$Attributes.attribute,"aria-labelledby",A2($Basics._op["++"],"heading",ident))]),
              _U.list([A2($Html.div,_U.list([$Html$Attributes.$class("panel-body")]),_U.list([body]))]))]));
   });
   var doneRow = F2(function (tableid,_p0) {
      var _p1 = _p0;
      var _p3 = _p1.start;
      var _p2 = _p1.end;
      var pad = function (str) {    return _U.eq($String.length(str),1) ? A2($Basics._op["++"],"0",str) : str;};
      var sec = $Basics.toString($Basics.round((_p2 - _p3) / 1000));
      var min = $Basics.toString($Basics.round(_p2 - _p3) / (1000 * 60) | 0);
      return _U.list([A2($Html.td,_U.list([]),_U.list([$Html.text(_p1.identity)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(A2($Date$Format.format,"%d/%e/%Y %H:%M",$Date.fromTime(_p3)))]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p1.hostname)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p1.queue)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(A2($Basics._op["++"],pad(min),A2($Basics._op["++"],":",pad(sec))))]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p1.status)]))]);
   });
   var runningRow = F2(function (tableId,_p4) {
      var _p5 = _p4;
      return _U.list([A2($Html.td,_U.list([]),_U.list([$Html.text(_p5.id)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p5.type$)]))
                     ,A2($Html.td,_U.list([]),_U.list([$Html.text(_p5.status)]))]);
   });
   var setDoneJobs = F2(function (_p7,_p6) {
      var _p8 = _p7;
      var _p9 = _p6;
      var jobsList = A2($List.map,function (_p10) {    var _p11 = _p10;return {ctor: "_Tuple2",_0: _p11.tid,_1: _p11};},_p9._1);
      var newDone = A2($Table.update,$Table.UpdateRows(jobsList),_p8.done);
      var newPager = A2($Pager.update,$Pager.UpdateTotal($Basics.toFloat(_p9._0)),_p8.pager);
      return {ctor: "_Tuple2",_0: _U.update(_p8,{done: newDone,pager: newPager}),_1: $Effects.none};
   });
   var setRunningJobs = F2(function (_p12,res) {
      var _p13 = _p12;
      var jobsList = A2($List.map,function (_p14) {    var _p15 = _p14;return {ctor: "_Tuple2",_0: _p15.tid,_1: _p15};},res);
      return {ctor: "_Tuple2",_0: _U.update(_p13,{running: A2($Table.update,$Table.UpdateRows(jobsList),_p13.running)}),_1: $Effects.none};
   });
   var GotoPage = function (a) {    return {ctor: "GotoPage",_0: a};};
   var NoOp = {ctor: "NoOp"};
   var LoadDone = function (a) {    return {ctor: "LoadDone",_0: a};};
   var LoadRunning = function (a) {    return {ctor: "LoadRunning",_0: a};};
   var view = F2(function (address,_p16) {
      var _p17 = _p16;
      var _p19 = _p17.running;
      var _p18 = _p17.done;
      return _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("panel-group"),$Html$Attributes.id("accordion"),A2($Html$Attributes.attribute,"role","tablist")]),
      _U.list([A3(accordionPanel,
              $Basics.not($List.isEmpty(_p19.rows)),
              "Running",
              $Bootstrap$Html.panelDefault_(A2($Table.view,A2($Signal.forwardTo,address,LoadRunning),_p19)))
              ,A3(accordionPanel,
              $Basics.not($List.isEmpty(_p18.rows)),
              "Done",
              A2($Html.div,
              _U.list([]),
              _U.list([$Bootstrap$Html.row_(_U.list([$Bootstrap$Html.panelDefault_(A2($Table.view,A2($Signal.forwardTo,address,LoadDone),_p18))]))
                      ,$Bootstrap$Html.row_(_U.list([A2($Pager.view,A2($Signal.forwardTo,address,GotoPage),_p17.pager)]))])))]))]);
   });
   var Polling = {ctor: "Polling"};
   var SetDone = function (a) {    return {ctor: "SetDone",_0: a};};
   var SetRunning = function (a) {    return {ctor: "SetRunning",_0: a};};
   var Model = F3(function (a,b,c) {    return {running: a,done: b,pager: c};});
   var DoneJob = F9(function (a,b,c,d,e,f,g,h,i) {    return {start: a,end: b,env: c,hostname: d,identity: e,queue: f,status: g,tid: h,tid_link: i};});
   var doneJob = A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,
   A2(apply,A2($Json$Decode.map,DoneJob,A2($Json$Decode._op[":="],"start",$Json$Decode.$float)),A2($Json$Decode._op[":="],"end",$Json$Decode.$float)),
   A2($Json$Decode._op[":="],"env",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"hostname",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"identity",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"queue",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"status",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"tid",$Json$Decode.string)),
   A2($Json$Decode._op[":="],"tid-link",$Json$Decode.oneOf(_U.list([$Json$Decode.string,$Json$Decode.$null("")]))));
   var doneList = A3($Json$Decode.object2,
   F2(function (v0,v1) {    return {ctor: "_Tuple2",_0: v0,_1: v1};}),
   A2($Json$Decode._op[":="],"total",$Json$Decode.$int),
   A2($Json$Decode._op[":="],"jobs",$Json$Decode.list(doneJob)));
   var getDone = F2(function (page,offset) {
      return $Effects.task(A2($Task.map,
      SetDone,
      $Task.toResult(A2($Http.get,
      doneList,
      A2($Basics._op["++"],"/jobs/done?offset=",A2($Basics._op["++"],$Basics.toString(offset),A2($Basics._op["++"],"&page=",$Basics.toString(page))))))));
   });
   var RunningJob = F7(function (a,b,c,d,e,f,g) {    return {env: a,id: b,jid: c,status: d,tid: e,tid_link: f,type$: g};});
   var runningJob = A8($Json$Decode.object7,
   RunningJob,
   A2($Json$Decode._op[":="],"env",$Json$Decode.string),
   A2($Json$Decode._op[":="],"id",$Json$Decode.string),
   A2($Json$Decode._op[":="],"jid",$Json$Decode.string),
   A2($Json$Decode._op[":="],"status",$Json$Decode.oneOf(_U.list([$Json$Decode.string,$Json$Decode.$null("")]))),
   A2($Json$Decode._op[":="],"tid",$Json$Decode.string),
   A2($Json$Decode._op[":="],"tid-link",$Json$Decode.oneOf(_U.list([$Json$Decode.string,$Json$Decode.$null("")]))),
   A2($Json$Decode._op[":="],"type",$Json$Decode.string));
   var runningList = A2($Json$Decode.at,_U.list(["jobs"]),$Json$Decode.list(runningJob));
   var getRunning = $Effects.task(A2($Task.map,SetRunning,$Task.toResult(A2($Http.get,runningList,"/jobs/running"))));
   var init = function () {
      var done = A5($Table.init,"doneJobs",false,_U.list(["#","Start","Host","Queue","Runtime (min:sec)","Status"]),doneRow,"Done Jobs");
      var running = A5($Table.init,"runningJobs",false,_U.list(["#","Queue","Status"]),runningRow,"Running Jobs");
      return {ctor: "_Tuple2",_0: A3(Model,running,done,$Pager.init),_1: $Effects.batch(_U.list([getRunning,A2(getDone,1,10)]))};
   }();
   var update = F2(function (action,_p20) {
      var _p21 = _p20;
      var _p34 = _p21.running;
      var _p33 = _p21;
      var _p22 = action;
      _v9_6: do {
         switch (_p22.ctor)
         {case "Polling": return {ctor: "_Tuple2",_0: _p33,_1: $Effects.batch(_U.list([getRunning,A2(getDone,_p21.pager.page,10)]))};
            case "SetRunning": return A4($Common$Redirect.successHandler,_p22._0,_p33,setRunningJobs(_p33),NoOp);
            case "SetDone": return A4($Common$Redirect.successHandler,_p22._0,_p33,setDoneJobs(_p33),NoOp);
            case "GotoPage": var _p24 = _p22._0;
              var _p23 = _p24;
              if (_p23.ctor === "NextPage") {
                    var newPager = A2($Pager.update,_p24,_p33.pager);
                    return {ctor: "_Tuple2",_0: _U.update(_p33,{pager: newPager}),_1: A2(getDone,_p23._0,10)};
                 } else {
                    return {ctor: "_Tuple2",_0: _p33,_1: $Effects.none};
                 }
            case "LoadDone": if (_p22._0.ctor === "Select") {
                    var _p28 = _p22._0._0;
                    var emptyRow = A9(DoneJob,0,0,"","","","","","","");
                    var _p25 = A2($Maybe.withDefault,
                    {ctor: "_Tuple2",_0: _p28,_1: emptyRow},
                    $List.head(A2($List.filter,function (_p26) {    var _p27 = _p26;return _U.eq(_p27._1.tid,_p28);},_p21.done.rows)));
                    var job = _p25._1;
                    return {ctor: "_Tuple2",_0: _p33,_1: A2($Common$NewTab.newtab,NoOp,job.tid_link)};
                 } else {
                    break _v9_6;
                 }
            case "LoadRunning": if (_p22._0.ctor === "Select") {
                    var _p32 = _p22._0._0;
                    var emptyRow = A7(RunningJob,"","","","","","","");
                    var _p29 = A2($Maybe.withDefault,
                    {ctor: "_Tuple2",_0: _p32,_1: emptyRow},
                    $List.head(A2($List.filter,function (_p30) {    var _p31 = _p30;return _U.eq(_p31._1.tid,_p32);},_p34.rows)));
                    var job = _p29._1;
                    return A2($Debug.log,$Basics.toString(_p34),{ctor: "_Tuple2",_0: _p33,_1: A2($Common$NewTab.newtab,NoOp,job.tid_link)});
                 } else {
                    break _v9_6;
                 }
            default: break _v9_6;}
      } while (false);
      return {ctor: "_Tuple2",_0: _p33,_1: $Effects.none};
   });
   return _elm.Jobs.List.values = {_op: _op
                                  ,RunningJob: RunningJob
                                  ,DoneJob: DoneJob
                                  ,Model: Model
                                  ,SetRunning: SetRunning
                                  ,SetDone: SetDone
                                  ,Polling: Polling
                                  ,LoadRunning: LoadRunning
                                  ,LoadDone: LoadDone
                                  ,NoOp: NoOp
                                  ,GotoPage: GotoPage
                                  ,init: init
                                  ,setRunningJobs: setRunningJobs
                                  ,setDoneJobs: setDoneJobs
                                  ,update: update
                                  ,runningRow: runningRow
                                  ,doneRow: doneRow
                                  ,accordionPanel: accordionPanel
                                  ,view: view
                                  ,runningJob: runningJob
                                  ,runningList: runningList
                                  ,apply: apply
                                  ,doneJob: doneJob
                                  ,doneList: doneList
                                  ,getRunning: getRunning
                                  ,getDone: getDone};
};
Elm.Native.Now = {};

Elm.Native.Now.make = function(localRuntime) {

  localRuntime.Native = localRuntime.Native || {};


  localRuntime.Native.Now = localRuntime.Native.Now || {};

  if (localRuntime.Native.Now.values) {
    return localRuntime.Native.Now.values;
  }

  var Result = Elm.Result.make(localRuntime);

  return localRuntime.Native.Now.values = {
    loadTime: (new window.Date).getTime()
  };

};

Elm.Now = Elm.Now || {};
Elm.Now.make = function (_elm) {
   "use strict";
   _elm.Now = _elm.Now || {};
   if (_elm.Now.values) return _elm.Now.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Now = Elm.Native.Now.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var loadTime = $Native$Now.loadTime;
   return _elm.Now.values = {_op: _op,loadTime: loadTime};
};
/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 1.0.2
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function(){

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart;

	//Occupy the global variable of Chart, and create a simple base class
	var Chart = function(context){
		var chart = this;
		this.canvas = context.canvas;

		this.ctx = context;

		//Variables global to the chart
		var computeDimension = function(element,dimension)
		{
			if (element['offset'+dimension])
			{
				return element['offset'+dimension];
			}
			else
			{
				return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
			}
		}

		var width = this.width = computeDimension(context.canvas,'Width');
		var height = this.height = computeDimension(context.canvas,'Height');

		// Firefox requires this to work correctly
		context.canvas.width  = width;
		context.canvas.height = height;

		var width = this.width = context.canvas.width;
		var height = this.height = context.canvas.height;
		this.aspectRatio = this.width / this.height;
		//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
		helpers.retinaScale(this);

		return this;
	};
	//Globally expose the defaults to allow for user updating/changing
	Chart.defaults = {
		global: {
			// Boolean - Whether to animate the chart
			animation: true,

			// Number - Number of animation steps
			animationSteps: 60,

			// String - Animation easing effect
			animationEasing: "easeOutQuart",

			// Boolean - If we should show the scale at all
			showScale: true,

			// Boolean - If we want to override with a hard coded scale
			scaleOverride: false,

			// ** Required if scaleOverride is true **
			// Number - The number of steps in a hard coded scale
			scaleSteps: null,
			// Number - The value jump in the hard coded scale
			scaleStepWidth: null,
			// Number - The scale starting value
			scaleStartValue: null,

			// String - Colour of the scale line
			scaleLineColor: "rgba(0,0,0,.1)",

			// Number - Pixel width of the scale line
			scaleLineWidth: 1,

			// Boolean - Whether to show labels on the scale
			scaleShowLabels: true,

			// Interpolated JS string - can access value
			scaleLabel: "<%=value%>",

			// Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
			scaleIntegersOnly: true,

			// Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
			scaleBeginAtZero: false,

			// String - Scale label font declaration for the scale label
			scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Scale label font size in pixels
			scaleFontSize: 12,

			// String - Scale label font weight style
			scaleFontStyle: "normal",

			// String - Scale label font colour
			scaleFontColor: "#666",

			// Boolean - whether or not the chart should be responsive and resize when the browser does.
			responsive: false,

			// Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
			maintainAspectRatio: true,

			// Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
			showTooltips: true,

			// Boolean - Determines whether to draw built-in tooltip or call custom tooltip function
			customTooltips: false,

			// Array - Array of string names to attach tooltip events
			tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],

			// String - Tooltip background colour
			tooltipFillColor: "rgba(0,0,0,0.8)",

			// String - Tooltip label font declaration for the scale label
			tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Tooltip label font size in pixels
			tooltipFontSize: 14,

			// String - Tooltip font weight style
			tooltipFontStyle: "normal",

			// String - Tooltip label font colour
			tooltipFontColor: "#fff",

			// String - Tooltip title font declaration for the scale label
			tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Tooltip title font size in pixels
			tooltipTitleFontSize: 14,

			// String - Tooltip title font weight style
			tooltipTitleFontStyle: "bold",

			// String - Tooltip title font colour
			tooltipTitleFontColor: "#fff",

			// Number - pixel width of padding around tooltip text
			tooltipYPadding: 6,

			// Number - pixel width of padding around tooltip text
			tooltipXPadding: 6,

			// Number - Size of the caret on the tooltip
			tooltipCaretSize: 8,

			// Number - Pixel radius of the tooltip border
			tooltipCornerRadius: 6,

			// Number - Pixel offset from point x to tooltip edge
			tooltipXOffset: 10,

			// String - Template string for single tooltips
			tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

			// String - Template string for single tooltips
			multiTooltipTemplate: "<%= value %>",

			// String - Colour behind the legend colour block
			multiTooltipKeyBackground: '#fff',

			// Function - Will fire on animation progression.
			onAnimationProgress: function(){},

			// Function - Will fire on animation completion.
			onAnimationComplete: function(){}

		}
	};

	//Create a dictionary of chart types, to allow for extension of existing types
	Chart.types = {};

	//Global Chart helpers object for utility methods and classes
	var helpers = Chart.helpers = {};

		//-- Basic js utility methods
	var each = helpers.each = function(loopable,callback,self){
			var additionalArgs = Array.prototype.slice.call(arguments, 3);
			// Check to see if null or undefined firstly.
			if (loopable){
				if (loopable.length === +loopable.length){
					var i;
					for (i=0; i<loopable.length; i++){
						callback.apply(self,[loopable[i], i].concat(additionalArgs));
					}
				}
				else{
					for (var item in loopable){
						callback.apply(self,[loopable[item],item].concat(additionalArgs));
					}
				}
			}
		},
		clone = helpers.clone = function(obj){
			var objClone = {};
			each(obj,function(value,key){
				if (obj.hasOwnProperty(key)) objClone[key] = value;
			});
			return objClone;
		},
		extend = helpers.extend = function(base){
			each(Array.prototype.slice.call(arguments,1), function(extensionObject) {
				each(extensionObject,function(value,key){
					if (extensionObject.hasOwnProperty(key)) base[key] = value;
				});
			});
			return base;
		},
		merge = helpers.merge = function(base,master){
			//Merge properties in left object over to a shallow clone of object right.
			var args = Array.prototype.slice.call(arguments,0);
			args.unshift({});
			return extend.apply(null, args);
		},
		indexOf = helpers.indexOf = function(arrayToSearch, item){
			if (Array.prototype.indexOf) {
				return arrayToSearch.indexOf(item);
			}
			else{
				for (var i = 0; i < arrayToSearch.length; i++) {
					if (arrayToSearch[i] === item) return i;
				}
				return -1;
			}
		},
		where = helpers.where = function(collection, filterCallback){
			var filtered = [];

			helpers.each(collection, function(item){
				if (filterCallback(item)){
					filtered.push(item);
				}
			});

			return filtered;
		},
		findNextWhere = helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex){
			// Default to start of the array
			if (!startIndex){
				startIndex = -1;
			}
			for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			}
		},
		findPreviousWhere = helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex){
			// Default to end of the array
			if (!startIndex){
				startIndex = arrayToSearch.length;
			}
			for (var i = startIndex - 1; i >= 0; i--) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			}
		},
		inherits = helpers.inherits = function(extensions){
			//Basic javascript inheritance based on the model created in Backbone.js
			var parent = this;
			var ChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function(){ return parent.apply(this, arguments); };

			var Surrogate = function(){ this.constructor = ChartElement;};
			Surrogate.prototype = parent.prototype;
			ChartElement.prototype = new Surrogate();

			ChartElement.extend = inherits;

			if (extensions) extend(ChartElement.prototype, extensions);

			ChartElement.__super__ = parent.prototype;

			return ChartElement;
		},
		noop = helpers.noop = function(){},
		uid = helpers.uid = (function(){
			var id=0;
			return function(){
				return "chart-" + id++;
			};
		})(),
		warn = helpers.warn = function(str){
			//Method for warning of errors
			if (window.console && typeof window.console.warn == "function") console.warn(str);
		},
		amd = helpers.amd = (typeof define == 'function' && define.amd),
		//-- Math methods
		isNumber = helpers.isNumber = function(n){
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		max = helpers.max = function(array){
			return Math.max.apply( Math, array );
		},
		min = helpers.min = function(array){
			return Math.min.apply( Math, array );
		},
		cap = helpers.cap = function(valueToCap,maxValue,minValue){
			if(isNumber(maxValue)) {
				if( valueToCap > maxValue ) {
					return maxValue;
				}
			}
			else if(isNumber(minValue)){
				if ( valueToCap < minValue ){
					return minValue;
				}
			}
			return valueToCap;
		},
		getDecimalPlaces = helpers.getDecimalPlaces = function(num){
			if (num%1!==0 && isNumber(num)){
				return num.toString().split(".")[1].length;
			}
			else {
				return 0;
			}
		},
		toRadians = helpers.radians = function(degrees){
			return degrees * (Math.PI/180);
		},
		// Gets the angle from vertical upright to the point about a centre.
		getAngleFromPoint = helpers.getAngleFromPoint = function(centrePoint, anglePoint){
			var distanceFromXCenter = anglePoint.x - centrePoint.x,
				distanceFromYCenter = anglePoint.y - centrePoint.y,
				radialDistanceFromCenter = Math.sqrt( distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);


			var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

			//If the segment is in the top left quadrant, we need to add another rotation to the angle
			if (distanceFromXCenter < 0 && distanceFromYCenter < 0){
				angle += Math.PI*2;
			}

			return {
				angle: angle,
				distance: radialDistanceFromCenter
			};
		},
		aliasPixel = helpers.aliasPixel = function(pixelWidth){
			return (pixelWidth % 2 === 0) ? 0 : 0.5;
		},
		splineCurve = helpers.splineCurve = function(FirstPoint,MiddlePoint,AfterPoint,t){
			//Props to Rob Spencer at scaled innovation for his post on splining between points
			//http://scaledinnovation.com/analytics/splines/aboutSplines.html
			var d01=Math.sqrt(Math.pow(MiddlePoint.x-FirstPoint.x,2)+Math.pow(MiddlePoint.y-FirstPoint.y,2)),
				d12=Math.sqrt(Math.pow(AfterPoint.x-MiddlePoint.x,2)+Math.pow(AfterPoint.y-MiddlePoint.y,2)),
				fa=t*d01/(d01+d12),// scaling factor for triangle Ta
				fb=t*d12/(d01+d12);
			return {
				inner : {
					x : MiddlePoint.x-fa*(AfterPoint.x-FirstPoint.x),
					y : MiddlePoint.y-fa*(AfterPoint.y-FirstPoint.y)
				},
				outer : {
					x: MiddlePoint.x+fb*(AfterPoint.x-FirstPoint.x),
					y : MiddlePoint.y+fb*(AfterPoint.y-FirstPoint.y)
				}
			};
		},
		calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val){
			return Math.floor(Math.log(val) / Math.LN10);
		},
		calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly){

			//Set a minimum step of two - a point at the top of the graph, and a point at the base
			var minSteps = 2,
				maxSteps = Math.floor(drawingSize/(textSize * 1.5)),
				skipFitting = (minSteps >= maxSteps);

			var maxValue = max(valuesArray),
				minValue = min(valuesArray);

			// We need some degree of seperation here to calculate the scales if all the values are the same
			// Adding/minusing 0.5 will give us a range of 1.
			if (maxValue === minValue){
				maxValue += 0.5;
				// So we don't end up with a graph with a negative start value if we've said always start from zero
				if (minValue >= 0.5 && !startFromZero){
					minValue -= 0.5;
				}
				else{
					// Make up a whole number above the values
					maxValue += 0.5;
				}
			}

			var	valueRange = Math.abs(maxValue - minValue),
				rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange),
				graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphRange = graphMax - graphMin,
				stepValue = Math.pow(10, rangeOrderOfMagnitude),
				numberOfSteps = Math.round(graphRange / stepValue);

			//If we have more space on the graph we'll use it to give more definition to the data
			while((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
				if(numberOfSteps > maxSteps){
					stepValue *=2;
					numberOfSteps = Math.round(graphRange/stepValue);
					// Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
					if (numberOfSteps % 1 !== 0){
						skipFitting = true;
					}
				}
				//We can fit in double the amount of scale points on the scale
				else{
					//If user has declared ints only, and the step value isn't a decimal
					if (integersOnly && rangeOrderOfMagnitude >= 0){
						//If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
						if(stepValue/2 % 1 === 0){
							stepValue /=2;
							numberOfSteps = Math.round(graphRange/stepValue);
						}
						//If it would make it a float break out of the loop
						else{
							break;
						}
					}
					//If the scale doesn't have to be an int, make the scale more granular anyway.
					else{
						stepValue /=2;
						numberOfSteps = Math.round(graphRange/stepValue);
					}

				}
			}

			if (skipFitting){
				numberOfSteps = minSteps;
				stepValue = graphRange / numberOfSteps;
			}

			return {
				steps : numberOfSteps,
				stepValue : stepValue,
				min : graphMin,
				max	: graphMin + (numberOfSteps * stepValue)
			};

		},
		/* jshint ignore:start */
		// Blows up jshint errors based on the new Function constructor
		//Templating methods
		//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
		template = helpers.template = function(templateString, valuesObject){

			// If templateString is function rather than string-template - call the function for valuesObject

			if(templateString instanceof Function){
			 	return templateString(valuesObject);
		 	}

			var cache = {};
			function tmpl(str, data){
				// Figure out if we're getting a template, or if we need to
				// load the template - and be sure to cache the result.
				var fn = !/\W/.test(str) ?
				cache[str] = cache[str] :

				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					str
						.replace(/[\r\t\n]/g, " ")
						.split("<%").join("\t")
						.replace(/((^|%>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)%>/g, "',$1,'")
						.split("\t").join("');")
						.split("%>").join("p.push('")
						.split("\r").join("\\'") +
					"');}return p.join('');"
				);

				// Provide some basic currying to the user
				return data ? fn( data ) : fn;
			}
			return tmpl(templateString,valuesObject);
		},
		/* jshint ignore:end */
		generateLabels = helpers.generateLabels = function(templateString,numberOfSteps,graphMin,stepValue){
			var labelsArray = new Array(numberOfSteps);
			if (labelTemplateString){
				each(labelsArray,function(val,index){
					labelsArray[index] = template(templateString,{value: (graphMin + (stepValue*(index+1)))});
				});
			}
			return labelsArray;
		},
		//--Animation methods
		//Easing functions adapted from Robert Penner's easing equations
		//http://www.robertpenner.com/easing/
		easingEffects = helpers.easingEffects = {
			linear: function (t) {
				return t;
			},
			easeInQuad: function (t) {
				return t * t;
			},
			easeOutQuad: function (t) {
				return -1 * t * (t - 2);
			},
			easeInOutQuad: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
				return -1 / 2 * ((--t) * (t - 2) - 1);
			},
			easeInCubic: function (t) {
				return t * t * t;
			},
			easeOutCubic: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t + 1);
			},
			easeInOutCubic: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t + 2);
			},
			easeInQuart: function (t) {
				return t * t * t * t;
			},
			easeOutQuart: function (t) {
				return -1 * ((t = t / 1 - 1) * t * t * t - 1);
			},
			easeInOutQuart: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
				return -1 / 2 * ((t -= 2) * t * t * t - 2);
			},
			easeInQuint: function (t) {
				return 1 * (t /= 1) * t * t * t * t;
			},
			easeOutQuint: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
			},
			easeInOutQuint: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
			},
			easeInSine: function (t) {
				return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
			},
			easeOutSine: function (t) {
				return 1 * Math.sin(t / 1 * (Math.PI / 2));
			},
			easeInOutSine: function (t) {
				return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
			},
			easeInExpo: function (t) {
				return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
			},
			easeOutExpo: function (t) {
				return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
			},
			easeInOutExpo: function (t) {
				if (t === 0) return 0;
				if (t === 1) return 1;
				if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
				return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
			},
			easeInCirc: function (t) {
				if (t >= 1) return t;
				return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
			},
			easeOutCirc: function (t) {
				return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
			},
			easeInOutCirc: function (t) {
				if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
				return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
			},
			easeInElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
			},
			easeOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
			},
			easeInOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1 / 2) == 2) return 1;
				if (!p) p = 1 * (0.3 * 1.5);
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
			},
			easeInBack: function (t) {
				var s = 1.70158;
				return 1 * (t /= 1) * t * ((s + 1) * t - s);
			},
			easeOutBack: function (t) {
				var s = 1.70158;
				return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
			},
			easeInOutBack: function (t) {
				var s = 1.70158;
				if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
				return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
			},
			easeInBounce: function (t) {
				return 1 - easingEffects.easeOutBounce(1 - t);
			},
			easeOutBounce: function (t) {
				if ((t /= 1) < (1 / 2.75)) {
					return 1 * (7.5625 * t * t);
				} else if (t < (2 / 2.75)) {
					return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
				} else if (t < (2.5 / 2.75)) {
					return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
				} else {
					return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
				}
			},
			easeInOutBounce: function (t) {
				if (t < 1 / 2) return easingEffects.easeInBounce(t * 2) * 0.5;
				return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
			}
		},
		//Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
		requestAnimFrame = helpers.requestAnimFrame = (function(){
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					return window.setTimeout(callback, 1000 / 60);
				};
		})(),
		cancelAnimFrame = helpers.cancelAnimFrame = (function(){
			return window.cancelAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.mozCancelAnimationFrame ||
				window.oCancelAnimationFrame ||
				window.msCancelAnimationFrame ||
				function(callback) {
					return window.clearTimeout(callback, 1000 / 60);
				};
		})(),
		animationLoop = helpers.animationLoop = function(callback,totalSteps,easingString,onProgress,onComplete,chartInstance){

			var currentStep = 0,
				easingFunction = easingEffects[easingString] || easingEffects.linear;

			var animationFrame = function(){
				currentStep++;
				var stepDecimal = currentStep/totalSteps;
				var easeDecimal = easingFunction(stepDecimal);

				callback.call(chartInstance,easeDecimal,stepDecimal, currentStep);
				onProgress.call(chartInstance,easeDecimal,stepDecimal);
				if (currentStep < totalSteps){
					chartInstance.animationFrame = requestAnimFrame(animationFrame);
				} else{
					onComplete.apply(chartInstance);
				}
			};
			requestAnimFrame(animationFrame);
		},
		//-- DOM methods
		getRelativePosition = helpers.getRelativePosition = function(evt){
			var mouseX, mouseY;
			var e = evt.originalEvent || evt,
				canvas = evt.currentTarget || evt.srcElement,
				boundingRect = canvas.getBoundingClientRect();

			if (e.touches){
				mouseX = e.touches[0].clientX - boundingRect.left;
				mouseY = e.touches[0].clientY - boundingRect.top;

			}
			else{
				mouseX = e.clientX - boundingRect.left;
				mouseY = e.clientY - boundingRect.top;
			}

			return {
				x : mouseX,
				y : mouseY
			};

		},
		addEvent = helpers.addEvent = function(node,eventType,method){
			if (node.addEventListener){
				node.addEventListener(eventType,method);
			} else if (node.attachEvent){
				node.attachEvent("on"+eventType, method);
			} else {
				node["on"+eventType] = method;
			}
		},
		removeEvent = helpers.removeEvent = function(node, eventType, handler){
			if (node.removeEventListener){
				node.removeEventListener(eventType, handler, false);
			} else if (node.detachEvent){
				node.detachEvent("on"+eventType,handler);
			} else{
				node["on" + eventType] = noop;
			}
		},
		bindEvents = helpers.bindEvents = function(chartInstance, arrayOfEvents, handler){
			// Create the events object if it's not already present
			if (!chartInstance.events) chartInstance.events = {};

			each(arrayOfEvents,function(eventName){
				chartInstance.events[eventName] = function(){
					handler.apply(chartInstance, arguments);
				};
				addEvent(chartInstance.chart.canvas,eventName,chartInstance.events[eventName]);
			});
		},
		unbindEvents = helpers.unbindEvents = function (chartInstance, arrayOfEvents) {
			each(arrayOfEvents, function(handler,eventName){
				removeEvent(chartInstance.chart.canvas, eventName, handler);
			});
		},
		getMaximumWidth = helpers.getMaximumWidth = function(domNode){
			var container = domNode.parentNode;
			// TODO = check cross browser stuff with this.
			return container.clientWidth;
		},
		getMaximumHeight = helpers.getMaximumHeight = function(domNode){
			var container = domNode.parentNode;
			// TODO = check cross browser stuff with this.
			return container.clientHeight;
		},
		getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth, // legacy support
		retinaScale = helpers.retinaScale = function(chart){
			var ctx = chart.ctx,
				width = chart.canvas.width,
				height = chart.canvas.height;

			if (window.devicePixelRatio) {
				ctx.canvas.style.width = width + "px";
				ctx.canvas.style.height = height + "px";
				ctx.canvas.height = height * window.devicePixelRatio;
				ctx.canvas.width = width * window.devicePixelRatio;
				ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			}
		},
		//-- Canvas methods
		clear = helpers.clear = function(chart){
			chart.ctx.clearRect(0,0,chart.width,chart.height);
		},
		fontString = helpers.fontString = function(pixelSize,fontStyle,fontFamily){
			return fontStyle + " " + pixelSize+"px " + fontFamily;
		},
		longestText = helpers.longestText = function(ctx,font,arrayOfStrings){
			ctx.font = font;
			var longest = 0;
			each(arrayOfStrings,function(string){
				var textWidth = ctx.measureText(string).width;
				longest = (textWidth > longest) ? textWidth : longest;
			});
			return longest;
		},
		drawRoundedRectangle = helpers.drawRoundedRectangle = function(ctx,x,y,width,height,radius){
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
		};


	//Store a reference to each instance - allowing us to globally resize chart instances on window resize.
	//Destroy method on the chart will remove the instance of the chart from this reference.
	Chart.instances = {};

	Chart.Type = function(data,options,chart){
		this.options = options;
		this.chart = chart;
		this.id = uid();
		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		// Initialize is always called when a chart type is created
		// By default it is a no op, but it should be extended
		if (options.responsive){
			this.resize();
		}
		this.initialize.call(this,data);
	};

	//Core methods that'll be a part of every chart type
	extend(Chart.Type.prototype,{
		initialize : function(){return this;},
		clear : function(){
			clear(this.chart);
			return this;
		},
		stop : function(){
			// Stops any current animation loop occuring
			cancelAnimFrame(this.animationFrame);
			return this;
		},
		resize : function(callback){
			this.stop();
			var canvas = this.chart.canvas,
				newWidth = getMaximumWidth(this.chart.canvas),
				newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			retinaScale(this.chart);

			if (typeof callback === "function"){
				callback.apply(this, Array.prototype.slice.call(arguments, 1));
			}
			return this;
		},
		reflow : noop,
		render : function(reflow){
			if (reflow){
				this.reflow();
			}
			if (this.options.animation && !reflow){
				helpers.animationLoop(
					this.draw,
					this.options.animationSteps,
					this.options.animationEasing,
					this.options.onAnimationProgress,
					this.options.onAnimationComplete,
					this
				);
			}
			else{
				this.draw();
				this.options.onAnimationComplete.call(this);
			}
			return this;
		},
		generateLegend : function(){
			return template(this.options.legendTemplate,this);
		},
		destroy : function(){
			this.clear();
			unbindEvents(this, this.events);
			var canvas = this.chart.canvas;

			// Reset canvas height/width attributes starts a fresh with the canvas context
			canvas.width = this.chart.width;
			canvas.height = this.chart.height;

			// < IE9 doesn't support removeProperty
			if (canvas.style.removeProperty) {
				canvas.style.removeProperty('width');
				canvas.style.removeProperty('height');
			} else {
				canvas.style.removeAttribute('width');
				canvas.style.removeAttribute('height');
			}

			delete Chart.instances[this.id];
		},
		showTooltip : function(ChartElements, forceRedraw){
			// Only redraw the chart if we've actually changed what we're hovering on.
			if (typeof this.activeElements === 'undefined') this.activeElements = [];

			var isChanged = (function(Elements){
				var changed = false;

				if (Elements.length !== this.activeElements.length){
					changed = true;
					return changed;
				}

				each(Elements, function(element, index){
					if (element !== this.activeElements[index]){
						changed = true;
					}
				}, this);
				return changed;
			}).call(this, ChartElements);

			if (!isChanged && !forceRedraw){
				return;
			}
			else{
				this.activeElements = ChartElements;
			}
			this.draw();
			if(this.options.customTooltips){
				this.options.customTooltips(false);
			}
			if (ChartElements.length > 0){
				// If we have multiple datasets, show a MultiTooltip for all of the data points at that index
				if (this.datasets && this.datasets.length > 1) {
					var dataArray,
						dataIndex;

					for (var i = this.datasets.length - 1; i >= 0; i--) {
						dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
						dataIndex = indexOf(dataArray, ChartElements[0]);
						if (dataIndex !== -1){
							break;
						}
					}
					var tooltipLabels = [],
						tooltipColors = [],
						medianPosition = (function(index) {

							// Get all the points at that particular index
							var Elements = [],
								dataCollection,
								xPositions = [],
								yPositions = [],
								xMax,
								yMax,
								xMin,
								yMin;
							helpers.each(this.datasets, function(dataset){
								dataCollection = dataset.points || dataset.bars || dataset.segments;
								if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()){
									Elements.push(dataCollection[dataIndex]);
								}
							});

							helpers.each(Elements, function(element) {
								xPositions.push(element.x);
								yPositions.push(element.y);


								//Include any colour information about the element
								tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
								tooltipColors.push({
									fill: element._saved.fillColor || element.fillColor,
									stroke: element._saved.strokeColor || element.strokeColor
								});

							}, this);

							yMin = min(yPositions);
							yMax = max(yPositions);

							xMin = min(xPositions);
							xMax = max(xPositions);

							return {
								x: (xMin > this.chart.width/2) ? xMin : xMax,
								y: (yMin + yMax)/2
							};
						}).call(this, dataIndex);

					new Chart.MultiTooltip({
						x: medianPosition.x,
						y: medianPosition.y,
						xPadding: this.options.tooltipXPadding,
						yPadding: this.options.tooltipYPadding,
						xOffset: this.options.tooltipXOffset,
						fillColor: this.options.tooltipFillColor,
						textColor: this.options.tooltipFontColor,
						fontFamily: this.options.tooltipFontFamily,
						fontStyle: this.options.tooltipFontStyle,
						fontSize: this.options.tooltipFontSize,
						titleTextColor: this.options.tooltipTitleFontColor,
						titleFontFamily: this.options.tooltipTitleFontFamily,
						titleFontStyle: this.options.tooltipTitleFontStyle,
						titleFontSize: this.options.tooltipTitleFontSize,
						cornerRadius: this.options.tooltipCornerRadius,
						labels: tooltipLabels,
						legendColors: tooltipColors,
						legendColorBackground : this.options.multiTooltipKeyBackground,
						title: ChartElements[0].label,
						chart: this.chart,
						ctx: this.chart.ctx,
						custom: this.options.customTooltips
					}).draw();

				} else {
					each(ChartElements, function(Element) {
						var tooltipPosition = Element.tooltipPosition();
						new Chart.Tooltip({
							x: Math.round(tooltipPosition.x),
							y: Math.round(tooltipPosition.y),
							xPadding: this.options.tooltipXPadding,
							yPadding: this.options.tooltipYPadding,
							fillColor: this.options.tooltipFillColor,
							textColor: this.options.tooltipFontColor,
							fontFamily: this.options.tooltipFontFamily,
							fontStyle: this.options.tooltipFontStyle,
							fontSize: this.options.tooltipFontSize,
							caretHeight: this.options.tooltipCaretSize,
							cornerRadius: this.options.tooltipCornerRadius,
							text: template(this.options.tooltipTemplate, Element),
							chart: this.chart,
							custom: this.options.customTooltips
						}).draw();
					}, this);
				}
			}
			return this;
		},
		toBase64Image : function(){
			return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
		}
	});

	Chart.Type.extend = function(extensions){

		var parent = this;

		var ChartType = function(){
			return parent.apply(this,arguments);
		};

		//Copy the prototype object of the this class
		ChartType.prototype = clone(parent.prototype);
		//Now overwrite some of the properties in the base class with the new extensions
		extend(ChartType.prototype, extensions);

		ChartType.extend = Chart.Type.extend;

		if (extensions.name || parent.prototype.name){

			var chartName = extensions.name || parent.prototype.name;
			//Assign any potential default values of the new chart type

			//If none are defined, we'll use a clone of the chart type this is being extended from.
			//I.e. if we extend a line chart, we'll use the defaults from the line chart if our new chart
			//doesn't define some defaults of their own.

			var baseDefaults = (Chart.defaults[parent.prototype.name]) ? clone(Chart.defaults[parent.prototype.name]) : {};

			Chart.defaults[chartName] = extend(baseDefaults,extensions.defaults);

			Chart.types[chartName] = ChartType;

			//Register this new chart type in the Chart prototype
			Chart.prototype[chartName] = function(data,options){
				var config = merge(Chart.defaults.global, Chart.defaults[chartName], options || {});
				return new ChartType(data,config,this);
			};
		} else{
			warn("Name not provided for this chart, so it hasn't been registered");
		}
		return parent;
	};

	Chart.Element = function(configuration){
		extend(this,configuration);
		this.initialize.apply(this,arguments);
		this.save();
	};
	extend(Chart.Element.prototype,{
		initialize : function(){},
		restore : function(props){
			if (!props){
				extend(this,this._saved);
			} else {
				each(props,function(key){
					this[key] = this._saved[key];
				},this);
			}
			return this;
		},
		save : function(){
			this._saved = clone(this);
			delete this._saved._saved;
			return this;
		},
		update : function(newProps){
			each(newProps,function(value,key){
				this._saved[key] = this[key];
				this[key] = value;
			},this);
			return this;
		},
		transition : function(props,ease){
			each(props,function(value,key){
				this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
			},this);
			return this;
		},
		tooltipPosition : function(){
			return {
				x : this.x,
				y : this.y
			};
		},
		hasValue: function(){
			return isNumber(this.value);
		}
	});

	Chart.Element.extend = inherits;


	Chart.Point = Chart.Element.extend({
		display: true,
		inRange: function(chartX,chartY){
			var hitDetectionRange = this.hitDetectionRadius + this.radius;
			return ((Math.pow(chartX-this.x, 2)+Math.pow(chartY-this.y, 2)) < Math.pow(hitDetectionRange,2));
		},
		draw : function(){
			if (this.display){
				var ctx = this.ctx;
				ctx.beginPath();

				ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
				ctx.closePath();

				ctx.strokeStyle = this.strokeColor;
				ctx.lineWidth = this.strokeWidth;

				ctx.fillStyle = this.fillColor;

				ctx.fill();
				ctx.stroke();
			}


			//Quick debug for bezier curve splining
			//Highlights control points and the line between them.
			//Handy for dev - stripped in the min version.

			// ctx.save();
			// ctx.fillStyle = "black";
			// ctx.strokeStyle = "black"
			// ctx.beginPath();
			// ctx.arc(this.controlPoints.inner.x,this.controlPoints.inner.y, 2, 0, Math.PI*2);
			// ctx.fill();

			// ctx.beginPath();
			// ctx.arc(this.controlPoints.outer.x,this.controlPoints.outer.y, 2, 0, Math.PI*2);
			// ctx.fill();

			// ctx.moveTo(this.controlPoints.inner.x,this.controlPoints.inner.y);
			// ctx.lineTo(this.x, this.y);
			// ctx.lineTo(this.controlPoints.outer.x,this.controlPoints.outer.y);
			// ctx.stroke();

			// ctx.restore();



		}
	});

	Chart.Arc = Chart.Element.extend({
		inRange : function(chartX,chartY){

			var pointRelativePosition = helpers.getAngleFromPoint(this, {
				x: chartX,
				y: chartY
			});

			//Check if within the range of the open/close angle
			var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle),
				withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);

			return (betweenAngles && withinRadius);
			//Ensure within the outside of the arc centre, but inside arc outer
		},
		tooltipPosition : function(){
			var centreAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2),
				rangeFromCentre = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
			return {
				x : this.x + (Math.cos(centreAngle) * rangeFromCentre),
				y : this.y + (Math.sin(centreAngle) * rangeFromCentre)
			};
		},
		draw : function(animationPercent){

			var easingDecimal = animationPercent || 1;

			var ctx = this.ctx;

			ctx.beginPath();

			ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);

			ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);

			ctx.closePath();
			ctx.strokeStyle = this.strokeColor;
			ctx.lineWidth = this.strokeWidth;

			ctx.fillStyle = this.fillColor;

			ctx.fill();
			ctx.lineJoin = 'bevel';

			if (this.showStroke){
				ctx.stroke();
			}
		}
	});

	Chart.Rectangle = Chart.Element.extend({
		draw : function(){
			var ctx = this.ctx,
				halfWidth = this.width/2,
				leftX = this.x - halfWidth,
				rightX = this.x + halfWidth,
				top = this.base - (this.base - this.y),
				halfStroke = this.strokeWidth / 2;

			// Canvas doesn't allow us to stroke inside the width so we can
			// adjust the sizes to fit if we're setting a stroke on the line
			if (this.showStroke){
				leftX += halfStroke;
				rightX -= halfStroke;
				top += halfStroke;
			}

			ctx.beginPath();

			ctx.fillStyle = this.fillColor;
			ctx.strokeStyle = this.strokeColor;
			ctx.lineWidth = this.strokeWidth;

			// It'd be nice to keep this class totally generic to any rectangle
			// and simply specify which border to miss out.
			ctx.moveTo(leftX, this.base);
			ctx.lineTo(leftX, top);
			ctx.lineTo(rightX, top);
			ctx.lineTo(rightX, this.base);
			ctx.fill();
			if (this.showStroke){
				ctx.stroke();
			}
		},
		height : function(){
			return this.base - this.y;
		},
		inRange : function(chartX,chartY){
			return (chartX >= this.x - this.width/2 && chartX <= this.x + this.width/2) && (chartY >= this.y && chartY <= this.base);
		}
	});

	Chart.Tooltip = Chart.Element.extend({
		draw : function(){

			var ctx = this.chart.ctx;

			ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

			this.xAlign = "center";
			this.yAlign = "above";

			//Distance between the actual element.y position and the start of the tooltip caret
			var caretPadding = this.caretPadding = 2;

			var tooltipWidth = ctx.measureText(this.text).width + 2*this.xPadding,
				tooltipRectHeight = this.fontSize + 2*this.yPadding,
				tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

			if (this.x + tooltipWidth/2 >this.chart.width){
				this.xAlign = "left";
			} else if (this.x - tooltipWidth/2 < 0){
				this.xAlign = "right";
			}

			if (this.y - tooltipHeight < 0){
				this.yAlign = "below";
			}


			var tooltipX = this.x - tooltipWidth/2,
				tooltipY = this.y - tooltipHeight;

			ctx.fillStyle = this.fillColor;

			// Custom Tooltips
			if(this.custom){
				this.custom(this);
			}
			else{
				switch(this.yAlign)
				{
				case "above":
					//Draw a caret above the x/y
					ctx.beginPath();
					ctx.moveTo(this.x,this.y - caretPadding);
					ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
					ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
					ctx.closePath();
					ctx.fill();
					break;
				case "below":
					tooltipY = this.y + caretPadding + this.caretHeight;
					//Draw a caret below the x/y
					ctx.beginPath();
					ctx.moveTo(this.x, this.y + caretPadding);
					ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
					ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
					ctx.closePath();
					ctx.fill();
					break;
				}

				switch(this.xAlign)
				{
				case "left":
					tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
					break;
				case "right":
					tooltipX = this.x - (this.cornerRadius + this.caretHeight);
					break;
				}

				drawRoundedRectangle(ctx,tooltipX,tooltipY,tooltipWidth,tooltipRectHeight,this.cornerRadius);

				ctx.fill();

				ctx.fillStyle = this.textColor;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(this.text, tooltipX + tooltipWidth/2, tooltipY + tooltipRectHeight/2);
			}
		}
	});

	Chart.MultiTooltip = Chart.Element.extend({
		initialize : function(){
			this.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

			this.titleFont = fontString(this.titleFontSize,this.titleFontStyle,this.titleFontFamily);

			this.height = (this.labels.length * this.fontSize) + ((this.labels.length-1) * (this.fontSize/2)) + (this.yPadding*2) + this.titleFontSize *1.5;

			this.ctx.font = this.titleFont;

			var titleWidth = this.ctx.measureText(this.title).width,
				//Label has a legend square as well so account for this.
				labelWidth = longestText(this.ctx,this.font,this.labels) + this.fontSize + 3,
				longestTextWidth = max([labelWidth,titleWidth]);

			this.width = longestTextWidth + (this.xPadding*2);


			var halfHeight = this.height/2;

			//Check to ensure the height will fit on the canvas
			if (this.y - halfHeight < 0 ){
				this.y = halfHeight;
			} else if (this.y + halfHeight > this.chart.height){
				this.y = this.chart.height - halfHeight;
			}

			//Decide whether to align left or right based on position on canvas
			if (this.x > this.chart.width/2){
				this.x -= this.xOffset + this.width;
			} else {
				this.x += this.xOffset;
			}


		},
		getLineHeight : function(index){
			var baseLineHeight = this.y - (this.height/2) + this.yPadding,
				afterTitleIndex = index-1;

			//If the index is zero, we're getting the title
			if (index === 0){
				return baseLineHeight + this.titleFontSize/2;
			} else{
				return baseLineHeight + ((this.fontSize*1.5*afterTitleIndex) + this.fontSize/2) + this.titleFontSize * 1.5;
			}

		},
		draw : function(){
			// Custom Tooltips
			if(this.custom){
				this.custom(this);
			}
			else{
				drawRoundedRectangle(this.ctx,this.x,this.y - this.height/2,this.width,this.height,this.cornerRadius);
				var ctx = this.ctx;
				ctx.fillStyle = this.fillColor;
				ctx.fill();
				ctx.closePath();

				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillStyle = this.titleTextColor;
				ctx.font = this.titleFont;

				ctx.fillText(this.title,this.x + this.xPadding, this.getLineHeight(0));

				ctx.font = this.font;
				helpers.each(this.labels,function(label,index){
					ctx.fillStyle = this.textColor;
					ctx.fillText(label,this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));

					//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
					//ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
					//Instead we'll make a white filled block to put the legendColour palette over.

					ctx.fillStyle = this.legendColorBackground;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);

					ctx.fillStyle = this.legendColors[index].fill;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);


				},this);
			}
		}
	});

	Chart.Scale = Chart.Element.extend({
		initialize : function(){
			this.fit();
		},
		buildYLabels : function(){
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i=0; i<=this.steps; i++){
				this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
			}
			this.yLabelWidth = (this.display && this.showLabels) ? longestText(this.ctx,this.font,this.yLabels) : 0;
		},
		addXLabel : function(label){
			this.xLabels.push(label);
			this.valuesCount++;
			this.fit();
		},
		removeXLabel : function(){
			this.xLabels.shift();
			this.valuesCount--;
			this.fit();
		},
		// Fitting loop to rotate x Labels and figure out what fits there, and also calculate how many Y steps to use
		fit: function(){
			// First we need the width of the yLabels, assuming the xLabels aren't rotated

			// To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
			this.startPoint = (this.display) ? this.fontSize : 0;
			this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

			// Apply padding settings to the start and end point.
			this.startPoint += this.padding;
			this.endPoint -= this.padding;

			// Cache the starting height, so can determine if we need to recalculate the scale yAxis
			var cachedHeight = this.endPoint - this.startPoint,
				cachedYLabelWidth;

			// Build the current yLabels so we have an idea of what size they'll be to start
			/*
			 *	This sets what is returned from calculateScaleRange as static properties of this class:
			 *
				this.steps;
				this.stepValue;
				this.min;
				this.max;
			 *
			 */
			this.calculateYRange(cachedHeight);

			// With these properties set we can now build the array of yLabels
			// and also the width of the largest yLabel
			this.buildYLabels();

			this.calculateXLabelRotation();

			while((cachedHeight > this.endPoint - this.startPoint)){
				cachedHeight = this.endPoint - this.startPoint;
				cachedYLabelWidth = this.yLabelWidth;

				this.calculateYRange(cachedHeight);
				this.buildYLabels();

				// Only go through the xLabel loop again if the yLabel width has changed
				if (cachedYLabelWidth < this.yLabelWidth){
					this.calculateXLabelRotation();
				}
			}

		},
		calculateXLabelRotation : function(){
			//Get the width of each grid by calculating the difference
			//between x offsets between 0 and 1.

			this.ctx.font = this.font;

			var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
				lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
				firstRotated,
				lastRotated;


			this.xScalePaddingRight = lastWidth/2 + 3;
			this.xScalePaddingLeft = (firstWidth/2 > this.yLabelWidth + 10) ? firstWidth/2 : this.yLabelWidth + 10;

			this.xLabelRotation = 0;
			if (this.display){
				var originalLabelWidth = longestText(this.ctx,this.font,this.xLabels),
					cosRotation,
					firstRotatedWidth;
				this.xLabelWidth = originalLabelWidth;
				//Allow 3 pixels x2 padding either side for label readability
				var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;

				//Max label rotate should be 90 - also act as a loop counter
				while ((this.xLabelWidth > xGridWidth && this.xLabelRotation === 0) || (this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0)){
					cosRotation = Math.cos(toRadians(this.xLabelRotation));

					firstRotated = cosRotation * firstWidth;
					lastRotated = cosRotation * lastWidth;

					// We're right aligning the text now.
					if (firstRotated + this.fontSize / 2 > this.yLabelWidth + 8){
						this.xScalePaddingLeft = firstRotated + this.fontSize / 2;
					}
					this.xScalePaddingRight = this.fontSize/2;


					this.xLabelRotation++;
					this.xLabelWidth = cosRotation * originalLabelWidth;

				}
				if (this.xLabelRotation > 0){
					this.endPoint -= Math.sin(toRadians(this.xLabelRotation))*originalLabelWidth + 3;
				}
			}
			else{
				this.xLabelWidth = 0;
				this.xScalePaddingRight = this.padding;
				this.xScalePaddingLeft = this.padding;
			}

		},
		// Needs to be overidden in each Chart type
		// Otherwise we need to pass all the data into the scale class
		calculateYRange: noop,
		drawingArea: function(){
			return this.startPoint - this.endPoint;
		},
		calculateY : function(value){
			var scalingFactor = this.drawingArea() / (this.min - this.max);
			return this.endPoint - (scalingFactor * (value - this.min));
		},
		calculateX : function(index){
			var isRotated = (this.xLabelRotation > 0),
				// innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
				innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight),
				valueWidth = innerWidth/Math.max((this.valuesCount - ((this.offsetGridLines) ? 0 : 1)), 1),
				valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

			if (this.offsetGridLines){
				valueOffset += (valueWidth/2);
			}

			return Math.round(valueOffset);
		},
		update : function(newProps){
			helpers.extend(this, newProps);
			this.fit();
		},
		draw : function(){
			var ctx = this.ctx,
				yLabelGap = (this.endPoint - this.startPoint) / this.steps,
				xStart = Math.round(this.xScalePaddingLeft);
			if (this.display){
				ctx.fillStyle = this.textColor;
				ctx.font = this.font;
				each(this.yLabels,function(labelString,index){
					var yLabelCenter = this.endPoint - (yLabelGap * index),
						linePositionY = Math.round(yLabelCenter),
						drawHorizontalLine = this.showHorizontalLines;

					ctx.textAlign = "right";
					ctx.textBaseline = "middle";
					if (this.showLabels){
						ctx.fillText(labelString,xStart - 10,yLabelCenter);
					}

					// This is X axis, so draw it
					if (index === 0 && !drawHorizontalLine){
						drawHorizontalLine = true;
					}

					if (drawHorizontalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					linePositionY += helpers.aliasPixel(ctx.lineWidth);

					if(drawHorizontalLine){
						ctx.moveTo(xStart, linePositionY);
						ctx.lineTo(this.width, linePositionY);
						ctx.stroke();
						ctx.closePath();
					}

					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;
					ctx.beginPath();
					ctx.moveTo(xStart - 5, linePositionY);
					ctx.lineTo(xStart, linePositionY);
					ctx.stroke();
					ctx.closePath();

				},this);

				each(this.xLabels,function(label,index){
					var xPos = this.calculateX(index) + aliasPixel(this.lineWidth),
						// Check to see if line/bar here and decide where to place the line
						linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth),
						isRotated = (this.xLabelRotation > 0),
						drawVerticalLine = this.showVerticalLines;

					// This is Y axis, so draw it
					if (index === 0 && !drawVerticalLine){
						drawVerticalLine = true;
					}

					if (drawVerticalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					if (drawVerticalLine){
						ctx.moveTo(linePos,this.endPoint);
						ctx.lineTo(linePos,this.startPoint - 3);
						ctx.stroke();
						ctx.closePath();
					}


					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;


					// Small lines at the bottom of the base grid line
					ctx.beginPath();
					ctx.moveTo(linePos,this.endPoint);
					ctx.lineTo(linePos,this.endPoint + 5);
					ctx.stroke();
					ctx.closePath();

					ctx.save();
					ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);
					ctx.rotate(toRadians(this.xLabelRotation)*-1);
					ctx.font = this.font;
					ctx.textAlign = (isRotated) ? "right" : "center";
					ctx.textBaseline = (isRotated) ? "middle" : "top";
					ctx.fillText(label, 0, 0);
					ctx.restore();
				},this);

			}
		}

	});

	Chart.RadialScale = Chart.Element.extend({
		initialize: function(){
			this.size = min([this.height, this.width]);
			this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
		},
		calculateCenterOffset: function(value){
			// Take into account half font size + the yPadding of the top value
			var scalingFactor = this.drawingArea / (this.max - this.min);

			return (value - this.min) * scalingFactor;
		},
		update : function(){
			if (!this.lineArc){
				this.setScaleSize();
			} else {
				this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
			}
			this.buildYLabels();
		},
		buildYLabels: function(){
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i=0; i<=this.steps; i++){
				this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
			}
		},
		getCircumference : function(){
			return ((Math.PI*2) / this.valuesCount);
		},
		setScaleSize: function(){
			/*
			 * Right, this is really confusing and there is a lot of maths going on here
			 * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
			 *
			 * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
			 *
			 * Solution:
			 *
			 * We assume the radius of the polygon is half the size of the canvas at first
			 * at each index we check if the text overlaps.
			 *
			 * Where it does, we store that angle and that index.
			 *
			 * After finding the largest index and angle we calculate how much we need to remove
			 * from the shape radius to move the point inwards by that x.
			 *
			 * We average the left and right distances to get the maximum shape radius that can fit in the box
			 * along with labels.
			 *
			 * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
			 * on each side, removing that from the size, halving it and adding the left x protrusion width.
			 *
			 * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
			 * and position it in the most space efficient manner
			 *
			 * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
			 */


			// Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
			// Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
			var largestPossibleRadius = min([(this.height/2 - this.pointLabelFontSize - 5), this.width/2]),
				pointPosition,
				i,
				textWidth,
				halfTextWidth,
				furthestRight = this.width,
				furthestRightIndex,
				furthestRightAngle,
				furthestLeft = 0,
				furthestLeftIndex,
				furthestLeftAngle,
				xProtrusionLeft,
				xProtrusionRight,
				radiusReductionRight,
				radiusReductionLeft,
				maxWidthRadius;
			this.ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
			for (i=0;i<this.valuesCount;i++){
				// 5px to space the text slightly out - similar to what we do in the draw function.
				pointPosition = this.getPointPosition(i, largestPossibleRadius);
				textWidth = this.ctx.measureText(template(this.templateString, { value: this.labels[i] })).width + 5;
				if (i === 0 || i === this.valuesCount/2){
					// If we're at index zero, or exactly the middle, we're at exactly the top/bottom
					// of the radar chart, so text will be aligned centrally, so we'll half it and compare
					// w/left and right text sizes
					halfTextWidth = textWidth/2;
					if (pointPosition.x + halfTextWidth > furthestRight) {
						furthestRight = pointPosition.x + halfTextWidth;
						furthestRightIndex = i;
					}
					if (pointPosition.x - halfTextWidth < furthestLeft) {
						furthestLeft = pointPosition.x - halfTextWidth;
						furthestLeftIndex = i;
					}
				}
				else if (i < this.valuesCount/2) {
					// Less than half the values means we'll left align the text
					if (pointPosition.x + textWidth > furthestRight) {
						furthestRight = pointPosition.x + textWidth;
						furthestRightIndex = i;
					}
				}
				else if (i > this.valuesCount/2){
					// More than half the values means we'll right align the text
					if (pointPosition.x - textWidth < furthestLeft) {
						furthestLeft = pointPosition.x - textWidth;
						furthestLeftIndex = i;
					}
				}
			}

			xProtrusionLeft = furthestLeft;

			xProtrusionRight = Math.ceil(furthestRight - this.width);

			furthestRightAngle = this.getIndexAngle(furthestRightIndex);

			furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);

			radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI/2);

			radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI/2);

			// Ensure we actually need to reduce the size of the chart
			radiusReductionRight = (isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
			radiusReductionLeft = (isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

			this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight)/2;

			//this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
			this.setCenterPoint(radiusReductionLeft, radiusReductionRight);

		},
		setCenterPoint: function(leftMovement, rightMovement){

			var maxRight = this.width - rightMovement - this.drawingArea,
				maxLeft = leftMovement + this.drawingArea;

			this.xCenter = (maxLeft + maxRight)/2;
			// Always vertically in the centre as the text height doesn't change
			this.yCenter = (this.height/2);
		},

		getIndexAngle : function(index){
			var angleMultiplier = (Math.PI * 2) / this.valuesCount;
			// Start from the top instead of right, so remove a quarter of the circle

			return index * angleMultiplier - (Math.PI/2);
		},
		getPointPosition : function(index, distanceFromCenter){
			var thisAngle = this.getIndexAngle(index);
			return {
				x : (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
				y : (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
			};
		},
		draw: function(){
			if (this.display){
				var ctx = this.ctx;
				each(this.yLabels, function(label, index){
					// Don't draw a centre value
					if (index > 0){
						var yCenterOffset = index * (this.drawingArea/this.steps),
							yHeight = this.yCenter - yCenterOffset,
							pointPosition;

						// Draw circular lines around the scale
						if (this.lineWidth > 0){
							ctx.strokeStyle = this.lineColor;
							ctx.lineWidth = this.lineWidth;

							if(this.lineArc){
								ctx.beginPath();
								ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI*2);
								ctx.closePath();
								ctx.stroke();
							} else{
								ctx.beginPath();
								for (var i=0;i<this.valuesCount;i++)
								{
									pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + (index * this.stepValue)));
									if (i === 0){
										ctx.moveTo(pointPosition.x, pointPosition.y);
									} else {
										ctx.lineTo(pointPosition.x, pointPosition.y);
									}
								}
								ctx.closePath();
								ctx.stroke();
							}
						}
						if(this.showLabels){
							ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);
							if (this.showLabelBackdrop){
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = this.backdropColor;
								ctx.fillRect(
									this.xCenter - labelWidth/2 - this.backdropPaddingX,
									yHeight - this.fontSize/2 - this.backdropPaddingY,
									labelWidth + this.backdropPaddingX*2,
									this.fontSize + this.backdropPaddingY*2
								);
							}
							ctx.textAlign = 'center';
							ctx.textBaseline = "middle";
							ctx.fillStyle = this.fontColor;
							ctx.fillText(label, this.xCenter, yHeight);
						}
					}
				}, this);

				if (!this.lineArc){
					ctx.lineWidth = this.angleLineWidth;
					ctx.strokeStyle = this.angleLineColor;
					for (var i = this.valuesCount - 1; i >= 0; i--) {
						if (this.angleLineWidth > 0){
							var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
							ctx.beginPath();
							ctx.moveTo(this.xCenter, this.yCenter);
							ctx.lineTo(outerPosition.x, outerPosition.y);
							ctx.stroke();
							ctx.closePath();
						}
						// Extra 3px out for some label spacing
						var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
						ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
						ctx.fillStyle = this.pointLabelFontColor;

						var labelsCount = this.labels.length,
							halfLabelsCount = this.labels.length/2,
							quarterLabelsCount = halfLabelsCount/2,
							upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
							exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
						if (i === 0){
							ctx.textAlign = 'center';
						} else if(i === halfLabelsCount){
							ctx.textAlign = 'center';
						} else if (i < halfLabelsCount){
							ctx.textAlign = 'left';
						} else {
							ctx.textAlign = 'right';
						}

						// Set the correct text baseline based on outer positioning
						if (exactQuarter){
							ctx.textBaseline = 'middle';
						} else if (upperHalf){
							ctx.textBaseline = 'bottom';
						} else {
							ctx.textBaseline = 'top';
						}

						ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
					}
				}
			}
		}
	});

	// Attach global event to resize each chart instance when the browser resizes
	helpers.addEvent(window, "resize", (function(){
		// Basic debounce of resize function so it doesn't hurt performance when resizing browser.
		var timeout;
		return function(){
			clearTimeout(timeout);
			timeout = setTimeout(function(){
				each(Chart.instances,function(instance){
					// If the responsive flag is set in the chart instance config
					// Cascade the resize event down to the chart.
					if (instance.options.responsive){
						instance.resize(instance.render, true);
					}
				});
			}, 50);
		};
	})());


	if (amd) {
		define(function(){
			return Chart;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = Chart;
	}

	root.Chart = Chart;

	Chart.noConflict = function(){
		root.Chart = previous;
		return Chart;
	};

}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;


	var defaultConfig = {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : true,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - If there is a stroke on each bar
		barShowStroke : true,

		//Number - Pixel width of the bar stroke
		barStrokeWidth : 2,

		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Bar",
		defaults : defaultConfig,
		initialize:  function(data){

			//Expose options as a scope variable here so we can access it in the ScaleClass
			var options = this.options;

			this.ScaleClass = Chart.Scale.extend({
				offsetGridLines : true,
				calculateBarX : function(datasetCount, datasetIndex, barIndex){
					//Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
					var xWidth = this.calculateBaseWidth(),
						xAbsolute = this.calculateX(barIndex) - (xWidth/2),
						barWidth = this.calculateBarWidth(datasetCount);

					return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * options.barDatasetSpacing) + barWidth/2;
				},
				calculateBaseWidth : function(){
					return (this.calculateX(1) - this.calculateX(0)) - (2*options.barValueSpacing);
				},
				calculateBarWidth : function(datasetCount){
					//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
					var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * options.barDatasetSpacing);

					return (baseWidth / datasetCount);
				}
			});

			this.datasets = [];

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

					this.eachBars(function(bar){
						bar.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activeBars, function(activeBar){
						activeBar.fillColor = activeBar.highlightFill;
						activeBar.strokeColor = activeBar.highlightStroke;
					});
					this.showTooltip(activeBars);
				});
			}

			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.BarClass = Chart.Rectangle.extend({
				strokeWidth : this.options.barStrokeWidth,
				showStroke : this.options.barShowStroke,
				ctx : this.chart.ctx
			});

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset,datasetIndex){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					bars : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.bars.push(new this.BarClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.strokeColor,
						fillColor : dataset.fillColor,
						highlightFill : dataset.highlightFill || dataset.fillColor,
						highlightStroke : dataset.highlightStroke || dataset.strokeColor
					}));
				},this);

			},this);

			this.buildScale(data.labels);

			this.BarClass.prototype.base = this.scale.endPoint;

			this.eachBars(function(bar, index, datasetIndex){
				helpers.extend(bar, {
					width : this.scale.calculateBarWidth(this.datasets.length),
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
					y: this.scale.endPoint
				});
				bar.save();
			}, this);

			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});

			this.eachBars(function(bar){
				bar.save();
			});
			this.render();
		},
		eachBars : function(callback){
			helpers.each(this.datasets,function(dataset, datasetIndex){
				helpers.each(dataset.bars, callback, this, datasetIndex);
			},this);
		},
		getBarsAtEvent : function(e){
			var barsArray = [],
				eventPosition = helpers.getRelativePosition(e),
				datasetIterator = function(dataset){
					barsArray.push(dataset.bars[barIndex]);
				},
				barIndex;

			for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
				for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
					if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x,eventPosition.y)){
						helpers.each(this.datasets, datasetIterator);
						return barsArray;
					}
				}
			}

			return barsArray;
		},
		buildScale : function(labels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachBars(function(bar){
					values.push(bar.value);
				});
				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange: function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding : (this.options.showScale) ? 0 : (this.options.barShowStroke) ? this.options.barStrokeWidth : 0,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}

			this.scale = new this.ScaleClass(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].bars.push(new this.BarClass({
					value : value,
					label : label,
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, this.scale.valuesCount+1),
					y: this.scale.endPoint,
					width : this.scale.calculateBarWidth(this.datasets.length),
					base : this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].strokeColor,
					fillColor : this.datasets[datasetIndex].fillColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.bars.shift();
			},this);
			this.update();
		},
		reflow : function(){
			helpers.extend(this.BarClass.prototype,{
				y: this.scale.endPoint,
				base : this.scale.endPoint
			});
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			this.scale.draw(easingDecimal);

			//Draw all the bars for each dataset
			helpers.each(this.datasets,function(dataset,datasetIndex){
				helpers.each(dataset.bars,function(bar,index){
					if (bar.hasValue()){
						bar.base = this.scale.endPoint;
						//Transition then draw
						bar.transition({
							x : this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
							y : this.scale.calculateY(bar.value),
							width : this.scale.calculateBarWidth(this.datasets.length)
						}, easingDecimal).draw();
					}
				},this);

			},this);
		}
	});


}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Whether we should show a stroke on each segment
		segmentShowStroke : true,

		//String - The colour of each segment stroke
		segmentStrokeColor : "#fff",

		//Number - The width of each segment stroke
		segmentStrokeWidth : 2,

		//The percentage of the chart that we cut out of the middle.
		percentageInnerCutout : 50,

		//Number - Amount of animation steps
		animationSteps : 100,

		//String - Animation easing effect
		animationEasing : "easeOutBounce",

		//Boolean - Whether we animate the rotation of the Doughnut
		animateRotate : true,

		//Boolean - Whether we animate scaling the Doughnut from the centre
		animateScale : false,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "Doughnut",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults : defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize:  function(data){

			//Declare segments as a static property to prevent inheriting across the Chart type prototype
			this.segments = [];
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;

			this.SegmentArc = Chart.Arc.extend({
				ctx : this.chart.ctx,
				x : this.chart.width/2,
				y : this.chart.height/2
			});

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];

					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});
					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});
					this.showTooltip(activeSegments);
				});
			}
			this.calculateTotal(data);

			helpers.each(data,function(datapoint, index){
				this.addData(datapoint, index, true);
			},this);

			this.render();
		},
		getSegmentsAtEvent : function(e){
			var segmentsArray = [];

			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments,function(segment){
				if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
			},this);
			return segmentsArray;
		},
		addData : function(segment, atIndex, silent){
			var index = atIndex || this.segments.length;
			this.segments.splice(index, 0, new this.SegmentArc({
				value : segment.value,
				outerRadius : (this.options.animateScale) ? 0 : this.outerRadius,
				innerRadius : (this.options.animateScale) ? 0 : (this.outerRadius/100) * this.options.percentageInnerCutout,
				fillColor : segment.color,
				highlightColor : segment.highlight || segment.color,
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				startAngle : Math.PI * 1.5,
				circumference : (this.options.animateRotate) ? 0 : this.calculateCircumference(segment.value),
				label : segment.label
			}));
			if (!silent){
				this.reflow();
				this.update();
			}
		},
		calculateCircumference : function(value){
			return (Math.PI*2)*(Math.abs(value) / this.total);
		},
		calculateTotal : function(data){
			this.total = 0;
			helpers.each(data,function(segment){
				this.total += Math.abs(segment.value);
			},this);
		},
		update : function(){
			this.calculateTotal(this.segments);

			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor']);
			});

			helpers.each(this.segments,function(segment){
				segment.save();
			});
			this.render();
		},

		removeData: function(atIndex){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
			this.segments.splice(indexToDelete, 1);
			this.reflow();
			this.update();
		},

		reflow : function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;
			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.outerRadius,
					innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
				});
			}, this);
		},
		draw : function(easeDecimal){
			var animDecimal = (easeDecimal) ? easeDecimal : 1;
			this.clear();
			helpers.each(this.segments,function(segment,index){
				segment.transition({
					circumference : this.calculateCircumference(segment.value),
					outerRadius : this.outerRadius,
					innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
				},animDecimal);

				segment.endAngle = segment.startAngle + segment.circumference;

				segment.draw();
				if (index === 0){
					segment.startAngle = Math.PI * 1.5;
				}
				//Check to see if it's the last segment, if not get the next and update the start angle
				if (index < this.segments.length-1){
					this.segments[index+1].startAngle = segment.endAngle;
				}
			},this);

		}
	});

	Chart.types.Doughnut.extend({
		name : "Pie",
		defaults : helpers.merge(defaultConfig,{percentageInnerCutout : 0})
	});

}).call(this);
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - Whether the line is curved between points
		bezierCurve : true,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 2,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Line",
		defaults : defaultConfig,
		initialize:  function(data){
			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,
				radius : this.options.pointDotRadius,
				display: this.options.pointDot,
				hitDetectionRadius : this.options.pointHitDetectionRadius,
				ctx : this.chart.ctx,
				inRange : function(mouseX){
					return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));
				}
			});

			this.datasets = [];

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePoints, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});
					this.showTooltip(activePoints);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);


				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

				this.buildScale(data.labels);


				this.eachPoints(function(point, index){
					helpers.extend(point, {
						x: this.scale.calculateX(index),
						y: this.scale.endPoint
					});
					point.save();
				}, this);

			},this);


			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});
			this.eachPoints(function(point){
				point.save();
			});
			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},
		getPointsAtEvent : function(e){
			var pointsArray = [],
				eventPosition = helpers.getRelativePosition(e);
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,function(point){
					if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);
				});
			},this);
			return pointsArray;
		},
		buildScale : function(labels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachPoints(function(point){
					values.push(point.value);
				});

				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange : function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}


			this.scale = new Chart.Scale(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets

			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: this.scale.calculateX(this.scale.valuesCount+1),
					y: this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.update();
		},
		reflow : function(){
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			// Some helper methods for getting the next/prev points
			var hasValue = function(item){
				return item.value !== null;
			},
			nextPoint = function(point, collection, index){
				return helpers.findNextWhere(collection, hasValue, index) || point;
			},
			previousPoint = function(point, collection, index){
				return helpers.findPreviousWhere(collection, hasValue, index) || point;
			};

			this.scale.draw(easingDecimal);


			helpers.each(this.datasets,function(dataset){
				var pointsWithValues = helpers.where(dataset.points, hasValue);

				//Transition each point first so that the line and point drawing isn't out of sync
				//We can use this extra loop to calculate the control points of this dataset also in this loop

				helpers.each(dataset.points, function(point, index){
					if (point.hasValue()){
						point.transition({
							y : this.scale.calculateY(point.value),
							x : this.scale.calculateX(index)
						}, easingDecimal);
					}
				},this);


				// Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
				// This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
				if (this.options.bezierCurve){
					helpers.each(pointsWithValues, function(point, index){
						var tension = (index > 0 && index < pointsWithValues.length - 1) ? this.options.bezierCurveTension : 0;
						point.controlPoints = helpers.splineCurve(
							previousPoint(point, pointsWithValues, index),
							point,
							nextPoint(point, pointsWithValues, index),
							tension
						);

						// Prevent the bezier going outside of the bounds of the graph

						// Cap puter bezier handles to the upper/lower scale bounds
						if (point.controlPoints.outer.y > this.scale.endPoint){
							point.controlPoints.outer.y = this.scale.endPoint;
						}
						else if (point.controlPoints.outer.y < this.scale.startPoint){
							point.controlPoints.outer.y = this.scale.startPoint;
						}

						// Cap inner bezier handles to the upper/lower scale bounds
						if (point.controlPoints.inner.y > this.scale.endPoint){
							point.controlPoints.inner.y = this.scale.endPoint;
						}
						else if (point.controlPoints.inner.y < this.scale.startPoint){
							point.controlPoints.inner.y = this.scale.startPoint;
						}
					},this);
				}


				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();

				helpers.each(pointsWithValues, function(point, index){
					if (index === 0){
						ctx.moveTo(point.x, point.y);
					}
					else{
						if(this.options.bezierCurve){
							var previous = previousPoint(point, pointsWithValues, index);

							ctx.bezierCurveTo(
								previous.controlPoints.outer.x,
								previous.controlPoints.outer.y,
								point.controlPoints.inner.x,
								point.controlPoints.inner.y,
								point.x,
								point.y
							);
						}
						else{
							ctx.lineTo(point.x,point.y);
						}
					}
				}, this);

				ctx.stroke();

				if (this.options.datasetFill && pointsWithValues.length > 0){
					//Round off the line by going to the base of the chart, back to the start, then fill.
					ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
					ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
					ctx.fillStyle = dataset.fillColor;
					ctx.closePath();
					ctx.fill();
				}

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(pointsWithValues,function(point){
					point.draw();
				});
			},this);
		}
	});


}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Show a backdrop to the scale label
		scaleShowLabelBackdrop : true,

		//String - The colour of the label backdrop
		scaleBackdropColor : "rgba(255,255,255,0.75)",

		// Boolean - Whether the scale should begin at zero
		scaleBeginAtZero : true,

		//Number - The backdrop padding above & below the label in pixels
		scaleBackdropPaddingY : 2,

		//Number - The backdrop padding to the side of the label in pixels
		scaleBackdropPaddingX : 2,

		//Boolean - Show line for each value in the scale
		scaleShowLine : true,

		//Boolean - Stroke a line around each segment in the chart
		segmentShowStroke : true,

		//String - The colour of the stroke on each segement.
		segmentStrokeColor : "#fff",

		//Number - The width of the stroke value in pixels
		segmentStrokeWidth : 2,

		//Number - Amount of animation steps
		animationSteps : 100,

		//String - Animation easing effect.
		animationEasing : "easeOutBounce",

		//Boolean - Whether to animate the rotation of the chart
		animateRotate : true,

		//Boolean - Whether to animate scaling the chart from the centre
		animateScale : false,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
	};


	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "PolarArea",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults : defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize:  function(data){
			this.segments = [];
			//Declare segment class as a chart instance specific class, so it can share props for this instance
			this.SegmentArc = Chart.Arc.extend({
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				ctx : this.chart.ctx,
				innerRadius : 0,
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.scale = new Chart.RadialScale({
				display: this.options.showScale,
				fontStyle: this.options.scaleFontStyle,
				fontSize: this.options.scaleFontSize,
				fontFamily: this.options.scaleFontFamily,
				fontColor: this.options.scaleFontColor,
				showLabels: this.options.scaleShowLabels,
				showLabelBackdrop: this.options.scaleShowLabelBackdrop,
				backdropColor: this.options.scaleBackdropColor,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
				lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
				lineColor: this.options.scaleLineColor,
				lineArc: true,
				width: this.chart.width,
				height: this.chart.height,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				templateString: this.options.scaleLabel,
				valuesCount: data.length
			});

			this.updateScaleRange(data);

			this.scale.update();

			helpers.each(data,function(segment,index){
				this.addData(segment,index,true);
			},this);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];
					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});
					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});
					this.showTooltip(activeSegments);
				});
			}

			this.render();
		},
		getSegmentsAtEvent : function(e){
			var segmentsArray = [];

			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments,function(segment){
				if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
			},this);
			return segmentsArray;
		},
		addData : function(segment, atIndex, silent){
			var index = atIndex || this.segments.length;

			this.segments.splice(index, 0, new this.SegmentArc({
				fillColor: segment.color,
				highlightColor: segment.highlight || segment.color,
				label: segment.label,
				value: segment.value,
				outerRadius: (this.options.animateScale) ? 0 : this.scale.calculateCenterOffset(segment.value),
				circumference: (this.options.animateRotate) ? 0 : this.scale.getCircumference(),
				startAngle: Math.PI * 1.5
			}));
			if (!silent){
				this.reflow();
				this.update();
			}
		},
		removeData: function(atIndex){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
			this.segments.splice(indexToDelete, 1);
			this.reflow();
			this.update();
		},
		calculateTotal: function(data){
			this.total = 0;
			helpers.each(data,function(segment){
				this.total += segment.value;
			},this);
			this.scale.valuesCount = this.segments.length;
		},
		updateScaleRange: function(datapoints){
			var valuesArray = [];
			helpers.each(datapoints,function(segment){
				valuesArray.push(segment.value);
			});

			var scaleSizes = (this.options.scaleOverride) ?
				{
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				} :
				helpers.calculateScaleRange(
					valuesArray,
					helpers.min([this.chart.width, this.chart.height])/2,
					this.options.scaleFontSize,
					this.options.scaleBeginAtZero,
					this.options.scaleIntegersOnly
				);

			helpers.extend(
				this.scale,
				scaleSizes,
				{
					size: helpers.min([this.chart.width, this.chart.height]),
					xCenter: this.chart.width/2,
					yCenter: this.chart.height/2
				}
			);

		},
		update : function(){
			this.calculateTotal(this.segments);

			helpers.each(this.segments,function(segment){
				segment.save();
			});
			
			this.reflow();
			this.render();
		},
		reflow : function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.updateScaleRange(this.segments);
			this.scale.update();

			helpers.extend(this.scale,{
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});

			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.scale.calculateCenterOffset(segment.value)
				});
			}, this);

		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			//Clear & draw the canvas
			this.clear();
			helpers.each(this.segments,function(segment, index){
				segment.transition({
					circumference : this.scale.getCircumference(),
					outerRadius : this.scale.calculateCenterOffset(segment.value)
				},easingDecimal);

				segment.endAngle = segment.startAngle + segment.circumference;

				// If we've removed the first segment we need to set the first one to
				// start at the top.
				if (index === 0){
					segment.startAngle = Math.PI * 1.5;
				}

				//Check to see if it's the last segment, if not get the next and update the start angle
				if (index < this.segments.length - 1){
					this.segments[index+1].startAngle = segment.endAngle;
				}
				segment.draw();
			}, this);
			this.scale.draw();
		}
	});

}).call(this);
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;



	Chart.Type.extend({
		name: "Radar",
		defaults:{
			//Boolean - Whether to show lines for each scale point
			scaleShowLine : true,

			//Boolean - Whether we show the angle lines out of the radar
			angleShowLineOut : true,

			//Boolean - Whether to show labels on the scale
			scaleShowLabels : false,

			// Boolean - Whether the scale should begin at zero
			scaleBeginAtZero : true,

			//String - Colour of the angle line
			angleLineColor : "rgba(0,0,0,.1)",

			//Number - Pixel width of the angle line
			angleLineWidth : 1,

			//String - Point label font declaration
			pointLabelFontFamily : "'Arial'",

			//String - Point label font weight
			pointLabelFontStyle : "normal",

			//Number - Point label font size in pixels
			pointLabelFontSize : 10,

			//String - Point label font colour
			pointLabelFontColor : "#666",

			//Boolean - Whether to show a dot for each point
			pointDot : true,

			//Number - Radius of each point dot in pixels
			pointDotRadius : 3,

			//Number - Pixel width of point dot stroke
			pointDotStrokeWidth : 1,

			//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
			pointHitDetectionRadius : 20,

			//Boolean - Whether to show a stroke for datasets
			datasetStroke : true,

			//Number - Pixel width of dataset stroke
			datasetStrokeWidth : 2,

			//Boolean - Whether to fill the dataset with a colour
			datasetFill : true,

			//String - A legend template
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		},

		initialize: function(data){
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,
				radius : this.options.pointDotRadius,
				display: this.options.pointDot,
				hitDetectionRadius : this.options.pointHitDetectionRadius,
				ctx : this.chart.ctx
			});

			this.datasets = [];

			this.buildScale(data);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePointsCollection = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];

					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePointsCollection, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});

					this.showTooltip(activePointsCollection);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label: dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					var pointPosition;
					if (!this.scale.animation){
						pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
					}
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						x: (this.options.animation) ? this.scale.xCenter : pointPosition.x,
						y: (this.options.animation) ? this.scale.yCenter : pointPosition.y,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

			},this);

			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},

		getPointsAtEvent : function(evt){
			var mousePosition = helpers.getRelativePosition(evt),
				fromCenter = helpers.getAngleFromPoint({
					x: this.scale.xCenter,
					y: this.scale.yCenter
				}, mousePosition);

			var anglePerIndex = (Math.PI * 2) /this.scale.valuesCount,
				pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex),
				activePointsCollection = [];

			// If we're at the top, make the pointIndex 0 to get the first of the array.
			if (pointIndex >= this.scale.valuesCount || pointIndex < 0){
				pointIndex = 0;
			}

			if (fromCenter.distance <= this.scale.drawingArea){
				helpers.each(this.datasets, function(dataset){
					activePointsCollection.push(dataset.points[pointIndex]);
				});
			}

			return activePointsCollection;
		},

		buildScale : function(data){
			this.scale = new Chart.RadialScale({
				display: this.options.showScale,
				fontStyle: this.options.scaleFontStyle,
				fontSize: this.options.scaleFontSize,
				fontFamily: this.options.scaleFontFamily,
				fontColor: this.options.scaleFontColor,
				showLabels: this.options.scaleShowLabels,
				showLabelBackdrop: this.options.scaleShowLabelBackdrop,
				backdropColor: this.options.scaleBackdropColor,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
				lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
				lineColor: this.options.scaleLineColor,
				angleLineColor : this.options.angleLineColor,
				angleLineWidth : (this.options.angleShowLineOut) ? this.options.angleLineWidth : 0,
				// Point labels at the edge of each line
				pointLabelFontColor : this.options.pointLabelFontColor,
				pointLabelFontSize : this.options.pointLabelFontSize,
				pointLabelFontFamily : this.options.pointLabelFontFamily,
				pointLabelFontStyle : this.options.pointLabelFontStyle,
				height : this.chart.height,
				width: this.chart.width,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				templateString: this.options.scaleLabel,
				labels: data.labels,
				valuesCount: data.datasets[0].data.length
			});

			this.scale.setScaleSize();
			this.updateScaleRange(data.datasets);
			this.scale.buildYLabels();
		},
		updateScaleRange: function(datasets){
			var valuesArray = (function(){
				var totalDataArray = [];
				helpers.each(datasets,function(dataset){
					if (dataset.data){
						totalDataArray = totalDataArray.concat(dataset.data);
					}
					else {
						helpers.each(dataset.points, function(point){
							totalDataArray.push(point.value);
						});
					}
				});
				return totalDataArray;
			})();


			var scaleSizes = (this.options.scaleOverride) ?
				{
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				} :
				helpers.calculateScaleRange(
					valuesArray,
					helpers.min([this.chart.width, this.chart.height])/2,
					this.options.scaleFontSize,
					this.options.scaleBeginAtZero,
					this.options.scaleIntegersOnly
				);

			helpers.extend(
				this.scale,
				scaleSizes
			);

		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			this.scale.valuesCount++;
			helpers.each(valuesArray,function(value,datasetIndex){
				var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: pointPosition.x,
					y: pointPosition.y,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.labels.push(label);

			this.reflow();

			this.update();
		},
		removeData : function(){
			this.scale.valuesCount--;
			this.scale.labels.shift();
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.reflow();
			this.update();
		},
		update : function(){
			this.eachPoints(function(point){
				point.save();
			});
			this.reflow();
			this.render();
		},
		reflow: function(){
			helpers.extend(this.scale, {
				width : this.chart.width,
				height: this.chart.height,
				size : helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});
			this.updateScaleRange(this.datasets);
			this.scale.setScaleSize();
			this.scale.buildYLabels();
		},
		draw : function(ease){
			var easeDecimal = ease || 1,
				ctx = this.chart.ctx;
			this.clear();
			this.scale.draw();

			helpers.each(this.datasets,function(dataset){

				//Transition each point first so that the line and point drawing isn't out of sync
				helpers.each(dataset.points,function(point,index){
					if (point.hasValue()){
						point.transition(this.scale.getPointPosition(index, this.scale.calculateCenterOffset(point.value)), easeDecimal);
					}
				},this);



				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();
				helpers.each(dataset.points,function(point,index){
					if (index === 0){
						ctx.moveTo(point.x,point.y);
					}
					else{
						ctx.lineTo(point.x,point.y);
					}
				},this);
				ctx.closePath();
				ctx.stroke();

				ctx.fillStyle = dataset.fillColor;
				ctx.fill();

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(dataset.points,function(point){
					if (point.hasValue()){
						point.draw();
					}
				});

			},this);

		}

	});





}).call(this);var sanitize = function sanitize(record) {
    var spaces = Array.prototype.slice.call(arguments, 1);
    return spaces.reduce(function (r, space) {
        return (function () {
            r[space] ? void 0 : r[space] = {};
            return r[space];
        })();
    }, record);
};
var createNode = function createNode(elementType) {
    return function () {
        var nø1 = document.createElement(elementType);
        return (function () {
            nø1.style.padding = 0;
            nø1.style.margin = 0;
            nø1.style.position = 'relative';
            return nø1;
        })();
    }.call(this);
};
var setWrapSize = function setWrapSize(wrap, wh) {
    return function () {
        var setWHø1 = function (w_, h_, x) {
            return (function () {
                x.width = w_ + 'px';
                return x.height = h_ + 'px';
            })();
        };
        var ratioø1 = window.devicePixelRatio ? window.devicePixelRatio : 1;
        var canvasø1 = wrap.firstChild;
        return (function () {
            setWHø1(wh.w * ratioø1, wh.h * ratioø1, canvasø1);
            setWHø1(wh.w, wh.h, wrap.style);
            return setWHø1(wh.w, wh.h, canvasø1.style);
        })();
    }.call(this);
};
var update = function update(type) {
    return function (wrap, _, model) {
        return (function () {
            setWrapSize(wrap, model);
            wrap.__chart ? (function () {
                wrap.__chart.clear();
                return wrap.__chart.destroy();
            })() : void 0;
            wrap.__chart = new Chart(wrap.firstChild.getContext('2d'))[type](model.data, model.options);
            return wrap;
        })();
    };
};
var render = function render(type, NativeElement) {
    return function (model) {
        return function () {
            var wrapø1 = createNode('div');
            var canvasø1 = NativeElement.createNode('canvas');
            return (function () {
                wrapø1.appendChild(canvasø1);
                setWrapSize(wrapø1, model);
                setTimeout(function () {
                    return update(type)(wrapø1, model, model);
                }, 0);
                return wrapø1;
            })();
        }.call(this);
    };
};
var showRGBA = function showRGBA(c) {
    return 'rgba(' + c._0 + ',' + c._1 + ',' + c._2 + ',' + c._3 + ')';
};
var chartRaw = function chartRaw(NativeElement) {
    return function (type, w, h, data, options) {
        return A3(NativeElement.newElement, w, h, {
            'ctor': 'Custom',
            'type': 'Chart',
            'render': render(type, NativeElement),
            'update': update(type),
            'model': {
                'w': w,
                'h': h,
                'data': data,
                'options': options
            }
        });
    };
};
var make = function make(localRuntime) {
    return function () {
        var NativeElementø1 = Elm.Native.Graphics.Element.make(localRuntime);
        var toArrayø1 = (Elm.Native.List.make(localRuntime) || 0)['toArray'];
        return (function () {
            sanitize(localRuntime, 'Native', 'Chartjs');
            return localRuntime.Native.Chartjs.values ? localRuntime.Native.Chartjs.values : localRuntime.Native.Chartjs.values = {
                'toArray': toArrayø1,
                'showRGBA': showRGBA,
                'chartRaw': F5(chartRaw(NativeElementø1))
            };
        })();
    }.call(this);
};
sanitize(Elm, 'Native', 'Chartjs');
Elm.Native.Chartjs.make = make;
Chart.defaults.global.animation = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFub255bW91cy53aXNwIl0sIm5hbWVzIjpbInNhbml0aXplIiwicmVjb3JkIiwic3BhY2VzIiwicmVkdWNlIiwiciIsInNwYWNlIiwiY3JlYXRlTm9kZSIsImVsZW1lbnRUeXBlIiwibsO4MSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlLnBhZGRpbmciLCJzdHlsZS5tYXJnaW4iLCJzdHlsZS5wb3NpdGlvbiIsInNldFdyYXBTaXplIiwid3JhcCIsIndoIiwic2V0V0jDuDEiLCJ3XyIsImhfIiwieCIsIndpZHRoIiwiaGVpZ2h0IiwicmF0aW/DuDEiLCJ3aW5kb3ciLCJkZXZpY2VQaXhlbFJhdGlvIiwiY2FudmFzw7gxIiwiZmlyc3RDaGlsZCIsInciLCJoIiwic3R5bGUiLCJ1cGRhdGUiLCJ0eXBlIiwiXyIsIm1vZGVsIiwiX19jaGFydCIsIl9fY2hhcnQuY2xlYXIiLCJfX2NoYXJ0LmRlc3Ryb3kiLCJmaXJzdENoaWxkLmdldENvbnRleHQiLCJkYXRhIiwib3B0aW9ucyIsInJlbmRlciIsIk5hdGl2ZUVsZW1lbnQiLCJ3cmFww7gxIiwiYXBwZW5kQ2hpbGQiLCJzZXRUaW1lb3V0Iiwic2hvd1JHQkEiLCJjIiwiXzAiLCJfMSIsIl8yIiwiXzMiLCJjaGFydFJhdyIsIkEzIiwibmV3RWxlbWVudCIsIm1ha2UiLCJsb2NhbFJ1bnRpbWUiLCJOYXRpdmVFbGVtZW50w7gxIiwiRWxtIiwiTmF0aXZlLkdyYXBoaWNzLkVsZW1lbnQubWFrZSIsInRvQXJyYXnDuDEiLCJOYXRpdmUuTGlzdC5tYWtlIiwiTmF0aXZlLkNoYXJ0anMudmFsdWVzIiwiRjUiLCJOYXRpdmUuQ2hhcnRqcy5tYWtlIiwiQ2hhcnQiLCJkZWZhdWx0cy5nbG9iYWwuYW5pbWF0aW9uIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPQSxRQUFBLEdBQVAsU0FBT0EsUUFBUCxDQUFpQkMsTUFBakIsRTtRQUEwQkMsTUFBQSxHO0lBQ3hCLE9BQUNBLE1BQUEsQ0FBT0MsTUFBUixDQUFlLFVBQUtDLENBQUwsRUFBT0MsS0FBUCxFQUFjO0FBQUEsZSxhQUMzQjtBQUFBLFlBQVVELENBQU4sQ0FBUUMsS0FBUixDQUFKLEcsTUFBQSxHQUFtQ0QsQ0FBTixDQUFRQyxLQUFSLENBQU4sR0FBcUIsRUFBNUM7QUFBQSxZQUNBLE9BQU1ELENBQU4sQ0FBUUMsS0FBUixFQURBO0FBQUEsUyxDQUFBLEVBRDJCO0FBQUEsS0FBN0IsRUFHQUosTUFIQSxFO0NBREY7QUFNQSxJQUFPSyxVQUFBLEdBQVAsU0FBT0EsVUFBUCxDQUFtQkMsV0FBbkIsRUFDRTtBQUFBLFcsWUFBTTtBQUFBLFlBQUFDLEcsR0FBR0MsUUFBQSxDQUFTQyxhQUFWLENBQXdCSCxXQUF4QixDQUFGO0FBQUEsUUFBd0MsTyxhQUM1QztBQUFBLFlBQU1DLEdBQUEsQ0FBRUcsYUFBUixHQUF1QixDQUF2QjtBQUFBLFlBQ01ILEdBQUEsQ0FBRUksWUFBUixHQUF1QixDQUF2QixDQURBO0FBQUEsWUFFTUosR0FBQSxDQUFFSyxjQUFSLEcsVUFBQSxDQUZBO0FBQUEsWUFHQSxPQUFBTCxHQUFBLENBSEE7QUFBQSxTLENBQUEsRUFENEMsQ0FBeEM7QUFBQSxLLEtBQU4sQyxJQUFBO0FBQUEsQ0FERixDQU5BO0FBYUEsSUFBT00sV0FBQSxHQUFQLFNBQU9BLFdBQVAsQ0FBb0JDLElBQXBCLEVBQXlCQyxFQUF6QixFQUE2QjtBQUFBLFcsWUFDMUI7QUFBQSxZQUFBQyxPLEdBQU0sVUFBS0MsRUFBTCxFQUFTQyxFQUFULEVBQWFDLENBQWIsRUFBZ0I7QUFBQSxtQixhQUNyQjtBQUFBLGdCQUFnQkEsQ0FBVixDQUFHQyxLQUFULEdBQXNCSCxFQUFILEdBQU0sSUFBekI7QUFBQSxnQkFDQSxPQUFnQkUsQ0FBVixDQUFHRSxNQUFULEdBQXNCSCxFQUFILEdBQU0sSUFBekIsQ0FEQTtBQUFBLGEsQ0FBQSxFQURxQjtBQUFBLFNBQXRCO0FBQUEsUUFHQSxJQUFBSSxPLEdBQVVDLE1BQUEsQ0FBT0MsZ0JBQVgsR0FBNEJELE1BQUEsQ0FBT0MsZ0JBQW5DLEdBQW9ELENBQTFELENBSEE7QUFBQSxRQUlBLElBQUFDLFEsR0FBT1gsSUFBQSxDQUFLWSxVQUFaLENBSkE7QUFBQSxRQUtELE8sYUFBSTtBQUFBLFlBQUNWLE9BQUQsQ0FBVUQsRUFBQSxDQUFHWSxDQUFOLEdBQVFMLE9BQWYsRUFBeUJQLEVBQUEsQ0FBR2EsQ0FBTixHQUFRTixPQUE5QixFQUFxQ0csUUFBckM7QUFBQSxZQUNDVCxPQUFELENBQVVELEVBQUEsQ0FBR1ksQ0FBYixFQUF5QlosRUFBQSxDQUFHYSxDQUE1QixFQUFxQ2QsSUFBQSxDQUFLZSxLQUExQyxFQURBO0FBQUEsWUFFQSxPQUFDYixPQUFELENBQVVELEVBQUEsQ0FBR1ksQ0FBYixFQUF5QlosRUFBQSxDQUFHYSxDQUE1QixFQUFxQ0gsUUFBQSxDQUFPSSxLQUE1QyxFQUZBO0FBQUEsUyxDQUFBLEVBQUosQ0FMQztBQUFBLEssS0FEMEIsQyxJQUFBO0FBQUEsQ0FBN0IsQ0FiQTtBQXVCQSxJQUFPQyxNQUFBLEdBQVAsU0FBT0EsTUFBUCxDQUFlQyxJQUFmLEVBQXFCO0FBQUEscUJBQUtqQixJQUFMLEVBQVVrQixDQUFWLEVBQVlDLEtBQVosRUFBbUI7QUFBQSxlLGFBQ3RDO0FBQUEsWUFBQ3BCLFdBQUQsQ0FBYUMsSUFBYixFQUFrQm1CLEtBQWxCO0FBQUEsWUFDSW5CLElBQUEsQ0FBS29CLE9BQVQsRyxhQUFxQjtBQUFBLGdCQUFDcEIsSUFBQSxDQUFLcUIsYUFBTjtBQUFBLGdCQUFxQixPQUFDckIsSUFBQSxDQUFLc0IsZUFBTixHQUFyQjtBQUFBLGEsQ0FBQSxFQUFyQixHLE1BQUEsQ0FEQTtBQUFBLFlBRU10QixJQUFBLENBQUtvQixPQUFYLEdBQ1MsSSxLQUFBLENBQVNwQixJQUFBLENBQUt1QixxQkFBTixDLElBQUEsQ0FBUixDQUFOLENBQWdETixJQUFoRCxDQUFELENBQ0VFLEtBQUEsQ0FBTUssSUFEUixFQUNhTCxLQUFBLENBQU1NLE9BRG5CLENBREYsQ0FGQTtBQUFBLFlBS0EsT0FBQXpCLElBQUEsQ0FMQTtBQUFBLFMsQ0FBQSxFQURzQztBQUFBLEtBQW5CO0FBQUEsQ0FBckIsQ0F2QkE7QUErQkEsSUFBTzBCLE1BQUEsR0FBUCxTQUFPQSxNQUFQLENBQWVULElBQWYsRUFBb0JVLGFBQXBCLEVBQW1DO0FBQUEscUJBQUtSLEtBQUwsRUFDakM7QUFBQSxlLFlBQU07QUFBQSxnQkFBQVMsTSxHQUFNckMsVUFBRCxDLEtBQUEsQ0FBTDtBQUFBLFlBQ0EsSUFBQW9CLFEsR0FBUWdCLGFBQUEsQ0FBY3BDLFVBQWYsQyxRQUFBLENBQVAsQ0FEQTtBQUFBLFlBRUosTyxhQUFJO0FBQUEsZ0JBQUNxQyxNQUFBLENBQUtDLFdBQU4sQ0FBa0JsQixRQUFsQjtBQUFBLGdCQUNDWixXQUFELENBQWE2QixNQUFiLEVBQWtCVCxLQUFsQixFQURBO0FBQUEsZ0JBRUNXLFVBQUQsQ0FBWSxZQUFPO0FBQUEsMkJBQUVkLE1BQUQsQ0FBUUMsSUFBUixDQUFELENBQWVXLE1BQWYsRUFBb0JULEtBQXBCLEVBQTBCQSxLQUExQjtBQUFBLGlCQUFuQixFQUFxRCxDQUFyRCxFQUZBO0FBQUEsZ0JBR0EsT0FBQVMsTUFBQSxDQUhBO0FBQUEsYSxDQUFBLEVBQUosQ0FGSTtBQUFBLFMsS0FBTixDLElBQUE7QUFBQSxLQURpQztBQUFBLENBQW5DLENBL0JBO0FBdUNBLElBQU9HLFFBQUEsR0FBUCxTQUFPQSxRQUFQLENBQWlCQyxDQUFqQixFQUNFO0FBQUEsV0FBRyxPLEdBQVFBLENBQUEsQ0FBRUMsRSxHQUFHLEcsR0FBSUQsQ0FBQSxDQUFFRSxFLEdBQUcsRyxHQUFJRixDQUFBLENBQUVHLEUsR0FBRyxHLEdBQUlILENBQUEsQ0FBRUksRUFBeEMsR0FBMkMsR0FBM0M7QUFBQSxDQURGLENBdkNBO0FBMENBLElBQU9DLFFBQUEsR0FBUCxTQUFPQSxRQUFQLENBQWlCVixhQUFqQixFQUFnQztBQUFBLHFCQUFLVixJQUFMLEVBQVdKLENBQVgsRUFBY0MsQ0FBZCxFQUFpQlUsSUFBakIsRUFBdUJDLE9BQXZCLEVBQzlCO0FBQUEsZUFBQ2EsRUFBRCxDQUFJWCxhQUFBLENBQWNZLFVBQWxCLEVBQTZCMUIsQ0FBN0IsRUFBK0JDLENBQS9CLEVBQWlDO0FBQUEsWSxRQUN2QixRQUR1QjtBQUFBLFksUUFFdkIsT0FGdUI7QUFBQSxZLFVBR3RCWSxNQUFELENBQVFULElBQVIsRUFBYVUsYUFBYixDQUh1QjtBQUFBLFksVUFJdEJYLE1BQUQsQ0FBUUMsSUFBUixDQUp1QjtBQUFBLFksU0FLdkI7QUFBQSxnQixLQUFJSixDQUFKO0FBQUEsZ0IsS0FBU0MsQ0FBVDtBQUFBLGdCLFFBQWlCVSxJQUFqQjtBQUFBLGdCLFdBQStCQyxPQUEvQjtBQUFBLGFBTHVCO0FBQUEsU0FBakM7QUFBQSxLQUQ4QjtBQUFBLENBQWhDLENBMUNBO0FBa0RBLElBQU9lLElBQUEsR0FBUCxTQUFPQSxJQUFQLENBQWFDLFlBQWIsRUFBMkI7QUFBQSxXLFlBQ3hCO0FBQUEsWUFBQUMsZSxHQUFlQyxHQUFBLENBQUlDLDRCQUFMLENBQWtDSCxZQUFsQyxDQUFkO0FBQUEsUUFDQSxJQUFBSSxTLElBQXlCRixHQUFBLENBQUlHLGdCQUFMLENBQXdCTCxZQUF4QixDLE1BQVYsQyxTQUFBLENBQWQsQ0FEQTtBQUFBLFFBRUQsTyxhQUFJO0FBQUEsWUFBQ3hELFFBQUQsQ0FBVXdELFlBQVYsRSxRQUFBLEUsU0FBQTtBQUFBLFlBQ0EsT0FBSUEsWUFBQSxDQUFhTSxxQkFBakIsR0FDSU4sWUFBQSxDQUFhTSxxQkFEakIsR0FFVU4sWUFBQSxDQUFhTSxxQkFBbkIsR0FBeUM7QUFBQSxnQixXQUN6QkYsU0FEeUI7QUFBQSxnQixZQUV6QmQsUUFGeUI7QUFBQSxnQixZQUc1QmlCLEVBQUQsQ0FBS1gsUUFBRCxDQUFVSyxlQUFWLENBQUosQ0FINkI7QUFBQSxhQUY3QyxDQURBO0FBQUEsUyxDQUFBLEVBQUosQ0FGQztBQUFBLEssS0FEd0IsQyxJQUFBO0FBQUEsQ0FBM0IsQ0FsREE7QUE2REN6RCxRQUFELENBQVUwRCxHQUFWLEUsUUFBQSxFLFNBQUEsRUE3REE7QUE4RE1BLEdBQUEsQ0FBSU0sbUJBQVYsR0FBOEJULElBQTlCLENBOURBO0FBK0RNVSxLQUFBLENBQU1DLHlCQUFaLEcsS0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihkZWZuLSBzYW5pdGl6ZSBbcmVjb3JkICYgc3BhY2VzXVxuICAoc3BhY2VzLnJlZHVjZSAoZm4gW3Igc3BhY2VdIChkb1xuICAgIChpZiAoYWdldCByIHNwYWNlKSBuaWwgKHNldCEgKGFnZXQgciBzcGFjZSkge30pKVxuICAgIChhZ2V0IHIgc3BhY2UpKSlcbiAgcmVjb3JkKSlcblxuKGRlZm4tIGNyZWF0ZU5vZGUgW2VsZW1lbnRUeXBlXVxuICAobGV0IFtuIChkb2N1bWVudC5jcmVhdGVFbGVtZW50IGVsZW1lbnRUeXBlKV0gKGRvXG4gICAgKHNldCEgbi5zdHlsZS5wYWRkaW5nICAwKVxuICAgIChzZXQhIG4uc3R5bGUubWFyZ2luICAgMClcbiAgICAoc2V0ISBuLnN0eWxlLnBvc2l0aW9uIDpyZWxhdGl2ZSlcbiAgICBuKSkpXG5cbihkZWZuLSBzZXRXcmFwU2l6ZSBbd3JhcCB3aF0gKGxldFxuICBbc2V0V0ggKGZuIFt3KiwgaCosIHhdIChkb1xuICAgIChzZXQhICguLXdpZHRoICB4KSAoKyB3KiBcInB4XCIpKVxuICAgIChzZXQhICguLWhlaWdodCB4KSAoKyBoKiBcInB4XCIpKSkpXG4gICByYXRpbyAoaWYgd2luZG93LmRldmljZVBpeGVsUmF0aW8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gMSlcbiAgIGNhbnZhcyB3cmFwLmZpcnN0Q2hpbGRdXG4gIChkbyAoc2V0V0ggKCogd2gudyByYXRpbykgKCogd2guaCByYXRpbykgY2FudmFzKVxuICAgICAgKHNldFdIICAgIHdoLncgICAgICAgICAgIHdoLmggICAgICAgIHdyYXAuc3R5bGUpXG4gICAgICAoc2V0V0ggICAgd2gudyAgICAgICAgICAgd2guaCAgICAgICAgY2FudmFzLnN0eWxlKSkpKVxuXG4oZGVmbi0gdXBkYXRlIFt0eXBlXSAoZm4gW3dyYXAgXyBtb2RlbF0gKGRvXG4gIChzZXRXcmFwU2l6ZSB3cmFwIG1vZGVsKVxuICAoaWYgd3JhcC5fX2NoYXJ0IChkbyAod3JhcC5fX2NoYXJ0LmNsZWFyKSAod3JhcC5fX2NoYXJ0LmRlc3Ryb3kpKSlcbiAgKHNldCEgd3JhcC5fX2NoYXJ0XG4gICAgKChhZ2V0IChDaGFydC4gKHdyYXAuZmlyc3RDaGlsZC5nZXRDb250ZXh0IDoyZCkpIHR5cGUpXG4gICAgICBtb2RlbC5kYXRhIG1vZGVsLm9wdGlvbnMpKVxuICB3cmFwKSkpXG5cbihkZWZuLSByZW5kZXIgW3R5cGUgTmF0aXZlRWxlbWVudF0gKGZuIFttb2RlbF1cbiAgKGxldCBbd3JhcCAoY3JlYXRlTm9kZSA6ZGl2KVxuICAgICAgICBjYW52YXMgKE5hdGl2ZUVsZW1lbnQuY3JlYXRlTm9kZSA6Y2FudmFzKV1cbiAgICAoZG8gKHdyYXAuYXBwZW5kQ2hpbGQgY2FudmFzKVxuICAgICAgICAoc2V0V3JhcFNpemUgd3JhcCBtb2RlbClcbiAgICAgICAgKHNldFRpbWVvdXQgKGZuIFtdICgodXBkYXRlIHR5cGUpIHdyYXAgbW9kZWwgbW9kZWwpKSAwKVxuICAgICAgICB3cmFwKSkpKVxuXG4oZGVmbi0gc2hvd1JHQkEgW2NdXG4gICgrIFwicmdiYShcIiBjLl8wIFwiLFwiIGMuXzEgXCIsXCIgYy5fMiBcIixcIiBjLl8zIFwiKVwiKSlcblxuKGRlZm4tIGNoYXJ0UmF3IFtOYXRpdmVFbGVtZW50XSAoZm4gW3R5cGUsIHcsIGgsIGRhdGEsIG9wdGlvbnNdXG4gIChBMyBOYXRpdmVFbGVtZW50Lm5ld0VsZW1lbnQgdyBoIHtcbiAgICA6Y3RvciAgIFwiQ3VzdG9tXCJcbiAgICA6dHlwZSAgIFwiQ2hhcnRcIlxuICAgIDpyZW5kZXIgKHJlbmRlciB0eXBlIE5hdGl2ZUVsZW1lbnQpXG4gICAgOnVwZGF0ZSAodXBkYXRlIHR5cGUpXG4gICAgOm1vZGVsICB7OncgdyA6aCBoIDpkYXRhIGRhdGEgOm9wdGlvbnMgb3B0aW9uc319KSkpXG5cbihkZWZuLSBtYWtlIFtsb2NhbFJ1bnRpbWVdIChsZXRcbiAgW05hdGl2ZUVsZW1lbnQgKEVsbS5OYXRpdmUuR3JhcGhpY3MuRWxlbWVudC5tYWtlIGxvY2FsUnVudGltZSlcbiAgIHRvQXJyYXkgICAgICAgKDp0b0FycmF5IChFbG0uTmF0aXZlLkxpc3QubWFrZSAgIGxvY2FsUnVudGltZSkpXVxuICAoZG8gKHNhbml0aXplIGxvY2FsUnVudGltZSA6TmF0aXZlIDpDaGFydGpzKVxuICAgICAgKGlmIGxvY2FsUnVudGltZS5OYXRpdmUuQ2hhcnRqcy52YWx1ZXNcbiAgICAgICAgICBsb2NhbFJ1bnRpbWUuTmF0aXZlLkNoYXJ0anMudmFsdWVzXG4gICAgICAgICAgKHNldCEgbG9jYWxSdW50aW1lLk5hdGl2ZS5DaGFydGpzLnZhbHVlcyB7XG4gICAgICAgICAgICA6dG9BcnJheSAgICAgIHRvQXJyYXlcbiAgICAgICAgICAgIDpzaG93UkdCQSAgICAgc2hvd1JHQkFcbiAgICAgICAgICAgIDpjaGFydFJhdyAoRjUgKGNoYXJ0UmF3IE5hdGl2ZUVsZW1lbnQpKX0pKSkpKVxuXG4oc2FuaXRpemUgRWxtIDpOYXRpdmUgOkNoYXJ0anMpXG4oc2V0ISBFbG0uTmF0aXZlLkNoYXJ0anMubWFrZSBtYWtlKVxuKHNldCEgQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmFuaW1hdGlvbiBmYWxzZSlcbiJdfQ==

Elm.Chartjs = Elm.Chartjs || {};
Elm.Chartjs.make = function (_elm) {
   "use strict";
   _elm.Chartjs = _elm.Chartjs || {};
   if (_elm.Chartjs.values) return _elm.Chartjs.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Color = Elm.Color.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Chartjs = Elm.Native.Chartjs.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var chartRaw = $Native$Chartjs.chartRaw;
   var showRGBA = $Native$Chartjs.showRGBA;
   var toArray = $Native$Chartjs.toArray;
   var JSArray = {ctor: "JSArray"};
   return _elm.Chartjs.values = {_op: _op,JSArray: JSArray,toArray: toArray,showRGBA: showRGBA,chartRaw: chartRaw};
};
Elm.Chartjs = Elm.Chartjs || {};
Elm.Chartjs.Line = Elm.Chartjs.Line || {};
Elm.Chartjs.Line.make = function (_elm) {
   "use strict";
   _elm.Chartjs = _elm.Chartjs || {};
   _elm.Chartjs.Line = _elm.Chartjs.Line || {};
   if (_elm.Chartjs.Line.values) return _elm.Chartjs.Line.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Chartjs = Elm.Chartjs.make(_elm),
   $Color = Elm.Color.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var decodeConfig = function (_p0) {
      var _p1 = _p0;
      var decode = function (_p2) {
         var _p3 = _p2;
         var _p4 = _p3._1;
         return {label: _p3._0
                ,fillColor: $Chartjs.showRGBA(_p4.fillColor)
                ,strokeColor: $Chartjs.showRGBA(_p4.strokeColor)
                ,pointColor: $Chartjs.showRGBA(_p4.pointColor)
                ,pointStrokeColor: $Chartjs.showRGBA(_p4.pointStrokeColor)
                ,pointHighlightFill: $Chartjs.showRGBA(_p4.pointHighlightFill)
                ,pointHighlightStroke: $Chartjs.showRGBA(_p4.pointHighlightStroke)
                ,data: $Chartjs.toArray(_p3._2)};
      };
      return {labels: $Chartjs.toArray(_p1._0),datasets: $Chartjs.toArray(A2($List.map,decode,_p1._1))};
   };
   var ConfigRaw = F2(function (a,b) {    return {labels: a,datasets: b};});
   var defStyle = function (f) {
      return {fillColor: f(0.2)
             ,strokeColor: f(1.0)
             ,pointColor: f(1.0)
             ,pointStrokeColor: $Color.white
             ,pointHighlightFill: $Color.white
             ,pointHighlightStroke: f(1.0)};
   };
   var defaultStyle = defStyle(A3($Color.rgba,220,220,220));
   var Style = F6(function (a,b,c,d,e,f) {
      return {fillColor: a,strokeColor: b,pointColor: c,pointStrokeColor: d,pointHighlightFill: e,pointHighlightStroke: f};
   });
   var defaultOptions = {scaleShowGridLines: true
                        ,scaleGridLineColor: A4($Color.rgba,0,0,0,5.0e-2)
                        ,scaleGridLineWidth: 1.0
                        ,scaleShowHorizontalLines: true
                        ,scaleShowVerticalLines: true
                        ,bezierCurve: true
                        ,bezierCurveTension: 0.4
                        ,pointDot: true
                        ,pointDotRadius: 4.0
                        ,pointDotStrokeWidth: 1.0
                        ,pointHitDetectionRadius: 20.0
                        ,datasetStroke: true
                        ,datasetStrokeWidth: 2.0
                        ,datasetFill: true
                        ,legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"};
   var decodeOptions = function (o) {    return _U.update(o,{scaleGridLineColor: $Chartjs.showRGBA(o.scaleGridLineColor)});};
   var chart = F4(function (w,h,c,o) {    return A5($Chartjs.chartRaw,"Line",w,h,decodeConfig(c),decodeOptions(o));});
   var chart$ = F3(function (w,h,c) {    return A4(chart,w,h,c,defaultOptions);});
   var OptionsRaw = function (a) {
      return function (b) {
         return function (c) {
            return function (d) {
               return function (e) {
                  return function (f) {
                     return function (g) {
                        return function (h) {
                           return function (i) {
                              return function (j) {
                                 return function (k) {
                                    return function (l) {
                                       return function (m) {
                                          return function (n) {
                                             return function (o) {
                                                return {scaleShowGridLines: a
                                                       ,scaleGridLineColor: b
                                                       ,scaleGridLineWidth: c
                                                       ,scaleShowHorizontalLines: d
                                                       ,scaleShowVerticalLines: e
                                                       ,bezierCurve: f
                                                       ,bezierCurveTension: g
                                                       ,pointDot: h
                                                       ,pointDotRadius: i
                                                       ,pointDotStrokeWidth: j
                                                       ,pointHitDetectionRadius: k
                                                       ,datasetStroke: l
                                                       ,datasetStrokeWidth: m
                                                       ,datasetFill: n
                                                       ,legendTemplate: o};
                                             };
                                          };
                                       };
                                    };
                                 };
                              };
                           };
                        };
                     };
                  };
               };
            };
         };
      };
   };
   var Options = function (a) {
      return function (b) {
         return function (c) {
            return function (d) {
               return function (e) {
                  return function (f) {
                     return function (g) {
                        return function (h) {
                           return function (i) {
                              return function (j) {
                                 return function (k) {
                                    return function (l) {
                                       return function (m) {
                                          return function (n) {
                                             return function (o) {
                                                return {scaleShowGridLines: a
                                                       ,scaleGridLineColor: b
                                                       ,scaleGridLineWidth: c
                                                       ,scaleShowHorizontalLines: d
                                                       ,scaleShowVerticalLines: e
                                                       ,bezierCurve: f
                                                       ,bezierCurveTension: g
                                                       ,pointDot: h
                                                       ,pointDotRadius: i
                                                       ,pointDotStrokeWidth: j
                                                       ,pointHitDetectionRadius: k
                                                       ,datasetStroke: l
                                                       ,datasetStrokeWidth: m
                                                       ,datasetFill: n
                                                       ,legendTemplate: o};
                                             };
                                          };
                                       };
                                    };
                                 };
                              };
                           };
                        };
                     };
                  };
               };
            };
         };
      };
   };
   return _elm.Chartjs.Line.values = {_op: _op
                                     ,chart: chart
                                     ,chart$: chart$
                                     ,defaultOptions: defaultOptions
                                     ,defStyle: defStyle
                                     ,defaultStyle: defaultStyle
                                     ,Options: Options
                                     ,Style: Style};
};
Elm.Jobs = Elm.Jobs || {};
Elm.Jobs.Stats = Elm.Jobs.Stats || {};
Elm.Jobs.Stats.make = function (_elm) {
   "use strict";
   _elm.Jobs = _elm.Jobs || {};
   _elm.Jobs.Stats = _elm.Jobs.Stats || {};
   if (_elm.Jobs.Stats.values) return _elm.Jobs.Stats.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Bootstrap$Html = Elm.Bootstrap.Html.make(_elm),
   $Chartjs$Line = Elm.Chartjs.Line.make(_elm),
   $Color = Elm.Color.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Common$Utils = Elm.Common.Utils.make(_elm),
   $Date = Elm.Date.make(_elm),
   $Date$Format = Elm.Date.Format.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Now = Elm.Now.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Task = Elm.Task.make(_elm),
   $Time = Elm.Time.make(_elm);
   var _op = {};
   var rgbString = function (color) {
      var _p0 = $Color.toRgb(color);
      var red = _p0.red;
      var green = _p0.green;
      var blue = _p0.blue;
      var alpha = _p0.alpha;
      var rgba = A2($String.join,",",A2($List.append,A2($List.map,$Basics.toString,_U.list([red,green,blue])),_U.list([$Basics.toString(alpha)])));
      return A2($Basics._op["++"],"rgba(",A2($Basics._op["++"],rgba,")"));
   };
   var item = function (_p1) {
      var _p2 = _p1;
      return A2($Html.li,
      _U.list([]),
      _U.list([A2($Html.div,
      _U.list([]),
      _U.list([A2($Html.span,_U.list([$Html$Attributes.style(_U.list([{ctor: "_Tuple2",_0: "background-color",_1: _p2._1}]))]),_U.list([]))
              ,$Html.text(_p2._0)]))]));
   };
   var legend = function (items) {    return A2($Html.ul,_U.list([$Html$Attributes.$class("legend")]),A2($List.map,item,items));};
   var chart = F2(function (_p3,header) {
      var _p4 = _p3;
      return A2($Html.div,
      _U.list([$Html$Attributes.$class("col-md-6")]),
      _U.list([$Bootstrap$Html.panelDefault_(_U.list([$Bootstrap$Html.panelHeading_(_U.list([$Html.text(header)]))
                                                     ,$Bootstrap$Html.panelBody_(_U.list([$Html.fromElement(A4($Chartjs$Line.chart,
                                                                                         500,
                                                                                         200,
                                                                                         _p4,
                                                                                         _U.update($Chartjs$Line.defaultOptions,{datasetFill: false})))
                                                                                         ,legend(A2($List.map,
                                                                                         function (_p5) {
                                                                                            var _p6 = _p5;
                                                                                            return {ctor: "_Tuple2"
                                                                                                   ,_0: _p6._0
                                                                                                   ,_1: rgbString(_p6._1.pointColor)};
                                                                                         },
                                                                                         _p4._1))]))]))]));
   });
   var view = F2(function (address,_p7) {
      var _p8 = _p7;
      return A2($List.map,
      $Bootstrap$Html.row_,
      A2($Common$Utils.partition,2,A2($List.map,function (_p9) {    var _p10 = _p9;return A2(chart,_p10._1,_p10._0);},_p8.charts)));
   });
   var meanMaxMin = function (polls) {
      var reloadTimes = A2($List.map,function (_p11) {    var _p12 = _p11;return {ctor: "_Tuple2",_0: _p12._0,_1: _p12._1.reloadTimer};},polls);
      var provisionTimes = A2($List.map,function (_p13) {    var _p14 = _p13;return {ctor: "_Tuple2",_0: _p14._0,_1: _p14._1.provisionTimer};},polls);
      var stopTimes = A2($List.map,function (_p15) {    var _p16 = _p15;return {ctor: "_Tuple2",_0: _p16._0,_1: _p16._1.stopTimer};},polls);
      var startTimes = A2($List.map,function (_p17) {    var _p18 = _p17;return {ctor: "_Tuple2",_0: _p18._0,_1: _p18._1.startTimer};},polls);
      return {ctor: "_Tuple5"
             ,_0: _U.list([function (_p19) {
                             var _p20 = _p19;
                             return _p20.mean;
                          }
                          ,function (_p21) {
                             var _p22 = _p21;
                             return _p22.min;
                          }
                          ,function (_p23) {
                             var _p24 = _p23;
                             return _p24.max;
                          }])
             ,_1: _U.list(["mean","min","max"])
             ,_2: _U.list([A3($Color.rgba,204,204,255),A3($Color.rgba,153,204,255),A3($Color.rgba,51,153,255)])
             ,_3: _U.list([startTimes,stopTimes,provisionTimes,reloadTimes])
             ,_4: _U.list(["Start","Stop","Provision","Reload"])};
   };
   var pollingTrim = F2(function (_p25,metrics) {
      var _p26 = _p25;
      var _p28 = _p26.polls;
      var _p27 = _p26.lastPoll;
      return _U.cmp($List.length(_p28),10) < 0 ? A2($List.append,_p28,_U.list([{ctor: "_Tuple2",_0: _p27,_1: metrics}])) : A2($List.append,
      A2($Maybe.withDefault,_U.list([]),$List.tail(_p28)),
      _U.list([{ctor: "_Tuple2",_0: _p27,_1: metrics}]));
   });
   var timerConfig = F4(function (xs,ysList,titles,styles) {
      return {ctor: "_Tuple2"
             ,_0: xs
             ,_1: A4($List.map3,
             F3(function (ys,title,style) {    return {ctor: "_Tuple3",_0: title,_1: $Chartjs$Line.defStyle(style),_2: ys};}),
             ysList,
             titles,
             styles)};
   });
   var timerChart = F4(function (timers,selectors,titles,styles) {
      var ysList = A2($List.map,
      function (selector) {
         return A2($List.map,function (_p29) {    var _p30 = _p29;return selector(_p30._1) / $Time.second;},timers);
      },
      selectors);
      var xs = A2($List.map,function (_p31) {    var _p32 = _p31;return A2($Date$Format.format,"%H:%M:%S",$Date.fromTime(_p32._0));},timers);
      return A4(timerConfig,xs,ysList,titles,styles);
   });
   var setMetrics = F2(function (_p33,metrics) {
      var _p34 = _p33;
      var _p36 = _p34;
      var _p35 = meanMaxMin(_p34.polls);
      var selectors = _p35._0;
      var titles = _p35._1;
      var styles = _p35._2;
      var samples = _p35._3;
      var headers = _p35._4;
      var newCharts = A3($List.map2,
      F2(function (sample,header) {    return {ctor: "_Tuple2",_0: header,_1: A4(timerChart,sample,selectors,titles,styles)};}),
      samples,
      headers);
      var newPolls = A2(pollingTrim,_p36,metrics);
      return {ctor: "_Tuple2",_0: _U.update(_p36,{polls: newPolls,charts: newCharts}),_1: $Effects.none};
   });
   var emptyTimer = {min: 0,max: 0,mean: 0};
   var NoOp = {ctor: "NoOp"};
   var Load = function (a) {    return {ctor: "Load",_0: a};};
   var PollMetrics = function (a) {    return {ctor: "PollMetrics",_0: a};};
   var Model = F4(function (a,b,c,d) {    return {polls: a,charts: b,lastPoll: c,interval: d};});
   var Metrics = F4(function (a,b,c,d) {    return {startTimer: a,stopTimer: b,provisionTimer: c,reloadTimer: d};});
   var Timer = F3(function (a,b,c) {    return {max: a,min: b,mean: c};});
   var timer = A4($Json$Decode.object3,
   Timer,
   A2($Json$Decode._op[":="],"max",$Json$Decode.$float),
   A2($Json$Decode._op[":="],"min",$Json$Decode.$float),
   A2($Json$Decode._op[":="],"mean",$Json$Decode.$float));
   var metricsDecoder = A5($Json$Decode.object4,
   Metrics,
   A2($Json$Decode.at,_U.list(["default.default.start-time"]),timer),
   A2($Json$Decode.at,_U.list(["default.default.stop-time"]),timer),
   A2($Json$Decode.at,_U.list(["default.default.provision-time"]),timer),
   A2($Json$Decode.at,_U.list(["default.default.reload-time"]),timer));
   var getMetrics = $Effects.task(A2($Task.map,Load,$Task.toResult(A2($Http.get,metricsDecoder,"/metrics"))));
   var init = {ctor: "_Tuple2",_0: A4(Model,_U.list([]),_U.list([]),$Now.loadTime,15),_1: getMetrics};
   var update = F2(function (action,_p37) {
      var _p38 = _p37;
      var _p40 = _p38;
      var _p39 = action;
      switch (_p39.ctor)
      {case "PollMetrics": return {ctor: "_Tuple2",_0: _U.update(_p40,{lastPoll: _p39._0}),_1: getMetrics};
         case "Load": return A4($Common$Redirect.successHandler,_p39._0,_p40,setMetrics(_p40),NoOp);
         default: return {ctor: "_Tuple2",_0: _p40,_1: $Effects.none};}
   });
   return _elm.Jobs.Stats.values = {_op: _op
                                   ,Timer: Timer
                                   ,Metrics: Metrics
                                   ,Model: Model
                                   ,PollMetrics: PollMetrics
                                   ,Load: Load
                                   ,NoOp: NoOp
                                   ,emptyTimer: emptyTimer
                                   ,init: init
                                   ,timerConfig: timerConfig
                                   ,timerChart: timerChart
                                   ,pollingTrim: pollingTrim
                                   ,meanMaxMin: meanMaxMin
                                   ,setMetrics: setMetrics
                                   ,update: update
                                   ,item: item
                                   ,legend: legend
                                   ,rgbString: rgbString
                                   ,chart: chart
                                   ,view: view
                                   ,timer: timer
                                   ,metricsDecoder: metricsDecoder
                                   ,getMetrics: getMetrics};
};
Elm.Nav = Elm.Nav || {};
Elm.Nav.Side = Elm.Nav.Side || {};
Elm.Nav.Side.make = function (_elm) {
   "use strict";
   _elm.Nav = _elm.Nav || {};
   _elm.Nav.Side = _elm.Nav.Side || {};
   if (_elm.Nav.Side.values) return _elm.Nav.Side.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Shorthand = Elm.Html.Shorthand.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var _op = {};
   var update = F2(function (action,model) {    var _p0 = action;return _U.update(model,{active: _p0._0,section: _p0._1});});
   var Goto = F2(function (a,b) {    return {ctor: "Goto",_0: a,_1: b};});
   var sectionItem = F3(function (address,active,section) {
      return $Html$Shorthand.li_(_U.list([A2($Html.a,
      _U.list([$Html$Attributes.$class(""),$Html$Attributes.href("#"),A2($Html$Events.onClick,address,A2(Goto,active,section))]),
      _U.list([$Html.text($Basics.toString(section))]))]));
   });
   var drop = F3(function (address,active,actions) {
      return A2($Html.li,
      _U.list([$Html$Attributes.$class("treeview")]),
      _U.list([A2($Html.a,
              _U.list([$Html$Attributes.href("#")]),
              _U.list([A2($Html.i,_U.list([$Html$Attributes.$class("fa fa-link")]),_U.list([]))
                      ,A2($Html.span,_U.list([]),_U.list([$Html.text($Basics.toString(active))]))
                      ,A2($Html.i,_U.list([$Html$Attributes.$class("fa fa-angle-left pull-right")]),_U.list([]))]))
              ,A2($Html.ul,
              _U.list([$Html$Attributes.$class("treeview-menu")]),
              A2($List.map,function (section) {    return A3(sectionItem,address,active,section);},actions))]));
   });
   var Model = F2(function (a,b) {    return {active: a,section: b};});
   var Stats = {ctor: "Stats"};
   var View = {ctor: "View"};
   var List = {ctor: "List"};
   var Launch = {ctor: "Launch"};
   var Add = {ctor: "Add"};
   var Jobs = {ctor: "Jobs"};
   var Types = {ctor: "Types"};
   var Systems = {ctor: "Systems"};
   var init = {active: Systems,section: List};
   var menus = function (address) {
      return _U.list([A3(drop,address,Systems,_U.list([List,Add])),A3(drop,address,Types,_U.list([List,Add])),A3(drop,address,Jobs,_U.list([List,Stats]))]);
   };
   var view = F2(function (address,model) {
      return _U.list([A2($Html.aside,
      _U.list([$Html$Attributes.$class("main-sidebar")]),
      _U.list([A2($Html.section,
      _U.list([$Html$Attributes.$class("sidebar")]),
      _U.list([A2($Html.ul,_U.list([$Html$Attributes.$class("sidebar-menu")]),menus(address))]))]))]);
   });
   return _elm.Nav.Side.values = {_op: _op
                                 ,Systems: Systems
                                 ,Types: Types
                                 ,Jobs: Jobs
                                 ,Add: Add
                                 ,Launch: Launch
                                 ,List: List
                                 ,View: View
                                 ,Stats: Stats
                                 ,Model: Model
                                 ,init: init
                                 ,Goto: Goto
                                 ,update: update
                                 ,sectionItem: sectionItem
                                 ,drop: drop
                                 ,menus: menus
                                 ,view: view};
};
Elm.Users = Elm.Users || {};
Elm.Users.Session = Elm.Users.Session || {};
Elm.Users.Session.make = function (_elm) {
   "use strict";
   _elm.Users = _elm.Users || {};
   _elm.Users.Session = _elm.Users.Session || {};
   if (_elm.Users.Session.values) return _elm.Users.Session.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Json$Decode = Elm.Json.Decode.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Task = Elm.Task.make(_elm);
   var _op = {};
   var logout = function (action) {    return $Effects.task(A2($Task.map,action,$Task.toResult($Http.getString("/logout"))));};
   var Session = F5(function (a,b,c,d,e) {    return {envs: a,identity: b,operations: c,roles: d,username: e};});
   var emptySession = A5(Session,_U.list([]),"",_U.list([]),_U.list([]),"");
   var session = A6($Json$Decode.object5,
   Session,
   A2($Json$Decode._op[":="],"envs",$Json$Decode.list($Json$Decode.string)),
   A2($Json$Decode._op[":="],"identity",$Json$Decode.string),
   A2($Json$Decode._op[":="],"operations",$Json$Decode.list($Json$Decode.string)),
   A2($Json$Decode._op[":="],"roles",$Json$Decode.list($Json$Decode.string)),
   A2($Json$Decode._op[":="],"username",$Json$Decode.string));
   var getSession = function (action) {    return $Effects.task(A2($Task.map,action,$Task.toResult(A2($Http.get,session,"/sessions"))));};
   return _elm.Users.Session.values = {_op: _op,Session: Session,emptySession: emptySession,session: session,getSession: getSession,logout: logout};
};
Elm.Nav = Elm.Nav || {};
Elm.Nav.Header = Elm.Nav.Header || {};
Elm.Nav.Header.make = function (_elm) {
   "use strict";
   _elm.Nav = _elm.Nav || {};
   _elm.Nav.Header = _elm.Nav.Header || {};
   if (_elm.Nav.Header.values) return _elm.Nav.Header.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Http = Elm.Http.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Users$Session = Elm.Users.Session.make(_elm);
   var _op = {};
   var navHeader = A2($Html.div,
   _U.list([$Html$Attributes.$class("navbar-header")]),
   _U.list([A2($Html.img,
   _U.list([$Html$Attributes.src("assets/img/cropped.png"),$Html$Attributes.alt("Celestial"),$Html$Attributes.width(110),$Html$Attributes.height(50)]),
   _U.list([]))]));
   var setSession = F2(function (model,session) {    return {ctor: "_Tuple2",_0: _U.update(model,{session: session}),_1: $Effects.none};});
   var NoOp = {ctor: "NoOp"};
   var Redirect = function (a) {    return {ctor: "Redirect",_0: a};};
   var update = F2(function (action,model) {
      var _p0 = action;
      switch (_p0.ctor)
      {case "LoadSession": return A4($Common$Redirect.successHandler,_p0._0,model,setSession(model),NoOp);
         case "SignOut": return {ctor: "_Tuple2",_0: model,_1: $Users$Session.logout(Redirect)};
         case "Redirect": return {ctor: "_Tuple2",_0: model,_1: $Common$Redirect.redirect(NoOp)};
         default: return {ctor: "_Tuple2",_0: model,_1: $Effects.none};}
   });
   var SignOut = {ctor: "SignOut"};
   var topNav = F2(function (address,_p1) {
      var _p2 = _p1;
      return A2($Html.div,
      _U.list([$Html$Attributes.$class("navbar-custom-menu")]),
      _U.list([A2($Html.ul,
      _U.list([$Html$Attributes.$class("nav navbar-nav")]),
      _U.list([A2($Html.li,
              _U.list([$Html$Attributes.$class("dropdown user user-menu")]),
              _U.list([A2($Html.a,
                      _U.list([A2($Html$Attributes.attribute,"aria-expanded","false")
                              ,$Html$Attributes.$class("dropdown-toggle")
                              ,A2($Html$Attributes.attribute,"data-toggle","dropdown")
                              ,$Html$Attributes.href("#")]),
                      _U.list([A2($Html.span,_U.list([$Html$Attributes.$class("hidden-xs")]),_U.list([$Html.text(_p2.username)]))]))
                      ,A2($Html.ul,
                      _U.list([$Html$Attributes.$class("dropdown-menu")]),
                      _U.list([A2($Html.li,
                              _U.list([$Html$Attributes.$class("user-header")]),
                              _U.list([A2($Html.p,
                              _U.list([]),
                              _U.list([$Html.text(A2($Basics._op["++"],"Environments you can access: ",A2($String.join," ",_p2.envs)))]))]))
                              ,A2($Html.li,_U.list([$Html$Attributes.$class("user-body")]),_U.list([]))
                              ,A2($Html.li,
                              _U.list([$Html$Attributes.$class("user-footer")]),
                              _U.list([A2($Html.div,
                                      _U.list([$Html$Attributes.$class("pull-left")]),
                                      _U.list([A2($Html.a,
                                      _U.list([$Html$Attributes.$class("btn btn-default btn-flat"),$Html$Attributes.href("#")]),
                                      _U.list([$Html.text("Profile")]))]))
                                      ,A2($Html.div,
                                      _U.list([$Html$Attributes.$class("pull-right")]),
                                      _U.list([A2($Html.a,
                                      _U.list([$Html$Attributes.$class("btn btn-default btn-flat")
                                              ,$Html$Attributes.href("#")
                                              ,A2($Html$Events.onClick,address,SignOut)]),
                                      _U.list([$Html.text("Sign out")]))]))]))]))]))
              ,A2($Html.li,
              _U.list([]),
              _U.list([A2($Html.a,
              _U.list([A2($Html$Attributes.attribute,"data-toggle","control-sidebar"),$Html$Attributes.href("#")]),
              _U.list([A2($Html.i,_U.list([$Html$Attributes.$class("fa fa-gears")]),_U.list([]))]))]))]))]));
   });
   var view = F2(function (address,_p3) {
      var _p4 = _p3;
      return _U.list([A2($Html.header,
      _U.list([$Html$Attributes.$class("main-header")]),
      _U.list([A2($Html.a,
              _U.list([$Html$Attributes.href("/index.html"),$Html$Attributes.$class("logo")]),
              _U.list([A2($Html.span,_U.list([$Html$Attributes.$class("logo-mini")]),_U.list([$Html.text("CEL")]))
                      ,A2($Html.span,_U.list([$Html$Attributes.$class("logo-lg")]),_U.list([navHeader]))]))
              ,A2($Html.nav,
              _U.list([$Html$Attributes.$class("navbar navbar-static-top"),A2($Html$Attributes.attribute,"role","navigation")]),
              _U.list([A2($Html.a,
                      _U.list([$Html$Attributes.href("#")
                              ,$Html$Attributes.$class("sidebar-toggle")
                              ,A2($Html$Attributes.attribute,"data-toggle","offcanvas")
                              ,A2($Html$Attributes.attribute,"role","button")]),
                      _U.list([A2($Html.span,_U.list([$Html$Attributes.$class("sr-only")]),_U.list([$Html.text("Toggle navigation")]))]))
                      ,A2(topNav,address,_p4.session)]))]))]);
   });
   var LoadSession = function (a) {    return {ctor: "LoadSession",_0: a};};
   var Model = function (a) {    return {session: a};};
   var init = {ctor: "_Tuple2",_0: Model($Users$Session.emptySession),_1: $Users$Session.getSession(LoadSession)};
   return _elm.Nav.Header.values = {_op: _op
                                   ,Model: Model
                                   ,init: init
                                   ,LoadSession: LoadSession
                                   ,SignOut: SignOut
                                   ,Redirect: Redirect
                                   ,NoOp: NoOp
                                   ,setSession: setSession
                                   ,update: update
                                   ,navHeader: navHeader
                                   ,topNav: topNav
                                   ,view: view};
};
Elm.Application = Elm.Application || {};
Elm.Application.make = function (_elm) {
   "use strict";
   _elm.Application = _elm.Application || {};
   if (_elm.Application.values) return _elm.Application.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Jobs$List = Elm.Jobs.List.make(_elm),
   $Jobs$Stats = Elm.Jobs.Stats.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Nav$Header = Elm.Nav.Header.make(_elm),
   $Nav$Side = Elm.Nav.Side.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Set = Elm.Set.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Systems$Add = Elm.Systems.Add.make(_elm),
   $Systems$Launch = Elm.Systems.Launch.make(_elm),
   $Systems$List = Elm.Systems.List.make(_elm),
   $Systems$View = Elm.Systems.View.make(_elm),
   $Table = Elm.Table.make(_elm),
   $Types$List = Elm.Types.List.make(_elm);
   var _op = {};
   var systemListing = function (_p0) {
      var _p1 = _p0;
      return {ctor: "_Tuple2"
             ,_0: _U.update(_p1,{navSide: A2($Nav$Side.update,A2($Nav$Side.Goto,$Nav$Side.Systems,$Nav$Side.List),_p1.navSide)})
             ,_1: $Effects.none};
   };
   var TypesListing = function (a) {    return {ctor: "TypesListing",_0: a};};
   var NavHeaderAction = function (a) {    return {ctor: "NavHeaderAction",_0: a};};
   var NavSideAction = function (a) {    return {ctor: "NavSideAction",_0: a};};
   var JobsStats = function (a) {    return {ctor: "JobsStats",_0: a};};
   var JobsList = function (a) {    return {ctor: "JobsList",_0: a};};
   var jobListing = function (_p2) {
      var _p3 = _p2;
      var newNavSide = A2($Nav$Side.update,A2($Nav$Side.Goto,$Nav$Side.Jobs,$Nav$Side.List),_p3.navSide);
      var _p4 = $Jobs$List.init;
      var newJobs = _p4._0;
      var effects = _p4._1;
      return {ctor: "_Tuple2",_0: _U.update(_p3,{navSide: newNavSide,jobsList: newJobs}),_1: A2($Effects.map,JobsList,effects)};
   };
   var SystemsLaunch = function (a) {    return {ctor: "SystemsLaunch",_0: a};};
   var setupJob = F2(function (action,_p5) {
      var _p6 = _p5;
      var _p12 = _p6.systemsList;
      var _p11 = _p6;
      var newNavSide = A2($Nav$Side.update,A2($Nav$Side.Goto,$Nav$Side.Systems,$Nav$Side.Launch),_p11.navSide);
      var table = _p12.table;
      var _p7 = _p12.systems;
      var systems = _p7._1;
      var selected = A2($List.filter,function (_p8) {    var _p9 = _p8;return A2($Set.member,_p9._0,table.selected);},systems);
      var selectedTable = _U.update(table,{rows: selected,selected: $Set.empty,id: "launchListing"});
      var _p10 = A2($Systems$Launch.update,action,_U.update(_p6.systemsLaunch,{table: selectedTable}));
      var newLaunch = _p10._0;
      var effect = _p10._1;
      return $List.isEmpty(selected) ? {ctor: "_Tuple2"
                                       ,_0: _U.update(_p11,{systemsList: _U.update(_p12,{error: $Systems$List.NoSystemSelected})})
                                       ,_1: $Effects.none} : {ctor: "_Tuple2"
                                                             ,_0: _U.update(_p11,
                                                             {systemsLaunch: newLaunch
                                                             ,navSide: newNavSide
                                                             ,systemsList: _U.update(_p12,{error: $Systems$List.NoError})})
                                                             ,_1: A2($Effects.map,SystemsLaunch,effect)};
   });
   var SystemsView = function (a) {    return {ctor: "SystemsView",_0: a};};
   var SystemsAdd = function (a) {    return {ctor: "SystemsAdd",_0: a};};
   var SystemsListing = function (a) {    return {ctor: "SystemsListing",_0: a};};
   var activeView = F2(function (address,_p13) {
      var _p14 = _p13;
      var _p18 = _p14;
      var _p15 = _p18.navSide.active;
      switch (_p15.ctor)
      {case "Systems": var _p16 = _p18.navSide.section;
           switch (_p16.ctor)
           {case "List": return A2($Systems$List.view,A2($Signal.forwardTo,address,SystemsListing),_p18.systemsList);
              case "Launch": return A2($Systems$Launch.view,A2($Signal.forwardTo,address,SystemsLaunch),_p18.systemsLaunch);
              case "Add": return A2($Systems$Add.view,A2($Signal.forwardTo,address,SystemsAdd),_p18.systemsAdd);
              case "View": return A2($Systems$View.view,A2($Signal.forwardTo,address,SystemsView),_p18.systemsView);
              default: return _U.list([]);}
         case "Types": return A2($Types$List.view,A2($Signal.forwardTo,address,TypesListing),_p18.typesList);
         default: var _p17 = _p18.navSide.section;
           switch (_p17.ctor)
           {case "List": return A2($Jobs$List.view,A2($Signal.forwardTo,address,JobsList),_p14.jobsList);
              case "Stats": return A2($Jobs$Stats.view,A2($Signal.forwardTo,address,JobsStats),_p14.jobsStats);
              default: return _U.list([]);}}
   });
   var view = F2(function (address,model) {
      return A2($Html.div,
      _U.list([$Html$Attributes.$class("wrapper")]),
      A2($List.append,
      A2($List.append,
      A2($Nav$Header.view,A2($Signal.forwardTo,address,NavHeaderAction),model.navHeader),
      A2($Nav$Side.view,A2($Signal.forwardTo,address,NavSideAction),model.navSide)),
      _U.list([A2($Html.div,
      _U.list([$Html$Attributes.$class("content-wrapper")]),
      _U.list([A2($Html.section,_U.list([$Html$Attributes.$class("content")]),A2(activeView,address,model))]))])));
   });
   var Model = F9(function (a,b,c,d,e,f,g,h,i) {
      return {systemsList: a,systemsAdd: b,systemsView: c,systemsLaunch: d,jobsList: e,jobsStats: f,typesList: g,navSide: h,navHeader: i};
   });
   var init = function () {
      var _p19 = $Nav$Header.init;
      var navHeaderModel = _p19._0;
      var navHeaderAction = _p19._1;
      var _p20 = $Types$List.init;
      var typesModel = _p20._0;
      var typesAction = _p20._1;
      var _p21 = $Jobs$Stats.init;
      var jobsStat = _p21._0;
      var jobsStatAction = _p21._1;
      var _p22 = $Jobs$List.init;
      var jobsList = _p22._0;
      var jobsListAction = _p22._1;
      var _p23 = $Systems$Launch.init;
      var systemsLaunch = _p23._0;
      var _p24 = $Systems$Add.init;
      var systemsAdd = _p24._0;
      var systemsAddAction = _p24._1;
      var _p25 = $Systems$View.init;
      var systemsView = _p25._0;
      var _p26 = $Systems$List.init;
      var systemsList = _p26._0;
      var systemsListAction = _p26._1;
      var effects = _U.list([A2($Effects.map,SystemsListing,systemsListAction)
                            ,A2($Effects.map,TypesListing,typesAction)
                            ,A2($Effects.map,NavHeaderAction,navHeaderAction)
                            ,A2($Effects.map,JobsList,jobsListAction)
                            ,A2($Effects.map,JobsStats,jobsStatAction)
                            ,A2($Effects.map,SystemsAdd,systemsAddAction)]);
      return {ctor: "_Tuple2"
             ,_0: A9(Model,systemsList,systemsAdd,systemsView,systemsLaunch,jobsList,jobsStat,typesModel,$Nav$Side.init,navHeaderModel)
             ,_1: $Effects.batch(effects)};
   }();
   var update = F2(function (action,_p27) {
      var _p28 = _p27;
      var _p52 = _p28.systemsView;
      var _p51 = _p28.systemsAdd;
      var _p50 = _p28.navSide;
      var _p49 = _p28;
      var _p48 = _p28.jobsStats;
      var _p29 = action;
      switch (_p29.ctor)
      {case "SystemsView": var _p30 = A2($Systems$View.update,_p29._0,_p52);
           var newSystems = _p30._0;
           var effects = _p30._1;
           return {ctor: "_Tuple2",_0: _U.update(_p49,{systemsView: newSystems}),_1: A2($Effects.map,SystemsView,effects)};
         case "SystemsListing": var _p34 = _p29._0;
           var _p31 = _p34;
           if (_p31.ctor === "LoadPage" && _p31._0.ctor === "View") {
                 var _p32 = A2($Systems$View.update,$Systems$View.ViewSystem(_p31._0._0),_p52);
                 var newSystems = _p32._0;
                 var effects = _p32._1;
                 return {ctor: "_Tuple2"
                        ,_0: _U.update(_p49,{systemsView: newSystems,navSide: A2($Nav$Side.update,A2($Nav$Side.Goto,$Nav$Side.Systems,$Nav$Side.View),_p50)})
                        ,_1: A2($Effects.map,SystemsView,effects)};
              } else {
                 var _p33 = A2($Systems$List.update,_p34,_p28.systemsList);
                 var newSystems = _p33._0;
                 var effect = _p33._1;
                 return {ctor: "_Tuple2",_0: _U.update(_p49,{systemsList: newSystems}),_1: A2($Effects.map,SystemsListing,effect)};
              }
         case "SystemsAdd": var _p38 = _p29._0;
           var _p35 = _p38;
           switch (_p35.ctor)
           {case "JobLaunched": return jobListing(_p49);
              case "SystemSaved": var _p36 = A2($Systems$Add.update,_p38,_p51);
                var newSystems = _p36._0;
                var effect = _p36._1;
                return !_U.eq(effect,$Effects.none) && _U.eq(_p35._0,$Systems$Add.NoOp) ? systemListing(_U.update(_p49,
                {systemsAdd: newSystems})) : {ctor: "_Tuple2",_0: _U.update(_p49,{systemsAdd: newSystems}),_1: A2($Effects.map,SystemsAdd,effect)};
              default: var _p37 = A2($Systems$Add.update,_p38,_p51);
                var newSystems = _p37._0;
                var effect = _p37._1;
                return {ctor: "_Tuple2",_0: _U.update(_p49,{systemsAdd: newSystems}),_1: A2($Effects.map,SystemsAdd,effect)};}
         case "SystemsLaunch": var _p41 = _p29._0;
           var _p39 = _p41;
           switch (_p39.ctor)
           {case "Cancel": return systemListing(_p49);
              case "JobLaunched": return jobListing(_p49);
              case "SetupJob": return A2(setupJob,_p41,_p49);
              case "Run": var _p40 = A2($Systems$Launch.update,_p41,_p49.systemsLaunch);
                var newLaunch = _p40._0;
                var effect = _p40._1;
                return {ctor: "_Tuple2",_0: _U.update(_p49,{systemsLaunch: newLaunch}),_1: A2($Effects.map,SystemsLaunch,effect)};
              default: return A2($Debug.log,$Basics.toString(_p41),{ctor: "_Tuple2",_0: _p49,_1: $Effects.none});}
         case "JobsList": var _p43 = _p29._0;
           if (_U.eq(_p43,$Jobs$List.Polling) && !_U.eq(_p50.active,$Nav$Side.Jobs)) return {ctor: "_Tuple2",_0: _p49,_1: $Effects.none}; else {
                 var _p42 = A2($Jobs$List.update,_p43,_p28.jobsList);
                 var newJobList = _p42._0;
                 var effects = _p42._1;
                 return {ctor: "_Tuple2",_0: _U.update(_p49,{jobsList: newJobList}),_1: A2($Effects.map,JobsList,effects)};
              }
         case "JobsStats": var _p44 = A2($Jobs$Stats.update,_p29._0,_p48);
           var newJobsStats = _p44._0;
           var effects = _p44._1;
           return {ctor: "_Tuple2",_0: _U.update(_p49,{jobsStats: newJobsStats}),_1: A2($Effects.map,JobsStats,effects)};
         case "NavSideAction": var _p45 = init;
           var newModel = _p45._0;
           var effects = _p45._1;
           var newNavSide = A2($Nav$Side.update,_p29._0,_p49.navSide);
           return {ctor: "_Tuple2",_0: _U.update(newModel,{jobsStats: _p48,navSide: newNavSide}),_1: effects};
         case "NavHeaderAction": var _p46 = A2($Nav$Header.update,_p29._0,_p49.navHeader);
           var newNavHeader = _p46._0;
           var effects = _p46._1;
           return {ctor: "_Tuple2",_0: _U.update(_p49,{navHeader: newNavHeader}),_1: A2($Effects.map,NavHeaderAction,effects)};
         default: var _p47 = A2($Types$List.update,_p29._0,_p28.typesList);
           var newTypes = _p47._0;
           var effect = _p47._1;
           return {ctor: "_Tuple2",_0: _U.update(_p49,{typesList: newTypes}),_1: A2($Effects.map,TypesListing,effect)};}
   });
   return _elm.Application.values = {_op: _op
                                    ,init: init
                                    ,Model: Model
                                    ,SystemsListing: SystemsListing
                                    ,SystemsAdd: SystemsAdd
                                    ,SystemsView: SystemsView
                                    ,SystemsLaunch: SystemsLaunch
                                    ,JobsList: JobsList
                                    ,JobsStats: JobsStats
                                    ,NavSideAction: NavSideAction
                                    ,NavHeaderAction: NavHeaderAction
                                    ,TypesListing: TypesListing
                                    ,setupJob: setupJob
                                    ,jobListing: jobListing
                                    ,systemListing: systemListing
                                    ,update: update
                                    ,activeView: activeView
                                    ,view: view};
};
Elm.Main = Elm.Main || {};
Elm.Main.make = function (_elm) {
   "use strict";
   _elm.Main = _elm.Main || {};
   if (_elm.Main.values) return _elm.Main.values;
   var _U = Elm.Native.Utils.make(_elm),
   $Application = Elm.Application.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Common$NewTab = Elm.Common.NewTab.make(_elm),
   $Common$Redirect = Elm.Common.Redirect.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Effects = Elm.Effects.make(_elm),
   $Jobs$List = Elm.Jobs.List.make(_elm),
   $Jobs$Stats = Elm.Jobs.Stats.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Result = Elm.Result.make(_elm),
   $Search = Elm.Search.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $StartApp = Elm.StartApp.make(_elm),
   $Systems$Launch = Elm.Systems.Launch.make(_elm),
   $Systems$List = Elm.Systems.List.make(_elm),
   $Task = Elm.Task.make(_elm),
   $Time = Elm.Time.make(_elm);
   var _op = {};
   var menuPort = Elm.Native.Port.make(_elm).inboundSignal("menuPort",
   "String",
   function (v) {
      return typeof v === "string" || typeof v === "object" && v instanceof String ? v : _U.badPort("a string",v);
   });
   var jobsStatsPolling = function () {
      var _p0 = $Jobs$Stats.init;
      var model = _p0._0;
      return A2($Signal.map,function (t) {    return $Application.JobsStats($Jobs$Stats.PollMetrics(t));},$Time.every(model.interval * $Time.second));
   }();
   var jobsListPolling = A2($Signal.map,function (_p1) {    return $Application.JobsList($Jobs$List.Polling);},$Time.every(5 * $Time.second));
   var menuClick = function (p) {    return A2($Signal.map,function (job) {    return $Application.SystemsLaunch($Systems$Launch.SetupJob(job));},p);};
   var parsingErr = Elm.Native.Port.make(_elm).inboundSignal("parsingErr",
   "Search.ParseResult",
   function (v) {
      return typeof v === "object" && "message" in v && "source" in v && "result" in v ? {_: {}
                                                                                         ,message: typeof v.message === "string" || typeof v.message === "object" && v.message instanceof String ? v.message : _U.badPort("a string",
                                                                                         v.message)
                                                                                         ,source: typeof v.source === "string" || typeof v.source === "object" && v.source instanceof String ? v.source : _U.badPort("a string",
                                                                                         v.source)
                                                                                         ,result: typeof v.result === "string" || typeof v.result === "object" && v.result instanceof String ? v.result : _U.badPort("a string",
                                                                                         v.result)} : _U.badPort("an object with fields `message`, `source`, `result`",
      v);
   });
   var parsingInput = F2(function (action,p) {
      return A2($Signal.map,function (r) {    return $Application.SystemsListing($Systems$List.Searching(action(r)));},p);
   });
   var parsingOk = Elm.Native.Port.make(_elm).inboundSignal("parsingOk",
   "Search.ParseResult",
   function (v) {
      return typeof v === "object" && "message" in v && "source" in v && "result" in v ? {_: {}
                                                                                         ,message: typeof v.message === "string" || typeof v.message === "object" && v.message instanceof String ? v.message : _U.badPort("a string",
                                                                                         v.message)
                                                                                         ,source: typeof v.source === "string" || typeof v.source === "object" && v.source instanceof String ? v.source : _U.badPort("a string",
                                                                                         v.source)
                                                                                         ,result: typeof v.result === "string" || typeof v.result === "object" && v.result instanceof String ? v.result : _U.badPort("a string",
                                                                                         v.result)} : _U.badPort("an object with fields `message`, `source`, `result`",
      v);
   });
   var toQuery = function (action) {    var _p2 = action;if (_p2.ctor === "Parse") {    return _p2._0;} else {    return "";}};
   var parserPort = Elm.Native.Port.make(_elm).outboundSignal("parserPort",
   function (v) {
      return v;
   },
   A2($Signal.map,toQuery,A3($Signal.filter,function (s) {    return !_U.eq(s,$Search.NoOp);},$Search.NoOp,$Search.searchActions.signal)));
   var toUrl = function (action) {    var _p3 = action;if (_p3.ctor === "Open") {    return _p3._0;} else {    return "";}};
   var newtabPort = Elm.Native.Port.make(_elm).outboundSignal("newtabPort",
   function (v) {
      return v;
   },
   A2($Signal.map,toUrl,A3($Signal.filter,function (s) {    return !_U.eq(s,$Common$NewTab.NoOp);},$Common$NewTab.NoOp,$Common$NewTab.newtabActions.signal)));
   var redirectPort = Elm.Native.Port.make(_elm).outboundSignal("redirectPort",
   function (v) {
      return [];
   },
   A2($Signal.map,
   $Basics.always({ctor: "_Tuple0"}),
   A3($Signal.filter,function (s) {    return _U.eq(s,$Common$Redirect.Prompt);},$Common$Redirect.NoOp,$Common$Redirect.redirectActions.signal)));
   var app = $StartApp.start({init: $Application.init
                             ,update: $Application.update
                             ,view: $Application.view
                             ,inputs: _U.list([A2(parsingInput,$Search.Result(true),parsingOk)
                                              ,A2(parsingInput,$Search.Result(false),parsingErr)
                                              ,menuClick(menuPort)
                                              ,jobsListPolling
                                              ,jobsStatsPolling])});
   var main = app.html;
   var tasks = Elm.Native.Task.make(_elm).performSignal("tasks",app.tasks);
   return _elm.Main.values = {_op: _op
                             ,app: app
                             ,main: main
                             ,toUrl: toUrl
                             ,toQuery: toQuery
                             ,parsingInput: parsingInput
                             ,menuClick: menuClick
                             ,jobsListPolling: jobsListPolling
                             ,jobsStatsPolling: jobsStatsPolling};
};
