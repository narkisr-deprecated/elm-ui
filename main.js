
(function() {
'use strict';

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

//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

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
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
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
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
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
	compare: F2(compare),

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

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
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

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

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

function chr(c)
{
	return new String(c);
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

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
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


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		var name = v.func ? v.func.name : v.name;
		return '<function' + (name === '' ? '' : ':') + name + '>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
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

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

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
}

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


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p0) {
		var _p1 = _p0;
		return A2(f, _p1._0, _p1._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$snd = function (_p2) {
	var _p3 = _p2;
	return _p3._1;
};
var _elm_lang$core$Basics$fst = function (_p4) {
	var _p5 = _p4;
	return _p5._0;
};
var _elm_lang$core$Basics$always = F2(
	function (a, _p6) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$Never = function (a) {
	return {ctor: 'Never', _0: a};
};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
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

return {
	crash: crash,
	log: F2(log)
};

}();
var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$oneOf = function (maybes) {
	oneOf:
	while (true) {
		var _p1 = maybes;
		if (_p1.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p3 = _p1._0;
			var _p2 = _p3;
			if (_p2.ctor === 'Nothing') {
				var _v3 = _p1._1;
				maybes = _v3;
				continue oneOf;
			} else {
				return _p3;
			}
		}
	}
};
var _elm_lang$core$Maybe$andThen = F2(
	function (maybeValue, callback) {
		var _p4 = maybeValue;
		if (_p4.ctor === 'Just') {
			return callback(_p4._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p5 = maybe;
		if (_p5.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p5._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p6 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p6.ctor === '_Tuple2') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p6._0._0, _p6._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p7 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p7.ctor === '_Tuple3') && (_p7._0.ctor === 'Just')) && (_p7._1.ctor === 'Just')) && (_p7._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p7._0._0, _p7._1._0, _p7._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p8 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p8.ctor === '_Tuple4') && (_p8._0.ctor === 'Just')) && (_p8._1.ctor === 'Just')) && (_p8._2.ctor === 'Just')) && (_p8._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p8._0._0, _p8._1._0, _p8._2._0, _p8._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p9 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p9.ctor === '_Tuple5') && (_p9._0.ctor === 'Just')) && (_p9._1.ctor === 'Just')) && (_p9._2.ctor === 'Just')) && (_p9._3.ctor === 'Just')) && (_p9._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p9._0._0, _p9._1._0, _p9._2._0, _p9._3._0, _p9._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

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
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,
	range: range,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return _elm_lang$core$Basics$not(
			A2(
				_elm_lang$core$List$any,
				function (_p2) {
					return _elm_lang$core$Basics$not(
						isOkay(_p2));
				},
				list));
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			_elm_lang$core$Native_List.range(
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						_elm_lang$core$List_ops['::'],
						f(x),
						acc);
				}),
			_elm_lang$core$Native_List.fromArray(
				[]),
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (x, xs$) {
				return pred(x) ? A2(_elm_lang$core$List_ops['::'], x, xs$) : xs$;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			_elm_lang$core$Native_List.fromArray(
				[]),
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return A2(_elm_lang$core$List_ops['::'], _p10._0, xs);
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			_elm_lang$core$Native_List.fromArray(
				[]),
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$List_ops['::'], x, y);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return A2(
						_elm_lang$core$List_ops['::'],
						A2(f, x, _p11._0),
						accAcc);
				} else {
					return _elm_lang$core$Native_List.fromArray(
						[]);
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				_elm_lang$core$Native_List.fromArray(
					[b]),
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return A2(_elm_lang$core$List_ops['::'], x, y);
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		_elm_lang$core$Native_List.fromArray(
			[]),
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: A2(_elm_lang$core$List_ops['::'], x, _p16),
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: A2(_elm_lang$core$List_ops['::'], x, _p15)
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_List.fromArray(
					[]),
				_1: _elm_lang$core$Native_List.fromArray(
					[])
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: A2(_elm_lang$core$List_ops['::'], _p19._0, _p20._0),
				_1: A2(_elm_lang$core$List_ops['::'], _p19._1, _p20._1)
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_List.fromArray(
				[]),
			_1: _elm_lang$core$Native_List.fromArray(
				[])
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return _elm_lang$core$Native_List.fromArray(
				[]);
		} else {
			var step = F2(
				function (x, rest) {
					return A2(
						_elm_lang$core$List_ops['::'],
						sep,
						A2(_elm_lang$core$List_ops['::'], x, rest));
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				_elm_lang$core$Native_List.fromArray(
					[]),
				_p21._1);
			return A2(_elm_lang$core$List_ops['::'], _p21._0, spersed);
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return _elm_lang$core$Native_List.fromArray(
				[]);
		} else {
			var _p22 = list;
			if (_p22.ctor === '[]') {
				return list;
			} else {
				return A2(
					_elm_lang$core$List_ops['::'],
					_p22._0,
					A2(_elm_lang$core$List$take, n - 1, _p22._1));
			}
		}
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v23 = A2(_elm_lang$core$List_ops['::'], value, result),
					_v24 = n - 1,
					_v25 = value;
				result = _v23;
				n = _v24;
				value = _v25;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			_elm_lang$core$Native_List.fromArray(
				[]),
			n,
			value);
	});

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (result, callback) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$formatError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function addPublicModule(object, name, main)
{
	var init = main ? makeEmbed(name, main) : mainIsUndefined(name);

	object['worker'] = function worker(flags)
	{
		return init(undefined, flags, false);
	}

	object['embed'] = function embed(domNode, flags)
	{
		return init(domNode, flags, true);
	}

	object['fullscreen'] = function fullscreen(flags)
	{
		return init(document.body, flags, true);
	};
}


// PROGRAM FAIL

function mainIsUndefined(name)
{
	return function(domNode)
	{
		var message = 'Cannot initialize module `' + name +
			'` because it has no `main` value!\nWhat should I show on screen?';
		domNode.innerHTML = errorHtml(message);
		throw new Error(message);
	};
}

function errorHtml(message)
{
	return '<div style="padding-left:1em;">'
		+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
		+ '<pre style="padding-left:1em;">' + message + '</pre>'
		+ '</div>';
}


// PROGRAM SUCCESS

function makeEmbed(moduleName, main)
{
	return function embed(rootDomNode, flags, withRenderer)
	{
		try
		{
			var program = mainToProgram(moduleName, main);
			if (!withRenderer)
			{
				program.renderer = dummyRenderer;
			}
			return makeEmbedHelp(moduleName, program, rootDomNode, flags);
		}
		catch (e)
		{
			rootDomNode.innerHTML = errorHtml(e.message);
			throw e;
		}
	};
}

function dummyRenderer()
{
	return { update: function() {} };
}


// MAIN TO PROGRAM

function mainToProgram(moduleName, wrappedMain)
{
	var main = wrappedMain.main;

	if (typeof main.init === 'undefined')
	{
		var emptyBag = batch(_elm_lang$core$Native_List.Nil);
		var noChange = _elm_lang$core$Native_Utils.Tuple2(
			_elm_lang$core$Native_Utils.Tuple0,
			emptyBag
		);

		return _elm_lang$virtual_dom$VirtualDom$programWithFlags({
			init: function() { return noChange; },
			view: function() { return main; },
			update: F2(function() { return noChange; }),
			subscriptions: function () { return emptyBag; }
		});
	}

	var flags = wrappedMain.flags;
	var init = flags
		? initWithFlags(moduleName, main.init, flags)
		: initWithoutFlags(moduleName, main.init);

	return _elm_lang$virtual_dom$VirtualDom$programWithFlags({
		init: init,
		view: main.view,
		update: main.update,
		subscriptions: main.subscriptions,
	});
}

function initWithoutFlags(moduleName, realInit)
{
	return function init(flags)
	{
		if (typeof flags !== 'undefined')
		{
			throw new Error(
				'You are giving module `' + moduleName + '` an argument in JavaScript.\n'
				+ 'This module does not take arguments though! You probably need to change the\n'
				+ 'initialization code to something like `Elm.' + moduleName + '.fullscreen()`'
			);
		}
		return realInit();
	};
}

function initWithFlags(moduleName, realInit, flagDecoder)
{
	return function init(flags)
	{
		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Err')
		{
			throw new Error(
				'You are trying to initialize module `' + moduleName + '` with an unexpected argument.\n'
				+ 'When trying to convert it to a usable Elm value, I run into this problem:\n\n'
				+ result._0
			);
		}
		return realInit(result._0);
	};
}


// SETUP RUNTIME SYSTEM

function makeEmbedHelp(moduleName, program, rootDomNode, flags)
{
	var init = program.init;
	var update = program.update;
	var subscriptions = program.subscriptions;
	var view = program.view;
	var makeRenderer = program.renderer;

	// ambient state
	var managers = {};
	var renderer;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var results = init(flags);
		var model = results._0;
		renderer = makeRenderer(rootDomNode, enqueue, view(model));
		var cmds = results._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			renderer.update(view(model));
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, handleMsg, loop);
	}

	var task = A2(andThen, init, loop);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			var value = converter(cmdList._0);
			for (var i = 0; i < subs.length; i++)
			{
				subs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function send(value)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, value);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		var value = result._0;
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	mainToProgram: mainToProgram,
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,
	addPublicModule: addPublicModule,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(task, callback)
{
	return {
		ctor: '_Task_andThen',
		task: task,
		callback: callback
	};
}

function onError(task, callback)
{
	return {
		ctor: '_Task_onError',
		task: task,
		callback: callback
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		numSteps = step(numSteps, process);
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

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
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
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
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
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
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
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
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
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
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
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
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
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
	return _elm_lang$core$Native_List.fromArray(is);
}

function toInt(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
		start = 1;
	}
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
	}
	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function toFloat(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
		}
		start = 1;
	}
	var dotCount = 0;
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if ('0' <= c && c <= '9')
		{
			continue;
		}
		if (c === '.')
		{
			dotCount += 1;
			if (dotCount <= 1)
			{
				continue;
			}
		}
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	return _elm_lang$core$Result$Ok(parseFloat(s));
}

function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
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

}();
//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

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
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
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
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
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
		return _elm_lang$core$Native_List.fromArray(str.split(re));
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
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

//import Native.List //

var _elm_lang$core$Native_Array = function() {

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
	if (list.ctor === '[]')
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
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
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

return {
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

}();
var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		_elm_lang$core$Native_List.range(
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2(_elm_lang$core$List_ops['::'], key, keyList);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return A2(_elm_lang$core$List_ops['::'], value, valueList);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					_elm_lang$core$List_ops['::'],
					{ctor: '_Tuple2', _0: key, _1: value},
					list);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				_elm_lang$core$Native_List.fromArray(
					[
						'Internal red-black tree invariant violated, expected ',
						msg,
						' and got ',
						_elm_lang$core$Basics$toString(c),
						'/',
						lgot,
						'/',
						rgot,
						'\nPlease report this bug to <https://github.com/elm-lang/core/issues>'
					])));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
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
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
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
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (c, l, r) {
		var _p29 = {ctor: '_Tuple2', _0: l, _1: r};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = c;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: c, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						c,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: c, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						c,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var l$ = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, c, k, v, l$, r);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function decodeObject(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function decodeTuple(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'tuple',
		func: f,
		decoders: decoders
	};
}

function andThen(decoder, callback)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function customAndThen(decoder, callback)
{
	return {
		ctor: '<decoder>',
		tag: 'customAndThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function decodeObject1(f, d1)
{
	return decodeObject(f, [d1]);
}

function decodeObject2(f, d1, d2)
{
	return decodeObject(f, [d1, d2]);
}

function decodeObject3(f, d1, d2, d3)
{
	return decodeObject(f, [d1, d2, d3]);
}

function decodeObject4(f, d1, d2, d3, d4)
{
	return decodeObject(f, [d1, d2, d3, d4]);
}

function decodeObject5(f, d1, d2, d3, d4, d5)
{
	return decodeObject(f, [d1, d2, d3, d4, d5]);
}

function decodeObject6(f, d1, d2, d3, d4, d5, d6)
{
	return decodeObject(f, [d1, d2, d3, d4, d5, d6]);
}

function decodeObject7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return decodeObject(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function decodeObject8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return decodeObject(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODING TUPLES

function decodeTuple1(f, d1)
{
	return decodeTuple(f, [d1]);
}

function decodeTuple2(f, d1, d2)
{
	return decodeTuple(f, [d1, d2]);
}

function decodeTuple3(f, d1, d2, d3)
{
	return decodeTuple(f, [d1, d2, d3]);
}

function decodeTuple4(f, d1, d2, d3, d4)
{
	return decodeTuple(f, [d1, d2, d3, d4]);
}

function decodeTuple5(f, d1, d2, d3, d4, d5)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5]);
}

function decodeTuple6(f, d1, d2, d3, d4, d5, d6)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5, d6]);
}

function decodeTuple7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function decodeTuple8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function badCustom(msg)
{
	return { tag: 'custom', msg: msg };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'custom':
				return 'A `customDecode` failed'
					+ (context === '_' ? '' : ' at ' + context)
					+ ' with the message: ' + problem.msg;

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok')
				? result
				: badField(field, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'tuple':
			var decoders = decoder.decoders;
			var len = decoders.length;

			if ( !(value instanceof Array) || value.length !== len )
			{
				return badPrimitive('a Tuple with ' + len + ' entries', value);
			}

			var answer = decoder.func;
			for (var i = 0; i < len; i++)
			{
				var result = runHelp(decoders[i], value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'customAndThen':
			var result = runHelp(decoder.decoder, value);
			if (result.tag !== 'ok')
			{
				return result;
			}
			var realResult = decoder.callback(result.value);
			if (realResult.ctor === 'Err')
			{
				return badCustom(realResult._0);
			}
			return ok(realResult._0);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'map-many':
		case 'tuple':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
		case 'customAndThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

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
	customAndThen: F2(customAndThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$tuple8 = _elm_lang$core$Native_Json.decodeTuple8;
var _elm_lang$core$Json_Decode$tuple7 = _elm_lang$core$Native_Json.decodeTuple7;
var _elm_lang$core$Json_Decode$tuple6 = _elm_lang$core$Native_Json.decodeTuple6;
var _elm_lang$core$Json_Decode$tuple5 = _elm_lang$core$Native_Json.decodeTuple5;
var _elm_lang$core$Json_Decode$tuple4 = _elm_lang$core$Native_Json.decodeTuple4;
var _elm_lang$core$Json_Decode$tuple3 = _elm_lang$core$Native_Json.decodeTuple3;
var _elm_lang$core$Json_Decode$tuple2 = _elm_lang$core$Native_Json.decodeTuple2;
var _elm_lang$core$Json_Decode$tuple1 = _elm_lang$core$Native_Json.decodeTuple1;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$customDecoder = _elm_lang$core$Native_Json.customAndThen;
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$object8 = _elm_lang$core$Native_Json.decodeObject8;
var _elm_lang$core$Json_Decode$object7 = _elm_lang$core$Native_Json.decodeObject7;
var _elm_lang$core$Json_Decode$object6 = _elm_lang$core$Native_Json.decodeObject6;
var _elm_lang$core$Json_Decode$object5 = _elm_lang$core$Native_Json.decodeObject5;
var _elm_lang$core$Json_Decode$object4 = _elm_lang$core$Native_Json.decodeObject4;
var _elm_lang$core$Json_Decode$object3 = _elm_lang$core$Native_Json.decodeObject3;
var _elm_lang$core$Json_Decode$object2 = _elm_lang$core$Native_Json.decodeObject2;
var _elm_lang$core$Json_Decode$object1 = _elm_lang$core$Native_Json.decodeObject1;
var _elm_lang$core$Json_Decode_ops = _elm_lang$core$Json_Decode_ops || {};
_elm_lang$core$Json_Decode_ops[':='] = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Json_Decode_ops[':='], x, y);
				}),
			decoder,
			fields);
	});
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.decodeObject1;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

//import Native.Json //

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';



////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


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
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (!a.options === b.options)
	{
		if (a.stopPropagation !== b.stopPropagation || a.preventDefault !== b.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}



////////////  RENDERER  ////////////


function renderer(parent, tagger, initialVirtualNode)
{
	var eventNode = { tagger: tagger, parent: undefined };

	var domNode = render(initialVirtualNode, eventNode);
	parent.appendChild(domNode);

	var state = 'NO_REQUEST';
	var currentVirtualNode = initialVirtualNode;
	var nextVirtualNode = initialVirtualNode;

	function registerVirtualNode(vNode)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextVirtualNode = vNode;
	}

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/core/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var patches = diff(currentVirtualNode, nextVirtualNode);
				domNode = applyPatches(domNode, currentVirtualNode, patches, eventNode);
				currentVirtualNode = nextVirtualNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return { update: registerVirtualNode };
}


var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(cb) { setTimeout(cb, 1000 / 60); };



////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = {
				tagger: tagger,
				parent: eventNode
			};

			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return document.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? document.createElementNS(vNode.namespace, vNode.tag)
				: document.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? document.createElementNS(vNode.namespace, vNode.tag)
				: document.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return redraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			domNode.elm_event_node_ref.tagger = patch.data;
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			var data = patch.data;

			// end inserts
			var endInserts = data.endInserts;
			var end;
			if (typeof endInserts !== 'undefined')
			{
				if (endInserts.length === 1)
				{
					var insert = endInserts[0];
					var entry = insert.entry;
					var end = entry.tag === 'move'
						? entry.data
						: render(entry.vnode, patch.eventNode);
				}
				else
				{
					end = document.createDocumentFragment();
					for (var i = 0; i < endInserts.length; i++)
					{
						var insert = endInserts[i];
						var entry = insert.entry;
						var node = entry.tag === 'move'
							? entry.data
							: render(entry.vnode, patch.eventNode);
						end.appendChild(node);
					}
				}
			}

			// removals
			domNode = applyPatchesHelp(domNode, data.patches);

			// inserts
			var inserts = data.inserts;
			for (var i = 0; i < inserts.length; i++)
			{
				var insert = inserts[i];
				var entry = insert.entry;
				var node = entry.tag === 'move'
					? entry.data
					: render(entry.vnode, patch.eventNode);
				domNode.insertBefore(node, domNode.childNodes[insert.index]);
			}

			if (typeof end !== 'undefined')
			{
				domNode.appendChild(end);
			}

			return domNode;

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function redraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}



////////////  PROGRAMS  ////////////


function programWithFlags(details)
{
	return {
		init: details.init,
		update: details.update,
		subscriptions: details.subscriptions,
		view: details.view,
		renderer: renderer
	};
}


return {
	node: node,
	text: text,

	custom: custom,

	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	programWithFlags: programWithFlags
};

}();
var _elm_lang$virtual_dom$VirtualDom$programWithFlags = _elm_lang$virtual_dom$Native_VirtualDom.programWithFlags;
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main$ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$svg = _elm_lang$html$Html$node('svg');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'charset', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type$ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$autosave = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'autosave', value);
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'form', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'media', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'rel', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Basics$fst,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Basics$snd, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_community$html_extra$Html_Attributes_Extra$role = function (r) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'role', r);
};
var _elm_community$html_extra$Html_Attributes_Extra$intProperty = F2(
	function (name, $int) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$int($int));
	});
var _elm_community$html_extra$Html_Attributes_Extra$valueAsInt = function (value) {
	return A2(_elm_community$html_extra$Html_Attributes_Extra$intProperty, 'valueAsNumber', value);
};
var _elm_community$html_extra$Html_Attributes_Extra$floatProperty = F2(
	function (name, $float) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$float($float));
	});
var _elm_community$html_extra$Html_Attributes_Extra$valueAsFloat = function (value) {
	return A2(_elm_community$html_extra$Html_Attributes_Extra$floatProperty, 'valueAsNumber', value);
};
var _elm_community$html_extra$Html_Attributes_Extra$volume = _elm_community$html_extra$Html_Attributes_Extra$floatProperty('volume');
var _elm_community$html_extra$Html_Attributes_Extra$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_community$html_extra$Html_Attributes_Extra$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_community$html_extra$Html_Attributes_Extra$low = _elm_community$html_extra$Html_Attributes_Extra$stringProperty('low');
var _elm_community$html_extra$Html_Attributes_Extra$high = _elm_community$html_extra$Html_Attributes_Extra$stringProperty('high');
var _elm_community$html_extra$Html_Attributes_Extra$optimum = _elm_community$html_extra$Html_Attributes_Extra$stringProperty('optimum');
var _elm_community$html_extra$Html_Attributes_Extra$innerHtml = _elm_community$html_extra$Html_Attributes_Extra$stringProperty('innerHTML');

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode_ops[':='], 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	_elm_lang$core$Native_List.fromArray(
		['target', 'checked']),
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	_elm_lang$core$Native_List.fromArray(
		['target', 'value']),
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_community$html_extra$Html_Events_Extra$targetValueIntParse = A2(_elm_lang$core$Json_Decode$customDecoder, _elm_lang$html$Html_Events$targetValue, _elm_lang$core$String$toInt);
var _elm_community$html_extra$Html_Events_Extra$targetValueFloatParse = A2(_elm_lang$core$Json_Decode$customDecoder, _elm_lang$html$Html_Events$targetValue, _elm_lang$core$String$toFloat);
var _elm_community$html_extra$Html_Events_Extra$targetValueMaybe = A2(
	_elm_lang$core$Json_Decode$customDecoder,
	_elm_lang$html$Html_Events$targetValue,
	function (s) {
		return _elm_lang$core$Result$Ok(
			_elm_lang$core$Native_Utils.eq(s, '') ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(s));
	});
