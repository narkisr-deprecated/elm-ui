  var service = {};

  var rules = 
'{' +
  'function makeInteger(o) {' +
    'return parseInt(o.join(""), 10);' +
  '}' +
'}' +

'start' +
  '= query' +

'\nquery =' +
  'env / must / must_not / all' +

'\nspace = " "*' +

'\nall= "*"' +

'must' +
  '= left:field "=" right:value space? rest:query? {' +
	'if(!rest) {' +
         'rest = {};' +
	'}' +
	'if(!rest["must"]) {' +
         'rest["must"] = [];' +
	'}' +
      'if( right.substr(-1) === "*" ) {' +
        'term = {wildcard:{}};' +
        'term["wildcard"][left] = right;' +
      '} else {' + 
        'term = {term:{}};' +
        'term["term"][left] = right;' +
      '}' + 
	'rest["must"].push(term);' +
	'return rest;' +
    '}' +

'must_not' +
  '= left:field "!=" right:value space? rest:query? {' +
	'if(!rest) {' +
         'rest = {};' +
	'}' +
	'if(!rest["must_not"]) {' +
         'rest["must_not"] = [];' +
	'}' +
      'if( right.substr(-1) === "*" ) {' +
        'term = {wildcard:{}};' +
        'term["wildcard"][left] = right;' +
      '} else {' + 
        'term = {term:{}};' +
        'term["term"][left] = right;' +
      '}' + 
	'rest["must_not"].push(term);' +
	'return rest;' +
    '}' +

'env = "env=" right:value space? rest:query? {  ' +
	'if(!rest) {' +
         'rest = {};' +
	'}' +
	'if(!rest["should"]) {' +
         'rest["should"] = [];' +
	'}' +
      'term = {term:{}};' +
      'term["term"]["env"] = right;' +
	'rest["should"].push(term);' +
	'return rest;' +
   '}' +

'field ' +
  '= prefix:([a-z]+) dot:"." key:([a-z]+) { ' +
     'return prefix.join("")+ "." + key.join(""); ' +
  '}' + '/' +

  'key:([a-z]+) { return key.join(""); }' + 

'value ' +
  '= alpha:[a-z\\-\\?\\*0-9]+ { return alpha.join(""); } /' +
    'digits:[0-9]+ { return makeInteger(digits); }';

function parseQuery(input) {
  var parser = PEG.buildParser(rules);
  return parser.parse(input);
};

