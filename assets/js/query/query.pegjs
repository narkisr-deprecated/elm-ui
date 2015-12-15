{
  function makeInteger(o) {
    return parseInt(o.join(''), 10);
  }
}

start
  = query

query =
  must / must_not / wildcard

space = ' '*

must
  = left:field '=' right:value space? rest:query? {
      if(!rest) {
         rest = {};
      }
      if(!rest['must']) {
         rest['must'] = {};
      }
      rest['must'][left]=right;
      return rest;
    }

must_not
  = left:field '!=' right:value space? rest:query? {  
      if(!rest) {
         rest = {};
      }
      if(!rest['must_not']) {
         rest['must_not'] = {};
      }
      rest['must_not'][left]=right;
      return rest;
   }

wildcard = 'type:' right:value space? rest:query? {  
      if(!rest['wildcard']) {
         rest['wildcard'] = {};
      }
      rest['wildcard']['type']=right;
      return rest;
   }

field 
  = prefix:([a-z]*) dot:(.?) key:([a-z]*)? { 
     return prefix.join('')+ "." + key.join(''); 
  }

value 
  = alpha:[a-z]+ { return alpha.join(''); } /
    digits:[0-9]+ { return makeInteger(digits); }