var _elm_community$html_extra$Html_Events_Extra$targetValueMaybeInt = function () {
	var traverse = F2(
		function (f, mx) {
			var _p0 = mx;
			if (_p0.ctor === 'Nothing') {
				return _elm_lang$core$Result$Ok(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Result$map,
					_elm_lang$core$Maybe$Just,
					f(_p0._0));
			}
		});
	return A2(
		_elm_lang$core$Json_Decode$customDecoder,
		_elm_community$html_extra$Html_Events_Extra$targetValueMaybe,
		traverse(_elm_lang$core$String$toInt));
}();
var _elm_community$html_extra$Html_Events_Extra$targetValueMaybeFloatParse = function () {
	var traverse = F2(
		function (f, mx) {
			var _p1 = mx;
			if (_p1.ctor === 'Nothing') {
				return _elm_lang$core$Result$Ok(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Result$map,
					_elm_lang$core$Maybe$Just,
					f(_p1._0));
			}
		});
	return A2(
		_elm_lang$core$Json_Decode$customDecoder,
		_elm_community$html_extra$Html_Events_Extra$targetValueMaybe,
		traverse(_elm_lang$core$String$toFloat));
}();
var _elm_community$html_extra$Html_Events_Extra$targetValueMaybeIntParse = function () {
	var traverse = F2(
		function (f, mx) {
			var _p2 = mx;
			if (_p2.ctor === 'Nothing') {
				return _elm_lang$core$Result$Ok(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Result$map,
					_elm_lang$core$Maybe$Just,
					f(_p2._0));
			}
		});
	return A2(
		_elm_lang$core$Json_Decode$customDecoder,
		_elm_community$html_extra$Html_Events_Extra$targetValueMaybe,
		traverse(_elm_lang$core$String$toInt));
}();
var _elm_community$html_extra$Html_Events_Extra$targetValueInt = A2(
	_elm_lang$core$Json_Decode$at,
	_elm_lang$core$Native_List.fromArray(
		['target', 'valueAsNumber']),
	_elm_lang$core$Json_Decode$int);
var _elm_community$html_extra$Html_Events_Extra$targetValueFloat = A2(
	_elm_lang$core$Json_Decode$customDecoder,
	A2(
		_elm_lang$core$Json_Decode$at,
		_elm_lang$core$Native_List.fromArray(
			['target', 'valueAsNumber']),
		_elm_lang$core$Json_Decode$float),
	function (v) {
		return _elm_lang$core$Basics$isNaN(v) ? _elm_lang$core$Result$Err('Not a number') : _elm_lang$core$Result$Ok(v);
	});
var _elm_community$html_extra$Html_Events_Extra$targetValueMaybeFloat = A2(
	_elm_lang$core$Json_Decode$andThen,
	_elm_community$html_extra$Html_Events_Extra$targetValueMaybe,
	function (mval) {
		var _p3 = mval;
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing);
		} else {
			return A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_community$html_extra$Html_Events_Extra$targetValueFloat);
		}
	});
var _elm_community$html_extra$Html_Events_Extra$charCode = A2(
	_elm_lang$core$Json_Decode$map,
	function (_p4) {
		return A2(
			_elm_lang$core$Maybe$map,
			_elm_lang$core$Basics$fst,
			_elm_lang$core$String$uncons(_p4));
	},
	A2(_elm_lang$core$Json_Decode_ops[':='], 'charCode', _elm_lang$core$Json_Decode$string));

var _circuithub$elm_html_shorthand$Html_Shorthand_Type$EventDecodeError = F2(
	function (a, b) {
		return {event: a, reason: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$FormUpdate = F2(
	function (a, b) {
		return {onSubmit: a, onEnter: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$FieldUpdate = F3(
	function (a, b, c) {
		return {onInput: a, onEnter: b, onKeyboardLost: c};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ButtonUpdate = function (a) {
	return {onClick: a};
};
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$SelectUpdate = function (a) {
	return {onSelect: a};
};
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ClassParam = function (a) {
	return {$class: a};
};
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ClassIdParam = F2(
	function (a, b) {
		return {$class: a, id: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ClassCiteParam = F2(
	function (a, b) {
		return {$class: a, cite: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$AnchorParam = F2(
	function (a, b) {
		return {$class: a, href: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ModParam = F3(
	function (a, b, c) {
		return {$class: a, cite: b, datetime: c};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ImgParam = F5(
	function (a, b, c, d, e) {
		return {$class: a, src: b, width: c, height: d, alt: e};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$IframeParam = F7(
	function (a, b, c, d, e, f, g) {
		return {$class: a, name: b, src: c, width: d, height: e, sandbox: f, seamless: g};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$EmbedParam = F7(
	function (a, b, c, d, e, f, g) {
		return {$class: a, id: b, src: c, type$: d, useMapName: e, height: f, width: g};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ObjectParam = F7(
	function (a, b, c, d, e, f, g) {
		return {$class: a, name: b, data: c, type$: d, useMapName: e, height: f, width: g};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$MediaParam = F8(
	function (a, b, c, d, e, f, g, h) {
		return {$class: a, src: b, autoplay: c, controls: d, loop: e, preload: f, poster: g, volume: h};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$VideoParam = function (a) {
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
												return {$class: a, src: b, width: c, height: d, videoHeight: e, videoWidth: f, autoplay: g, controls: h, loop: i, preload: j, poster: k, volume: l};
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
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$FormParam = F3(
	function (a, b, c) {
		return {$class: a, novalidate: b, update: c};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$FieldsetParam = F2(
	function (a, b) {
		return {$class: a, disabled: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$LabelParam = F2(
	function (a, b) {
		return {$class: a, $for: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputFieldParam = F8(
	function (a, b, c, d, e, f, g, h) {
		return {$class: a, name: b, placeholder: c, update: d, type$: e, pattern: f, required: g, decoder: h};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputTextParam = F7(
	function (a, b, c, d, e, f, g) {
		return {$class: a, name: b, placeholder: c, value: d, required: e, autocomplete: f, update: g};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputMaybeTextParam = F6(
	function (a, b, c, d, e, f) {
		return {$class: a, name: b, placeholder: c, value: d, autocomplete: e, update: f};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputUrlParam = F7(
	function (a, b, c, d, e, f, g) {
		return {$class: a, name: b, placeholder: c, value: d, required: e, autocomplete: f, update: g};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputMaybeUrlParam = F6(
	function (a, b, c, d, e, f) {
		return {$class: a, name: b, placeholder: c, value: d, autocomplete: e, update: f};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputFloatParam = F8(
	function (a, b, c, d, e, f, g, h) {
		return {$class: a, name: b, placeholder: c, value: d, min: e, max: f, step: g, update: h};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputMaybeFloatParam = F8(
	function (a, b, c, d, e, f, g, h) {
		return {$class: a, name: b, placeholder: c, value: d, min: e, max: f, step: g, update: h};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputIntParam = F8(
	function (a, b, c, d, e, f, g, h) {
		return {$class: a, name: b, placeholder: c, value: d, min: e, max: f, step: g, update: h};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$InputMaybeIntParam = F8(
	function (a, b, c, d, e, f, g, h) {
		return {$class: a, name: b, placeholder: c, value: d, min: e, max: f, step: g, update: h};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ButtonParam = F2(
	function (a, b) {
		return {$class: a, update: b};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$SelectParam = F3(
	function (a, b, c) {
		return {$class: a, name: b, update: c};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$OptionParam = F3(
	function (a, b, c) {
		return {label: a, value: b, selected: c};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$OutputParam = F3(
	function (a, b, c) {
		return {$class: a, name: b, $for: c};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$ProgressParam = F3(
	function (a, b, c) {
		return {$class: a, value: b, max: c};
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Type$MeterParam = F7(
	function (a, b, c, d, e, f, g) {
		return {$class: a, value: b, min: c, max: d, low: e, high: f, optimum: g};
	});

var _circuithub$elm_html_shorthand$Html_Shorthand_Event$messageDecoder = F2(
	function (dec, f) {
		return A2(
			_elm_lang$core$Json_Decode$customDecoder,
			_elm_lang$core$Json_Decode$value,
			function (event) {
				var r = A2(_elm_lang$core$Json_Decode$decodeValue, dec, event);
				var r$ = A2(
					_elm_lang$core$Result$formatError,
					_circuithub$elm_html_shorthand$Html_Shorthand_Type$EventDecodeError(event),
					r);
				var _p0 = {
					ctor: '_Tuple2',
					_0: f(r$),
					_1: r
				};
				if (_p0._0.ctor === 'Nothing') {
					if (_p0._1.ctor === 'Err') {
						return _elm_lang$core$Result$Err(_p0._1._0);
					} else {
						return _elm_lang$core$Result$Err('no message in response to event');
					}
				} else {
					return _elm_lang$core$Result$Ok(_p0._0._0);
				}
			});
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Event$onMouseLost = F2(
	function (dec, f) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'mouseleave',
			A2(_elm_lang$core$Json_Decode$map, f, dec));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Event$onKeyboardLost = F2(
	function (dec, f) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'blur',
			A2(_elm_lang$core$Json_Decode$map, f, dec));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Event$onEnter = F2(
	function (dec, f) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'keydown',
			A2(
				_elm_lang$core$Json_Decode$map,
				f,
				A2(
					_elm_lang$core$Json_Decode$customDecoder,
					A3(
						_elm_lang$core$Json_Decode$object2,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_elm_lang$html$Html_Events$keyCode,
						dec),
					function (_p1) {
						var _p2 = _p1;
						return _elm_lang$core$Native_Utils.eq(_p2._0, 13) ? _elm_lang$core$Result$Ok(_p2._1) : _elm_lang$core$Result$Err('expected key code 13');
					})));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Event$onChange = F2(
	function (dec, f) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'change',
			A2(_elm_lang$core$Json_Decode$map, f, dec));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand_Event$onInput$ = F2(
	function (dec, f) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'input',
			A2(_elm_lang$core$Json_Decode$map, f, dec));
	});

var _circuithub$elm_html_shorthand$Html_Shorthand_Internal$encodeClass = function () {
	var isAlpha = function (c) {
		var cc = _elm_lang$core$Char$toCode(
			_elm_lang$core$Char$toLower(c));
		return (_elm_lang$core$Native_Utils.cmp(
			cc,
			_elm_lang$core$Char$toCode(
				_elm_lang$core$Native_Utils.chr('a'))) > -1) && (_elm_lang$core$Native_Utils.cmp(
			cc,
			_elm_lang$core$Char$toCode(
				_elm_lang$core$Native_Utils.chr('z'))) < 1);
	};
	var startWithAlpha = function (s) {
		var _p0 = _elm_lang$core$String$uncons(s);
		if (_p0.ctor === 'Just') {
			return _elm_lang$core$Basics$not(
				isAlpha(_p0._0._0)) ? A2(
				_elm_lang$core$String$cons,
				_elm_lang$core$Native_Utils.chr('x'),
				s) : s;
		} else {
			return s;
		}
	};
	var hu = _elm_lang$core$Native_List.fromArray(
		[
			_elm_lang$core$Native_Utils.chr('-'),
			_elm_lang$core$Native_Utils.chr('_')
		]);
	var isClassChar = function (c) {
		return _elm_lang$core$Char$isDigit(c) || (isAlpha(c) || A2(_elm_lang$core$List$member, c, hu));
	};
	var smartTrimLeft = function (s) {
		var _p1 = _elm_lang$core$String$uncons(s);
		if (_p1.ctor === 'Just') {
			return A2(_elm_lang$core$List$member, _p1._0._0, hu) ? _p1._0._1 : s;
		} else {
			return s;
		}
	};
	var smartTrimRight = function (s) {
		var _p2 = _elm_lang$core$String$uncons(
			_elm_lang$core$String$reverse(s));
		if (_p2.ctor === 'Just') {
			return A2(_elm_lang$core$List$member, _p2._0._0, hu) ? _elm_lang$core$String$reverse(_p2._0._1) : s;
		} else {
			return s;
		}
	};
	var smartTrim = function (_p3) {
		return smartTrimRight(
			smartTrimLeft(_p3));
	};
	return function (_p4) {
		return A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				function (_p5) {
					return startWithAlpha(
						smartTrim(
							A2(
								_elm_lang$core$String$filter,
								isClassChar,
								_elm_lang$core$String$toLower(_p5))));
				},
				_elm_lang$core$String$words(_p4)));
	};
}();
var _circuithub$elm_html_shorthand$Html_Shorthand_Internal$class$ = function (_p6) {
	return _elm_lang$html$Html_Attributes$class(
		_circuithub$elm_html_shorthand$Html_Shorthand_Internal$encodeClass(_p6));
};
var _circuithub$elm_html_shorthand$Html_Shorthand_Internal$encodeId = function () {
	var isAlpha = function (c) {
		var cc = _elm_lang$core$Char$toCode(
			_elm_lang$core$Char$toLower(c));
		return (_elm_lang$core$Native_Utils.cmp(
			cc,
			_elm_lang$core$Char$toCode(
				_elm_lang$core$Native_Utils.chr('a'))) > -1) && (_elm_lang$core$Native_Utils.cmp(
			cc,
			_elm_lang$core$Char$toCode(
				_elm_lang$core$Native_Utils.chr('z'))) < 1);
	};
	var startWithAlpha = function (s) {
		var _p7 = _elm_lang$core$String$uncons(s);
		if (_p7.ctor === 'Just') {
			return _elm_lang$core$Basics$not(
				isAlpha(_p7._0._0)) ? A2(
				_elm_lang$core$String$cons,
				_elm_lang$core$Native_Utils.chr('x'),
				s) : s;
		} else {
			return s;
		}
	};
	var hu = _elm_lang$core$Native_List.fromArray(
		[
			_elm_lang$core$Native_Utils.chr('-'),
			_elm_lang$core$Native_Utils.chr('_')
		]);
	var isIdChar = function (c) {
		return _elm_lang$core$Char$isDigit(c) || (isAlpha(c) || A2(_elm_lang$core$List$member, c, hu));
	};
	var smartTrimLeft = function (s) {
		var _p8 = _elm_lang$core$String$uncons(s);
		if (_p8.ctor === 'Just') {
			return A2(_elm_lang$core$List$member, _p8._0._0, hu) ? _p8._0._1 : s;
		} else {
			return s;
		}
	};
	var smartTrimRight = function (s) {
		var _p9 = _elm_lang$core$String$uncons(
			_elm_lang$core$String$reverse(s));
		if (_p9.ctor === 'Just') {
			return A2(_elm_lang$core$List$member, _p9._0._0, hu) ? _elm_lang$core$String$reverse(_p9._0._1) : s;
		} else {
			return s;
		}
	};
	var smartTrim = function (_p10) {
		return smartTrimRight(
			smartTrimLeft(_p10));
	};
	return function (_p11) {
		return startWithAlpha(
			A2(
				_elm_lang$core$String$join,
				'-',
				A2(
					_elm_lang$core$List$map,
					function (_p12) {
						return smartTrim(
							A2(
								_elm_lang$core$String$filter,
								isIdChar,
								_elm_lang$core$String$toLower(_p12)));
					},
					_elm_lang$core$String$words(_p11))));
	};
}();
var _circuithub$elm_html_shorthand$Html_Shorthand_Internal$id$ = function (_p13) {
	return _elm_lang$html$Html_Attributes$id(
		_circuithub$elm_html_shorthand$Html_Shorthand_Internal$encodeId(_p13));
};

var _circuithub$elm_html_shorthand$Html_Shorthand$meter$ = F2(
	function (p, t) {
		var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
		return A2(
			_elm_lang$html$Html$meter,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$value(
						_elm_lang$core$Basics$toString(p.value)),
						_elm_lang$html$Html_Attributes$min(
						_elm_lang$core$Basics$toString(_elm_lang$core$Basics$min)),
						_elm_lang$html$Html_Attributes$max(
						_elm_lang$core$Basics$toString(p.max))
					]),
				filterJust(
					_elm_lang$core$Native_List.fromArray(
						[
							A2(
							_elm_lang$core$Maybe$map,
							function (_p0) {
								return _elm_community$html_extra$Html_Attributes_Extra$low(
									_elm_lang$core$Basics$toString(_p0));
							},
							p.low),
							A2(
							_elm_lang$core$Maybe$map,
							function (_p1) {
								return _elm_community$html_extra$Html_Attributes_Extra$high(
									_elm_lang$core$Basics$toString(_p1));
							},
							p.high),
							A2(
							_elm_lang$core$Maybe$map,
							function (_p2) {
								return _elm_community$html_extra$Html_Attributes_Extra$optimum(
									_elm_lang$core$Basics$toString(_p2));
							},
							p.optimum)
						]))),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(t)
				]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$progress$ = F2(
	function (p, t) {
		return A2(
			_elm_lang$html$Html$progress,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$value(
					_elm_lang$core$Basics$toString(p.value)),
					_elm_lang$html$Html_Attributes$max(
					_elm_lang$core$Basics$toString(p.max))
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(t)
				]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$option$ = function (p) {
	return A2(
		_elm_lang$html$Html$option,
		_elm_lang$core$Native_List.fromArray(
			[
				A2(_elm_community$html_extra$Html_Attributes_Extra$stringProperty, 'label', p.label),
				_elm_lang$html$Html_Attributes$value(
				_elm_lang$core$Basics$toString(p.value)),
				_elm_lang$html$Html_Attributes$selected(p.selected)
			]),
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$option_ = F2(
	function (val, sel) {
		return A2(
			_elm_lang$html$Html$option,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$selected(sel)
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(val)
				]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$buttonReset_ = function (t) {
	return A2(
		_elm_lang$html$Html$button,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$type$('reset')
			]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$buttonSubmit_ = function (t) {
	return A2(
		_elm_lang$html$Html$button,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$type$('submit')
			]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$buttonLink_ = F2(
	function (t, msg) {
		return A2(
			_elm_lang$html$Html$a,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$href('#'),
					_elm_lang$html$Html_Events$onClick(msg)
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(t)
				]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$button_ = F2(
	function (t, msg) {
		return A2(
			_elm_lang$html$Html$button,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$type$('button'),
					_elm_lang$html$Html_Events$onClick(msg)
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(t)
				]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$label_ = F2(
	function ($for, t) {
		return A2(
			_elm_lang$html$Html$label,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$for($for)
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(t)
				]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$legend_ = function (t) {
	return A2(
		_elm_lang$html$Html$legend,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$fieldset_ = function (disabled) {
	return _elm_lang$html$Html$fieldset(
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$disabled(disabled)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$th_ = _elm_lang$html$Html$th(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$td_ = _elm_lang$html$Html$td(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$tr_ = _elm_lang$html$Html$tr(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$tfoot_ = _elm_lang$html$Html$tfoot(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$thead_ = _elm_lang$html$Html$thead(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$tbody_ = _elm_lang$html$Html$tbody(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$caption_ = _elm_lang$html$Html$caption(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$table_ = _elm_lang$html$Html$table(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$audio_ = function (url) {
	return A2(
		_elm_lang$html$Html$audio,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$src(url)
			]),
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$video_ = function (url) {
	return A2(
		_elm_lang$html$Html$video,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$src(url)
			]),
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$param$ = F2(
	function (n, v) {
		return A2(
			_elm_lang$html$Html$param,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$name(n),
					_elm_lang$html$Html_Attributes$value(v)
				]),
			_elm_lang$core$Native_List.fromArray(
				[]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$img_ = F4(
	function (w, h, s, a) {
		return A2(
			_elm_lang$html$Html$img,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$width(w),
					_elm_lang$html$Html_Attributes$height(h),
					_elm_lang$html$Html_Attributes$src(s),
					_elm_lang$html$Html_Attributes$alt(a)
				]),
			_elm_lang$core$Native_List.fromArray(
				[]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$del_ = _elm_lang$html$Html$del(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$ins_ = _elm_lang$html$Html$ins(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$wbr$ = A2(
	_elm_lang$html$Html$wbr,
	_elm_lang$core$Native_List.fromArray(
		[]),
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$br$ = A2(
	_elm_lang$html$Html$br,
	_elm_lang$core$Native_List.fromArray(
		[]),
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$span_ = _elm_lang$html$Html$span(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$bdo$ = function (dir) {
	return _elm_lang$html$Html$bdo(
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$dir(
				function () {
					var _p3 = dir;
					switch (_p3.ctor) {
						case 'LeftToRight':
							return 'ltr';
						case 'RightToLeft':
							return 'rtl';
						default:
							return 'auto';
					}
				}())
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$bdi_ = function (t) {
	return A2(
		_elm_lang$html$Html$bdi,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$rp_ = function (t) {
	return A2(
		_elm_lang$html$Html$rp,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$rt_ = function (t) {
	return A2(
		_elm_lang$html$Html$rt,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$ruby_ = _elm_lang$html$Html$ruby(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$mark_ = _elm_lang$html$Html$mark(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$u_ = function (t) {
	return A2(
		_elm_lang$html$Html$u,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$b_ = function (t) {
	return A2(
		_elm_lang$html$Html$b,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$i_ = function (t) {
	return A2(
		_elm_lang$html$Html$i,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$sup_ = function (t) {
	return A2(
		_elm_lang$html$Html$sup,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$sub_ = function (t) {
	return A2(
		_elm_lang$html$Html$sub,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$kbd_ = _elm_lang$html$Html$kbd(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$samp_ = _elm_lang$html$Html$samp(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$var_ = function (t) {
	return A2(
		_elm_lang$html$Html$var,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$code_ = _elm_lang$html$Html$code(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$abbr_ = function (t) {
	return A2(
		_elm_lang$html$Html$abbr,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$q_ = function (t) {
	return A2(
		_elm_lang$html$Html$q,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$cite_ = _elm_lang$html$Html$cite(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$s_ = function (t) {
	return A2(
		_elm_lang$html$Html$s,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$small_ = function (t) {
	return A2(
		_elm_lang$html$Html$small,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$strong_ = function (t) {
	return A2(
		_elm_lang$html$Html$strong,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$em_ = function (t) {
	return A2(
		_elm_lang$html$Html$em,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$a_ = F2(
	function (href, t) {
		return A2(
			_elm_lang$html$Html$a,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$href(href)
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(t)
				]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$div_ = _elm_lang$html$Html$div(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$figcaption_ = _elm_lang$html$Html$figcaption(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$dd_ = _elm_lang$html$Html$dd(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$dl_ = _elm_lang$html$Html$dl(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$li_ = _elm_lang$html$Html$li(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$ul_ = _elm_lang$html$Html$ul(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$ol_ = _elm_lang$html$Html$ol(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$blockquote_ = _elm_lang$html$Html$blockquote(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$pre_ = _elm_lang$html$Html$pre(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$hr_ = A2(
	_elm_lang$html$Html$hr,
	_elm_lang$core$Native_List.fromArray(
		[]),
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$p_ = _elm_lang$html$Html$p(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$main_ = _elm_lang$html$Html$main$(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$address_ = _elm_lang$html$Html$address(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$footer_ = _elm_lang$html$Html$footer(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$header_ = _elm_lang$html$Html$header(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$h6_ = function (t) {
	return A2(
		_elm_lang$html$Html$h6,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h5_ = function (t) {
	return A2(
		_elm_lang$html$Html$h5,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h4_ = function (t) {
	return A2(
		_elm_lang$html$Html$h4,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h3_ = function (t) {
	return A2(
		_elm_lang$html$Html$h3,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h2_ = function (t) {
	return A2(
		_elm_lang$html$Html$h2,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h1_ = function (t) {
	return A2(
		_elm_lang$html$Html$h1,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$nav_ = _elm_lang$html$Html$nav(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$body_ = _elm_lang$html$Html$body(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _circuithub$elm_html_shorthand$Html_Shorthand$class$ = _circuithub$elm_html_shorthand$Html_Shorthand_Internal$class$;
var _circuithub$elm_html_shorthand$Html_Shorthand$body$ = function (p) {
	return _elm_lang$html$Html$body(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$nav$ = function (p) {
	return _elm_lang$html$Html$nav(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h1$ = function (p) {
	return _elm_lang$html$Html$h1(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h2$ = function (p) {
	return _elm_lang$html$Html$h2(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h3$ = function (p) {
	return _elm_lang$html$Html$h3(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h4$ = function (p) {
	return _elm_lang$html$Html$h4(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h5$ = function (p) {
	return _elm_lang$html$Html$h5(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$h6$ = function (p) {
	return _elm_lang$html$Html$h6(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$header$ = function (p) {
	return _elm_lang$html$Html$header(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$footer$ = function (p) {
	return _elm_lang$html$Html$footer(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$address$ = function (p) {
	return _elm_lang$html$Html$address(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$p$ = function (param) {
	return _elm_lang$html$Html$p(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(param.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$pre$ = function (p) {
	return _elm_lang$html$Html$pre(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$blockquote$ = function (p) {
	return _elm_lang$html$Html$blockquote(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$cite(p.cite)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$ol$ = function (p) {
	return _elm_lang$html$Html$ol(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$ul$ = function (p) {
	return _elm_lang$html$Html$ul(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$li$ = function (p) {
	return _elm_lang$html$Html$li(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$dl$ = function (p) {
	return _elm_lang$html$Html$dl(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$dd$ = function (p) {
	return _elm_lang$html$Html$dd(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$figcaption$ = function (p) {
	return _elm_lang$html$Html$figcaption(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$div$ = function (p) {
	return _elm_lang$html$Html$div(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$a$ = function (p) {
	return _elm_lang$html$Html$a(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$href(p.href)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$em$ = function (p) {
	return _elm_lang$html$Html$em(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$strong$ = function (p) {
	return _elm_lang$html$Html$strong(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$small$ = function (p) {
	return _elm_lang$html$Html$small(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$s$ = function (p) {
	return _elm_lang$html$Html$s(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$cite$ = function (p) {
	return _elm_lang$html$Html$cite(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$q$ = function (p) {
	return _elm_lang$html$Html$q(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$cite(p.cite)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$abbr$ = function (p) {
	return _elm_lang$html$Html$abbr(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$code$ = function (p) {
	return _elm_lang$html$Html$code(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$var$ = function (p) {
	return _elm_lang$html$Html$var(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$samp$ = function (p) {
	return _elm_lang$html$Html$samp(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$kbd$ = function (p) {
	return _elm_lang$html$Html$kbd(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$sub$ = function (p) {
	return _elm_lang$html$Html$sub(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$sup$ = function (p) {
	return _elm_lang$html$Html$sup(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$i$ = function (p) {
	return _elm_lang$html$Html$i(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$b$ = function (p) {
	return _elm_lang$html$Html$b(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$u$ = function (p) {
	return _elm_lang$html$Html$u(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$mark$ = function (p) {
	return _elm_lang$html$Html$mark(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$ruby$ = function (p) {
	return _elm_lang$html$Html$ruby(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$rt$ = function (p) {
	return _elm_lang$html$Html$rt(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$rp$ = function (p) {
	return _elm_lang$html$Html$rp(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$bdi$ = function (p) {
	return _elm_lang$html$Html$bdi(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$span$ = function (p) {
	return _elm_lang$html$Html$span(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$ins$ = function (p) {
	return _elm_lang$html$Html$ins(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$cite(p.cite),
				_elm_lang$html$Html_Attributes$datetime(p.datetime)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$del$ = function (p) {
	return _elm_lang$html$Html$del(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$cite(p.cite),
				_elm_lang$html$Html_Attributes$datetime(p.datetime)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$img$ = function (p) {
	return A2(
		_elm_lang$html$Html$img,
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$src(p.src),
				_elm_lang$html$Html_Attributes$width(p.width),
				_elm_lang$html$Html_Attributes$height(p.height),
				_elm_lang$html$Html_Attributes$alt(p.alt)
			]),
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$video$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	return _elm_lang$html$Html$video(
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Native_List.fromArray(
				[
					_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
					_elm_lang$html$Html_Attributes$width(p.width),
					_elm_lang$html$Html_Attributes$height(p.height),
					_elm_lang$html$Html_Attributes$autoplay(p.autoplay),
					_elm_lang$html$Html_Attributes$controls(p.controls),
					_elm_lang$html$Html_Attributes$loop(p.loop)
				]),
			filterJust(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$src, p.src),
						A2(
						_elm_lang$core$Maybe$map,
						_elm_community$html_extra$Html_Attributes_Extra$stringProperty('preload'),
						p.preload),
						A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$poster, p.poster),
						A2(_elm_lang$core$Maybe$map, _elm_community$html_extra$Html_Attributes_Extra$volume, p.volume)
					]))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$audio$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	return _elm_lang$html$Html$audio(
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Native_List.fromArray(
				[
					_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
					_elm_lang$html$Html_Attributes$autoplay(p.autoplay),
					_elm_lang$html$Html_Attributes$controls(p.controls),
					_elm_lang$html$Html_Attributes$loop(p.loop)
				]),
			filterJust(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$src, p.src),
						A2(
						_elm_lang$core$Maybe$map,
						_elm_community$html_extra$Html_Attributes_Extra$stringProperty('preload'),
						p.preload),
						A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$poster, p.poster),
						A2(_elm_lang$core$Maybe$map, _elm_community$html_extra$Html_Attributes_Extra$volume, p.volume)
					]))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$table$ = function (p) {
	return _elm_lang$html$Html$table(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$caption$ = function (p) {
	return _elm_lang$html$Html$caption(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$tbody$ = function (p) {
	return _elm_lang$html$Html$tbody(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$thead$ = function (p) {
	return _elm_lang$html$Html$thead(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$tfoot$ = function (p) {
	return _elm_lang$html$Html$tfoot(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$tr$ = function (p) {
	return _elm_lang$html$Html$tr(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$td$ = function (p) {
	return _elm_lang$html$Html$td(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$th$ = function (p) {
	return _elm_lang$html$Html$th(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$form$ = function (p) {
	var onEnter$ = function (msg) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'keypress',
			A2(
				_elm_lang$core$Json_Decode$customDecoder,
				_elm_lang$html$Html_Events$keyCode,
				function (c) {
					return _elm_lang$core$Native_Utils.eq(c, 13) ? _elm_lang$core$Result$Ok(msg) : _elm_lang$core$Result$Err('expected key code 13');
				}));
	};
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	return _elm_lang$html$Html$form(
		A2(
			_elm_lang$core$List_ops['::'],
			_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
			A2(
				_elm_lang$core$List_ops['::'],
				_elm_lang$html$Html_Attributes$novalidate(p.novalidate),
				filterJust(
					_elm_lang$core$Native_List.fromArray(
						[
							A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Events$onSubmit, p.update.onSubmit),
							A2(_elm_lang$core$Maybe$map, onEnter$, p.update.onSubmit)
						])))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$fieldset$ = function (p) {
	return _elm_lang$html$Html$fieldset(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$disabled(p.disabled)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$legend$ = function (p) {
	return _elm_lang$html$Html$legend(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$label$ = function (p) {
	return _elm_lang$html$Html$label(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$for(p.$for)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$button$ = function (p) {
	return _elm_lang$html$Html$button(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$type$('button'),
				_elm_lang$html$Html_Events$onClick(p.update.onClick)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$buttonLink$ = function (p) {
	return _elm_lang$html$Html$a(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$href('#'),
				_elm_lang$html$Html_Events$onClick(p.update.onClick)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$buttonSubmit$ = function (p) {
	return _elm_lang$html$Html$button(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$type$('submit')
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$buttonReset$ = function (p) {
	return _elm_lang$html$Html$button(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$type$('reset')
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$id$ = _circuithub$elm_html_shorthand$Html_Shorthand_Internal$id$;
var _circuithub$elm_html_shorthand$Html_Shorthand$section_ = function (i) {
	return _elm_lang$html$Html$section(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(i)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$section$ = function (p) {
	return _elm_lang$html$Html$section(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(p.id)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$article_ = function (i) {
	return _elm_lang$html$Html$article(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(i)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$article$ = function (p) {
	return _elm_lang$html$Html$article(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(p.id)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$aside$ = function (p) {
	return _elm_lang$html$Html$aside(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(p.id)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$dt$ = function (p) {
	return _elm_lang$html$Html$dt(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(p.id)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$figure$ = function (p) {
	return _elm_lang$html$Html$figure(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(p.id)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$dfn$ = function (p) {
	return _elm_lang$html$Html$dfn(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(p.id)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$embed$ = function (p) {
	return A2(
		_elm_lang$html$Html$embed,
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_circuithub$elm_html_shorthand$Html_Shorthand$id$(p.id),
				_elm_lang$html$Html_Attributes$src(p.src),
				_elm_lang$html$Html_Attributes$type$(p.type$),
				_elm_lang$html$Html_Attributes$width(p.width),
				_elm_lang$html$Html_Attributes$height(p.height)
			]),
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$encodeClass = _circuithub$elm_html_shorthand$Html_Shorthand_Internal$encodeClass;
var _circuithub$elm_html_shorthand$Html_Shorthand$encodeId = _circuithub$elm_html_shorthand$Html_Shorthand_Internal$encodeId;
var _circuithub$elm_html_shorthand$Html_Shorthand$iframe$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	var i$ = _circuithub$elm_html_shorthand$Html_Shorthand$encodeId(p.name);
	return A2(
		_elm_lang$html$Html$iframe,
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Native_List.fromArray(
				[
					_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
					_elm_lang$html$Html_Attributes$id(i$),
					_elm_lang$html$Html_Attributes$name(i$),
					_elm_lang$html$Html_Attributes$src(p.src),
					_elm_lang$html$Html_Attributes$width(p.width),
					_elm_lang$html$Html_Attributes$height(p.height),
					_elm_lang$html$Html_Attributes$seamless(p.seamless)
				]),
			filterJust(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$sandbox, p.sandbox)
					]))),
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$object$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	var attrs = filterJust(
		_elm_lang$core$Native_List.fromArray(
			[
				A2(
				_elm_lang$core$Maybe$map,
				function (_p4) {
					return _elm_lang$html$Html_Attributes$usemap(
						A2(
							_elm_lang$core$String$cons,
							_elm_lang$core$Native_Utils.chr('#'),
							_circuithub$elm_html_shorthand$Html_Shorthand$encodeId(_p4)));
				},
				p.useMapName)
			]));
	var i$ = _circuithub$elm_html_shorthand$Html_Shorthand$encodeId(p.name);
	return _elm_lang$html$Html$object(
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Native_List.fromArray(
				[
					_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
					_elm_lang$html$Html_Attributes$id(i$),
					_elm_lang$html$Html_Attributes$name(i$),
					A2(_elm_lang$html$Html_Attributes$attribute, 'data', p.data),
					_elm_lang$html$Html_Attributes$type$(p.type$)
				]),
			A2(
				_elm_lang$core$Basics_ops['++'],
				attrs,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$height(p.height),
						_elm_lang$html$Html_Attributes$width(p.width)
					]))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputField$ = F2(
	function (p, attrs) {
		var i$ = _circuithub$elm_html_shorthand$Html_Shorthand$encodeId(p.name);
		var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
		var pattrs = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$type$(p.type$),
					_elm_lang$html$Html_Attributes$id(i$),
					_elm_lang$html$Html_Attributes$name(i$),
					_elm_lang$html$Html_Attributes$required(p.required)
				]),
			filterJust(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$core$Maybe$map,
						_circuithub$elm_html_shorthand$Html_Shorthand$class$,
						_elm_lang$core$Native_Utils.eq(p.$class, '') ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(p.$class)),
						A2(
						_elm_lang$core$Maybe$map,
						function (onEvent) {
							return A2(
								_circuithub$elm_html_shorthand$Html_Shorthand_Event$onInput$,
								A2(_circuithub$elm_html_shorthand$Html_Shorthand_Event$messageDecoder, p.decoder, onEvent),
								_elm_lang$core$Basics$identity);
						},
						p.update.onInput),
						A2(
						_elm_lang$core$Maybe$map,
						function (onEvent) {
							return A2(
								_circuithub$elm_html_shorthand$Html_Shorthand_Event$onEnter,
								A2(_circuithub$elm_html_shorthand$Html_Shorthand_Event$messageDecoder, p.decoder, onEvent),
								_elm_lang$core$Basics$identity);
						},
						p.update.onEnter),
						A2(
						_elm_lang$core$Maybe$map,
						function (onEvent) {
							return A2(
								_circuithub$elm_html_shorthand$Html_Shorthand_Event$onKeyboardLost,
								A2(_circuithub$elm_html_shorthand$Html_Shorthand_Event$messageDecoder, p.decoder, onEvent),
								_elm_lang$core$Basics$identity);
						},
						p.update.onKeyboardLost),
						A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$placeholder, p.placeholder),
						A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$pattern, p.pattern)
					])));
		return A2(
			_elm_lang$html$Html$input,
			A2(_elm_lang$core$Basics_ops['++'], pattrs, attrs),
			_elm_lang$core$Native_List.fromArray(
				[]));
	});
var _circuithub$elm_html_shorthand$Html_Shorthand$inputText$ = function (p) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{$class: p.$class, name: p.name, placeholder: p.placeholder, update: p.update, type$: 'text', pattern: _elm_lang$core$Maybe$Nothing, required: p.required, decoder: _elm_lang$html$Html_Events$targetValue},
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$value(p.value),
				_elm_lang$html$Html_Attributes$autocomplete(p.autocomplete)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputMaybeText$ = function (p) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{$class: p.$class, name: p.name, placeholder: p.placeholder, update: p.update, type$: 'text', pattern: _elm_lang$core$Maybe$Nothing, required: false, decoder: _elm_community$html_extra$Html_Events_Extra$targetValueMaybe},
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$value(
				A2(_elm_lang$core$Maybe$withDefault, '', p.value)),
				_elm_lang$html$Html_Attributes$autocomplete(p.autocomplete)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputFloat$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{
			$class: p.$class,
			name: p.name,
			placeholder: p.placeholder,
			update: p.update,
			type$: 'number',
			pattern: _elm_lang$core$Maybe$Nothing,
			required: true,
			decoder: function () {
				var _p5 = {ctor: '_Tuple2', _0: p.min, _1: p.max};
				if (((_p5.ctor === '_Tuple2') && (_p5._0.ctor === 'Nothing')) && (_p5._1.ctor === 'Nothing')) {
					return _elm_community$html_extra$Html_Events_Extra$targetValueFloat;
				} else {
					return A2(
						_elm_lang$core$Json_Decode$customDecoder,
						_elm_community$html_extra$Html_Events_Extra$targetValueFloat,
						function (v) {
							return ((_elm_lang$core$Native_Utils.cmp(
								v,
								A2(_elm_lang$core$Maybe$withDefault, -1 / 0, p.min)) < 0) || (_elm_lang$core$Native_Utils.cmp(
								v,
								A2(_elm_lang$core$Maybe$withDefault, 1 / 0, p.max)) > 0)) ? _elm_lang$core$Result$Err('out of bounds') : _elm_lang$core$Result$Ok(v);
						});
				}
			}()
		},
		A2(
			_elm_lang$core$List_ops['::'],
			_elm_community$html_extra$Html_Attributes_Extra$valueAsFloat(p.value),
			A2(
				_elm_lang$core$List_ops['::'],
				A2(
					_elm_community$html_extra$Html_Attributes_Extra$stringProperty,
					'step',
					A2(
						_elm_lang$core$Maybe$withDefault,
						'any',
						A2(_elm_lang$core$Maybe$map, _elm_lang$core$Basics$toString, p.step))),
				filterJust(
					_elm_lang$core$Native_List.fromArray(
						[
							A2(
							_elm_lang$core$Maybe$map,
							function (_p6) {
								return _elm_lang$html$Html_Attributes$min(
									_elm_lang$core$Basics$toString(_p6));
							},
							p.min),
							A2(
							_elm_lang$core$Maybe$map,
							function (_p7) {
								return _elm_lang$html$Html_Attributes$max(
									_elm_lang$core$Basics$toString(_p7));
							},
							p.max)
						])))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputMaybeFloat$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{
			$class: p.$class,
			name: p.name,
			placeholder: p.placeholder,
			update: p.update,
			type$: 'number',
			pattern: _elm_lang$core$Maybe$Nothing,
			required: false,
			decoder: function () {
				var _p8 = {ctor: '_Tuple2', _0: p.min, _1: p.max};
				if (((_p8.ctor === '_Tuple2') && (_p8._0.ctor === 'Nothing')) && (_p8._1.ctor === 'Nothing')) {
					return _elm_community$html_extra$Html_Events_Extra$targetValueMaybeFloat;
				} else {
					return A2(
						_elm_lang$core$Json_Decode$customDecoder,
						_elm_community$html_extra$Html_Events_Extra$targetValueMaybeFloat,
						function (mv) {
							var _p9 = mv;
							if (_p9.ctor === 'Nothing') {
								return _elm_lang$core$Result$Ok(_elm_lang$core$Maybe$Nothing);
							} else {
								var _p10 = _p9._0;
								return ((_elm_lang$core$Native_Utils.cmp(
									_p10,
									A2(_elm_lang$core$Maybe$withDefault, -1 / 0, p.min)) < 0) || (_elm_lang$core$Native_Utils.cmp(
									_p10,
									A2(_elm_lang$core$Maybe$withDefault, 1 / 0, p.max)) > 0)) ? _elm_lang$core$Result$Err('out of bounds') : _elm_lang$core$Result$Ok(mv);
							}
						});
				}
			}()
		},
		A2(
			_elm_lang$core$List_ops['::'],
			function () {
				var _p11 = p.value;
				if (_p11.ctor === 'Nothing') {
					return _elm_lang$html$Html_Attributes$value('');
				} else {
					return _elm_community$html_extra$Html_Attributes_Extra$valueAsFloat(_p11._0);
				}
			}(),
			A2(
				_elm_lang$core$List_ops['::'],
				A2(
					_elm_community$html_extra$Html_Attributes_Extra$stringProperty,
					'step',
					A2(
						_elm_lang$core$Maybe$withDefault,
						'any',
						A2(_elm_lang$core$Maybe$map, _elm_lang$core$Basics$toString, p.step))),
				filterJust(
					_elm_lang$core$Native_List.fromArray(
						[
							A2(
							_elm_lang$core$Maybe$map,
							function (_p12) {
								return _elm_lang$html$Html_Attributes$min(
									_elm_lang$core$Basics$toString(_p12));
							},
							p.min),
							A2(
							_elm_lang$core$Maybe$map,
							function (_p13) {
								return _elm_lang$html$Html_Attributes$max(
									_elm_lang$core$Basics$toString(_p13));
							},
							p.max)
						])))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputInt$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{
			$class: p.$class,
			name: p.name,
			placeholder: p.placeholder,
			update: p.update,
			type$: 'number',
			pattern: _elm_lang$core$Maybe$Nothing,
			required: true,
			decoder: function () {
				var _p14 = {ctor: '_Tuple2', _0: p.min, _1: p.max};
				if (((_p14.ctor === '_Tuple2') && (_p14._0.ctor === 'Nothing')) && (_p14._1.ctor === 'Nothing')) {
					return _elm_community$html_extra$Html_Events_Extra$targetValueInt;
				} else {
					return A2(
						_elm_lang$core$Json_Decode$customDecoder,
						_elm_community$html_extra$Html_Events_Extra$targetValueInt,
						function (v) {
							return ((_elm_lang$core$Native_Utils.cmp(
								v,
								A2(
									_elm_lang$core$Maybe$withDefault,
									_elm_lang$core$Basics$floor(-1 / 0),
									p.min)) < 0) || (_elm_lang$core$Native_Utils.cmp(
								v,
								A2(
									_elm_lang$core$Maybe$withDefault,
									_elm_lang$core$Basics$ceiling(1 / 0),
									p.max)) > 0)) ? _elm_lang$core$Result$Err('out of bounds') : _elm_lang$core$Result$Ok(v);
						});
				}
			}()
		},
		A2(
			_elm_lang$core$List_ops['::'],
			_elm_community$html_extra$Html_Attributes_Extra$valueAsInt(p.value),
			filterJust(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$core$Maybe$map,
						function (_p15) {
							return _elm_lang$html$Html_Attributes$min(
								_elm_lang$core$Basics$toString(_p15));
						},
						p.min),
						A2(
						_elm_lang$core$Maybe$map,
						function (_p16) {
							return _elm_lang$html$Html_Attributes$max(
								_elm_lang$core$Basics$toString(_p16));
						},
						p.max),
						A2(
						_elm_lang$core$Maybe$map,
						function (_p17) {
							return A2(
								_elm_community$html_extra$Html_Attributes_Extra$stringProperty,
								'step',
								_elm_lang$core$Basics$toString(_p17));
						},
						p.step)
					]))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputMaybeInt$ = function (p) {
	var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{
			$class: p.$class,
			name: p.name,
			placeholder: p.placeholder,
			update: p.update,
			type$: 'number',
			pattern: _elm_lang$core$Maybe$Nothing,
			required: false,
			decoder: function () {
				var _p18 = {ctor: '_Tuple2', _0: p.min, _1: p.max};
				if (((_p18.ctor === '_Tuple2') && (_p18._0.ctor === 'Nothing')) && (_p18._1.ctor === 'Nothing')) {
					return _elm_community$html_extra$Html_Events_Extra$targetValueMaybeInt;
				} else {
					return A2(
						_elm_lang$core$Json_Decode$customDecoder,
						_elm_community$html_extra$Html_Events_Extra$targetValueMaybeInt,
						function (mv) {
							var _p19 = mv;
							if (_p19.ctor === 'Nothing') {
								return _elm_lang$core$Result$Ok(_elm_lang$core$Maybe$Nothing);
							} else {
								var _p20 = _p19._0;
								return ((_elm_lang$core$Native_Utils.cmp(
									_p20,
									A2(
										_elm_lang$core$Maybe$withDefault,
										_elm_lang$core$Basics$floor(-1 / 0),
										p.min)) < 0) || (_elm_lang$core$Native_Utils.cmp(
									_p20,
									A2(
										_elm_lang$core$Maybe$withDefault,
										_elm_lang$core$Basics$ceiling(1 / 0),
										p.max)) > 0)) ? _elm_lang$core$Result$Err('out of bounds') : _elm_lang$core$Result$Ok(mv);
							}
						});
				}
			}()
		},
		A2(
			_elm_lang$core$List_ops['::'],
			function () {
				var _p21 = p.value;
				if (_p21.ctor === 'Nothing') {
					return _elm_lang$html$Html_Attributes$value('');
				} else {
					return _elm_community$html_extra$Html_Attributes_Extra$valueAsInt(_p21._0);
				}
			}(),
			filterJust(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$core$Maybe$map,
						function (_p22) {
							return _elm_lang$html$Html_Attributes$min(
								_elm_lang$core$Basics$toString(_p22));
						},
						p.min),
						A2(
						_elm_lang$core$Maybe$map,
						function (_p23) {
							return _elm_lang$html$Html_Attributes$max(
								_elm_lang$core$Basics$toString(_p23));
						},
						p.max),
						A2(
						_elm_lang$core$Maybe$map,
						function (_p24) {
							return A2(
								_elm_community$html_extra$Html_Attributes_Extra$stringProperty,
								'step',
								_elm_lang$core$Basics$toString(_p24));
						},
						p.step)
					]))));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputUrl$ = function (p) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{$class: p.$class, name: p.name, placeholder: p.placeholder, update: p.update, type$: 'url', pattern: _elm_lang$core$Maybe$Nothing, required: p.required, decoder: _elm_lang$html$Html_Events$targetValue},
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$value(p.value),
				_elm_lang$html$Html_Attributes$autocomplete(p.autocomplete)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$inputMaybeUrl$ = function (p) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$inputField$,
		{$class: p.$class, name: p.name, placeholder: p.placeholder, update: p.update, type$: 'url', pattern: _elm_lang$core$Maybe$Nothing, required: false, decoder: _elm_community$html_extra$Html_Events_Extra$targetValueMaybe},
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$value(
				A2(_elm_lang$core$Maybe$withDefault, '', p.value)),
				_elm_lang$html$Html_Attributes$autocomplete(p.autocomplete)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$select$ = function (p) {
	var i$ = _circuithub$elm_html_shorthand$Html_Shorthand$encodeId(p.name);
	return _elm_lang$html$Html$select(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$id(i$),
				_elm_lang$html$Html_Attributes$name(i$),
				A2(_circuithub$elm_html_shorthand$Html_Shorthand_Event$onChange, _elm_lang$html$Html_Events$targetValue, p.update.onSelect)
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$output$ = function (p) {
	var i$ = _circuithub$elm_html_shorthand$Html_Shorthand$encodeId(p.name);
	return _elm_lang$html$Html$output(
		_elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_html_shorthand$Html_Shorthand$class$(p.$class),
				_elm_lang$html$Html_Attributes$id(i$),
				_elm_lang$html$Html_Attributes$name(i$),
				_elm_lang$html$Html_Attributes$for(
				A2(
					_elm_lang$core$String$join,
					' ',
					A2(_elm_lang$core$List$map, _circuithub$elm_html_shorthand$Html_Shorthand$encodeId, p.$for)))
			]));
};
var _circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdateFallbackFocusLost = function (handler) {
	var doErr = function (r) {
		var _p25 = r;
		if (_p25.ctor === 'Ok') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p26 = A2(_elm_lang$core$Json_Decode$decodeValue, _elm_lang$html$Html_Events$targetValue, _p25._0.event);
			if (_p26.ctor === 'Ok') {
				return _elm_lang$core$Maybe$Just(
					handler.onFallback(_p26._0));
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	};
	var doOk = function (r) {
		var _p27 = r;
		if (_p27.ctor === 'Ok') {
			return _elm_lang$core$Maybe$Just(
				handler.onInput(_p27._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return {
		onInput: _elm_lang$core$Maybe$Just(doOk),
		onEnter: _elm_lang$core$Maybe$Just(doErr),
		onKeyboardLost: _elm_lang$core$Maybe$Just(doErr)
	};
};
var _circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdate = {onInput: _elm_lang$core$Maybe$Nothing, onEnter: _elm_lang$core$Maybe$Nothing, onKeyboardLost: _elm_lang$core$Maybe$Nothing};
var _circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdateContinuous = function (handler) {
	var doOk = function (r) {
		var _p28 = r;
		if (_p28.ctor === 'Ok') {
			return _elm_lang$core$Maybe$Just(
				handler.onInput(_p28._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return _elm_lang$core$Native_Utils.update(
		_circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdate,
		{
			onInput: _elm_lang$core$Maybe$Just(doOk)
		});
};
var _circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdateFocusLost = function (handler) {
	var doOk = function (r) {
		var _p29 = r;
		if (_p29.ctor === 'Ok') {
			return _elm_lang$core$Maybe$Just(
				handler.onInput(_p29._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return _elm_lang$core$Native_Utils.update(
		_circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdate,
		{
			onEnter: _elm_lang$core$Maybe$Just(doOk),
			onKeyboardLost: _elm_lang$core$Maybe$Just(doOk)
		});
};
var _circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdateFallbackContinuous = function (handler) {
	var doOkErr = function (r) {
		var _p30 = r;
		if (_p30.ctor === 'Ok') {
			return _elm_lang$core$Maybe$Just(
				handler.onInput(_p30._0));
		} else {
			var _p31 = A2(_elm_lang$core$Json_Decode$decodeValue, _elm_lang$html$Html_Events$targetValue, _p30._0.event);
			if (_p31.ctor === 'Ok') {
				return _elm_lang$core$Maybe$Just(
					handler.onFallback(_p31._0));
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	};
	return _elm_lang$core$Native_Utils.update(
		_circuithub$elm_html_shorthand$Html_Shorthand$fieldUpdate,
		{
			onInput: _elm_lang$core$Maybe$Just(doOkErr)
		});
};
var _circuithub$elm_html_shorthand$Html_Shorthand$AutoDirection = {ctor: 'AutoDirection'};
var _circuithub$elm_html_shorthand$Html_Shorthand$RightToLeft = {ctor: 'RightToLeft'};
var _circuithub$elm_html_shorthand$Html_Shorthand$LeftToRight = {ctor: 'LeftToRight'};

var _circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset = F3(
	function (gridsize, colspan, offset) {
		var prefix = A2(
			_elm_lang$core$Basics_ops['++'],
			'col',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$String$cons,
					_elm_lang$core$Native_Utils.chr('-'),
					gridsize),
				'-'));
		return (_elm_lang$core$Native_Utils.cmp(offset, 0) > 0) ? A2(
			_elm_lang$core$Basics_ops['++'],
			prefix,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(colspan),
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$String$cons,
						_elm_lang$core$Native_Utils.chr(' '),
						prefix),
					A2(
						_elm_lang$core$Basics_ops['++'],
						'offset-',
						_elm_lang$core$Basics$toString(offset))))) : A2(
			_elm_lang$core$Basics_ops['++'],
			prefix,
			_elm_lang$core$Basics$toString(colspan));
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent = F3(
	function (c, typ, _p0) {
		var _p1 = _p0;
		var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
		return A2(
			_elm_lang$html$Html$button,
			A2(
				_elm_lang$core$List_ops['::'],
				_elm_lang$html$Html_Attributes$type$(typ),
				A2(
					_elm_lang$core$List_ops['::'],
					_circuithub$elm_html_shorthand$Html_Shorthand$class$(
						A2(_elm_lang$core$Basics_ops['++'], 'btn ', c)),
					filterJust(
						_elm_lang$core$Native_List.fromArray(
							[
								A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$title, _p1.tooltip)
							])))),
			function () {
				var _p2 = {ctor: '_Tuple2', _0: _p1.icon, _1: _p1.label};
				_v1_3:
				do {
					if (_p2.ctor === '_Tuple2') {
						if (_p2._0.ctor === 'Just') {
							if (_p2._1.ctor === 'Just') {
								return _elm_lang$core$Native_List.fromArray(
									[
										_p2._0._0,
										_elm_lang$html$Html$text(
										A2(
											_elm_lang$core$String$cons,
											_elm_lang$core$Native_Utils.chr(' '),
											_p2._1._0))
									]);
							} else {
								return _elm_lang$core$Native_List.fromArray(
									[_p2._0._0]);
							}
						} else {
							if (_p2._1.ctor === 'Just') {
								return _elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html$text(_p2._1._0)
									]);
							} else {
								break _v1_3;
							}
						}
					} else {
						break _v1_3;
					}
				} while(false);
				return _elm_lang$core$Native_List.fromArray(
					[]);
			}());
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc = F4(
	function (c, typ, _p3, x) {
		var _p4 = _p3;
		var filterJust = _elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity);
		return A2(
			_elm_lang$html$Html$button,
			A2(
				_elm_lang$core$List_ops['::'],
				_elm_lang$html$Html_Attributes$type$(typ),
				A2(
					_elm_lang$core$List_ops['::'],
					_circuithub$elm_html_shorthand$Html_Shorthand$class$(
						A2(_elm_lang$core$Basics_ops['++'], 'btn ', c)),
					A2(
						_elm_lang$core$List_ops['::'],
						_elm_lang$html$Html_Events$onClick(x),
						filterJust(
							_elm_lang$core$Native_List.fromArray(
								[
									A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$title, _p4.tooltip)
								]))))),
			function () {
				var _p5 = {ctor: '_Tuple2', _0: _p4.icon, _1: _p4.label};
				_v3_3:
				do {
					if (_p5.ctor === '_Tuple2') {
						if (_p5._0.ctor === 'Just') {
							if (_p5._1.ctor === 'Just') {
								return _elm_lang$core$Native_List.fromArray(
									[
										_p5._0._0,
										_elm_lang$html$Html$text(
										A2(
											_elm_lang$core$String$cons,
											_elm_lang$core$Native_Utils.chr(' '),
											_p5._1._0))
									]);
							} else {
								return _elm_lang$core$Native_List.fromArray(
									[_p5._0._0]);
							}
						} else {
							if (_p5._1.ctor === 'Just') {
								return _elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html$text(_p5._1._0)
									]);
							} else {
								break _v3_3;
							}
						}
					} else {
						break _v3_3;
					}
				} while(false);
				return _elm_lang$core$Native_List.fromArray(
					[]);
			}());
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$BtnParam = F3(
	function (a, b, c) {
		return {icon: a, label: b, tooltip: c};
	});

var _circuithub$elm_bootstrap_html$Bootstrap_Html$wellLg_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'well well-lg'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$wellSm_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'well well-sm'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$well_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'well'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$embedResponsive4x3_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'embed-responsive embed-responsive-4by3'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$embedResponsive16x9_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'embed-responsive embed-responsive-16by9'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$panelTitle_ = function (t) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$h2$,
		{$class: 'panel-title'},
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$panelBody_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'panel-body'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$panelHeading_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'panel-heading'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$panelDefault_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'panel panel-default'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$navbarHeader_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'navbar-header'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$navbar$ = function (c) {
	return _circuithub$elm_html_shorthand$Html_Shorthand$nav$(
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'navbar ', c)
		});
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$navbarDefault$ = function (c) {
	return _circuithub$elm_bootstrap_html$Bootstrap_Html$navbar$(
		A2(_elm_lang$core$Basics_ops['++'], 'navbar-default ', c));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTreeDeciduous$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-tree-deciduous ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTreeDeciduous_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTreeDeciduous$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTreeConifer$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-tree-conifer ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTreeConifer_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTreeConifer$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloudUpload$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-cloud-upload ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloudUpload_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloudUpload$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloudDownload$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-cloud-download ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloudDownload_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloudDownload$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRegistrationMark$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-registration-mark ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRegistrationMark_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRegistrationMark$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCopyrightMark$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-copyright-mark ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCopyrightMark_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCopyrightMark$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound71$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sound-7-1 ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound71_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound71$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound61$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sound-6-1 ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound61_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound61$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound51$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sound-5-1 ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound51_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSound51$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSoundDolby$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sound-dolby ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSoundDolby_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSoundDolby$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSoundStereo$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sound-stereo ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSoundStereo_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSoundStereo$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSubtitles$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-subtitles ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSubtitles_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSubtitles$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHdVideo$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-hd-video ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHdVideo_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHdVideo$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSdVideo$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sd-video ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSdVideo_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSdVideo$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStats$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-stats ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStats_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStats$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTower$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-tower ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTower_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTower$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPhoneAlt$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-phone-alt ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPhoneAlt_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPhoneAlt$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEarphone$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-earphone ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEarphone_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEarphone$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCompressed$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-compressed ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCompressed_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCompressed$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeader$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-header ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeader_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeader$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCutlery$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-cutlery ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCutlery_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCutlery$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTransfer$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-transfer ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTransfer_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTransfer$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCreditCard$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-credit-card ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCreditCard_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCreditCard$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyOpen$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-floppy-open ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyOpen_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyOpen$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppySave$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-floppy-save ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppySave_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppySave$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyRemove$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-floppy-remove ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyRemove_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyRemove$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppySaved$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-floppy-saved ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppySaved_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppySaved$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyDisk$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-floppy-disk ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyDisk_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFloppyDisk$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSend$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-send ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSend_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSend$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExport$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-export ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExport_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExport$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconImport$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-import ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconImport_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconImport$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSaved$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-saved ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSaved_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSaved$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOpen$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-open ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOpen_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOpen$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSave$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-save ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSave_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSave$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRecord$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-record ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRecord_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRecord$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconNewWindow$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-new-window ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconNewWindow_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconNewWindow$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLogOut$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-log-out ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLogOut_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLogOut$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFlash$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-flash ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFlash_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFlash$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLogIn$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-log-in ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLogIn_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLogIn$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCollapseUp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-collapse-up ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCollapseUp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCollapseUp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCollapseDown$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-collapse-down ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCollapseDown_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCollapseDown$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExpand$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-expand ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExpand_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExpand$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUnchecked$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-unchecked ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUnchecked_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUnchecked$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAttributesAlt$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sort-by-attributes-alt ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAttributesAlt_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAttributesAlt$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAttributes$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sort-by-attributes ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAttributes_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAttributes$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByOrderAlt$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sort-by-order-alt ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByOrderAlt_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByOrderAlt$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByOrder$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sort-by-order ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByOrder_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByOrder$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAlphabetAlt$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sort-by-alphabet-alt ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAlphabetAlt_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAlphabetAlt$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAlphabet$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sort-by-alphabet ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAlphabet_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSortByAlphabet$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSort$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-sort ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSort_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSort$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGbp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-gbp ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGbp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGbp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUsd$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-usd ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUsd_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUsd$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPushpin$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-pushpin ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPushpin_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPushpin$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPhone$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-phone ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPhone_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPhone$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLink$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-link ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLink_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLink$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeartEmpty$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-heart-empty ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeartEmpty_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeartEmpty$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPaperclip$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-paperclip ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPaperclip_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPaperclip$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDashboard$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-dashboard ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDashboard_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDashboard$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFullscreen$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-fullscreen ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFullscreen_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFullscreen$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBriefcase$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-briefcase ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBriefcase_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBriefcase$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFilter$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-filter ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFilter_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFilter$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTasks$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-tasks ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTasks_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTasks$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconWrench$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-wrench ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconWrench_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconWrench$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGlobe$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-globe ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGlobe_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGlobe$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowDown$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-circle-arrow-down ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowDown_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowDown$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowUp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-circle-arrow-up ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowUp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowUp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowLeft$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-circle-arrow-left ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowLeft_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowLeft$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowRight$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-circle-arrow-right ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowRight_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCircleArrowRight$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandDown$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-hand-down ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandDown_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandDown$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandUp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-hand-up ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandUp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandUp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandLeft$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-hand-left ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandLeft_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandLeft$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandRight$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-hand-right ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandRight_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHandRight$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThumbsDown$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-thumbs-down ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThumbsDown_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThumbsDown$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThumbsUp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-thumbs-up ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThumbsUp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThumbsUp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCertificate$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-certificate ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCertificate_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCertificate$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBell$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-bell ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBell_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBell$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBullhorn$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-bullhorn ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBullhorn_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBullhorn$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHdd$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-hdd ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHdd_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHdd$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeHorizontal$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-resize-horizontal ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeHorizontal_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeHorizontal$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeVertical$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-resize-vertical ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeVertical_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeVertical$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFolderOpen$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-folder-open ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFolderOpen_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFolderOpen$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFolderClose$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-folder-close ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFolderClose_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFolderClose$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShoppingCart$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-shopping-cart ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShoppingCart_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShoppingCart$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRetweet$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-retweet ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRetweet_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRetweet$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronDown$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-chevron-down ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronDown_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronDown$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronUp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-chevron-up ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronUp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronUp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMagnet$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-magnet ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMagnet_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMagnet$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconComment$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-comment ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconComment_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconComment$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRandom$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-random ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRandom_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRandom$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCalendar$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-calendar ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCalendar_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCalendar$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlane$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-plane ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlane_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlane$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconWarningSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-warning-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconWarningSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconWarningSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEyeClose$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-eye-close ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEyeClose_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEyeClose$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEyeOpen$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-eye-open ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEyeOpen_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEyeOpen$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFire$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-fire ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFire_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFire$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLeaf$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-leaf ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLeaf_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLeaf$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGift$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-gift ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGift_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGift$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExclamationSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-exclamation-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExclamationSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconExclamationSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeSmall$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-resize-small ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeSmall_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeSmall$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeFull$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-resize-full ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeFull_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconResizeFull$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShareAlt$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-share-alt ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShareAlt_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShareAlt$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowDown$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-arrow-down ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowDown_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowDown$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowUp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-arrow-up ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowUp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowUp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowRight$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-arrow-right ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowRight_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowRight$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowLeft$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-arrow-left ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowLeft_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconArrowLeft$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBanCircle$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-ban-circle ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBanCircle_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBanCircle$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOkCircle$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-ok-circle ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOkCircle_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOkCircle$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemoveCircle$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-remove-circle ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemoveCircle_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemoveCircle$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconScreenshot$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-screenshot ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconScreenshot_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconScreenshot$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconInfoSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-info-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconInfoSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconInfoSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconQuestionSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-question-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconQuestionSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconQuestionSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOkSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-ok-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOkSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOkSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemoveSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-remove-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemoveSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemoveSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMinusSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-minus-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMinusSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMinusSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlusSign$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-plus-sign ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlusSign_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlusSign$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronRight$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-chevron-right ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronRight_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronRight$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronLeft$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-chevron-left ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronLeft_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconChevronLeft$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEject$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-eject ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEject_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEject$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStepForward$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-step-forward ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStepForward_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStepForward$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFastForward$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-fast-forward ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFastForward_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFastForward$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconForward$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-forward ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconForward_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconForward$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStop$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-stop ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStop_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStop$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPause$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-pause ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPause_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPause$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlay$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-play ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlay_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlay$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBackward$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-backward ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBackward_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBackward$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFastBackward$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-fast-backward ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFastBackward_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFastBackward$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStepBackward$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-step-backward ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStepBackward_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStepBackward$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMove$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-move ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMove_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMove$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCheck$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-check ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCheck_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCheck$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShare$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-share ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShare_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconShare$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEdit$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-edit ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEdit_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEdit$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTint$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-tint ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTint_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTint$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAdjust$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-adjust ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAdjust_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAdjust$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMapMarker$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-map-marker ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMapMarker_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMapMarker$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPicture$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-picture ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPicture_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPicture$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFacetimeVideo$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-facetime-video ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFacetimeVideo_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFacetimeVideo$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconIndentRight$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-indent-right ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconIndentRight_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconIndentRight$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconIndentLeft$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-indent-left ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconIndentLeft_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconIndentLeft$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconList$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-list ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconList_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconList$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignJustify$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-align-justify ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignJustify_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignJustify$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignRight$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-align-right ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignRight_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignRight$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignCenter$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-align-center ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignCenter_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignCenter$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignLeft$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-align-left ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignLeft_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAlignLeft$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTextWidth$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-text-width ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTextWidth_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTextWidth$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTextHeight$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-text-height ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTextHeight_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTextHeight$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconItalic$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-italic ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconItalic_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconItalic$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBold$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-bold ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBold_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBold$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFont$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-font ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFont_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFont$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCamera$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-camera ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCamera_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCamera$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPrint$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-print ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPrint_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPrint$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBookmark$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-bookmark ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBookmark_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBookmark$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBook$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-book ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBook_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBook$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTags$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-tags ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTags_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTags$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTag$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-tag ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTag_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTag$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBarcode$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-barcode ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBarcode_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconBarcode$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconQrcode$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-qrcode ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconQrcode_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconQrcode$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeUp$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-volume-up ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeUp_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeUp$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeDown$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-volume-down ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeDown_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeDown$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeOff$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-volume-off ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeOff_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconVolumeOff$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeadphones$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-headphones ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeadphones_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeadphones$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFlag$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-flag ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFlag_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFlag$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLock$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-lock ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLock_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconLock$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconListAlt$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-list-alt ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconListAlt_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconListAlt$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRefresh$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-refresh ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRefresh_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRefresh$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRepeat$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-repeat ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRepeat_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRepeat$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlayCircle$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-play-circle ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlayCircle_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlayCircle$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconInbox$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-inbox ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconInbox_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconInbox$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUpload$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-upload ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUpload_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUpload$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDownload$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-download ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDownload_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDownload$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDownloadAlt$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-download-alt ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDownloadAlt_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconDownloadAlt$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRoad$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-road ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRoad_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRoad$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTime$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-time ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTime_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTime$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFile$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-file ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFile_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFile$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHome$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-home ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHome_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHome$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTrash$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-trash ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTrash_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTrash$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCog$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-cog ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCog_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCog$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSignal$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-signal ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSignal_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSignal$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOff$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-off ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOff_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOff$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconZoomOut$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-zoom-out ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconZoomOut_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconZoomOut$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconZoomIn$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-zoom-in ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconZoomIn_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconZoomIn$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemove$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-remove ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemove_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconRemove$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOk$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-ok ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOk_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconOk$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThList$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-th-list ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThList_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThList$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTh$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-th ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTh_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconTh$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThLarge$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-th-large ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThLarge_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconThLarge$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFilm$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-film ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFilm_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconFilm$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUser$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-user ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUser_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconUser$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStarEmpty$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-star-empty ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStarEmpty_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStarEmpty$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStar$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-star ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStar_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconStar$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeart$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-heart ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeart_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconHeart$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSearch$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-search ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSearch_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconSearch$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMusic$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-music ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMusic_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMusic$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGlass$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-glass ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGlass_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconGlass$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPencil$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-pencil ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPencil_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPencil$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEnvelope$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-envelope ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEnvelope_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEnvelope$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloud$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-cloud ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloud_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconCloud$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMinus$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-minus ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMinus_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconMinus$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEuro$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-euro ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEuro_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconEuro$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlus$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-plus ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlus_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconPlus$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAsterisk$ = function (c) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$span$,
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'glyphicon glyphicon-asterisk ', c)
		},
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAsterisk_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$glyphiconAsterisk$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$skipNavigation_ = function (t) {
	return A2(
		_circuithub$elm_html_shorthand$Html_Shorthand$a$,
		{$class: 'sr-only sr-only-focusable', href: '#content'},
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(t)
			]));
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitLgPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent, 'btn-lg btn-primary', 'submit', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitLgPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-lg btn-primary ', c),
			'submit',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitSmPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent, 'btn-sm btn-primary', 'submit', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitSmPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-sm btn-primary ', c),
			'submit',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitXsPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent, 'btn-xs btn-primary ', 'submit', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitXsPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-xs btn-primary ', c),
			'submit',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent, 'btn-primary', 'submit', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSubmitPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btncNoevent,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-primary ', c),
			'submit',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgDanger_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-lg btn-danger', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgDanger$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-lg btn-danger ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmDanger_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-sm btn-danger', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmDanger$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-sm btn-danger ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsDanger_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-xs btn-danger ', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsDanger$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-xs btn-danger ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnDanger_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-danger', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnDanger$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-danger ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgWarning_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-lg btn-warning', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgWarning$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-lg btn-warning ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmWarning_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-sm btn-warning', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmWarning$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-sm btn-warning ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsWarning_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-xs btn-warning ', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsWarning$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-xs btn-warning ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnWarning_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-warning', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnWarning$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-warning ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgInfo_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-lg btn-info', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgInfo$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-lg btn-info ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmInfo_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-sm btn-info', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmInfo$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-sm btn-info ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsInfo_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-xs btn-info ', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsInfo$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-xs btn-info ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnInfo_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-info', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnInfo$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-info ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgSuccess_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-lg btn-success', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgSuccess$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-lg btn-success ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmSuccess_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-sm btn-success', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmSuccess$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-sm btn-success ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsSuccess_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-xs btn-success ', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsSuccess$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-xs btn-success ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$panelDefault$ = F3(
	function (t, btns, bs) {
		var uncurry3 = F2(
			function (f, _p0) {
				var _p1 = _p0;
				return A2(f, _p1._0, _p1._1);
			});
		return _circuithub$elm_bootstrap_html$Bootstrap_Html$panelDefault_(
			_elm_lang$core$Native_List.fromArray(
				[
					_circuithub$elm_bootstrap_html$Bootstrap_Html$panelHeading_(
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_elm_lang$core$List$map,
							uncurry3(
								_circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsSuccess$('pull-right')),
							_elm_lang$core$List$reverse(btns)),
						_elm_lang$core$Native_List.fromArray(
							[
								_circuithub$elm_bootstrap_html$Bootstrap_Html$panelTitle_(t)
							]))),
					_circuithub$elm_bootstrap_html$Bootstrap_Html$panelBody_(bs)
				]));
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSuccess_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-success', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSuccess$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-success ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-lg btn-primary', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-lg btn-primary ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-sm btn-primary', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-sm btn-primary ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-xs btn-primary ', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-xs btn-primary ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnPrimary_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-primary', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnPrimary$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-primary ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgDefault_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-lg btn-default', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnLgDefault$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-lg btn-default ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmDefault_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-sm btn-default', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnSmDefault$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-sm btn-default ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsDefault_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-xs btn-default ', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnXsDefault$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-xs btn-default  ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnDefault_ = function (p) {
	return A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc, 'btn-default', 'button', p);
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnDefault$ = F2(
	function (c, p) {
		return A3(
			_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$btnc,
			A2(_elm_lang$core$Basics_ops['++'], 'btn-default ', c),
			'button',
			p);
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$btnParam = {icon: _elm_lang$core$Maybe$Nothing, label: _elm_lang$core$Maybe$Nothing, tooltip: _elm_lang$core$Maybe$Nothing};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$formGroup_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'form-group'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$tableBodyStriped$ = function (c) {
	return _circuithub$elm_html_shorthand$Html_Shorthand$table$(
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'table table-body-striped ', c)
		});
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$tableBodyStriped_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$tableBodyStriped$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$tableStriped$ = function (c) {
	return _circuithub$elm_html_shorthand$Html_Shorthand$table$(
		{
			$class: A2(_elm_lang$core$Basics_ops['++'], 'table table-striped ', c)
		});
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$tableStriped_ = _circuithub$elm_bootstrap_html$Bootstrap_Html$tableStriped$('');
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colLgOffset_ = F8(
	function (xs, xsOffset, sm, smOffset, md, mdOffset, lg, lgOffset) {
		return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
			{
				$class: A2(
					_elm_lang$core$Basics_ops['++'],
					A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'xs', xs, xsOffset),
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_elm_lang$core$String$cons,
							_elm_lang$core$Native_Utils.chr(' '),
							A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'sm', sm, smOffset)),
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(
								_elm_lang$core$String$cons,
								_elm_lang$core$Native_Utils.chr(' '),
								A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'md', md, mdOffset)),
							A2(
								_elm_lang$core$String$cons,
								_elm_lang$core$Native_Utils.chr(' '),
								A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'lg', lg, lgOffset)))))
			});
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colMdOffset_ = F6(
	function (xs, xsOffset, sm, smOffset, md, mdOffset) {
		return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
			{
				$class: A2(
					_elm_lang$core$Basics_ops['++'],
					A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'xs', xs, xsOffset),
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_elm_lang$core$String$cons,
							_elm_lang$core$Native_Utils.chr(' '),
							A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'sm', sm, smOffset)),
						A2(
							_elm_lang$core$String$cons,
							_elm_lang$core$Native_Utils.chr(' '),
							A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'md', md, mdOffset))))
			});
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colSmOffset_ = F4(
	function (xs, xsOffset, sm, smOffset) {
		return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
			{
				$class: A2(
					_elm_lang$core$Basics_ops['++'],
					A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'xs', xs, xsOffset),
					A2(
						_elm_lang$core$String$cons,
						_elm_lang$core$Native_Utils.chr(' '),
						A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'sm', sm, smOffset)))
			});
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colXsOffset_ = F2(
	function (xs, xsOffset) {
		return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
			{
				$class: A3(_circuithub$elm_bootstrap_html$Bootstrap_Html_Internal$colOffset, 'xs', xs, xsOffset)
			});
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colLg_ = F4(
	function (xs, sm, md, lg) {
		return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
			{
				$class: A2(
					_elm_lang$core$Basics_ops['++'],
					'col-xs-',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(xs),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' col-sm-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(sm),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' col-md-',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(md),
										A2(
											_elm_lang$core$Basics_ops['++'],
											' col-lg-',
											_elm_lang$core$Basics$toString(lg))))))))
			});
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colMd_ = F3(
	function (xs, sm, md) {
		return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
			{
				$class: A2(
					_elm_lang$core$Basics_ops['++'],
					'col-xs-',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(xs),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' col-sm-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(sm),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' col-md-',
									_elm_lang$core$Basics$toString(md))))))
			});
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colSm_ = F2(
	function (xs, sm) {
		return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
			{
				$class: A2(
					_elm_lang$core$Basics_ops['++'],
					'col-xs-',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(xs),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' col-sm-',
							_elm_lang$core$Basics$toString(sm))))
			});
	});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$colXs_ = function (xs) {
	return _circuithub$elm_html_shorthand$Html_Shorthand$div$(
		{
			$class: A2(
				_elm_lang$core$Basics_ops['++'],
				'col-xs-',
				_elm_lang$core$Basics$toString(xs))
		});
};
var _circuithub$elm_bootstrap_html$Bootstrap_Html$row_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'row'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$containerFluid_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'container-fluid'});
var _circuithub$elm_bootstrap_html$Bootstrap_Html$container_ = _circuithub$elm_html_shorthand$Html_Shorthand$div$(
	{$class: 'container'});

var _elm_community$basics_extra$Basics_Extra_ops = _elm_community$basics_extra$Basics_Extra_ops || {};
_elm_community$basics_extra$Basics_Extra_ops['=>'] = F2(
	function (v0, v1) {
		return {ctor: '_Tuple2', _0: v0, _1: v1};
	});
var _elm_community$basics_extra$Basics_Extra$never = function (n) {
	never:
	while (true) {
		var _v0 = n;
		n = _v0;
		continue never;
	}
};

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_p1._0,
				_elm_lang$core$Platform$sendToApp(router)));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (f, task) {
		return A2(
			_elm_lang$core$Task$onError,
			task,
			function (err) {
				return _elm_lang$core$Task$fail(
					f(err));
			});
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			});
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					});
			});
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							taskC,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							});
					});
			});
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							taskC,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									taskD,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									});
							});
					});
			});
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							taskC,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									taskD,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											taskE,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											});
									});
							});
					});
			});
	});
var _elm_lang$core$Task$andMap = F2(
	function (taskFunc, taskValue) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskFunc,
			function (func) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskValue,
					function (value) {
						return _elm_lang$core$Task$succeed(
							func(value));
					});
			});
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p2 = tasks;
	if (_p2.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			_elm_lang$core$Native_List.fromArray(
				[]));
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$List_ops['::'], x, y);
				}),
			_p2._0,
			_elm_lang$core$Task$sequence(_p2._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p3) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$toMaybe = function (task) {
	return A2(
		_elm_lang$core$Task$onError,
		A2(_elm_lang$core$Task$map, _elm_lang$core$Maybe$Just, task),
		function (_p4) {
			return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
		});
};
var _elm_lang$core$Task$fromMaybe = F2(
	function ($default, maybe) {
		var _p5 = maybe;
		if (_p5.ctor === 'Just') {
			return _elm_lang$core$Task$succeed(_p5._0);
		} else {
			return _elm_lang$core$Task$fail($default);
		}
	});
var _elm_lang$core$Task$toResult = function (task) {
	return A2(
		_elm_lang$core$Task$onError,
		A2(_elm_lang$core$Task$map, _elm_lang$core$Result$Ok, task),
		function (msg) {
			return _elm_lang$core$Task$succeed(
				_elm_lang$core$Result$Err(msg));
		});
};
var _elm_lang$core$Task$fromResult = function (result) {
	var _p6 = result;
	if (_p6.ctor === 'Ok') {
		return _elm_lang$core$Task$succeed(_p6._0);
	} else {
		return _elm_lang$core$Task$fail(_p6._0);
	}
};
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p9, _p8, _p7) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$T = function (a) {
	return {ctor: 'T', _0: a};
};
var _elm_lang$core$Task$perform = F3(
	function (onFail, onSuccess, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$T(
				A2(
					_elm_lang$core$Task$onError,
					A2(_elm_lang$core$Task$map, onSuccess, task),
					function (x) {
						return _elm_lang$core$Task$succeed(
							onFail(x));
					})));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$T(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			return A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Native_Scheduler.spawn(
					A2(
						_elm_lang$core$Time$setInterval,
						_p1,
						A2(_elm_lang$core$Platform$sendToSelf, router, _p1))),
				function (id) {
					return A3(
						_elm_lang$core$Time$spawnHelp,
						router,
						_p0._1,
						A3(_elm_lang$core$Dict$insert, _p1, id, processes));
				});
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				_elm_lang$core$Native_List.fromArray(
					[_p6]),
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				A2(_elm_lang$core$List_ops['::'], _p6, _p4._0),
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			return A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Time$now,
				function (time) {
					return A2(
						_elm_lang$core$Task$andThen,
						_elm_lang$core$Task$sequence(
							A2(
								_elm_lang$core$List$map,
								function (tagger) {
									return A2(
										_elm_lang$core$Platform$sendToApp,
										router,
										tagger(time));
								},
								_p7._0)),
						function (_p8) {
							return _elm_lang$core$Task$succeed(state);
						});
				});
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						_elm_lang$core$Native_Scheduler.kill(id),
						function (_p14) {
							return _p13._2;
						})
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: A2(_elm_lang$core$List_ops['::'], interval, _p18._0),
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: _elm_lang$core$Native_List.fromArray(
					[]),
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			killTask,
			function (_p20) {
				return A2(
					_elm_lang$core$Task$andThen,
					A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict),
					function (newProcesses) {
						return _elm_lang$core$Task$succeed(
							A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
					});
			});
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

//import Dict, List, Maybe, Native.Scheduler //

var _evancz$elm_http$Native_Http = function() {

function send(settings, request)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var req = new XMLHttpRequest();

		// start
		if (settings.onStart.ctor === 'Just')
		{
			req.addEventListener('loadStart', function() {
				var task = settings.onStart._0;
				_elm_lang$core$Native_Scheduler.rawSpawn(task);
			});
		}

		// progress
		if (settings.onProgress.ctor === 'Just')
		{
			req.addEventListener('progress', function(event) {
				var progress = !event.lengthComputable
					? _elm_lang$core$Maybe$Nothing
					: _elm_lang$core$Maybe$Just({
						loaded: event.loaded,
						total: event.total
					});
				var task = settings.onProgress._0(progress);
				_elm_lang$core$Native_Scheduler.rawSpawn(task);
			});
		}

		// end
		req.addEventListener('error', function() {
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'RawNetworkError' }));
		});

		req.addEventListener('timeout', function() {
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'RawTimeout' }));
		});

		req.addEventListener('load', function() {
			return callback(_elm_lang$core$Native_Scheduler.succeed(toResponse(req)));
		});

		req.open(request.verb, request.url, true);

		// set all the headers
		function setHeader(pair) {
			req.setRequestHeader(pair._0, pair._1);
		}
		A2(_elm_lang$core$List$map, setHeader, request.headers);

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

		return function() {
			req.abort();
		};
	});
}


// deal with responses

function toResponse(req)
{
	var tag = req.responseType === 'blob' ? 'Blob' : 'Text'
	var response = tag === 'Blob' ? req.response : req.responseText;
	return {
		status: req.status,
		statusText: req.statusText,
		headers: parseHeaders(req.getAllResponseHeaders()),
		url: req.responseURL,
		value: { ctor: tag, _0: response }
	};
}


function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

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

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
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

return {
	send: F2(send),
	multipart: multipart,
	uriEncode: uriEncode,
	uriDecode: uriDecode
};

}();

var _evancz$elm_http$Http$send = _evancz$elm_http$Native_Http.send;
var _evancz$elm_http$Http$defaultSettings = {timeout: 0, onStart: _elm_lang$core$Maybe$Nothing, onProgress: _elm_lang$core$Maybe$Nothing, desiredResponseType: _elm_lang$core$Maybe$Nothing, withCredentials: false};
var _evancz$elm_http$Http$multipart = _evancz$elm_http$Native_Http.multipart;
var _evancz$elm_http$Http$uriDecode = _evancz$elm_http$Native_Http.uriDecode;
var _evancz$elm_http$Http$uriEncode = _evancz$elm_http$Native_Http.uriEncode;
var _evancz$elm_http$Http$queryEscape = function (string) {
	return A2(
		_elm_lang$core$String$join,
		'+',
		A2(
			_elm_lang$core$String$split,
			'%20',
			_evancz$elm_http$Http$uriEncode(string)));
};
var _evancz$elm_http$Http$queryPair = function (_p0) {
	var _p1 = _p0;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_evancz$elm_http$Http$queryEscape(_p1._0),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'=',
			_evancz$elm_http$Http$queryEscape(_p1._1)));
};
var _evancz$elm_http$Http$url = F2(
	function (baseUrl, args) {
		var _p2 = args;
		if (_p2.ctor === '[]') {
			return baseUrl;
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				baseUrl,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'?',
					A2(
						_elm_lang$core$String$join,
						'&',
						A2(_elm_lang$core$List$map, _evancz$elm_http$Http$queryPair, args))));
		}
	});
var _evancz$elm_http$Http$Request = F4(
	function (a, b, c, d) {
		return {verb: a, headers: b, url: c, body: d};
	});
var _evancz$elm_http$Http$Settings = F5(
	function (a, b, c, d, e) {
		return {timeout: a, onStart: b, onProgress: c, desiredResponseType: d, withCredentials: e};
	});
var _evancz$elm_http$Http$Response = F5(
	function (a, b, c, d, e) {
		return {status: a, statusText: b, headers: c, url: d, value: e};
	});
var _evancz$elm_http$Http$TODO_implement_blob_in_another_library = {ctor: 'TODO_implement_blob_in_another_library'};
var _evancz$elm_http$Http$TODO_implement_file_in_another_library = {ctor: 'TODO_implement_file_in_another_library'};
var _evancz$elm_http$Http$BodyBlob = function (a) {
	return {ctor: 'BodyBlob', _0: a};
};
var _evancz$elm_http$Http$BodyFormData = {ctor: 'BodyFormData'};
var _evancz$elm_http$Http$ArrayBuffer = {ctor: 'ArrayBuffer'};
var _evancz$elm_http$Http$BodyString = function (a) {
	return {ctor: 'BodyString', _0: a};
};
var _evancz$elm_http$Http$string = _evancz$elm_http$Http$BodyString;
var _evancz$elm_http$Http$Empty = {ctor: 'Empty'};
var _evancz$elm_http$Http$empty = _evancz$elm_http$Http$Empty;
var _evancz$elm_http$Http$FileData = F3(
	function (a, b, c) {
		return {ctor: 'FileData', _0: a, _1: b, _2: c};
	});
var _evancz$elm_http$Http$BlobData = F3(
	function (a, b, c) {
		return {ctor: 'BlobData', _0: a, _1: b, _2: c};
	});
var _evancz$elm_http$Http$blobData = _evancz$elm_http$Http$BlobData;
var _evancz$elm_http$Http$StringData = F2(
	function (a, b) {
		return {ctor: 'StringData', _0: a, _1: b};
	});
var _evancz$elm_http$Http$stringData = _evancz$elm_http$Http$StringData;
var _evancz$elm_http$Http$Blob = function (a) {
	return {ctor: 'Blob', _0: a};
};
var _evancz$elm_http$Http$Text = function (a) {
	return {ctor: 'Text', _0: a};
};
var _evancz$elm_http$Http$RawNetworkError = {ctor: 'RawNetworkError'};
var _evancz$elm_http$Http$RawTimeout = {ctor: 'RawTimeout'};
var _evancz$elm_http$Http$BadResponse = F2(
	function (a, b) {
		return {ctor: 'BadResponse', _0: a, _1: b};
	});
var _evancz$elm_http$Http$UnexpectedPayload = function (a) {
	return {ctor: 'UnexpectedPayload', _0: a};
};
var _evancz$elm_http$Http$handleResponse = F2(
	function (handle, response) {
		if ((_elm_lang$core$Native_Utils.cmp(200, response.status) < 1) && (_elm_lang$core$Native_Utils.cmp(response.status, 300) < 0)) {
			var _p3 = response.value;
			if (_p3.ctor === 'Text') {
				return handle(_p3._0);
			} else {
				return _elm_lang$core$Task$fail(
					_evancz$elm_http$Http$UnexpectedPayload('Response body is a blob, expecting a string.'));
			}
		} else {
			return _elm_lang$core$Task$fail(
				A2(_evancz$elm_http$Http$BadResponse, response.status, response.statusText));
		}
	});
var _evancz$elm_http$Http$NetworkError = {ctor: 'NetworkError'};
var _evancz$elm_http$Http$Timeout = {ctor: 'Timeout'};
var _evancz$elm_http$Http$promoteError = function (rawError) {
	var _p4 = rawError;
	if (_p4.ctor === 'RawTimeout') {
		return _evancz$elm_http$Http$Timeout;
	} else {
		return _evancz$elm_http$Http$NetworkError;
	}
};
var _evancz$elm_http$Http$getString = function (url) {
	var request = {
		verb: 'GET',
		headers: _elm_lang$core$Native_List.fromArray(
			[]),
		url: url,
		body: _evancz$elm_http$Http$empty
	};
	return A2(
		_elm_lang$core$Task$andThen,
		A2(
			_elm_lang$core$Task$mapError,
			_evancz$elm_http$Http$promoteError,
			A2(_evancz$elm_http$Http$send, _evancz$elm_http$Http$defaultSettings, request)),
		_evancz$elm_http$Http$handleResponse(_elm_lang$core$Task$succeed));
};
var _evancz$elm_http$Http$fromJson = F2(
	function (decoder, response) {
		var decode = function (str) {
			var _p5 = A2(_elm_lang$core$Json_Decode$decodeString, decoder, str);
			if (_p5.ctor === 'Ok') {
				return _elm_lang$core$Task$succeed(_p5._0);
			} else {
				return _elm_lang$core$Task$fail(
					_evancz$elm_http$Http$UnexpectedPayload(_p5._0));
			}
		};
		return A2(
			_elm_lang$core$Task$andThen,
			A2(_elm_lang$core$Task$mapError, _evancz$elm_http$Http$promoteError, response),
			_evancz$elm_http$Http$handleResponse(decode));
	});
var _evancz$elm_http$Http$get = F2(
	function (decoder, url) {
		var request = {
			verb: 'GET',
			headers: _elm_lang$core$Native_List.fromArray(
				[]),
			url: url,
			body: _evancz$elm_http$Http$empty
		};
		return A2(
			_evancz$elm_http$Http$fromJson,
			decoder,
			A2(_evancz$elm_http$Http$send, _evancz$elm_http$Http$defaultSettings, request));
	});
var _evancz$elm_http$Http$post = F3(
	function (decoder, url, body) {
		var request = {
			verb: 'POST',
			headers: _elm_lang$core$Native_List.fromArray(
				[]),
			url: url,
			body: body
		};
		return A2(
			_evancz$elm_http$Http$fromJson,
			decoder,
			A2(_evancz$elm_http$Http$send, _evancz$elm_http$Http$defaultSettings, request));
	});

var _narkisr$elm_ui$Systems_Add_Validations$validate = F3(
	function (step, key, validations) {
		var stepValidations = A2(
			_elm_lang$core$Maybe$withDefault,
			_elm_lang$core$Dict$empty,
			A2(
				_elm_lang$core$Dict$get,
				_elm_lang$core$Basics$toString(step),
				validations));
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_elm_lang$core$Basics$identity,
			A2(_elm_lang$core$Dict$get, key, stepValidations));
	});
var _narkisr$elm_ui$Systems_Add_Validations$validateAll = F3(
	function (validations, step, model) {
		var stepValues = A2(
			_elm_lang$core$List$map,
			function (vs) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					_elm_lang$core$Dict$empty,
					A2(
						_elm_lang$core$Dict$get,
						_elm_lang$core$Basics$toString(step),
						vs));
			},
			validations);
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (v, m) {
					return v(m);
				}),
			model,
			_elm_lang$core$List$concat(
				A2(_elm_lang$core$List$map, _elm_lang$core$Dict$values, stepValues)));
	});
var _narkisr$elm_ui$Systems_Add_Validations$notAny = function (errors) {
	return _elm_lang$core$List$isEmpty(
		A2(
			_elm_lang$core$List$filter,
			function (e) {
				return _elm_lang$core$Basics$not(
					_elm_lang$core$List$isEmpty(e));
			},
			_elm_lang$core$Dict$values(errors)));
};
var _narkisr$elm_ui$Systems_Add_Validations$vpair = F2(
	function (step, validations) {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$toString(step),
			_1: _elm_lang$core$Dict$fromList(validations)
		};
	});
var _narkisr$elm_ui$Systems_Add_Validations$Invalid = function (a) {
	return {ctor: 'Invalid', _0: a};
};
var _narkisr$elm_ui$Systems_Add_Validations$None = {ctor: 'None'};
var _narkisr$elm_ui$Systems_Add_Validations$notEmpty = function (value) {
	return _elm_lang$core$String$isEmpty(value) ? _narkisr$elm_ui$Systems_Add_Validations$Invalid('cannot be empty') : _narkisr$elm_ui$Systems_Add_Validations$None;
};
var _narkisr$elm_ui$Systems_Add_Validations$hasItems = function (value) {
	return _elm_lang$core$List$isEmpty(value) ? _narkisr$elm_ui$Systems_Add_Validations$Invalid('cannot be empty') : _narkisr$elm_ui$Systems_Add_Validations$None;
};
var _narkisr$elm_ui$Systems_Add_Validations$notContained = function (_p0) {
	var _p1 = _p0;
	var _p3 = _p1._0;
	var _p2 = _narkisr$elm_ui$Systems_Add_Validations$notEmpty(_p3);
	if (_p2.ctor === 'Invalid') {
		return _narkisr$elm_ui$Systems_Add_Validations$Invalid(_p2._0);
	} else {
		return A2(_elm_lang$core$List$member, _p3, _p1._1) ? _narkisr$elm_ui$Systems_Add_Validations$Invalid('cannot add twice') : _narkisr$elm_ui$Systems_Add_Validations$None;
	}
};
var _narkisr$elm_ui$Systems_Add_Validations$validIp = function (value) {
	return (_elm_lang$core$Basics$not(
		_elm_lang$core$String$isEmpty(value)) && (!_elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(
			A3(
				_elm_lang$core$Regex$find,
				_elm_lang$core$Regex$All,
				_elm_lang$core$Regex$regex('\\d+\\.\\d+\\.\\d+\\.\\d+$'),
				value)),
		1))) ? _narkisr$elm_ui$Systems_Add_Validations$Invalid('non legal ip address') : _narkisr$elm_ui$Systems_Add_Validations$None;
};
var _narkisr$elm_ui$Systems_Add_Validations$validId = F4(
	function (length, prefix, allowEmpty, value) {
		return (_elm_lang$core$String$isEmpty(value) && allowEmpty) ? _narkisr$elm_ui$Systems_Add_Validations$None : (_elm_lang$core$Basics$not(
			A2(_elm_lang$core$String$contains, prefix, value)) ? _narkisr$elm_ui$Systems_Add_Validations$Invalid(
			A2(_elm_lang$core$Basics_ops['++'], 'Id should start with ', prefix)) : ((!_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$String$length(value),
			length)) ? _narkisr$elm_ui$Systems_Add_Validations$Invalid(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'Id should have ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(length),
					' characthers'))) : _narkisr$elm_ui$Systems_Add_Validations$None));
	});
var _narkisr$elm_ui$Systems_Add_Validations$validationOf = F4(
	function (key, validations, value, _p4) {
		var _p5 = _p4;
		var _p7 = _p5;
		var res = A2(
			_elm_lang$core$List$filter,
			function (error) {
				return !_elm_lang$core$Native_Utils.eq(error, _narkisr$elm_ui$Systems_Add_Validations$None);
			},
			A2(
				_elm_lang$core$List$map,
				function (validation) {
					return validation(
						value(_p7));
				},
				validations));
		var newErrors = A3(
			_elm_lang$core$Dict$update,
			key,
			function (_p6) {
				return _elm_lang$core$Maybe$Just(res);
			},
			_p5.errors);
		return _elm_lang$core$Native_Utils.update(
			_p7,
			{errors: newErrors});
	});

var _narkisr$elm_ui$Common_Utils$capitalize = function (s) {
	var _p0 = _elm_lang$core$String$uncons(s);
	if (_p0.ctor === 'Just') {
		return A2(
			_elm_lang$core$String$cons,
			_elm_lang$core$Char$toUpper(_p0._0._0),
			_p0._0._1);
	} else {
		return s;
	}
};
var _narkisr$elm_ui$Common_Utils$none = function (a) {
	return {ctor: '_Tuple2', _0: a, _1: _elm_lang$core$Platform_Cmd$none};
};
var _narkisr$elm_ui$Common_Utils$setEnvironments = F2(
	function (model, es) {
		return _narkisr$elm_ui$Common_Utils$none(
			_elm_lang$core$Native_Utils.update(
				model,
				{
					environments: _elm_lang$core$Dict$keys(es)
				}));
	});
var _narkisr$elm_ui$Common_Utils$setEnvironment = F2(
	function (_p1, es) {
		var _p2 = _p1;
		return _narkisr$elm_ui$Common_Utils$none(
			_elm_lang$core$Native_Utils.update(
				_p2,
				{
					environment: A2(
						_elm_lang$core$Maybe$withDefault,
						'',
						_elm_lang$core$List$head(
							_elm_lang$core$Dict$keys(es)))
				}));
	});
var _narkisr$elm_ui$Common_Utils$defaultEmpty = function (list) {
	var _p3 = list;
	if (_p3.ctor === 'Just') {
		return _p3._0;
	} else {
		return _elm_lang$core$Native_List.fromArray(
			[]);
	}
};
var _narkisr$elm_ui$Common_Utils$withDefaultProp = F3(
	function (parent, $default, prop) {
		var _p4 = parent;
		if (_p4.ctor === 'Just') {
			return prop(_p4._0);
		} else {
			return $default;
		}
	});
var _narkisr$elm_ui$Common_Utils$partition = F2(
	function (n, list) {
		var $catch = A2(_elm_lang$core$List$take, n, list);
		return _elm_lang$core$Native_Utils.eq(
			n,
			_elm_lang$core$List$length($catch)) ? A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Native_List.fromArray(
				[$catch]),
			A2(
				_narkisr$elm_ui$Common_Utils$partition,
				n,
				A2(_elm_lang$core$List$drop, n, list))) : _elm_lang$core$Native_List.fromArray(
			[$catch]);
	});

var _narkisr$elm_ui$Common_Components$buttons = F4(
	function (_p0, next, back, last) {
		var _p1 = _p0;
		var margin = _elm_lang$html$Html_Attributes$style(
			_elm_lang$core$Native_List.fromArray(
				[
					{ctor: '_Tuple2', _0: 'margin-left', _1: '30%'}
				]));
		return _elm_lang$core$Native_List.fromArray(
			[
				A2(
				_elm_lang$html$Html$button,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$id('Back'),
						_elm_lang$html$Html_Attributes$class('btn btn-primary'),
						margin,
						_elm_lang$html$Html_Events$onClick(back)
					]),
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html$text('<< Back')
					])),
				_p1.hasNext ? A2(
				_elm_lang$html$Html$div,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$class('btn-group'),
						margin
					]),
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$html$Html$button,
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html_Attributes$id('Next'),
								_elm_lang$html$Html_Attributes$class('btn btn-primary'),
								_elm_lang$html$Html_Events$onClick(next)
							]),
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html$text('Next >>')
							]))
					])) : A2(
				_elm_lang$html$Html$div,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$class('btn-group'),
						margin
					]),
				last)
			]);
	});
var _narkisr$elm_ui$Common_Components$checkbox = F2(
	function (msg, currentValue) {
		return A2(
			_elm_lang$html$Html$input,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$type$('checkbox'),
					_elm_lang$html$Html_Events$onClick(msg),
					_elm_lang$html$Html_Attributes$checked(currentValue)
				]),
			_elm_lang$core$Native_List.fromArray(
				[]));
	});
var _narkisr$elm_ui$Common_Components$typedInput = F4(
	function (msg, place, currentValue, typed) {
		return A2(
			_elm_lang$html$Html$input,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$class('form-control'),
					_elm_lang$html$Html_Attributes$type$(typed),
					_elm_lang$html$Html_Attributes$placeholder(place),
					_elm_lang$html$Html_Attributes$value(currentValue),
					_elm_lang$html$Html_Events$onInput(msg)
				]),
			_elm_lang$core$Native_List.fromArray(
				[]));
	});
var _narkisr$elm_ui$Common_Components$inputNumber = F3(
	function (msg, place, currentValue) {
		return A4(_narkisr$elm_ui$Common_Components$typedInput, msg, place, currentValue, 'number');
	});
var _narkisr$elm_ui$Common_Components$inputText = F3(
	function (msg, place, currentValue) {
		return A4(_narkisr$elm_ui$Common_Components$typedInput, msg, place, currentValue, 'text');
	});
var _narkisr$elm_ui$Common_Components$onMultiSelect = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(
			_elm_lang$core$Json_Decode$map,
			msg,
			A2(
				_elm_lang$core$Json_Decode$at,
				_elm_lang$core$Native_List.fromArray(
					['target']),
				_elm_lang$core$Json_Decode$string)));
};
var _narkisr$elm_ui$Common_Components$onSelect = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(
			_elm_lang$core$Json_Decode$map,
			msg,
			A2(
				_elm_lang$core$Json_Decode$at,
				_elm_lang$core$Native_List.fromArray(
					['target', 'value']),
				_elm_lang$core$Json_Decode$string)));
};
var _narkisr$elm_ui$Common_Components$selected = F2(
	function (value, $default) {
		return _elm_lang$core$Native_Utils.eq(value, $default) ? _elm_lang$core$Native_List.fromArray(
			[
				A2(_elm_lang$html$Html_Attributes$attribute, 'selected', 'true')
			]) : _elm_lang$core$Native_List.fromArray(
			[]);
	});
var _narkisr$elm_ui$Common_Components$selector = F3(
	function (msg, options, $default) {
		return A2(
			_elm_lang$html$Html$select,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$class('form-control'),
					_narkisr$elm_ui$Common_Components$onSelect(msg)
				]),
			A2(
				_elm_lang$core$List$map,
				function (opt) {
					return A2(
						_elm_lang$html$Html$option,
						A2(_narkisr$elm_ui$Common_Components$selected, opt, $default),
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html$text(opt)
							]));
				},
				options));
	});
var _narkisr$elm_ui$Common_Components$toHtml = function (error) {
	var _p2 = error;
	if (_p2.ctor === 'Invalid') {
		return A2(
			_elm_lang$html$Html$span,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$class('help-block')
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(_p2._0)
				]));
	} else {
		return A2(
			_elm_lang$html$Html$span,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$class('help-block')
				]),
			_elm_lang$core$Native_List.fromArray(
				[]));
	}
};
var _narkisr$elm_ui$Common_Components$withMessage = function (errors) {
	if (_elm_lang$core$List$isEmpty(errors)) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[]),
			_elm_lang$core$Native_List.fromArray(
				[]));
	} else {
		var messages = A2(_elm_lang$core$List$map, _narkisr$elm_ui$Common_Components$toHtml, errors);
		return A2(
			_elm_lang$core$Maybe$withDefault,
			A2(
				_elm_lang$html$Html$div,
				_elm_lang$core$Native_List.fromArray(
					[]),
				_elm_lang$core$Native_List.fromArray(
					[])),
			_elm_lang$core$List$head(messages));
	}
};
var _narkisr$elm_ui$Common_Components$withError = F2(
	function (errors, $class) {
		return _elm_lang$core$List$isEmpty(errors) ? $class : A2(_elm_lang$core$Basics_ops['++'], $class, ' has-error');
	});
var _narkisr$elm_ui$Common_Components$group = F3(
	function (title, widget, errors) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$class(
					A2(_narkisr$elm_ui$Common_Components$withError, errors, 'form-group')),
					_elm_lang$html$Html_Attributes$id(title)
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					A2(
					_elm_lang$html$Html$label,
					_elm_lang$core$Native_List.fromArray(
						[
							_elm_lang$html$Html_Attributes$for(title),
							_elm_lang$html$Html_Attributes$class('col-sm-3 control-label')
						]),
					_elm_lang$core$Native_List.fromArray(
						[
							_elm_lang$html$Html$text(title)
						])),
					A2(
					_elm_lang$html$Html$div,
					_elm_lang$core$Native_List.fromArray(
						[
							_elm_lang$html$Html_Attributes$class('col-sm-6')
						]),
					_elm_lang$core$Native_List.fromArray(
						[widget])),
					_narkisr$elm_ui$Common_Components$withMessage(errors)
				]));
	});
var _narkisr$elm_ui$Common_Components$group$ = F2(
	function (title, widget) {
		return A3(
			_narkisr$elm_ui$Common_Components$group,
			title,
			widget,
			_elm_lang$core$Native_List.fromArray(
				[]));
	});
var _narkisr$elm_ui$Common_Components$withErrors = F3(
	function (errors, key, widget) {
		return A3(
			_narkisr$elm_ui$Common_Components$group,
			key,
			widget,
			_narkisr$elm_ui$Common_Utils$defaultEmpty(
				A2(_elm_lang$core$Dict$get, key, errors)));
	});
var _narkisr$elm_ui$Common_Components$callout = F2(
	function (type$, message) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$class('col-md-offset-1 col-md-10')
				]),
			_elm_lang$core$Native_List.fromArray(
				[
					A2(
					_elm_lang$html$Html$div,
					_elm_lang$core$Native_List.fromArray(
						[
							_elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$Basics_ops['++'], 'callout callout-', type$))
						]),
					message)
				]));
	});
var _narkisr$elm_ui$Common_Components$dialogPanel = F3(
	function (type$, message, body) {
		return _elm_lang$core$Native_List.fromArray(
			[
				_circuithub$elm_bootstrap_html$Bootstrap_Html$row_(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(_narkisr$elm_ui$Common_Components$callout, type$, message)
					])),
				_circuithub$elm_bootstrap_html$Bootstrap_Html$row_(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$html$Html$div,
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html_Attributes$class('col-md-offset-1 col-md-10')
							]),
						_elm_lang$core$Native_List.fromArray(
							[body]))
					]))
			]);
	});
var _narkisr$elm_ui$Common_Components$dialogButtons = F2(
	function (cancel, ok) {
		return _circuithub$elm_bootstrap_html$Bootstrap_Html$row_(
			_elm_lang$core$Native_List.fromArray(
				[
					A2(
					_elm_lang$html$Html$div,
					_elm_lang$core$Native_List.fromArray(
						[
							_elm_lang$html$Html_Attributes$class('text-center')
						]),
					_elm_lang$core$Native_List.fromArray(
						[
							A2(
							_elm_lang$html$Html$div,
							_elm_lang$core$Native_List.fromArray(
								[
									_elm_lang$html$Html_Attributes$class('btn-group col-md-offset-5 col-md-10')
								]),
							_elm_lang$core$Native_List.fromArray(
								[
									A2(
									_elm_lang$html$Html$button,
									_elm_lang$core$Native_List.fromArray(
										[
											_elm_lang$html$Html_Attributes$class('btn btn-danger btn-sm col-md-1 col-md-offset-1'),
											_elm_lang$html$Html_Events$onClick(cancel)
										]),
									_elm_lang$core$Native_List.fromArray(
										[
											_elm_lang$html$Html$text(
											_elm_lang$core$Basics$toString(cancel))
										])),
									A2(
									_elm_lang$html$Html$button,
									_elm_lang$core$Native_List.fromArray(
										[
											_elm_lang$html$Html_Attributes$class('btn btn-primary btn-sm col-md-1'),
											_elm_lang$html$Html_Events$onClick(ok)
										]),
									_elm_lang$core$Native_List.fromArray(
										[
											_elm_lang$html$Html$text(
											_elm_lang$core$Basics$toString(ok))
										]))
								]))
						]))
				]));
	});
var _narkisr$elm_ui$Common_Components$message = F2(
	function (title, content) {
		return _elm_lang$core$Native_List.fromArray(
			[
				A2(
				_elm_lang$html$Html$h4,
				_elm_lang$core$Native_List.fromArray(
					[]),
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html$text(title)
					])),
				A2(
				_elm_lang$html$Html$span,
				_elm_lang$core$Native_List.fromArray(
					[]),
				content)
			]);
	});
var _narkisr$elm_ui$Common_Components$info = function (msg) {
	return A2(
		_narkisr$elm_ui$Common_Components$message,
		'Info',
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(msg)
			]));
};
var _narkisr$elm_ui$Common_Components$error = function (msg) {
	return A2(
		_narkisr$elm_ui$Common_Components$message,
		'Error!',
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(msg)
			]));
};
var _narkisr$elm_ui$Common_Components$asList = function (body) {
	return _elm_lang$core$Native_List.fromArray(
		[body]);
};
var _narkisr$elm_ui$Common_Components$withButtons = F3(
	function (cancel, ok, panel) {
		return A2(
			_elm_lang$core$List$append,
			panel,
			_narkisr$elm_ui$Common_Components$asList(
				A2(_narkisr$elm_ui$Common_Components$dialogButtons, cancel, ok)));
	});
var _narkisr$elm_ui$Common_Components$infoCallout = F4(
	function (message, body, cancel, ok) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[]),
			A3(
				_narkisr$elm_ui$Common_Components$withButtons,
				cancel,
				ok,
				A3(_narkisr$elm_ui$Common_Components$dialogPanel, 'info', message, body)));
	});
var _narkisr$elm_ui$Common_Components$dangerCallout = F4(
	function (message, body, cancel, ok) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[]),
			A3(
				_narkisr$elm_ui$Common_Components$withButtons,
				cancel,
				ok,
				A3(_narkisr$elm_ui$Common_Components$dialogPanel, 'danger', message, body)));
	});
var _narkisr$elm_ui$Common_Components$warningCallout = F4(
	function (message, body, cancel, ok) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[]),
			A3(
				_narkisr$elm_ui$Common_Components$withButtons,
				cancel,
				ok,
				A3(_narkisr$elm_ui$Common_Components$dialogPanel, 'warning', message, body)));
	});
var _narkisr$elm_ui$Common_Components$panel = function (body) {
	return A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('panel panel-default')
			]),
		_elm_lang$core$Native_List.fromArray(
			[body]));
};
var _narkisr$elm_ui$Common_Components$panelContents = function (body) {
	return A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('panel-body')
			]),
		_elm_lang$core$Native_List.fromArray(
			[body]));
};
var _narkisr$elm_ui$Common_Components$fixedSize = function (height) {
	return _elm_lang$html$Html_Attributes$style(
		_elm_lang$core$Native_List.fromArray(
			[
				{ctor: '_Tuple2', _0: 'height', _1: 'auto !important'},
				{ctor: '_Tuple2', _0: 'overflow', _1: 'auto'},
				{ctor: '_Tuple2', _0: 'min-height', _1: height},
				{ctor: '_Tuple2', _0: 'height', _1: height}
			]));
};
var _narkisr$elm_ui$Common_Components$fixedPanel = function (body) {
	return A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('panel-body'),
				_narkisr$elm_ui$Common_Components$fixedSize('550px')
			]),
		_elm_lang$core$Native_List.fromArray(
			[body]));
};
var _narkisr$elm_ui$Common_Components$notImplemented = A2(
	_elm_lang$html$Html$div,
	_elm_lang$core$Native_List.fromArray(
		[]),
	_elm_lang$core$Native_List.fromArray(
		[
			_elm_lang$html$Html$text('not implemented')
		]));

var _narkisr$elm_ui$Common_Redirect$redirect = _elm_lang$core$Native_Platform.outgoingPort(
	'redirect',
	function (v) {
		return v;
	});

var _narkisr$elm_ui$Common_Http$apply = F2(
	function (func, value) {
		return A3(
			_elm_lang$core$Json_Decode$object2,
			F2(
				function (x, y) {
					return x(y);
				}),
			func,
			value);
	});
var _narkisr$elm_ui$Common_Http$httpJson = F4(
	function (verb, body, decoder, url) {
		var request = {
			verb: verb,
			headers: _elm_lang$core$Native_List.fromArray(
				[
					{ctor: '_Tuple2', _0: 'Content-Type', _1: 'application/json;charset=UTF-8'},
					{ctor: '_Tuple2', _0: 'Accept', _1: 'application/json, text/plain, */*'}
				]),
			url: url,
			body: body
		};
		return A2(
			_evancz$elm_http$Http$fromJson,
			decoder,
			A2(_evancz$elm_http$Http$send, _evancz$elm_http$Http$defaultSettings, request));
	});
var _narkisr$elm_ui$Common_Http$delete = A2(_narkisr$elm_ui$Common_Http$httpJson, 'DELETE', _evancz$elm_http$Http$empty);
var _narkisr$elm_ui$Common_Http$getJson = A2(_narkisr$elm_ui$Common_Http$httpJson, 'GET', _evancz$elm_http$Http$empty);
var _narkisr$elm_ui$Common_Http$postJson = _narkisr$elm_ui$Common_Http$httpJson('POST');
var _narkisr$elm_ui$Common_Http$putJson = _narkisr$elm_ui$Common_Http$httpJson('PUT');
var _narkisr$elm_ui$Common_Http$SaveResponse = F2(
	function (a, b) {
		return {message: a, id: b};
	});
var _narkisr$elm_ui$Common_Http$saveResponse = A3(
	_elm_lang$core$Json_Decode$object2,
	_narkisr$elm_ui$Common_Http$SaveResponse,
	A2(_elm_lang$core$Json_Decode_ops[':='], 'message', _elm_lang$core$Json_Decode$string),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode_ops[':='], 'id', _elm_lang$core$Json_Decode$int)));

var _narkisr$elm_ui$Common_Model$valueOf = function (option) {
	var _p0 = option;
	switch (_p0.ctor) {
		case 'BoolOption':
			return _elm_lang$core$String$toLower(
				_elm_lang$core$Basics$toString(_p0._0));
		case 'StringOption':
			return _p0._0;
		case 'IntOption':
			return _elm_lang$core$Basics$toString(_p0._0);
		default:
			return _elm_lang$core$Basics$toString(_p0._0);
	}
};
var _narkisr$elm_ui$Common_Model$DictOption = function (a) {
	return {ctor: 'DictOption', _0: a};
};
var _narkisr$elm_ui$Common_Model$IntOption = function (a) {
	return {ctor: 'IntOption', _0: a};
};
var _narkisr$elm_ui$Common_Model$StringOption = function (a) {
	return {ctor: 'StringOption', _0: a};
};
var _narkisr$elm_ui$Common_Model$BoolOption = function (a) {
	return {ctor: 'BoolOption', _0: a};
};
var _narkisr$elm_ui$Common_Model$option = function (_p1) {
	return _elm_lang$core$Json_Decode$oneOf(
		_elm_lang$core$Native_List.fromArray(
			[
				A2(_elm_lang$core$Json_Decode$map, _narkisr$elm_ui$Common_Model$BoolOption, _elm_lang$core$Json_Decode$bool),
				A2(_elm_lang$core$Json_Decode$map, _narkisr$elm_ui$Common_Model$StringOption, _elm_lang$core$Json_Decode$string),
				A2(_elm_lang$core$Json_Decode$map, _narkisr$elm_ui$Common_Model$IntOption, _elm_lang$core$Json_Decode$int),
				_narkisr$elm_ui$Common_Model$dictOption$(
				{ctor: '_Tuple0'})
			]));
};
var _narkisr$elm_ui$Common_Model$dictOption$ = function (_p2) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}),
		function (_p3) {
			return A2(
				_elm_lang$core$Json_Decode$map,
				_narkisr$elm_ui$Common_Model$DictOption,
				_elm_lang$core$Json_Decode$dict(
					_narkisr$elm_ui$Common_Model$option(_p3)));
		});
};

var _narkisr$elm_ui$Environments_List$environmentsKeys = A2(
	_elm_lang$core$Json_Decode$at,
	_elm_lang$core$Native_List.fromArray(
		['environments']),
	_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string));
var _narkisr$elm_ui$Environments_List$getEnvironmentKeys = function (msg) {
	return A3(
		_elm_lang$core$Task$perform,
		_elm_community$basics_extra$Basics_Extra$never,
		msg,
		_elm_lang$core$Task$toResult(
			A2(_narkisr$elm_ui$Common_Http$getJson, _narkisr$elm_ui$Environments_List$environmentsKeys, '/environments/keys')));
};
var _narkisr$elm_ui$Environments_List$template = _elm_lang$core$Json_Decode$dict(_elm_lang$core$Json_Decode$string);
var _narkisr$elm_ui$Environments_List$Empty = {ctor: 'Empty'};
var _narkisr$elm_ui$Environments_List$Physical = {ctor: 'Physical'};
var _narkisr$elm_ui$Environments_List$GCE = {ctor: 'GCE'};
var _narkisr$elm_ui$Environments_List$AWS = {ctor: 'AWS'};
var _narkisr$elm_ui$Environments_List$KVM = F2(
	function (a, b) {
		return {ctor: 'KVM', _0: a, _1: b};
	});
var _narkisr$elm_ui$Environments_List$Openstack = F2(
	function (a, b) {
		return {ctor: 'Openstack', _0: a, _1: b};
	});
var _narkisr$elm_ui$Environments_List$Proxmox = F2(
	function (a, b) {
		return {ctor: 'Proxmox', _0: a, _1: b};
	});
var _narkisr$elm_ui$Environments_List$OSTemplates = function (a) {
	return {ctor: 'OSTemplates', _0: a};
};
var _narkisr$elm_ui$Environments_List$hypervisor = _elm_lang$core$Json_Decode$oneOf(
	_elm_lang$core$Native_List.fromArray(
		[
			A3(
			_elm_lang$core$Json_Decode$object2,
			_narkisr$elm_ui$Environments_List$Openstack,
			A2(
				_elm_lang$core$Json_Decode_ops[':='],
				'flavors',
				_elm_lang$core$Json_Decode$dict(_elm_lang$core$Json_Decode$string)),
			A2(
				_elm_lang$core$Json_Decode_ops[':='],
				'ostemplates',
				_elm_lang$core$Json_Decode$dict(_narkisr$elm_ui$Environments_List$template))),
			A3(
			_elm_lang$core$Json_Decode$object2,
			_narkisr$elm_ui$Environments_List$KVM,
			A2(
				_elm_lang$core$Json_Decode_ops[':='],
				'ostemplates',
				_elm_lang$core$Json_Decode$dict(_narkisr$elm_ui$Environments_List$template)),
			A2(
				_elm_lang$core$Json_Decode_ops[':='],
				'nodes',
				_elm_lang$core$Json_Decode$dict(
					_elm_lang$core$Json_Decode$dict(
						_narkisr$elm_ui$Common_Model$option(
							{ctor: '_Tuple0'}))))),
			A2(
			_elm_lang$core$Json_Decode$object1,
			_narkisr$elm_ui$Environments_List$OSTemplates,
			A2(
				_elm_lang$core$Json_Decode_ops[':='],
				'ostemplates',
				_elm_lang$core$Json_Decode$dict(_narkisr$elm_ui$Environments_List$template))),
			_elm_lang$core$Json_Decode$succeed(_narkisr$elm_ui$Environments_List$Physical)
		]));
var _narkisr$elm_ui$Environments_List$environment = _elm_lang$core$Json_Decode$dict(_narkisr$elm_ui$Environments_List$hypervisor);
var _narkisr$elm_ui$Environments_List$environmentsList = A2(
	_elm_lang$core$Json_Decode$at,
	_elm_lang$core$Native_List.fromArray(
		['environments']),
	_elm_lang$core$Json_Decode$dict(_narkisr$elm_ui$Environments_List$environment));
var _narkisr$elm_ui$Environments_List$getEnvironments = function (msg) {
	return A3(
		_elm_lang$core$Task$perform,
		_elm_community$basics_extra$Basics_Extra$never,
		msg,
		_elm_lang$core$Task$toResult(
			A2(_narkisr$elm_ui$Common_Http$getJson, _narkisr$elm_ui$Environments_List$environmentsList, '/environments')));
};

var _narkisr$elm_ui$Systems_Add_Common$setMachine = F2(
	function (f, _p0) {
		var _p1 = _p0;
		var newMachine = f(_p1.machine);
		return _elm_lang$core$Native_Utils.update(
			_p1,
			{machine: newMachine});
	});
var _narkisr$elm_ui$Systems_Add_Common$getOses = F2(
	function (hyp, model) {
		var hypervisor = A2(
			_elm_lang$core$Maybe$withDefault,
			_narkisr$elm_ui$Environments_List$Empty,
			A2(_elm_lang$core$Dict$get, hyp, model.environment));
		var _p2 = hypervisor;
		switch (_p2.ctor) {
			case 'OSTemplates':
				return _p2._0;
			case 'Openstack':
				return _p2._1;
			case 'KVM':
				return _p2._0;
			default:
				return _elm_lang$core$Dict$empty;
		}
	});
var _narkisr$elm_ui$Systems_Add_Common$setDefaultOS = F2(
	function (hyp, _p3) {
		var _p4 = _p3;
		var _p7 = _p4;
		var _p6 = _p4.machine;
		var _p5 = _elm_lang$core$List$head(
			_elm_lang$core$Dict$keys(
				A2(_narkisr$elm_ui$Systems_Add_Common$getOses, hyp, _p7)));
		if (_p5.ctor === 'Just') {
			return _elm_lang$core$String$isEmpty(_p6.os) ? _elm_lang$core$Native_Utils.update(
				_p7,
				{
					machine: _elm_lang$core$Native_Utils.update(
						_p6,
						{os: _p5._0})
				}) : _p7;
		} else {
			return _p7;
		}
	});

var _narkisr$elm_ui$Common_Errors$setErrors = F2(
	function (_p0, es) {
		var _p1 = _p0;
		var newErrors = _elm_lang$core$Native_Utils.update(
			_p1.saveErrors,
			{errors: es});
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				_p1,
				{saveErrors: newErrors}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _narkisr$elm_ui$Common_Errors$handler = F5(
	function (result, model, success, fail, noop) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return success(_p2._0);
		} else {
			var _p4 = _p2._0;
			var _p3 = _p4;
			if ((_p3.ctor === 'BadResponse') && (_p3._0 === 401)) {
				return A2(
					_elm_lang$core$Debug$log,
					_elm_lang$core$Basics$toString(_p4),
					{
						ctor: '_Tuple2',
						_0: model,
						_1: _narkisr$elm_ui$Common_Redirect$redirect('login')
					});
			} else {
				return A2(
					_elm_lang$core$Debug$log,
					_elm_lang$core$Basics$toString(_p4),
					{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none});
			}
		}
	});
var _narkisr$elm_ui$Common_Errors$errorsSuccessHandler = F4(
	function (result, model, success, noop) {
		return A5(
			_narkisr$elm_ui$Common_Errors$handler,
			result,
			model,
			success,
			_narkisr$elm_ui$Common_Errors$setErrors(model),
			noop);
	});
var _narkisr$elm_ui$Common_Errors$identityFail = F2(
	function (model, res) {
		return A2(
			_elm_lang$core$Debug$log,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'request failed ',
				_elm_lang$core$Basics$toString(res)),
			{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none});
	});
var _narkisr$elm_ui$Common_Errors$successHandler = F4(
	function (result, model, success, noop) {
		return A5(
			_narkisr$elm_ui$Common_Errors$handler,
			result,
			model,
			success,
			_narkisr$elm_ui$Common_Errors$identityFail(model),
			noop);
	});
var _narkisr$elm_ui$Common_Errors$identitySuccess = F2(
	function (model, res) {
		return _narkisr$elm_ui$Common_Utils$none(model);
	});
var _narkisr$elm_ui$Common_Errors$failHandler = F4(
	function (result, model, fail, noop) {
		return A5(
			_narkisr$elm_ui$Common_Errors$handler,
			result,
			model,
			_narkisr$elm_ui$Common_Errors$identitySuccess(model),
			fail,
			noop);
	});
var _narkisr$elm_ui$Common_Errors$errorsHandler = F3(
	function (result, model, noop) {
		return A5(
			_narkisr$elm_ui$Common_Errors$handler,
			result,
			model,
			_narkisr$elm_ui$Common_Errors$identitySuccess(model),
			_narkisr$elm_ui$Common_Errors$setErrors(model),
			noop);
	});
var _narkisr$elm_ui$Common_Errors$errorsList = function (errors) {
	return _elm_lang$core$Basics$not(
		_elm_lang$core$Native_Utils.eq(errors.keyValues, _elm_lang$core$Maybe$Nothing));
};
var _narkisr$elm_ui$Common_Errors$hasErrors = function (_p5) {
	var _p6 = _p5;
	var _p7 = _p6.errors;
	return _narkisr$elm_ui$Common_Errors$errorsList(_p7) || (!_elm_lang$core$Native_Utils.eq(_p7.message, _elm_lang$core$Maybe$Nothing));
};
var _narkisr$elm_ui$Common_Errors$mapValues = F2(
	function (f, d) {
		return _elm_lang$core$Dict$values(
			A2(_elm_lang$core$Dict$map, f, d));
	});
var _narkisr$elm_ui$Common_Errors$nestedSection = F2(
	function (key, errors) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[]),
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html$text(key),
					A2(
					_elm_lang$html$Html$ul,
					_elm_lang$core$Native_List.fromArray(
						[]),
					A2(
						_narkisr$elm_ui$Common_Errors$mapValues,
						F2(
							function (k, v) {
								return A2(
									_elm_lang$html$Html$li,
									_elm_lang$core$Native_List.fromArray(
										[]),
									_elm_lang$core$Native_List.fromArray(
										[
											_elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												k,
												A2(_elm_lang$core$Basics_ops['++'], ': ', v)))
										]));
							}),
						errors))
				]));
	});
var _narkisr$elm_ui$Common_Errors$nestedList = F2(
	function (prop, nested) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[]),
			A2(
				_elm_lang$core$List$map,
				function (section) {
					return A2(_narkisr$elm_ui$Common_Errors$nestedSection, prop, section);
				},
				nested));
	});
var _narkisr$elm_ui$Common_Errors$deepNestedList = F2(
	function (prop, nested) {
		return A2(
			_elm_lang$html$Html$div,
			_elm_lang$core$Native_List.fromArray(
				[]),
			_elm_lang$core$List$concat(
				A2(
					_elm_lang$core$List$map,
					function (parent) {
						return A2(
							_narkisr$elm_ui$Common_Errors$mapValues,
							F2(
								function (key, errors) {
									return A2(
										_narkisr$elm_ui$Common_Errors$nestedSection,
										A2(
											_elm_lang$core$Basics_ops['++'],
											prop,
											A2(_elm_lang$core$Basics_ops['++'], '.', key)),
										errors);
								}),
							parent);
					},
					nested)));
	});
var _narkisr$elm_ui$Common_Errors$toText = F2(
	function (key, error) {
		var _p8 = error;
		switch (_p8.ctor) {
			case 'Nested':
				return A2(_narkisr$elm_ui$Common_Errors$nestedSection, key, _p8._0);
			case 'DeepNestedList':
				return A2(
					_elm_lang$html$Html$div,
					_elm_lang$core$Native_List.fromArray(
						[]),
					A2(
						_narkisr$elm_ui$Common_Errors$mapValues,
						F2(
							function (prop, nested) {
								return A2(
									_narkisr$elm_ui$Common_Errors$deepNestedList,
									A2(
										_elm_lang$core$Basics_ops['++'],
										key,
										A2(_elm_lang$core$Basics_ops['++'], '.', prop)),
									nested);
							}),
						_p8._0));
			case 'NestedList':
				return A2(
					_elm_lang$html$Html$div,
					_elm_lang$core$Native_List.fromArray(
						[]),
					A2(
						_narkisr$elm_ui$Common_Errors$mapValues,
						F2(
							function (prop, nested) {
								return A2(
									_narkisr$elm_ui$Common_Errors$nestedList,
									A2(
										_elm_lang$core$Basics_ops['++'],
										key,
										A2(_elm_lang$core$Basics_ops['++'], '.', prop)),
									nested);
							}),
						_p8._0));
			default:
				return _elm_lang$html$Html$text(
					A2(
						_elm_lang$core$Basics_ops['++'],
						key,
						A2(_elm_lang$core$Basics_ops['++'], ': ', _p8._0)));
		}
	});
var _narkisr$elm_ui$Common_Errors$errorsText = function (errors) {
	return _narkisr$elm_ui$Common_Errors$errorsList(errors) ? A2(
		_elm_lang$html$Html$ul,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$style(
				_elm_lang$core$Native_List.fromArray(
					[
						{ctor: '_Tuple2', _0: 'list-style-type', _1: 'none'}
					]))
			]),
		_elm_lang$core$Dict$values(
			A2(
				_elm_lang$core$Dict$map,
				F2(
					function (k, v) {
						return A2(
							_elm_lang$html$Html$li,
							_elm_lang$core$Native_List.fromArray(
								[]),
							_elm_lang$core$Native_List.fromArray(
								[
									A2(_narkisr$elm_ui$Common_Errors$toText, k, v)
								]));
					}),
				A2(_elm_lang$core$Maybe$withDefault, _elm_lang$core$Dict$empty, errors.keyValues)))) : A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html$text(
				A2(_elm_lang$core$Maybe$withDefault, '', errors.message))
			]));
};
var _narkisr$elm_ui$Common_Errors$view = function (_p9) {
	var _p10 = _p9;
	return A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('panel-body')
			]),
		_elm_lang$core$Native_List.fromArray(
			[
				A2(
				_elm_lang$html$Html$h4,
				_elm_lang$core$Native_List.fromArray(
					[]),
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html$text('The following errors found:')
					])),
				_narkisr$elm_ui$Common_Errors$errorsText(_p10.errors)
			]));
};
var _narkisr$elm_ui$Common_Errors$Errors = F3(
	function (a, b, c) {
		return {type$: a, keyValues: b, message: c};
	});
var _narkisr$elm_ui$Common_Errors$messageDecoder = A2(
	_elm_lang$core$Json_Decode$object1,
	A2(_narkisr$elm_ui$Common_Errors$Errors, '', _elm_lang$core$Maybe$Nothing),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode_ops[':='], 'message', _elm_lang$core$Json_Decode$string)));
var _narkisr$elm_ui$Common_Errors$Model = function (a) {
	return {errors: a};
};
var _narkisr$elm_ui$Common_Errors$init = _narkisr$elm_ui$Common_Errors$Model(
	A3(_narkisr$elm_ui$Common_Errors$Errors, '', _elm_lang$core$Maybe$Nothing, _elm_lang$core$Maybe$Nothing));
var _narkisr$elm_ui$Common_Errors$Value = function (a) {
	return {ctor: 'Value', _0: a};
};
var _narkisr$elm_ui$Common_Errors$NestedList = function (a) {
	return {ctor: 'NestedList', _0: a};
};
var _narkisr$elm_ui$Common_Errors$DeepNestedList = function (a) {
	return {ctor: 'DeepNestedList', _0: a};
};
var _narkisr$elm_ui$Common_Errors$Nested = function (a) {
	return {ctor: 'Nested', _0: a};
};
var _narkisr$elm_ui$Common_Errors$errorsDecoder = function () {
	var options = _elm_lang$core$Native_List.fromArray(
		[
			A2(_elm_lang$core$Json_Decode$map, _narkisr$elm_ui$Common_Errors$Value, _elm_lang$core$Json_Decode$string),
			A2(
			_elm_lang$core$Json_Decode$map,
			_narkisr$elm_ui$Common_Errors$Nested,
			_elm_lang$core$Json_Decode$dict(_elm_lang$core$Json_Decode$string)),
			A2(
			_elm_lang$core$Json_Decode$map,
			_narkisr$elm_ui$Common_Errors$DeepNestedList,
			_elm_lang$core$Json_Decode$dict(
				_elm_lang$core$Json_Decode$list(
					_elm_lang$core$Json_Decode$dict(
						_elm_lang$core$Json_Decode$dict(_elm_lang$core$Json_Decode$string))))),
			A2(
			_elm_lang$core$Json_Decode$map,
			_narkisr$elm_ui$Common_Errors$NestedList,
			_elm_lang$core$Json_Decode$dict(
				_elm_lang$core$Json_Decode$list(
					_elm_lang$core$Json_Decode$dict(_elm_lang$core$Json_Decode$string))))
		]);
	return A4(
		_elm_lang$core$Json_Decode$object3,
		_narkisr$elm_ui$Common_Errors$Errors,
		A2(
			_elm_lang$core$Json_Decode$at,
			_elm_lang$core$Native_List.fromArray(
				['object', 'type']),
			_elm_lang$core$Json_Decode$string),
		_elm_lang$core$Json_Decode$maybe(
			A2(
				_elm_lang$core$Json_Decode$at,
				_elm_lang$core$Native_List.fromArray(
					['object', 'errors']),
				_elm_lang$core$Json_Decode$dict(
					_elm_lang$core$Json_Decode$oneOf(options)))),
		_elm_lang$core$Json_Decode$maybe(
			A2(_elm_lang$core$Json_Decode_ops[':='], 'message', _elm_lang$core$Json_Decode$string)));
}();
var _narkisr$elm_ui$Common_Errors$decodeError = function (error) {
	var emptyErrors = A3(_narkisr$elm_ui$Common_Errors$Errors, '', _elm_lang$core$Maybe$Nothing, _elm_lang$core$Maybe$Nothing);
	var _p11 = error;
	if (_p11.ctor === 'Text') {
		var _p14 = _p11._0;
		var _p12 = A2(_elm_lang$core$Json_Decode$decodeString, _narkisr$elm_ui$Common_Errors$errorsDecoder, _p14);
		if (_p12.ctor === 'Ok') {
			return _p12._0;
		} else {
			var _p13 = A2(
				_elm_lang$core$Debug$log,
				_elm_lang$core$Basics$toString(_p12._0),
				A2(_elm_lang$core$Json_Decode$decodeString, _narkisr$elm_ui$Common_Errors$messageDecoder, _p14));
			if (_p13.ctor === 'Ok') {
				return _p13._0;
			} else {
				return A2(_elm_lang$core$Debug$log, _p13._0, emptyErrors);
			}
		}
	} else {
		return emptyErrors;
	}
};
var _narkisr$elm_ui$Common_Errors$NoOp = {ctor: 'NoOp'};

var _narkisr$elm_ui$Common_NewTab$newtab = _elm_lang$core$Native_Platform.outgoingPort(
	'newtab',
	function (v) {
		return v;
	});

var _narkisr$elm_ui$Nav_Common$Users = {ctor: 'Users'};
var _narkisr$elm_ui$Nav_Common$Stacks = {ctor: 'Stacks'};
var _narkisr$elm_ui$Nav_Common$Templates = {ctor: 'Templates'};
var _narkisr$elm_ui$Nav_Common$Jobs = {ctor: 'Jobs'};
var _narkisr$elm_ui$Nav_Common$Types = {ctor: 'Types'};
var _narkisr$elm_ui$Nav_Common$Systems = {ctor: 'Systems'};
var _narkisr$elm_ui$Nav_Common$Stats = {ctor: 'Stats'};
var _narkisr$elm_ui$Nav_Common$View = {ctor: 'View'};
var _narkisr$elm_ui$Nav_Common$List = {ctor: 'List'};
var _narkisr$elm_ui$Nav_Common$Edit = {ctor: 'Edit'};
var _narkisr$elm_ui$Nav_Common$Delete = {ctor: 'Delete'};
var _narkisr$elm_ui$Nav_Common$Launch = {ctor: 'Launch'};
var _narkisr$elm_ui$Nav_Common$Add = {ctor: 'Add'};

var _narkisr$elm_ui$Users_Session$isUser = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$core$List$member, 'celestial.roles/user', _p1.roles);
};
var _narkisr$elm_ui$Users_Session$logout = function (msg) {
	return A3(
		_elm_lang$core$Task$perform,
		_elm_community$basics_extra$Basics_Extra$never,
		msg,
		_elm_lang$core$Task$toResult(
			_evancz$elm_http$Http$getString('/logout')));
};
var _narkisr$elm_ui$Users_Session$Session = F5(
	function (a, b, c, d, e) {
		return {envs: a, identity: b, operations: c, roles: d, username: e};
	});
var _narkisr$elm_ui$Users_Session$emptySession = A5(
	_narkisr$elm_ui$Users_Session$Session,
	_elm_lang$core$Native_List.fromArray(
		[]),
	'',
	_elm_lang$core$Native_List.fromArray(
		[]),
	_elm_lang$core$Native_List.fromArray(
		[]),
	'');
var _narkisr$elm_ui$Users_Session$session = A6(
	_elm_lang$core$Json_Decode$object5,
	_narkisr$elm_ui$Users_Session$Session,
	A2(
		_elm_lang$core$Json_Decode_ops[':='],
		'envs',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
	A2(_elm_lang$core$Json_Decode_ops[':='], 'identity', _elm_lang$core$Json_Decode$string),
	A2(
		_elm_lang$core$Json_Decode_ops[':='],
		'operations',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
	A2(
		_elm_lang$core$Json_Decode_ops[':='],
		'roles',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
	A2(_elm_lang$core$Json_Decode_ops[':='], 'username', _elm_lang$core$Json_Decode$string));
var _narkisr$elm_ui$Users_Session$getSession = function (msg) {
	return A3(
		_elm_lang$core$Task$perform,
		_elm_community$basics_extra$Basics_Extra$never,
		msg,
		_elm_lang$core$Task$toResult(
			A2(_narkisr$elm_ui$Common_Http$getJson, _narkisr$elm_ui$Users_Session$session, '/sessions')));
};

var _narkisr$elm_ui$Nav_Header$dropdown = function (attrs) {
	return A2(
		_elm_lang$core$List$append,
		_elm_lang$core$Native_List.fromArray(
			[
				A2(_elm_lang$html$Html_Attributes$attribute, 'aria-expanded', 'false'),
				_elm_lang$html$Html_Attributes$class('dropdown-toggle'),
				A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'dropdown'),
				_elm_lang$html$Html_Attributes$href('#')
			]),
		attrs);
};
var _narkisr$elm_ui$Nav_Header$gearsButton = function (session) {
	return _narkisr$elm_ui$Users_Session$isUser(session) ? A2(
		_elm_lang$html$Html$i,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('fa fa-gears'),
				_elm_lang$html$Html_Attributes$style(
				_elm_lang$core$Native_List.fromArray(
					[
						{ctor: '_Tuple2', _0: 'color', _1: 'gray'},
						{ctor: '_Tuple2', _0: 'pointer-events', _1: 'none'}
					]))
			]),
		_elm_lang$core$Native_List.fromArray(
			[])) : A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('dropdown pull-right')
			]),
		_elm_lang$core$Native_List.fromArray(
			[
				A2(
				_elm_lang$html$Html$i,
				_narkisr$elm_ui$Nav_Header$dropdown(
					_elm_lang$core$Native_List.fromArray(
						[
							_elm_lang$html$Html_Attributes$class('fa fa-gears'),
							_elm_lang$html$Html_Attributes$style(
							_elm_lang$core$Native_List.fromArray(
								[
									{ctor: '_Tuple2', _0: 'color', _1: 'black'}
								]))
						])),
				_elm_lang$core$Native_List.fromArray(
					[])),
				A2(
				_elm_lang$html$Html$ul,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$class('dropdown-menu')
					]),
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$html$Html$li,
						_elm_lang$core$Native_List.fromArray(
							[]),
						_elm_lang$core$Native_List.fromArray(
							[
								A2(
								_elm_lang$html$Html$a,
								_elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html_Attributes$href('#/users/list')
									]),
								_elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html$text('Users')
									]))
							])),
						A2(
						_elm_lang$html$Html$li,
						_elm_lang$core$Native_List.fromArray(
							[]),
						_elm_lang$core$Native_List.fromArray(
							[
								A2(
								_elm_lang$html$Html$a,
								_elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html_Attributes$href('swagger/index.html')
									]),
								_elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html$text('Swagger')
									]))
							]))
					]))
			]));
};
var _narkisr$elm_ui$Nav_Header$navHeader = A2(
	_elm_lang$html$Html$div,
	_elm_lang$core$Native_List.fromArray(
		[
			_elm_lang$html$Html_Attributes$class('navbar-header')
		]),
	_elm_lang$core$Native_List.fromArray(
		[
			A2(
			_elm_lang$html$Html$img,
			_elm_lang$core$Native_List.fromArray(
				[
					_elm_lang$html$Html_Attributes$src('assets/img/cropped.png'),
					_elm_lang$html$Html_Attributes$alt('Celestial'),
					_elm_lang$html$Html_Attributes$width(110),
					_elm_lang$html$Html_Attributes$height(50)
				]),
			_elm_lang$core$Native_List.fromArray(
				[]))
		]));
var _narkisr$elm_ui$Nav_Header$setSession = F2(
	function (model, session) {
		return _narkisr$elm_ui$Common_Utils$none(
			_elm_lang$core$Native_Utils.update(
				model,
				{session: session}));
	});
var _narkisr$elm_ui$Nav_Header$Model = function (a) {
	return {session: a};
};
var _narkisr$elm_ui$Nav_Header$init = _narkisr$elm_ui$Common_Utils$none(
	_narkisr$elm_ui$Nav_Header$Model(_narkisr$elm_ui$Users_Session$emptySession));
var _narkisr$elm_ui$Nav_Header$Goto = F2(
	function (a, b) {
		return {ctor: 'Goto', _0: a, _1: b};
	});
var _narkisr$elm_ui$Nav_Header$NoOp = {ctor: 'NoOp'};
var _narkisr$elm_ui$Nav_Header$LoadSwagger = {ctor: 'LoadSwagger'};
var _narkisr$elm_ui$Nav_Header$Redirect = function (a) {
	return {ctor: 'Redirect', _0: a};
};
var _narkisr$elm_ui$Nav_Header$update = F2(
	function (msg, model) {
		var _p0 = msg;
		switch (_p0.ctor) {
			case 'SetSession':
				return _narkisr$elm_ui$Common_Utils$none(
					_elm_lang$core$Native_Utils.update(
						model,
						{session: _p0._0}));
			case 'SignOut':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _narkisr$elm_ui$Users_Session$logout(_narkisr$elm_ui$Nav_Header$Redirect)
				};
			case 'Redirect':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _narkisr$elm_ui$Common_Redirect$redirect('login')
				};
			case 'LoadSwagger':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _narkisr$elm_ui$Common_NewTab$newtab('swagger/index.html')
				};
			default:
				return _narkisr$elm_ui$Common_Utils$none(model);
		}
	});
var _narkisr$elm_ui$Nav_Header$SetSession = function (a) {
	return {ctor: 'SetSession', _0: a};
};
var _narkisr$elm_ui$Nav_Header$SignOut = {ctor: 'SignOut'};
var _narkisr$elm_ui$Nav_Header$topNav = function (_p1) {
	var _p2 = _p1;
	return A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('navbar-custom-menu')
			]),
		_elm_lang$core$Native_List.fromArray(
			[
				A2(
				_elm_lang$html$Html$ul,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$class('nav navbar-nav')
					]),
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$html$Html$li,
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html_Attributes$class('dropdown user user-menu')
							]),
						_elm_lang$core$Native_List.fromArray(
							[
								A2(
								_elm_lang$html$Html$a,
								_narkisr$elm_ui$Nav_Header$dropdown(
									_elm_lang$core$Native_List.fromArray(
										[])),
								_elm_lang$core$Native_List.fromArray(
									[
										A2(
										_elm_lang$html$Html$span,
										_elm_lang$core$Native_List.fromArray(
											[
												_elm_lang$html$Html_Attributes$class('hidden-xs')
											]),
										_elm_lang$core$Native_List.fromArray(
											[
												_elm_lang$html$Html$text(_p2.username)
											]))
									])),
								A2(
								_elm_lang$html$Html$ul,
								_elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html_Attributes$class('dropdown-menu')
									]),
								_elm_lang$core$Native_List.fromArray(
									[
										A2(
										_elm_lang$html$Html$li,
										_elm_lang$core$Native_List.fromArray(
											[
												_elm_lang$html$Html_Attributes$class('user-header')
											]),
										_elm_lang$core$Native_List.fromArray(
											[
												A2(
												_elm_lang$html$Html$p,
												_elm_lang$core$Native_List.fromArray(
													[]),
												_elm_lang$core$Native_List.fromArray(
													[
														_elm_lang$html$Html$text(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'Environments you can access: ',
															A2(_elm_lang$core$String$join, ' ', _p2.envs)))
													]))
											])),
										A2(
										_elm_lang$html$Html$li,
										_elm_lang$core$Native_List.fromArray(
											[
												_elm_lang$html$Html_Attributes$class('user-body')
											]),
										_elm_lang$core$Native_List.fromArray(
											[])),
										A2(
										_elm_lang$html$Html$li,
										_elm_lang$core$Native_List.fromArray(
											[
												_elm_lang$html$Html_Attributes$class('user-footer')
											]),
										_elm_lang$core$Native_List.fromArray(
											[
												A2(
												_elm_lang$html$Html$div,
												_elm_lang$core$Native_List.fromArray(
													[
														_elm_lang$html$Html_Attributes$class('pull-left')
													]),
												_elm_lang$core$Native_List.fromArray(
													[
														A2(
														_elm_lang$html$Html$a,
														_elm_lang$core$Native_List.fromArray(
															[
																_elm_lang$html$Html_Attributes$class('btn btn-default btn-flat'),
																_elm_lang$html$Html_Attributes$href('#')
															]),
														_elm_lang$core$Native_List.fromArray(
															[
																_elm_lang$html$Html$text('Profile')
															]))
													])),
												A2(
												_elm_lang$html$Html$div,
												_elm_lang$core$Native_List.fromArray(
													[
														_elm_lang$html$Html_Attributes$class('pull-right')
													]),
												_elm_lang$core$Native_List.fromArray(
													[
														A2(
														_elm_lang$html$Html$a,
														_elm_lang$core$Native_List.fromArray(
															[
																_elm_lang$html$Html_Attributes$class('btn btn-default btn-flat'),
																_elm_lang$html$Html_Attributes$href('#'),
																_elm_lang$html$Html_Events$onClick(_narkisr$elm_ui$Nav_Header$SignOut)
															]),
														_elm_lang$core$Native_List.fromArray(
															[
																_elm_lang$html$Html$text('Sign out')
															]))
													]))
											]))
									]))
							])),
						A2(
						_elm_lang$html$Html$li,
						_elm_lang$core$Native_List.fromArray(
							[]),
						_elm_lang$core$Native_List.fromArray(
							[
								A2(
								_elm_lang$html$Html$a,
								_elm_lang$core$Native_List.fromArray(
									[
										A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'control-sidebar'),
										_elm_lang$html$Html_Attributes$href('#')
									]),
								_elm_lang$core$Native_List.fromArray(
									[
										_narkisr$elm_ui$Nav_Header$gearsButton(_p2)
									]))
							]))
					]))
			]));
};
var _narkisr$elm_ui$Nav_Header$view = function (_p3) {
	var _p4 = _p3;
	return A2(
		_elm_lang$html$Html$header,
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$html$Html_Attributes$class('main-header')
			]),
		_elm_lang$core$Native_List.fromArray(
			[
				A2(
				_elm_lang$html$Html$a,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$href('/index.html'),
						_elm_lang$html$Html_Attributes$class('logo')
					]),
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$html$Html$span,
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html_Attributes$class('logo-mini')
							]),
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html$text('CEL')
							])),
						A2(
						_elm_lang$html$Html$span,
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html_Attributes$class('logo-lg')
							]),
						_elm_lang$core$Native_List.fromArray(
							[_narkisr$elm_ui$Nav_Header$navHeader]))
					])),
				A2(
				_elm_lang$html$Html$nav,
				_elm_lang$core$Native_List.fromArray(
					[
						_elm_lang$html$Html_Attributes$class('navbar navbar-static-top'),
						A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'navigation')
					]),
				_elm_lang$core$Native_List.fromArray(
					[
						A2(
						_elm_lang$html$Html$a,
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$html$Html_Attributes$href('#'),
								_elm_lang$html$Html_Attributes$class('sidebar-toggle'),
								A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'offcanvas'),
								A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'button')
							]),
						_elm_lang$core$Native_List.fromArray(
							[
								A2(
								_elm_lang$html$Html$span,
								_elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html_Attributes$class('sr-only')
									]),
								_elm_lang$core$Native_List.fromArray(
									[
										_elm_lang$html$Html$text('Toggle navigation')
									]))
							])),
						_narkisr$elm_ui$Nav_Header$topNav(_p4.session)
					]))
			]));
};

var Elm = {};
Elm['Nav'] = Elm['Nav'] || {};
Elm['Nav']['Header'] = Elm['Nav']['Header'] || {};
_elm_lang$core$Native_Platform.addPublicModule(Elm['Nav']['Header'], 'Nav.Header', typeof _narkisr$elm_ui$Nav_Header$main === 'undefined' ? null : _narkisr$elm_ui$Nav_Header$main);

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

