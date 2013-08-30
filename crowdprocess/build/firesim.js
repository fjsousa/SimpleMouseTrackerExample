function Run(data){

Module = {};
Module['preRun'] = [];

//OUTPUT
Module['return'] = {};
Module['return']['output'] = {};
Module['return']['output']['files'] = {};
Module['return']['output']['stdout'] = '';
Module['return']['output']['stderr'] = '';

//PATH CODE
Module['dirname'] = function dirname(path){

  return path.substring(0,path.lastIndexOf('/')+1);
}

Module['basename'] = function basename(path){

  return path.substring(path.lastIndexOf('/')+1);
}

//COMPRESS CODE
// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// this work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.3.0

var LZString = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  
  compressToBase64 : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    
    input = this.compress(input);
    
    while (i < input.length*2) {
      
      if (i%2==0) {
        chr1 = input.charCodeAt(i/2) >> 8;
        chr2 = input.charCodeAt(i/2) & 255;
        if (i/2+1 < input.length) 
          chr3 = input.charCodeAt(i/2+1) >> 8;
        else 
          chr3 = NaN;
      } else {
        chr1 = input.charCodeAt((i-1)/2) & 255;
        if ((i+1)/2 < input.length) {
          chr2 = input.charCodeAt((i+1)/2) >> 8;
          chr3 = input.charCodeAt((i+1)/2) & 255;
        } else 
          chr2=chr3=NaN;
      }
      i+=3;
      
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      
      output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      
    }
    
    return output;
  },
  
  decompressFromBase64 : function (input) {
    var output = "",
        ol = 0, 
        output_,
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;
    
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    
    while (i < input.length) {
      
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      
      if (ol%2==0) {
        output_ = chr1 << 8;
        flush = true;
        
        if (enc3 != 64) {
          output += String.fromCharCode(output_ | chr2);
          flush = false;
        }
        if (enc4 != 64) {
          output_ = chr3 << 8;
          flush = true;
        }
      } else {
        output = output + String.fromCharCode(output_ | chr1);
        flush = false;
        
        if (enc3 != 64) {
          output_ = chr2 << 8;
          flush = true;
        }
        if (enc4 != 64) {
          output += String.fromCharCode(output_ | chr3);
          flush = false;
        }
      }
      ol+=3;
    }
    
    return this.decompress(output);
    
  },

  compressToUTF16 : function (input) {
    var output = "",
        i,c,
        current,
        status = 0;
    
    input = this.compress(input);
    
    for (i=0 ; i<input.length ; i++) {
      c = input.charCodeAt(i);
      switch (status++) {
        case 0:
          output += String.fromCharCode((c >> 1)+32);
          current = (c & 1) << 14;
          break;
        case 1:
          output += String.fromCharCode((current + (c >> 2))+32);
          current = (c & 3) << 13;
          break;
        case 2:
          output += String.fromCharCode((current + (c >> 3))+32);
          current = (c & 7) << 12;
          break;
        case 3:
          output += String.fromCharCode((current + (c >> 4))+32);
          current = (c & 15) << 11;
          break;
        case 4:
          output += String.fromCharCode((current + (c >> 5))+32);
          current = (c & 31) << 10;
          break;
        case 5:
          output += String.fromCharCode((current + (c >> 6))+32);
          current = (c & 63) << 9;
          break;
        case 6:
          output += String.fromCharCode((current + (c >> 7))+32);
          current = (c & 127) << 8;
          break;
        case 7:
          output += String.fromCharCode((current + (c >> 8))+32);
          current = (c & 255) << 7;
          break;
        case 8:
          output += String.fromCharCode((current + (c >> 9))+32);
          current = (c & 511) << 6;
          break;
        case 9:
          output += String.fromCharCode((current + (c >> 10))+32);
          current = (c & 1023) << 5;
          break;
        case 10:
          output += String.fromCharCode((current + (c >> 11))+32);
          current = (c & 2047) << 4;
          break;
        case 11:
          output += String.fromCharCode((current + (c >> 12))+32);
          current = (c & 4095) << 3;
          break;
        case 12:
          output += String.fromCharCode((current + (c >> 13))+32);
          current = (c & 8191) << 2;
          break;
        case 13:
          output += String.fromCharCode((current + (c >> 14))+32);
          current = (c & 16383) << 1;
          break;
        case 14:
          output += String.fromCharCode((current + (c >> 15))+32, (c & 32767)+32);
          status = 0;
          break;
      }
    }
    
    return output + String.fromCharCode(current + 32);
  },
  

  decompressFromUTF16 : function (input) {
    var output = "",
        current,c,
        status=0,
        i = 0;
    
    while (i < input.length) {
      c = input.charCodeAt(i) - 32;
      
      switch (status++) {
        case 0:
          current = c << 1;
          break;
        case 1:
          output += String.fromCharCode(current | (c >> 14));
          current = (c&16383) << 2;
          break;
        case 2:
          output += String.fromCharCode(current | (c >> 13));
          current = (c&8191) << 3;
          break;
        case 3:
          output += String.fromCharCode(current | (c >> 12));
          current = (c&4095) << 4;
          break;
        case 4:
          output += String.fromCharCode(current | (c >> 11));
          current = (c&2047) << 5;
          break;
        case 5:
          output += String.fromCharCode(current | (c >> 10));
          current = (c&1023) << 6;
          break;
        case 6:
          output += String.fromCharCode(current | (c >> 9));
          current = (c&511) << 7;
          break;
        case 7:
          output += String.fromCharCode(current | (c >> 8));
          current = (c&255) << 8;
          break;
        case 8:
          output += String.fromCharCode(current | (c >> 7));
          current = (c&127) << 9;
          break;
        case 9:
          output += String.fromCharCode(current | (c >> 6));
          current = (c&63) << 10;
          break;
        case 10:
          output += String.fromCharCode(current | (c >> 5));
          current = (c&31) << 11;
          break;
        case 11:
          output += String.fromCharCode(current | (c >> 4));
          current = (c&15) << 12;
          break;
        case 12:
          output += String.fromCharCode(current | (c >> 3));
          current = (c&7) << 13;
          break;
        case 13:
          output += String.fromCharCode(current | (c >> 2));
          current = (c&3) << 14;
          break;
        case 14:
          output += String.fromCharCode(current | (c >> 1));
          current = (c&1) << 15;
          break;
        case 15:
          output += String.fromCharCode(current | c);
          status=0;
          break;
      }
      
      
      i++;
    }
    
    return this.decompress(output);
    //return output;
    
  },


  
  compress: function (uncompressed) {
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_result= "",
        context_data_string="", 
        context_data_val=0, 
        context_data_position=0,
        ii;
    
    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!context_dictionary.hasOwnProperty(context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }
      
      context_wc = context_w + context_c;
      if (context_dictionary.hasOwnProperty(context_wc)) {
        context_w = context_wc;
      } else {
        if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
          
          
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }
    
    // Output the code for w.
    if (context_w !== "") {
      if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += String.fromCharCode(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
        
        
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }
    
    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == 15) {
        context_data_position = 0;
        context_data_string += String.fromCharCode(context_data_val);
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }
    
    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == 15) {
        context_data_string += String.fromCharCode(context_data_val);
        break;
      }
      else context_data_position++;
    }
    return context_data_string;
  },
  
  decompress: function (compressed) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = "",
        i,
        w,
        bits, resb, maxpower, power,
        c,
        errorCount=0,
        literal,
        data = {string:compressed, val:compressed.charCodeAt(0), position:32768, index:1};
    
    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }
    
    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = 32768;
        data.val = data.string.charCodeAt(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }
    
    switch (next = bits) {
      case 0: 
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = String.fromCharCode(bits);
        break;
      case 1: 
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = String.fromCharCode(bits);
        break;
      case 2: 
        return "";
    }
    dictionary[3] = c;
    w = result = c;
    while (true) {
      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = 32768;
          data.val = data.string.charCodeAt(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0: 
          if (errorCount++ > 10000) return "Error";
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = String.fromCharCode(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1: 
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = String.fromCharCode(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2: 
          return result;
      }
      
      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
      
      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result += entry;
      
      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;
      
      w = entry;
      
      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
      
    }
  }
};


module.exports.compress = LZString.compressToBase64.bind(LZString);
module.exports.decompress = LZString.decompressFromBase64.bind(LZString);



Module['compress'] = module.exports.compress;
Module['decompress'] = module.exports.decompress;





Module['preRun'].push(function () {

if((data.input) && (data.input.files)){ 
        var files = data.input.files;
	files.forEach(function(file) {
 
		var dirname = Module['dirname'](file.name);
		var basename = Module['basename'](file.name);
		
	
		var content = ((file.decompress) || (file.compress)) ? Module['decompress'](file.content) : file.content;
		

		Module['FS_createDataFile'](dirname,basename,content,true,true); 
	}); 

}
		
		var dirname = Module['dirname'](Module['dirname']('/malcataSlope_100.grass'));
		var basename = Module['basename'](Module['basename']('/malcataSlope_100.grass'));
		
		var content = Module['decompress']('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');
		
		
		Module['FS_createDataFile'](dirname,basename,content,true,true);
	
		
		
		var dirname = Module['dirname'](Module['dirname']('/malcataAspect_100.grass'));
		var basename = Module['basename'](Module['basename']('/malcataAspect_100.grass'));
		
		var content = Module['decompress']('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');
		
		
		Module['FS_createDataFile'](dirname,basename,content,true,true);
	
		

	Module['print'] = function(text){
		Module['return']['output']['stdout'] += text + '\n';
	};

	Module['printErr'] = function(text){
		Module['return']['output']['stderr'] += text + '\n';
	};
});

//

//EMSCRIPTEN CODE
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (ENVIRONMENT_IS_WEB) {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
    this['Module'] = Module;
  } else if (ENVIRONMENT_IS_WORKER) {
    // We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 4976;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,254,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,254,255,255,255,2,0,0,0,254,255,255,255,2,0,0,0,255,255,255,255,1,0,0,0,84,104,101,114,101,32,119,101,114,101,32,37,100,32,116,105,109,101,32,115,116,101,112,115,32,101,110,100,105,110,103,32,97,116,32,37,51,46,50,102,32,109,105,110,117,116,101,115,32,40,37,51,46,50,102,32,104,111,117,114,115,41,46,10,0,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,111,98,106,101,99,116,46,10,0,37,115,10,0,0,0,0,0,67,117,115,116,111,109,32,70,117,101,108,32,109,111,100,101,108,0,0,0,0,0,0,0,70,105,114,101,95,70,108,97,109,101,76,101,110,103,116,104,84,97,98,108,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,108,97,109,101,32,108,101,110,103,116,104,32,116,97,98,108,101,32,119,105,116,104,32,37,100,32,99,108,97,115,115,101,115,32,111,102,32,37,102,32,102,101,101,116,46,0,0,0,0,0,0,67,85,83,84,79,77,0,0,70,105,114,101,95,70,108,97,109,101,83,99,111,114,99,104,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,83,116,97,110,100,97,114,100,0,0,0,0,0,0,0,0,82,117,110,110,105,110,103,32,102,105,114,101,83,105,109,32,119,105,116,104,32,82,111,119,115,58,37,100,44,32,85,58,37,108,102,44,32,68,105,114,58,37,108,102,10,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,112,97,114,116,105,99,108,101,32,116,111,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,65,116,65,122,105,109,117,116,104,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,116,121,112,101,32,118,97,108,117,101,32,40,97,114,103,32,35,51,41,32,105,115,32,110,111,116,32,70,73,82,69,95,84,89,80,69,95,68,69,65,68,44,32,70,73,82,69,95,84,89,80,69,95,72,69,82,66,44,32,111,114,32,70,73,82,69,95,84,89,80,69,95,87,79,79,68,46,0,0,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,68,101,115,116,114,111,121,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,102,111,114,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,32,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,101,120,116,105,110,99,116,105,111,110,32,109,111,105,115,116,117,114,101,32,37,53,46,52,102,32,105,115,32,116,111,111,32,115,109,97,108,108,46,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,100,101,112,116,104,32,37,53,46,52,102,32,105,115,32,116,111,111,32,115,109,97,108,108,46,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,101,120,99,101,101,100,115,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,114,97,110,103,101,32,91,48,46,46,37,100,93,46,0,0,0,0,0,0,99,97,116,97,108,111,103,33,61,78,85,76,76,32,38,38,32,70,117,101,108,67,97,116,95,77,97,103,105,99,67,111,111,107,105,101,40,99,97,116,97,108,111,103,41,61,61,70,73,82,69,95,67,65,84,65,76,79,71,95,77,65,71,73,67,0,0,0,0,0,0,0,37,115,10,0,0,0,0,0,72,101,97,118,121,32,76,111,103,103,105,110,103,32,83,108,97,115,104,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,77,97,120,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,78,70,70,76,49,51,0,0,77,101,100,105,117,109,32,76,111,103,103,105,110,103,32,83,108,97,115,104,0,0,0,0,78,70,70,76,49,50,0,0,76,105,103,104,116,32,76,111,103,103,105,110,103,32,83,108,97,115,104,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,111,112,101,110,32,111,117,116,112,117,116,32,109,97,112,32,34,37,115,34,46,10,0,0,0,0,0,0,0,0,78,70,70,76,49,49,0,0,84,105,109,98,101,114,32,40,108,105,116,116,101,114,32,38,32,117,110,100,101,114,115,116,111,114,121,41,0,0,0,0,78,70,70,76,49,48,0,0,72,97,114,100,119,111,111,100,32,76,105,116,116,101,114,0,78,70,70,76,48,57,0,0,67,108,111,115,101,100,32,84,105,109,98,101,114,32,76,105,116,116,101,114,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,78,111,87,105,110,100,78,111,83,108,111,112,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,78,70,70,76,48,56,0,0,83,111,117,116,104,101,114,110,32,82,111,117,103,104,0,0,78,70,70,76,48,55,0,0,68,111,114,109,97,110,116,32,66,114,117,115,104,32,38,32,72,97,114,100,119,111,111,100,32,83,108,97,115,104,0,0,114,0,0,0,0,0,0,0,78,70,70,76,48,54,0,0,66,114,117,115,104,32,40,50,32,102,116,41,0,0,0,0,78,70,70,76,48,53,0,0,67,104,97,112,97,114,114,97,108,32,40,54,32,102,116,41,0,0,0,0,0,0,0,0,78,70,70,76,48,52,0,0,84,97,108,108,32,71,114,97,115,115,32,40,50,46,53,32,102,116,41,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,111,109,98,117,115,116,105,111,110,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,0,0,78,70,70,76,48,51,0,0,84,105,109,98,101,114,32,40,103,114,97,115,115,32,38,32,117,110,100,101,114,115,116,111,114,121,41,0,0,0,0,0,78,70,70,76,48,50,0,0,83,104,111,114,116,32,71,114,97,115,115,32,40,49,32,102,116,41,0,0,0,0,0,0,32,32,37,53,46,50,102,32,0,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,109,97,112,115,32,119,105,116,104,32,37,100,32,99,111,108,115,32,97,110,100,32,37,100,32,114,111,119,115,46,10,0,0,0,0,0,0,78,70,70,76,48,49,0,0,119,0,0,0,0,0,0,0,78,111,32,67,111,109,98,117,115,116,105,98,108,101,32,70,117,101,108,0,0,0,0,0,102,108,97,109,101,46,77,97,112,0,0,0,0,0,0,0,78,111,70,117,101,108,0,0,105,103,110,46,77,97,112,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,119,105,116,104,32,37,100,32,102,117,101,108,32,109,111,100,101,108,115,46,10,0,0,0,0,115,108,111,112,101,46,77,97,112,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,101,114,114,111,114,32,98,117,102,102,101,114,46,10,0,0,0,97,115,112,101,99,116,46,77,97,112,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,100,117,112,108,105,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,110,97,109,101,46,10,0,0,99,97,116,97,108,111,103,33,61,32,78,85,76,76,32,38,38,32,70,117,101,108,67,97,116,95,77,97,103,105,99,67,111,111,107,105,101,40,99,97,116,97,108,111,103,41,61,61,70,73,82,69,95,67,65,84,65,76,79,71,95,77,65,71,73,67,0,0,0,0,0,0,102,105,114,101,76,105,98,46,99,0,0,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,87,105,110,100,83,108,111,112,101,77,97,120,0,70,105,114,101,95,83,112,114,101,97,100,78,111,87,105,110,100,78,111,83,108,111,112,101,0,0,0,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,65,116,65,122,105,109,117,116,104,0,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,68,101,115,116,114,111,121,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,0,0,0,0,70,105,114,101,95,70,117,101,108,67,111,109,98,117,115,116,105,111,110,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,68,101,115,116,114,111,121,0,70,105,114,101,95,70,108,97,109,101,83,99,111,114,99,104,0,0,0,0,0,0,0,0,70,105,114,101,95,70,108,97,109,101,76,101,110,103,116,104,84,97,98,108,101,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,192,146,64,0,0,0,0,0,0,104,64,0,0,0,0,0,0,88,64,0,0,0,0,0,0,72,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,156,196,32,176,114,104,161,63,0,0,0,0,0,88,171,64,2,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,112,167,64,2,0,0,0,1,0,0,0,90,100,59,223,79,141,167,63,0,0,0,0,0,64,91,64,2,0,0,0,1,0,0,0,90,100,59,223,79,141,151,63,0,0,0,0,0,0,62,64,2,0,0,0,2,0,0,0,90,100,59,223,79,141,151,63,0,0,0,0,0,112,151,64,3,0,0,0,1,0,0,0,68,139,108,231,251,169,193,63,0,0,0,0,0,112,151,64,4,0,0,0,1,0,0,0,113,61,10,215,163,112,205,63,0,0,0,0,0,64,159,64,4,0,0,0,1,0,0,0,90,100,59,223,79,141,199,63,0,0,0,0,0,64,91,64,4,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,0,62,64,4,0,0,0,3,0,0,0,113,61,10,215,163,112,205,63,0,0,0,0,0,112,151,64,5,0,0,0,1,0,0,0,90,100,59,223,79,141,167,63,0,0,0,0,0,64,159,64,5,0,0,0,1,0,0,0,90,100,59,223,79,141,151,63,0,0,0,0,0,64,91,64,5,0,0,0,3,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,112,151,64,6,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,88,155,64,6,0,0,0,1,0,0,0,113,61,10,215,163,112,189,63,0,0,0,0,0,64,91,64,6,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,0,62,64,7,0,0,0,1,0,0,0,57,180,200,118,190,159,170,63,0,0,0,0,0,88,155,64,7,0,0,0,1,0,0,0,106,188,116,147,24,4,182,63,0,0,0,0,0,64,91,64,7,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,0,62,64,7,0,0,0,3,0,0,0,156,196,32,176,114,104,145,63,0,0,0,0,0,56,152,64,8,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,64,159,64,8,0,0,0,1,0,0,0,90,100,59,223,79,141,167,63,0,0,0,0,0,64,91,64,8,0,0,0,1,0,0,0,113,61,10,215,163,112,189,63,0,0,0,0,0,0,62,64,9,0,0,0,1,0,0,0,244,253,212,120,233,38,193,63,0,0,0,0,0,136,163,64,9,0,0,0,1,0,0,0,219,249,126,106,188,116,147,63,0,0,0,0,0,64,91,64,9,0,0,0,1,0,0,0,121,233,38,49,8,172,124,63,0,0,0,0,0,0,62,64,10,0,0,0,1,0,0,0,68,139,108,231,251,169,193,63,0,0,0,0,0,64,159,64,10,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,64,91,64,10,0,0,0,1,0,0,0,113,61,10,215,163,112,205,63,0,0,0,0,0,0,62,64,10,0,0,0,3,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,112,151,64,11,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,112,151,64,11,0,0,0,1,0,0,0,229,208,34,219,249,126,202,63,0,0,0,0,0,64,91,64,11,0,0,0,1,0,0,0,254,212,120,233,38,49,208,63,0,0,0,0,0,0,62,64,12,0,0,0,1,0,0,0,90,100,59,223,79,141,199,63,0,0,0,0,0,112,151,64,12,0,0,0,1,0,0,0,207,247,83,227,165,155,228,63,0,0,0,0,0,64,91,64,12,0,0,0,1,0,0,0,125,63,53,94,186,73,232,63,0,0,0,0,0,0,62,64,13,0,0,0,1,0,0,0,207,247,83,227,165,155,212,63,0,0,0,0,0,112,151,64,13,0,0,0,1,0,0,0,33,176,114,104,145,237,240,63,0,0,0,0,0,64,91,64,13,0,0,0,1,0,0,0,207,247,83,227,165,155,244,63,0,0,0,0,0,0,62,64,64,9,0,0,0,0,0,0,154,153,153,153,153,153,185,63,123,20,174,71,225,122,132,63,0,0,0,0,24,9,0,0,8,9,0,0,0,0,0,0,0,0,0,0,0,0,240,63,184,30,133,235,81,184,190,63,1,0,0,0,168,8,0,0,160,8,0,0,0,0,0,0,0,0,0,0,0,0,240,63,51,51,51,51,51,51,195,63,4,0,0,0,128,8,0,0,120,8,0,0,0,0,0,0,0,0,0,0,0,0,4,64,0,0,0,0,0,0,208,63,1,0,0,0,16,8,0,0,8,8,0,0,0,0,0,0,0,0,0,0,0,0,24,64,154,153,153,153,153,153,201,63,4,0,0,0,240,7,0,0,232,7,0,0,0,0,0,0,0,0,0,0,0,0,0,64,154,153,153,153,153,153,201,63,3,0,0,0,216,7,0,0,208,7,0,0,0,0,0,0,0,0,0,0,0,0,4,64,0,0,0,0,0,0,208,63,3,0,0,0,168,7,0,0,160,7,0,0,0,0,0,0,0,0,0,0,0,0,4,64,154,153,153,153,153,153,217,63,4,0,0,0,144,7,0,0,136,7,0,0,0,0,0,0,154,153,153,153,153,153,201,63,51,51,51,51,51,51,211,63,3,0,0,0,32,7,0,0,24,7,0,0,0,0,0,0,154,153,153,153,153,153,201,63,0,0,0,0,0,0,208,63,3,0,0,0,8,7,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,208,63,4,0,0,0,224,6,0,0,216,6,0,0,0,0,0,0,0,0,0,0,0,0,240,63,51,51,51,51,51,51,195,63,3,0,0,0,152,6,0,0,144,6,0,0,0,0,0,0,102,102,102,102,102,102,2,64,154,153,153,153,153,153,201,63,3,0,0,0,120,6,0,0,112,6,0,0,0,0,0,0,0,0,0,0,0,0,8,64,0,0,0,0,0,0,208,63,3,0,0,0,16,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  var _llvm_pow_f64=Math.pow;
  var _exp=Math.exp;
  var _sqrt=Math.sqrt;
  var _fabs=Math.abs;
  var _cos=Math.cos;
  var _sin=Math.sin;
  var _asin=Math.asin;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var VFS={mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode &= 4095;
        mode |= 0100000;
        return VFS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode &= 511 | 0001000;
        mode |= 0040000;
        return VFS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        mode |= 0020000;
        return VFS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path alreay exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to changews
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_node.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return VFS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        VFS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        VFS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        VFS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        VFS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        VFS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        if ((flags & 512)) {
          mode = (mode & 4095) | 0100000;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 0200000)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 512)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 2048)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = VFS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~1024;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 1024)) {
          VFS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },readdir:function (stream) {
        if (!stream.stream_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return stream.stream_ops.readdir(stream);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 8) {
          // seek to the end before writing in append mode
          VFS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write acccess
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      }};
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          // this wouldn't be required if the library wasn't eval'd at first...
          if (!TTY.utf8) {
            TTY.utf8 = new Runtime.UTF8Processor();
          }
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              if (process.stdin.destroyed) {
                return undefined;
              }
              result = process.stdin.read();
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        node.node_ops = MEMFS.node_ops;
        if (FS.isDir(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
          node.contents = [];
        } else if (FS.isLink(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
        } else if (FS.isChrdev(node.mode)) {
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{open:function (stream) {
          if (FS.isDir(stream.node.mode)) {
            // cache off the directory entries when open'd
            var entries = ['.', '..']
            for (var key in stream.node.contents) {
              if (!stream.node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            stream.entries = entries;
          }
        },read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.subarray) { // typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          stream.node.timestamp = Date.now();
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },readdir:function (stream) {
          return stream.entries;
        },allocate:function (stream, offset, length) {
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 0x02)) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            assert(contents.buffer === buffer || contents.buffer === buffer.buffer);
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,nodes:[null],devices:[null],streams:[null],nextInode:1,name_table:[,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function (errno) {
        this.errno = errno;
        for (var key in ERRNO_CODES) {
          if (ERRNO_CODES[key] === errno) {
            this.code = key;
            break;
          }
        }
        this.message = ERRNO_MESSAGES[errno];
      },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return (parentid + hash) % FS.name_table.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.name_table[hash];
        FS.name_table[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.name_table[hash] === node) {
          FS.name_table[hash] = node.name_next;
        } else {
          var current = FS.name_table[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.name_table[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return VFS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        Object.defineProperty(node, 'read', {
          get: function() { return (node.mode & readMode) === readMode; },
          set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
        });
        Object.defineProperty(node, 'write', {
          get: function() { return (node.mode & writeMode) === writeMode; },
          set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
        });
        // TODO add:
        // isFolder
        // isDevice
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 0170000) === 0100000;
      },isDir:function (mode) {
        return (mode & 0170000) === 0040000;
      },isLink:function (mode) {
        return (mode & 0170000) === 0120000;
      },isChrdev:function (mode) {
        return (mode & 0170000) === 0020000;
      },isBlkdev:function (mode) {
        return (mode & 0170000) === 0060000;
      },isFIFO:function (mode) {
        return (mode & 0170000) === 0010000;
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = VFS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },flagModes:{"r":0,"rs":8192,"r+":2,"w":1537,"wx":3585,"xw":3585,"w+":1538,"wx+":3586,"xw+":3586,"a":521,"ax":2569,"xa":2569,"a+":522,"ax+":2570,"xa+":2570},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 3;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 1024)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayMknod:function (mode) {
        switch (mode & 0170000) {
          case 0100000:
          case 0020000:
          case 0060000:
          case 0010000:
          case 0140000:
            return 0;
          default:
            return ERRNO_CODES.EINVAL;
        }
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 3) !== 0 ||  // opening for write
              (flags & 1024)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperty(stream, 'object', {
          get: function() { return stream.node; },
          set: function(val) { stream.node = val; }
        });
        Object.defineProperty(stream, 'isRead', {
          get: function() { return (stream.flags & 3) !== 1; }
        });
        Object.defineProperty(stream, 'isWrite', {
          get: function() { return (stream.flags & 3) !== 0; }
        });
        Object.defineProperty(stream, 'isAppend', {
          get: function() { return (stream.flags & 8); }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },createDefaultDirectories:function () {
        VFS.mkdir('/tmp', 0777);
      },createDefaultDevices:function () {
        // create /dev
        VFS.mkdir('/dev', 0777);
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        VFS.mkdev('/dev/null', 0666, FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        VFS.mkdev('/dev/tty', 0666, FS.makedev(5, 0));
        VFS.mkdev('/dev/tty1', 0666, FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        VFS.mkdir('/dev/shm', 0777);
        VFS.mkdir('/dev/shm/tmp', 0777);
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          VFS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          VFS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          VFS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = VFS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = VFS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = VFS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.root = FS.createNode(null, '/', 0040000 | 0777, 0);
        VFS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          VFS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return VFS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            VFS.mkdir(current, 0777);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return VFS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        var node = VFS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          VFS.chmod(path, mode | 146);
          var stream = VFS.open(path, 'w');
          VFS.write(stream, data, 0, data.length, 0);
          VFS.close(stream);
          VFS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = input && output ? 0777 : (input ? 0333 : 0555);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return VFS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return VFS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.getStream(fd);
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return VFS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (stream && ('socket' in stream)) {
        return _send(fildes, buf, nbyte, 0);
      }
      try {
        var slab = HEAP8;
        return VFS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"](((Math.min((+(Math.floor((ret)/(+(4294967296))))), (+(4294967295))))|0)>>>0),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = VFS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return VFS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }
  function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      var streamObj = FS.getStream(stream);
      if (streamObj) streamObj.error = false;
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.getStream(fd);
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return VFS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      }
      try {
        var slab = HEAP8;
        return VFS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }
  var ___strtok_state=0;
  function _strtok_r(s, delim, lasts) {
      var skip_leading_delim = 1;
      var spanp;
      var c, sc;
      var tok;
      if (s == 0 && (s = getValue(lasts, 'i8*')) == 0) {
        return 0;
      }
      cont: while (1) {
        c = getValue(s++, 'i8');
        for (spanp = delim; (sc = getValue(spanp++, 'i8')) != 0;) {
          if (c == sc) {
            if (skip_leading_delim) {
              continue cont;
            } else {
              setValue(lasts, s, 'i8*');
              setValue(s - 1, 0, 'i8');
              return s - 1;
            }
          }
        }
        break;
      }
      if (c == 0) {
        setValue(lasts, 0, 'i8*');
        return 0;
      }
      tok = s - 1;
      for (;;) {
        c = getValue(s++, 'i8');
        spanp = delim;
        do {
          if ((sc = getValue(spanp++, 'i8')) == c) {
            if (c == 0) {
              s = 0;
            } else {
              setValue(s - 1, 0, 'i8');
            }
            setValue(lasts, s, 'i8*');
            return tok;
          }
        } while (sc != 0);
      }
      abort('strtok_r error!');
    }function _strtok(s, delim) {
      return _strtok_r(s, delim, ___strtok_state);
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        VFS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);;
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  var _floor=Math.floor;
  var _atanf=Math.atan;
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }
  var _fabsf=Math.abs;
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
___strtok_state = Runtime.staticAlloc(4);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=+env.NaN;var o=+env.Infinity;var p=0;var q=0;var r=0;var s=0;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ab=env.asmPrintInt;var ac=env.asmPrintFloat;var ad=env.min;var ae=env.invoke_ii;var af=env.invoke_v;var ag=env.invoke_iii;var ah=env.invoke_vi;var ai=env._open;var aj=env._fabsf;var ak=env._snprintf;var al=env._lseek;var am=env._fclose;var an=env._strtok_r;var ao=env._abort;var ap=env._fprintf;var aq=env._sqrt;var ar=env._printf;var as=env._close;var at=env._pread;var au=env._fflush;var av=env._fopen;var aw=env.__reallyNegative;var ax=env._strtol;var ay=env._asin;var az=env._atanf;var aA=env._fabs;var aB=env._strtok;var aC=env.___setErrNo;var aD=env._fwrite;var aE=env._fseek;var aF=env._send;var aG=env._write;var aH=env._ftell;var aI=env._sprintf;var aJ=env._rewind;var aK=env._strdup;var aL=env._sin;var aM=env._sysconf;var aN=env._fread;var aO=env.__parseInt;var aP=env._fputc;var aQ=env._read;var aR=env.__formatString;var aS=env._atoi;var aT=env.___assert_func;var aU=env._cos;var aV=env._pwrite;var aW=env._recv;var aX=env._llvm_pow_f64;var aY=env._fsync;var aZ=env._floor;var a_=env.___errno_location;var a$=env._isspace;var a0=env._sbrk;var a1=env._exp;var a2=env._time;
// EMSCRIPTEN_START_FUNCS
function a7(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function a8(){return i|0}function a9(a){a=a|0;i=a}function ba(a,b){a=a|0;b=b|0;if((p|0)==0){p=a;q=b}}function bb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function bc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function bd(a){a=a|0;C=a}function be(a){a=a|0;D=a}function bf(a){a=a|0;E=a}function bg(a){a=a|0;F=a}function bh(a){a=a|0;G=a}function bi(a){a=a|0;H=a}function bj(a){a=a|0;I=a}function bk(a){a=a|0;J=a}function bl(a){a=a|0;K=a}function bm(a){a=a|0;L=a}function bn(){}function bo(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0.0,B=0,C=0.0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0,L=0.0,M=0.0,N=0.0,Q=0.0,R=0.0,S=0.0,T=0,U=0.0,V=0.0,W=0,Y=0,Z=0.0,_=0,$=0;d=i;i=i+96|0;e=d|0;f=e;g=i;i=i+16|0;j=g;k=i;i=i+16|0;l=k;m=i;i=i+16|0;n=m;o=i;i=i+16|0;p=o;q=i;i=i+16|0;r=q;if((a|0)==0){aT(2728,160,2896,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,160,2896,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){s=a+24|0;u=c[(c[s>>2]|0)+(b<<2)>>2]|0;if((u|0)==0){break}if((c[u+12>>2]|0)==0){v=u}else{w=0;x=u;while(1){h[(c[(c[x+16>>2]|0)+(w<<2)>>2]|0)+64>>3]=0.0;h[(c[(c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(w<<2)>>2]|0)+72>>3]=0.0;h[(c[(c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(w<<2)>>2]|0)+80>>3]=0.0;u=w+1|0;y=c[(c[s>>2]|0)+(b<<2)>>2]|0;if(u>>>0<(c[y+12>>2]|0)>>>0){w=u;x=y}else{v=y;break}}}h[v+88>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+96>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+104>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+112>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+120>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+128>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+136>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+144>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+152>>3]=0.0;x=c[(c[s>>2]|0)+(b<<2)>>2]|0;bJ(j|0,0,16);bJ(l|0,0,16);bJ(n|0,0,16);bJ(p|0,0,16);bJ(r|0,0,16);bJ(f|0,0,96);h[x+56>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+72>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+64>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+80>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+248>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+240>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+256>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+264>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+272>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+280>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+320>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+312>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+328>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+288>>3]=1.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+296>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+304>>3]=0.0;c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+336>>2]=0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+344>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+352>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+360>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+376>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+208>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+216>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+224>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+232>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+160>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+168>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+176>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+184>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+192>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+200>>3]=0.0;c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+4>>2]=1;x=c[(c[s>>2]|0)+(b<<2)>>2]|0;w=c[x+12>>2]|0;if((w|0)==0){c[a+4>>2]=0;z=0;i=d;return z|0}y=c[x+16>>2]|0;u=0;A=0.0;do{B=c[y+(u<<2)>>2]|0;C=+h[B+48>>3];D=k+(c[B+88>>2]<<3)|0;h[D>>3]=C+ +h[D>>3];A=A+C;u=u+1|0;}while(u>>>0<w>>>0);if(A>1.0e-6){E=0;F=x}else{c[a+4>>2]=0;z=0;i=d;return z|0}while(1){w=c[(c[F+16>>2]|0)+(E<<2)>>2]|0;u=c[w+88>>2]|0;C=+h[k+(u<<3)>>3];if(C>1.0e-6){h[w+64>>3]=+h[w+48>>3]/C;w=c[(c[s>>2]|0)+(b<<2)>>2]|0;y=c[(c[w+16>>2]|0)+(E<<2)>>2]|0;D=e+(u*48|0)+(c[y+96>>2]<<3)|0;h[D>>3]=+h[y+64>>3]+ +h[D>>3];G=w}else{G=F}w=E+1|0;H=c[G+12>>2]|0;if(w>>>0<H>>>0){E=w;F=G}else{break}}if((H|0)==0){I=G}else{x=0;w=G;while(1){D=c[(c[w+16>>2]|0)+(x<<2)>>2]|0;h[D+72>>3]=+h[e+((c[D+88>>2]|0)*48|0)+(c[D+96>>2]<<3)>>3];D=x+1|0;y=c[(c[s>>2]|0)+(b<<2)>>2]|0;if(D>>>0<(c[y+12>>2]|0)>>>0){x=D;w=y}else{I=y;break}}}h[I+56>>3]=+h[k>>3]/A;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+64>>3]=+h[k+8>>3]/A;w=c[(c[s>>2]|0)+(b<<2)>>2]|0;if((c[w+12>>2]|0)==0){J=0.0;K=w}else{x=0;C=0.0;y=w;D=c[w+16>>2]|0;while(1){w=c[D+(x<<2)>>2]|0;u=c[w+88>>2]|0;L=+h[w>>3];B=g+(u<<3)|0;h[B>>3]=+h[B>>3]+ +h[w+72>>3]*L*(1.0- +h[w+32>>3]);M=+h[w+64>>3];B=m+(u<<3)|0;h[B>>3]=+h[B>>3]+M*+h[w+8>>3];B=o+(u<<3)|0;h[B>>3]=+h[B>>3]+M*+h[w+24>>3];B=q+(u<<3)|0;h[B>>3]=+h[B>>3]+M*+h[w+40>>3];w=y+104|0;h[w>>3]=L+ +h[w>>3];w=c[(c[s>>2]|0)+(b<<2)>>2]|0;B=c[w+16>>2]|0;u=c[B+(x<<2)>>2]|0;L=+h[u+16>>3];if(L>1.0e-6){N=C+ +h[u>>3]/L}else{N=C}u=x+1|0;if(u>>>0<(c[w+12>>2]|0)>>>0){x=u;C=N;y=w;D=B}else{J=N;K=w;break}}}C=+h[K+56>>3]*+h[m>>3]+0.0;A=+h[q>>3];do{if(A>0.0){L=.174/+P(+A,.19);if(L<=1.0){Q=L;break}Q=1.0}else{Q=1.0}}while(0);h[K+72>>3]=+h[g>>3]*+h[o>>3]*Q;D=c[(c[s>>2]|0)+(b<<2)>>2]|0;A=C+ +h[D+64>>3]*+h[m+8>>3];L=+h[q+8>>3];do{if(L>0.0){M=.174/+P(+L,.19);if(M<=1.0){R=M;break}R=1.0}else{R=1.0}}while(0);L=+h[g+8>>3];h[D+80>>3]=L*+h[o+8>>3]*R;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+112>>3]=384.0/A;y=c[(c[s>>2]|0)+(b<<2)>>2]|0;C=+h[y+32>>3];if(C>1.0e-6){x=y+104|0;h[x>>3]=+h[x>>3]/C;x=c[(c[s>>2]|0)+(b<<2)>>2]|0;S=J/+h[x+32>>3];T=x}else{S=J;T=y}h[T+120>>3]=+X(+((S+.1)*(+O(+A)*.681+.792)))/(A*.2595+192.0);C=S/(3.348/+P(+A,.8189));M=133.0/+P(+A,.7913);U=+P(+A,1.5);V=U/(U*.0594+495.0)*+P(+C,+M);U=V*+X(+((1.0-C)*M));y=(c[(c[s>>2]|0)+(b<<2)>>2]|0)+72|0;h[y>>3]=U*+h[y>>3];y=(c[(c[s>>2]|0)+(b<<2)>>2]|0)+80|0;h[y>>3]=U*+h[y>>3];U=+P(+S,-.3)*5.275;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+128>>3]=U;U=+P(+A,.54)*.02526;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+136>>3]=U;U=+X(+(+P(+A,.55)*-.133))*7.47;M=+X(+(A*-359.0e-6))*.715;V=U*+P(+C,+(-0.0-M));h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+152>>3]=V;V=+P(+C,+M)/U;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+144>>3]=V;if(L<1.0e-6){c[a+4>>2]=0;z=0;i=d;return z|0}y=c[s>>2]|0;x=c[y+(b<<2)>>2]|0;do{if((c[x+12>>2]|0)!=0){w=0;L=0.0;B=x;u=y;while(1){W=c[(c[B+16>>2]|0)+(w<<2)>>2]|0;V=+h[W>>3];if((c[W+88>>2]|0)==0){Y=B+88|0;h[Y>>3]=+h[Y>>3]+V*+h[W+56>>3];Z=L;_=c[s>>2]|0}else{Z=L+V*+X(+(-500.0/+h[W+8>>3]));_=u}W=w+1|0;$=c[_+(b<<2)>>2]|0;if(W>>>0<(c[$+12>>2]|0)>>>0){w=W;L=Z;B=$;u=_}else{break}}if(Z<=1.0e-6){break}h[$+96>>3]=+h[$+88>>3]*2.9/Z}}while(0);c[a+4>>2]=0;z=0;i=d;return z|0}}while(0);$=c[a+16>>2]|0;aI(c[a+20>>2]|0,2088,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=$,t)|0)|0;c[a+4>>2]=-1;z=-1;i=d;return z|0}function bp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0.0,u=0.0,v=0,w=0.0,x=0,y=0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0,F=0,G=0.0,H=0,I=0.0,J=0.0,K=0.0,L=0.0;e=i;i=i+16|0;f=e|0;g=f;if((a|0)==0){aT(2728,436,2768,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,436,2768,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){j=a+24|0;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;if((k|0)==0){break}do{if((c[k+4>>2]|0)==0){bo(a,b)|0;l=c[(c[j>>2]|0)+(b<<2)>>2]|0}else{m=0;while(1){if(m>>>0>=6){break}if(+N(+(+h[d+(m<<3)>>3]- +h[k+160+(m<<3)>>3]))<1.0e-6){m=m+1|0}else{break}}if((m|0)!=6){l=k;break}c[a+4>>2]=0;n=0;i=e;return n|0}}while(0);h[l+160>>3]=+h[d>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+168>>3]=+h[d+8>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+176>>3]=+h[d+16>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+184>>3]=+h[d+24>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+192>>3]=+h[d+32>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+200>>3]=+h[d+40>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+248>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+240>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+256>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+264>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+272>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+344>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+352>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+360>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+376>>3]=0.0;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;if((c[k+12>>2]|0)==0){c[a+4>>2]=0;n=0;i=e;return n|0}bJ(g|0,0,16);o=0;p=0;q=0.0;r=k;while(1){k=c[(c[r+16>>2]|0)+(o<<2)>>2]|0;if((c[k+88>>2]|0)==0){s=+h[d+(c[2992+(c[k+96>>2]<<2)>>2]<<3)>>3];u=q+s*+h[k+56>>3]*+h[k>>3];v=p;w=s}else{u=q;v=p+1|0;w=+h[d+(((c[k+92>>2]|0)==2?4:5)<<3)>>3]}h[k+80>>3]=w;k=o+1|0;x=c[j>>2]|0;y=c[x+(b<<2)>>2]|0;if(k>>>0<(c[y+12>>2]|0)>>>0){o=k;p=v;q=u;r=y}else{break}}do{if((v|0)==0){z=0.0;A=+h[y+40>>3];B=x+(b<<2)|0}else{q=+h[y+88>>3];if(q>1.0e-6){C=u/q}else{C=0.0}r=x+(b<<2)|0;q=+h[y+40>>3];s=+h[y+96>>3]*(1.0-C/q)+-.226;if(s>=q){z=s;A=q;B=r;break}z=q;A=q;B=r}}while(0);r=c[B>>2]|0;p=c[r+12>>2]|0;if((p|0)==0){D=0.0}else{o=c[r+16>>2]|0;k=0;q=0.0;while(1){E=c[o+(k<<2)>>2]|0;s=+h[E+80>>3];F=c[E+88>>2]|0;G=+h[E+64>>3];H=f+(F<<3)|0;h[H>>3]=+h[H>>3]+s*G;I=q+(s*1116.0+250.0)*G*+h[r+56+(F<<3)>>3]*+h[E+56>>3];E=k+1|0;if(E>>>0<p>>>0){k=E;q=I}else{D=I;break}}}q=+h[r+104>>3];I=+h[f>>3];if(A>1.0e-6){G=I/A;J=1.0-G*2.59+G*G*5.11-G*G*G*3.52}else{J=0.0}k=r+240|0;h[k>>3]=+h[k>>3]+ +h[r+72>>3]*(I<A?J:0.0);I=+h[f+8>>3];if(z>1.0e-6){G=I/z;K=1.0-G*2.59+G*G*5.11-G*G*G*3.52}else{K=0.0}k=c[(c[j>>2]|0)+(b<<2)>>2]|0;p=k+240|0;h[p>>3]=+h[p>>3]+ +h[k+80>>3]*(I<z?K:0.0);I=D*q;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+256>>3]=+h[k+240>>3]*+h[k+112>>3];k=c[(c[j>>2]|0)+(b<<2)>>2]|0;if(I>1.0e-6){L=+h[k+240>>3]*+h[k+120>>3]/I}else{L=0.0}h[k+248>>3]=L;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+264>>3]=+h[k+248>>3];k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+344>>3]=+h[k+248>>3];k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+304>>3]=+h[k+248>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+352>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+272>>3]=0.0;c[a+4>>2]=0;n=0;i=e;return n|0}}while(0);f=c[a+16>>2]|0;aI(c[a+20>>2]|0,1848,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=f,t)|0)|0;c[a+4>>2]=-1;n=-1;i=e;return n|0}function bq(a,b,d,e,f,g){a=a|0;b=b|0;d=+d;e=+e;f=+f;g=+g;var j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,S=0.0,T=0.0,V=0.0,W=0,X=0.0,Y=0.0,Z=0.0,_=0,$=0.0,aa=0.0,ab=0.0,ac=0;j=i;if((a|0)==0){aT(2728,663,2744,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,663,2744,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){k=a+24|0;l=c[(c[k>>2]|0)+(b<<2)>>2]|0;if((l|0)==0){break}if(+N(+(+h[l+224>>3]-f))<1.0e-6){m=l}else{h[l+320>>3]=+h[l+128>>3]*f*f;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+224>>3]=f;m=c[(c[k>>2]|0)+(b<<2)>>2]|0}if(+N(+(+h[m+208>>3]-d))<1.0e-6){n=m}else{if(d<1.0e-6){o=0.0}else{p=+h[m+152>>3];o=p*+P(+d,+(+h[m+136>>3]))}h[m+312>>3]=o;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+208>>3]=d;n=c[(c[k>>2]|0)+(b<<2)>>2]|0}p=+h[n+320>>3];q=+h[n+312>>3];r=p+q;if(g<180.0){s=g+180.0}else{s=g+-180.0}u=+h[n+248>>3];do{if(u<1.0e-6){v=0.0;w=1.0;x=0.0;y=0.0;z=r;A=0.0;B=0}else{if(r<1.0e-6){v=0.0;w=1.0;x=0.0;y=u;z=0.0;A=0.0;B=0;break}L151:do{if(f<1.0e-6){C=e;D=r;E=(r+1.0)*u;F=d}else{do{if(d<1.0e-6){G=(r+1.0)*u;H=r;I=s}else{if(+N(+(s-e))<1.0e-6){G=(r+1.0)*u;H=r;I=s;break}if(s>e){J=360.0-s+e}else{J=e-s}K=J*.017453293;L=u*q;M=u*p+L*+Q(+K);S=L*+R(+K);K=+O(+(M*M+S*S));L=u+K;T=L/u+-1.0;l=T>1.0e-6;V=+U(+(+N(+S)/K));W=S>=0.0;do{if(M<0.0){if(W){X=3.141592653589793-V;break}else{X=V+3.141592653589793;break}}else{if(W){X=V;break}X=6.283185307179586-V}}while(0);V=s+X*57.29577951;if(V>360.0){Y=V+-360.0}else{Y=V}if(l){G=L;H=T;I=Y}else{C=Y;D=T;E=L;F=0.0;break L151}}}while(0);C=I;D=H;E=G;F=+P(+(H*+h[n+144>>3]),+(1.0/+h[n+136>>3]))}}while(0);V=+h[n+240>>3]*.9;if(F>V){if(V<1.0e-6){Z=0.0}else{M=+h[n+152>>3];Z=M*+P(+V,+(+h[n+136>>3]))}_=1;$=V;aa=Z;ab=(Z+1.0)*u}else{_=0;$=F;aa=D;ab=E}if($<=1.0e-6){v=0.0;w=1.0;x=C;y=ab;z=aa;A=$;B=_;break}V=$*.002840909+1.0;if(V<=1.00001){v=0.0;w=V;x=C;y=ab;z=aa;A=$;B=_;break}v=+O(+(V*V+-1.0))/V;w=V;x=C;y=ab;z=aa;A=$;B=_}}while(0);h[n+232>>3]=g;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+216>>3]=e;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+328>>3]=z;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+280>>3]=A;c[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+336>>2]=B;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+344>>3]=y;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+264>>3]=y;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+352>>3]=x;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+272>>3]=x;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+288>>3]=w;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+296>>3]=v;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+304>>3]=y*(1.0-v)/(v+1.0);h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+360>>3]=0.0;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+376>>3]=0.0;c[a+4>>2]=0;ac=0;i=j;return ac|0}}while(0);B=c[a+16>>2]|0;aI(c[a+20>>2]|0,1576,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=B,t)|0)|0;c[a+4>>2]=-1;ac=-1;i=j;return ac|0}function br(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,n=0;d=i;e=(a|0)==0?4488:a;a=bC(40)|0;if((a|0)==0){f=c[m>>2]|0;ap(f|0,280,(t=i,i=i+8|0,c[t>>2]=e,t)|0)|0;g=0;i=d;return g|0}c[a>>2]=19520904;f=aK(e|0)|0;c[a+16>>2]=f;if((f|0)==0){j=c[m>>2]|0;ap(j|0,2584,(t=i,i=i+8|0,c[t>>2]=e,t)|0)|0;bD(a);g=0;i=d;return g|0}j=bE(1024,1)|0;c[a+20>>2]=j;if((j|0)==0){k=c[m>>2]|0;ap(k|0,2488,(t=i,i=i+8|0,c[t>>2]=e,t)|0)|0;bD(f);bD(a);g=0;i=d;return g|0}k=a+4|0;c[k>>2]=-1;l=b+1|0;c[a+8>>2]=l;n=bE(b+2|0,4)|0;c[a+24>>2]=n;if((n|0)==0){n=c[m>>2]|0;ap(n|0,2384,(t=i,i=i+16|0,c[t>>2]=e,c[t+8>>2]=l,t)|0)|0;bD(j);bD(f);bD(a);g=0;i=d;return g|0}else{c[a+28>>2]=0;c[a+12>>2]=0;h[a+32>>3]=0.0;c[k>>2]=0;g=a;i=d;return g|0}return 0}function bs(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0;d=i;e=br(a,b>>>0<13?13:b)|0;if((e|0)==0){f=0;i=d;return f|0}else{g=0}while(1){if(g>>>0>=14){j=0;break}if((bw(e,g,c[4e3+(g<<5)>>2]|0,c[4028+(g<<5)>>2]|0,+h[4008+(g<<5)>>3],+h[4016+(g<<5)>>3],1.0,c[4024+(g<<5)>>2]|0)|0)==0){g=g+1|0}else{k=160;break}}if((k|0)==160){g=c[m>>2]|0;b=c[e+20>>2]|0;ap(g|0,1544,(t=i,i=i+8|0,c[t>>2]=b,t)|0)|0;bx(e)|0;f=0;i=d;return f|0}while(1){if(j>>>0>=39){f=e;k=166;break}if((by(e,c[3064+(j*24|0)>>2]|0,c[3068+(j*24|0)>>2]|0,+h[3072+(j*24|0)>>3],+h[3080+(j*24|0)>>3],32.0,8.0e3,.0555,.01)|0)==0){j=j+1|0}else{break}}if((k|0)==166){i=d;return f|0}ap(c[m>>2]|0,1544,(t=i,i=i+8|0,c[t>>2]=c[e+20>>2],t)|0)|0;bx(e)|0;f=0;i=d;return f|0}function bt(a,b,d,e){a=a|0;b=b|0;d=+d;e=e|0;var f=0,g=0,j=0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0,u=0,v=0,w=0,x=0.0;f=i;if((a|0)==0){aT(2728,878,2800,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,878,2800,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){g=a+24|0;j=c[(c[g>>2]|0)+(b<<2)>>2]|0;if((j|0)==0){break}k=+h[j+264>>3];if(k<1.0e-6){c[a+4>>2]=0;l=0;i=f;return l|0}do{if(+h[j+328>>3]<1.0e-6){m=179}else{n=+N(+(+h[j+272>>3]-d));if(n<1.0e-6){m=179;break}if(n>180.0){o=360.0-n}else{o=n}n=+h[j+296>>3];p=1.0-n*+Q(+(o*.017453293));if(p>1.0e-6){h[j+344>>3]=(1.0-n)*k/p;break}else{h[j+344>>3]=+h[j+248>>3];break}}}while(0);if((m|0)==179){h[j+344>>3]=k}h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+352>>3]=d;do{if((e|0)!=0){q=c[(c[g>>2]|0)+(b<<2)>>2]|0;p=+h[q+112>>3]*+h[q+344>>3]*+h[q+240>>3]/60.0;if((e&1|0)!=0){h[q+360>>3]=p}L254:do{if((e&2|0)!=0){if(p<1.0e-6){h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;break}q=c[a+12>>2]|0;do{if((q|0)!=0){r=q-1|0;s=c[a+28>>2]|0;if(+h[s+(r<<3)>>3]>p){u=r;v=0}else{break}do{r=((u-v|0)>>>1)+v|0;w=+h[s+(r<<3)>>3]>p;v=w?v:r+1|0;u=w?r:u;}while((v|0)!=(u|0));h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+368>>3]=+((v+1|0)>>>0>>>0)*+h[a+32>>3];break L254}}while(0);n=+P(+p,.46)*.45;h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+368>>3]=n}}while(0);if((e&4|0)==0){break}q=c[(c[g>>2]|0)+(b<<2)>>2]|0;if(p<1.0e-6){h[q+376>>3]=0.0;break}else{n=+h[q+208>>3]/88.0;x=+P(+p,1.166667);h[q+376>>3]=x/+O(+(p+n*n*n));break}}}while(0);c[a+4>>2]=0;l=0;i=f;return l|0}}while(0);e=c[a+16>>2]|0;aI(c[a+20>>2]|0,736,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=e,t)|0)|0;c[a+4>>2]=-1;l=-1;i=f;return l|0}function bu(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0;e=i;if((a|0)==0){aT(2728,1027,2944,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,1027,2944,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){f=a+24|0;g=c[(c[f>>2]|0)+(b<<2)>>2]|0;if((g|0)==0){break}j=+h[g+112>>3]*+h[g+344>>3]*+h[g+240>>3]/60.0;L284:do{if((d&2|0)!=0){if(j<1.0e-6){h[g+368>>3]=0.0;break}k=c[a+12>>2]|0;do{if((k|0)!=0){l=k-1|0;m=c[a+28>>2]|0;if(+h[m+(l<<3)>>3]>j){n=0;o=l}else{break}do{l=((o-n|0)>>>1)+n|0;p=+h[m+(l<<3)>>3]>j;o=p?l:o;n=p?n:l+1|0;}while((n|0)!=(o|0));h[g+368>>3]=+((o+1|0)>>>0>>>0)*+h[a+32>>3];break L284}}while(0);h[g+368>>3]=+P(+j,.46)*.45}}while(0);do{if((d&4|0)!=0){g=c[(c[f>>2]|0)+(b<<2)>>2]|0;if(j<1.0e-6){h[g+376>>3]=0.0;break}else{q=+h[g+208>>3]/88.0;r=+P(+j,1.166667);h[g+376>>3]=r/+O(+(j+q*q*q));break}}}while(0);c[a+4>>2]=0;s=0;i=e;return s|0}}while(0);d=c[a+16>>2]|0;aI(c[a+20>>2]|0,488,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=d,t)|0)|0;c[a+4>>2]=-1;s=-1;i=e;return s|0}function bv(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,j=0,k=0,l=0,m=0;e=i;if((a|0)==0){aT(2728,1163,2968,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,1163,2968,2656);return 0}f=a+28|0;g=c[f>>2]|0;if((g|0)!=0){bD(g);c[f>>2]=0;c[a+12>>2]=0;h[a+32>>3]=0.0}if((b|0)==0){c[a+4>>2]=0;j=0;i=e;return j|0}g=bE(b,8)|0;k=g;c[f>>2]=k;if((g|0)==0){g=c[a+20>>2]|0;aI(g|0,384,(t=i,i=i+16|0,c[t>>2]=b,h[t+8>>3]=d,t)|0)|0;c[a+4>>2]=-1;j=-1;i=e;return j|0}else{l=0;m=k}while(1){k=l+1|0;h[m+(l<<3)>>3]=+P(+(+(k>>>0>>>0)*d/.45),2.1739130434782608);if(k>>>0>=b>>>0){break}l=k;m=c[f>>2]|0}c[a+12>>2]=b;h[a+32>>3]=d;c[a+4>>2]=0;j=0;i=e;return j|0}function bw(a,b,d,e,f,g,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;g=+g;j=+j;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0;l=i;if((a|0)==0){aT(2728,1559,2872,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,1559,2872,2656);return 0}m=c[a+8>>2]|0;if(m>>>0<b>>>0){n=c[a+20>>2]|0;o=c[a+16>>2]|0;aI(n|0,1376,(t=i,i=i+32|0,c[t>>2]=d,c[t+8>>2]=b,c[t+16>>2]=o,c[t+24>>2]=m,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}if(f<1.0e-6){m=c[a+20>>2]|0;aI(m|0,1296,(t=i,i=i+24|0,c[t>>2]=d,c[t+8>>2]=b,h[t+16>>3]=f,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}if(g<1.0e-6){m=c[a+20>>2]|0;aI(m|0,1200,(t=i,i=i+24|0,c[t>>2]=d,c[t+8>>2]=b,h[t+16>>3]=g,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}m=a+24|0;o=c[m>>2]|0;if((c[o+(b<<2)>>2]|0)==0){q=o}else{bz(a,b)|0;q=c[m>>2]|0}o=(k|0)==0?1:k;k=bE(1,384)|0;c[q+(b<<2)>>2]=k;do{if((k|0)!=0){q=bE(o,4)|0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+16>>2]=q;if((q|0)==0){break}c[c[(c[m>>2]|0)+(b<<2)>>2]>>2]=b;h[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+32>>3]=f;h[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+40>>3]=g;h[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+48>>3]=j;q=aK(((d|0)==0?4488:d)|0)|0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+20>>2]=q;q=aK(((e|0)==0?4488:e)|0)|0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+24>>2]=q;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+4>>2]=0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+8>>2]=o;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+12>>2]=0;q=c[(c[m>>2]|0)+(b<<2)>>2]|0;if((c[q+8>>2]|0)!=0){n=0;r=q;do{c[(c[r+16>>2]|0)+(n<<2)>>2]=0;n=n+1|0;r=c[(c[m>>2]|0)+(b<<2)>>2]|0;}while(n>>>0<(c[r+8>>2]|0)>>>0)}c[a+4>>2]=0;p=0;i=l;return p|0}}while(0);bz(a,b)|0;m=c[a+16>>2]|0;aI(c[a+20>>2]|0,1096,(t=i,i=i+24|0,c[t>>2]=d,c[t+8>>2]=b,c[t+16>>2]=m,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}function bx(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,i=0,j=0,k=0;if((a|0)==0){aT(2728,1473,2920,1472);return 0}if((c[a>>2]|0)!=19520904){aT(2728,1473,2920,1472);return 0}b=a+24|0;d=c[b>>2]|0;if((d|0)!=0){e=a+8|0;f=0;g=d;while(1){if((c[g+(f<<2)>>2]|0)==0){i=g}else{bz(a,f)|0;i=c[b>>2]|0}d=f+1|0;if(d>>>0>(c[e>>2]|0)>>>0){break}else{f=d;g=i}}bD(i);c[b>>2]=0}b=a+28|0;i=c[b>>2]|0;if((i|0)!=0){bD(i);c[b>>2]=0;c[a+12>>2]=0;h[a+32>>3]=0.0}b=a+20|0;i=c[b>>2]|0;if((i|0)!=0){bD(i);c[b>>2]=0}b=c[a+16>>2]|0;if((b|0)==0){j=a;bD(j);k=a+4|0;c[k>>2]=0;return 0}bD(b);j=a;bD(j);k=a+4|0;c[k>>2]=0;return 0}function by(a,b,d,e,f,g,j,k,l){a=a|0;b=b|0;d=d|0;e=+e;f=+f;g=+g;j=+j;k=+k;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0.0,v=0.0;m=i;if((a|0)==0){aT(2728,1775,2824,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,1775,2824,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){n=a+24|0;o=(c[n>>2]|0)+(b<<2)|0;p=c[o>>2]|0;if((p|0)==0){break}if((d-1|0)>>>0>1&(d|0)!=3){q=c[a+20>>2]|0;aI(q|0,816,(t=i,i=i+8|0,c[t>>2]=b,t)|0)|0;c[a+4>>2]=-1;r=-1;i=m;return r|0}q=c[p+12>>2]|0;p=bE(1,104)|0;c[(c[(c[o>>2]|0)+16>>2]|0)+(q<<2)>>2]=p;if((p|0)==0){p=c[a+20>>2]|0;o=c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+20>>2]|0;s=c[a+16>>2]|0;aI(p|0,624,(t=i,i=i+24|0,c[t>>2]=o,c[t+8>>2]=b,c[t+16>>2]=s,t)|0)|0;c[a+4>>2]=-1;r=-1;i=m;return r|0}c[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+92>>2]=d;h[c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]>>3]=e;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+8>>3]=f;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+16>>3]=g;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+24>>3]=j;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+32>>3]=k;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+40>>3]=l;c[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+88>>2]=(d|0)!=1;if(g>1.0e-6){u=e*f/g}else{u=0.0}h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+48>>3]=u;if(f>1.0e-6){v=+X(+(-138.0/f))}else{v=0.0}h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+56>>3]=v;s=0;while(1){if(+h[3016+(s<<3)>>3]>f){s=s+1|0}else{break}}c[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+96>>2]=s;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+64>>3]=0.0;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+72>>3]=0.0;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+80>>3]=0.0;o=(c[(c[n>>2]|0)+(b<<2)>>2]|0)+12|0;c[o>>2]=(c[o>>2]|0)+1;c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+4>>2]=0;c[a+4>>2]=0;r=0;i=m;return r|0}}while(0);d=c[a+16>>2]|0;aI(c[a+20>>2]|0,936,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=d,t)|0)|0;c[a+4>>2]=-1;r=-1;i=m;return r|0}function bz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;if((a|0)==0){aT(2728,1661,2848,2656);return 0}if((c[a>>2]|0)!=19520904){aT(2728,1661,2848,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){e=a+24|0;f=c[e>>2]|0;g=c[f+(b<<2)>>2]|0;if((g|0)==0){break}h=c[g+16>>2]|0;if((h|0)==0){j=g}else{if((c[g+8>>2]|0)==0){k=h}else{g=0;l=h;h=f;while(1){f=c[l+(g<<2)>>2]|0;if((f|0)==0){m=h}else{bD(f);c[(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(g<<2)>>2]=0;m=c[e>>2]|0}f=g+1|0;n=c[m+(b<<2)>>2]|0;o=c[n+16>>2]|0;if(f>>>0<(c[n+8>>2]|0)>>>0){g=f;l=o;h=m}else{k=o;break}}}bD(k);c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+16>>2]=0;j=c[(c[e>>2]|0)+(b<<2)>>2]|0}h=c[j+20>>2]|0;if((h|0)==0){p=j}else{bD(h);c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+20>>2]=0;p=c[(c[e>>2]|0)+(b<<2)>>2]|0}h=c[p+24>>2]|0;if((h|0)==0){q=p}else{bD(h);c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+24>>2]=0;q=c[(c[e>>2]|0)+(b<<2)>>2]|0}bD(q);c[(c[e>>2]|0)+(b<<2)>>2]=0;c[a+4>>2]=0;r=0;i=d;return r|0}}while(0);q=c[a+16>>2]|0;aI(c[a+20>>2]|0,1016,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=q,t)|0)|0;c[a+4>>2]=-1;r=-1;i=d;return r|0}function bA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,P=0,Q=0,R=0,S=0,T=0,U=0,W=0,X=0,Y=0.0,Z=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0,aj=0.0,ak=0,al=0,an=0,ao=0,aq=0,as=0.0,at=0,au=0,aw=0.0,ax=0.0,ay=0,az=0,aA=0,aC=0.0,aD=0,aF=0,aG=0,aI=0,aK=0.0,aL=0,aM=0;b=i;i=i+304|0;e=b|0;f=b+128|0;g=b+256|0;j=d+4|0;k=aS(c[j>>2]|0)|0;c[1242]=k;l=aS(c[j>>2]|0)|0;c[1244]=l;n=9842.5197/+(l|0);h[556]=n;h[557]=n;n=+bG(c[d+12>>2]|0);o=+bG(c[d+16>>2]|0);p=+bG(c[d+8>>2]|0)/100.0;ar(576,(t=i,i=i+24|0,c[t>>2]=k,h[t+8>>3]=n,h[t+16>>3]=o,t)|0)|0;k=c[1242]|0;l=c[1244]|0;j=_(l,k)|0;q=bE(j,8)|0;r=q;do{if((q|0)!=0){s=bE(j,8)|0;u=s;if((s|0)==0){break}v=bE(j,8)|0;w=v;if((v|0)==0){break}v=bE(j,8)|0;x=v;if((v|0)==0){break}v=bE(j,8)|0;y=v;if((v|0)==0){break}v=bE(j,8)|0;z=v;if((v|0)==0){break}v=bE(j,8)|0;A=v;if((v|0)==0){break}v=bE(j,8)|0;B=v;if((v|0)==0){break}C=bE(j,8)|0;D=C;if((C|0)==0){break}E=bE(j,8)|0;F=E;if((E|0)==0){break}G=bE(j,8)|0;H=G;if((G|0)==0){break}I=bE(j,4)|0;J=I;if((I|0)==0){break}I=d+20|0;K=av(c[I>>2]|0,1992)|0;if((K|0)==0){L=c[I>>2]|0;ar(1712,(t=i,i=i+8|0,c[t>>2]=L,t)|0)|0;P=-1;i=b;return P|0}L=d+24|0;I=av(c[L>>2]|0,1992)|0;if((I|0)==0){Q=c[L>>2]|0;ar(1712,(t=i,i=i+8|0,c[t>>2]=Q,t)|0)|0;P=-1;i=b;return P|0}aE(K|0,0,2)|0;Q=aH(K|0)|0;aJ(K|0);L=bC(Q+1|0)|0;R=j<<3;S=bC(R)|0;T=bC(R)|0;aN(L|0,1,Q|0,K|0)|0;a[L+Q|0]=0;Q=aB(L|0,1192)|0;R=(j|0)>0;if(R){U=0;W=Q;do{h[S+(U<<3)>>3]=+bF(W,0);W=aB(0,1192)|0;U=U+1|0;}while((U|0)<(j|0))}bD(L);aE(I|0,0,2)|0;U=aH(I|0)|0;aJ(I|0);W=bC(U+1|0)|0;aN(W|0,1,U|0,I|0)|0;a[W+U|0]=0;U=aB(W|0,1192)|0;do{if(R){Q=0;X=U;do{h[T+(Q<<3)>>3]=+bF(X,0);X=aB(0,1192)|0;Q=Q+1|0;}while((Q|0)<(j|0));bD(W);if(!R){break}Y=n*196.850393701;Q=j<<3;bJ(v|0,0,Q|0);bJ(C|0,0,Q|0);bJ(E|0,0,Q|0);bJ(G|0,0,Q|0);bJ(s|0,0,Q|0);Q=0;do{h[w+(Q<<3)>>3]=+h[S+(Q<<3)>>3]/100.0;X=T+(Q<<3)|0;Z=+h[X>>3]+-90.0;if(Z<0.0){$=Z+360.0}else{$=Z}h[X>>3]=$;h[x+(Q<<3)>>3]=360.0-$;c[J+(Q<<2)>>2]=1;h[y+(Q<<3)>>3]=Y;h[z+(Q<<3)>>3]=o;h[A+(Q<<3)>>3]=p;h[r+(Q<<3)>>3]=999999999.0;Q=Q+1|0;}while((Q|0)<(j|0))}else{bD(W)}}while(0);am(K|0)|0;am(I|0)|0;W=c[1244]|0;Y=+M(+(+((W|0)/2|0|0)));h[r+(~~(Y+ +(W|0)*+M(+(+((c[1242]|0)/2|0|0))))<<3)>>3]=0.0;W=bs(560,14)|0;T=W+24|0;S=c[(c[T>>2]|0)+4>>2]|0;if((bw(W,14,480,360,.197,+h[S+40>>3],+h[S+48>>3],1)|0)!=0){bx(W)|0;P=0;i=b;return P|0}S=c[c[(c[(c[T>>2]|0)+4>>2]|0)+16>>2]>>2]|0;if((by(W,14,c[S+92>>2]|0,.23,3500.0,+h[S+16>>3],+h[S+24>>3],+h[S+32>>3],+h[S+40>>3])|0)!=0){S=c[m>>2]|0;s=c[W+20>>2]|0;ap(S|0,352,(t=i,i=i+8|0,c[t>>2]=s,t)|0)|0;bx(W)|0;P=0;i=b;return P|0}bv(W,500,.1)|0;Y=+h[556];Z=+h[557];s=0;do{aa=+(c[144+(s<<2)>>2]|0);ab=aa*Y;ac=+(c[80+(s<<2)>>2]|0);ad=ac*Z;h[e+(s<<3)>>3]=+O(+(Y*aa*ab+Z*ac*ad));do{if((s|0)<8){h[f+(s<<3)>>3]=+(s|0)*45.0}else{ac=+V(+(ab/ad));aa=ac;S=f+(s<<3)|0;h[S>>3]=aa;do{if((43534>>>(s>>>0)&1|0)==0){ae=aa}else{if((3971>>>(s>>>0)&1|0)==0){af=aa}else{ag=+N(+ac)*57.29577951;h[S>>3]=ag;af=ag}if((61496>>>(s>>>0)&1|0)==0){ae=af;break}ag=180.0-af*57.29577951;h[S>>3]=ag;ae=ag}}while(0);if((21984>>>(s>>>0)&1|0)==0){break}if((61496>>>(s>>>0)&1|0)==0){ah=ae}else{ac=+N(+ae)*57.29577951+180.0;h[S>>3]=ac;ah=ac}if((3971>>>(s>>>0)&1|0)==0){break}h[S>>3]=360.0- +N(+ah)*57.29577951}}while(0);s=s+1|0;}while((s|0)<16);L509:do{if(R){s=0;Z=999999999.0;do{Y=+h[r+(s<<3)>>3];Z=Y<Z?Y:Z;s=s+1|0;}while((s|0)<(j|0));if(Z>=999999999.0){ai=0;aj=0.0;break}s=g|0;I=g+8|0;K=g+16|0;G=g+24|0;E=g+32|0;C=g+40|0;v=0;Y=Z;U=c[1242]|0;while(1){L=v+1|0;if((U|0)<=0){ai=L;aj=Y;break L509}Q=0;X=0;ad=999999999.0;ak=c[1244]|0;al=U;while(1){if((ak|0)>0){an=Q;ao=0;ab=ad;aq=ak;while(1){ac=+h[r+(an<<3)>>3];do{if(ac>Y){if(ac>=ab){as=ab;at=aq;break}as=ac;at=aq}else{au=c[J+(an<<2)>>2]|0;h[s>>3]=+h[A+(an<<3)>>3];h[I>>3]=+h[B+(an<<3)>>3];aa=+h[D+(an<<3)>>3];h[K>>3]=aa;h[G>>3]=aa;h[E>>3]=+h[F+(an<<3)>>3];h[C>>3]=+h[H+(an<<3)>>3];bp(W,au,s)|0;aa=+h[y+(an<<3)>>3];ag=+h[z+(an<<3)>>3];aw=+h[w+(an<<3)>>3];ax=+h[x+(an<<3)>>3];bq(W,au,aa,ag,aw,ax)|0;ay=0;ax=ab;while(1){az=(c[80+(ay<<2)>>2]|0)+X|0;aA=(c[144+(ay<<2)>>2]|0)+ao|0;do{if((az|0)>=(c[1242]|0)|(az|0)<0|(aA|0)<0){aC=ax}else{aD=c[1244]|0;if((aA|0)>=(aD|0)){aC=ax;break}aF=(_(aD,az)|0)+aA|0;aD=r+(aF<<3)|0;aw=+h[aD>>3];if(aw<=Y){aC=ax;break}ag=+h[f+(ay<<3)>>3];bt(W,au,ag,0)|0;ag=+h[(c[(c[T>>2]|0)+(au<<2)>>2]|0)+344>>3];if(ag<=1.0e-6){aC=ax;break}aa=Y+ +h[e+(ay<<3)>>3]/ag;if(aa<aw){h[aD>>3]=aa;bu(W,au,2)|0;h[u+(aF<<3)>>3]=+h[(c[(c[T>>2]|0)+(au<<2)>>2]|0)+368>>3]}if(aa>=ax){aC=ax;break}aC=aa}}while(0);aA=ay+1|0;if((aA|0)<16){ay=aA;ax=aC}else{break}}as=aC;at=c[1244]|0}}while(0);ay=ao+1|0;aG=an+1|0;if((ay|0)<(at|0)){an=aG;ao=ay;ab=as;aq=at}else{break}}aI=aG;aK=as;aL=at;aM=c[1242]|0}else{aI=Q;aK=ad;aL=ak;aM=al}aq=X+1|0;if((aq|0)<(aM|0)){Q=aI;X=aq;ad=aK;ak=aL;al=aM}else{break}}if(aK<999999999.0){v=L;Y=aK;U=aM}else{ai=L;aj=Y;break}}}else{ai=0;aj=0.0}}while(0);ar(208,(t=i,i=i+24|0,c[t>>2]=ai,h[t+8>>3]=aj,h[t+16>>3]=aj/60.0,t)|0)|0;bB(x,2568);bB(w,2472);bB(r,2376);bB(u,2352);P=0;i=b;return P|0}}while(0);ap(c[m>>2]|0,2256,(t=i,i=i+16|0,c[t>>2]=l,c[t+8>>2]=k,t)|0)|0;P=1;i=b;return P|0}function bB(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0.0,k=0;d=i;e=av(b|0,2320)|0;if((e|0)==0){ar(1712,(t=i,i=i+8|0,c[t>>2]=b,t)|0)|0;i=d;return}if((c[1242]|0)>0){b=0;do{f=c[1244]|0;if((f|0)>0){g=_(f,b)|0;f=0;while(1){j=+h[a+(g<<3)>>3];ap(e|0,2240,(t=i,i=i+8|0,h[t>>3]=j==999999999.0?0.0:j,t)|0)|0;k=f+1|0;if((k|0)<(c[1244]|0)){g=g+1|0;f=k}else{break}}}aP(10,e|0)|0;b=b+1|0;}while((b|0)<(c[1242]|0))}am(e|0)|0;i=d;return}function bC(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[1124]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=4536+(h<<2)|0;j=4536+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[1124]=e&~(1<<g)}else{if(l>>>0<(c[1128]|0)>>>0){ao();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{ao();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[1126]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=4536+(p<<2)|0;m=4536+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[1124]=e&~(1<<r)}else{if(l>>>0<(c[1128]|0)>>>0){ao();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{ao();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[1126]|0;if((l|0)!=0){q=c[1129]|0;d=l>>>3;l=d<<1;f=4536+(l<<2)|0;k=c[1124]|0;h=1<<d;do{if((k&h|0)==0){c[1124]=k|h;s=f;t=4536+(l+2<<2)|0}else{d=4536+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[1128]|0)>>>0){s=g;t=d;break}ao();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[1126]=m;c[1129]=e;n=i;return n|0}l=c[1125]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[4800+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[1128]|0;if(r>>>0<i>>>0){ao();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){ao();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){ao();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){ao();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){ao();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{ao();return 0}}}while(0);L640:do{if((e|0)!=0){f=d+28|0;i=4800+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[1125]=c[1125]&~(1<<c[f>>2]);break L640}else{if(e>>>0<(c[1128]|0)>>>0){ao();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L640}}}while(0);if(v>>>0<(c[1128]|0)>>>0){ao();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[1126]|0;if((f|0)!=0){e=c[1129]|0;i=f>>>3;f=i<<1;q=4536+(f<<2)|0;k=c[1124]|0;g=1<<i;do{if((k&g|0)==0){c[1124]=k|g;y=q;z=4536+(f+2<<2)|0}else{i=4536+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[1128]|0)>>>0){y=l;z=i;break}ao();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[1126]=p;c[1129]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[1125]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[4800+(A<<2)>>2]|0;L688:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L688}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[4800+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[1126]|0)-g|0)>>>0){o=g;break}q=K;m=c[1128]|0;if(q>>>0<m>>>0){ao();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){ao();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){ao();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){ao();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){ao();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{ao();return 0}}}while(0);L738:do{if((e|0)!=0){i=K+28|0;m=4800+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[1125]=c[1125]&~(1<<c[i>>2]);break L738}else{if(e>>>0<(c[1128]|0)>>>0){ao();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L738}}}while(0);if(L>>>0<(c[1128]|0)>>>0){ao();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=4536+(e<<2)|0;r=c[1124]|0;j=1<<i;do{if((r&j|0)==0){c[1124]=r|j;O=m;P=4536+(e+2<<2)|0}else{i=4536+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[1128]|0)>>>0){O=d;P=i;break}ao();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=4800+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[1125]|0;l=1<<Q;if((m&l|0)==0){c[1125]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=579;break}else{l=l<<1;m=j}}if((T|0)==579){if(S>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[1128]|0;if(m>>>0<i>>>0){ao();return 0}if(j>>>0<i>>>0){ao();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[1126]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[1129]|0;if(S>>>0>15){R=J;c[1129]=R+o;c[1126]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[1126]=0;c[1129]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[1127]|0;if(o>>>0<J>>>0){S=J-o|0;c[1127]=S;J=c[1130]|0;K=J;c[1130]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[1116]|0)==0){J=aM(8)|0;if((J-1&J|0)==0){c[1118]=J;c[1117]=J;c[1119]=-1;c[1120]=2097152;c[1121]=0;c[1235]=0;c[1116]=(a2(0)|0)&-16^1431655768;break}else{ao();return 0}}}while(0);J=o+48|0;S=c[1118]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[1234]|0;do{if((O|0)!=0){P=c[1232]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L830:do{if((c[1235]&4|0)==0){O=c[1130]|0;L832:do{if((O|0)==0){T=609}else{L=O;P=4944;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=609;break L832}else{P=M}}if((P|0)==0){T=609;break}L=R-(c[1127]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=a0(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=618}}while(0);do{if((T|0)==609){O=a0(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[1117]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[1232]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[1234]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=a0($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=618}}while(0);L852:do{if((T|0)==618){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=629;break L830}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[1118]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((a0(O|0)|0)==-1){a0(m|0)|0;W=Y;break L852}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=629;break L830}}}while(0);c[1235]=c[1235]|4;ad=W;T=626}else{ad=0;T=626}}while(0);do{if((T|0)==626){if(S>>>0>=2147483647){break}W=a0(S|0)|0;Z=a0(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=629}}}while(0);do{if((T|0)==629){ad=(c[1232]|0)+aa|0;c[1232]=ad;if(ad>>>0>(c[1233]|0)>>>0){c[1233]=ad}ad=c[1130]|0;L872:do{if((ad|0)==0){S=c[1128]|0;if((S|0)==0|ab>>>0<S>>>0){c[1128]=ab}c[1236]=ab;c[1237]=aa;c[1239]=0;c[1133]=c[1116];c[1132]=-1;S=0;do{Y=S<<1;ac=4536+(Y<<2)|0;c[4536+(Y+3<<2)>>2]=ac;c[4536+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[1130]=ab+ae;c[1127]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[1131]=c[1120]}else{S=4944;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=641;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==641){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[1130]|0;Y=(c[1127]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[1130]=Z+ai;c[1127]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[1131]=c[1120];break L872}}while(0);if(ab>>>0<(c[1128]|0)>>>0){c[1128]=ab}S=ab+aa|0;Y=4944;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=651;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==651){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[1130]|0)){J=(c[1127]|0)+K|0;c[1127]=J;c[1130]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[1129]|0)){J=(c[1126]|0)+K|0;c[1126]=J;c[1129]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L917:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=4536+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[1128]|0)>>>0){ao();return 0}if((c[U+12>>2]|0)==(Z|0)){break}ao();return 0}}while(0);if((Q|0)==(U|0)){c[1124]=c[1124]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[1128]|0)>>>0){ao();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}ao();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ap=O;aq=e}}else{ap=L;aq=g}while(1){g=ap+20|0;L=c[g>>2]|0;if((L|0)!=0){ap=L;aq=g;continue}g=ap+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ap=L;aq=g}}if(aq>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[aq>>2]=0;an=ap;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[1128]|0)>>>0){ao();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){ao();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{ao();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=4800+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[1125]=c[1125]&~(1<<c[P>>2]);break L917}else{if(m>>>0<(c[1128]|0)>>>0){ao();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L917}}}while(0);if(an>>>0<(c[1128]|0)>>>0){ao();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);ar=ab+(($|al)+aa)|0;as=$+K|0}else{ar=Z;as=K}J=ar+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=as|1;c[ab+(as+W)>>2]=as;J=as>>>3;if(as>>>0<256){V=J<<1;X=4536+(V<<2)|0;P=c[1124]|0;m=1<<J;do{if((P&m|0)==0){c[1124]=P|m;at=X;au=4536+(V+2<<2)|0}else{J=4536+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[1128]|0)>>>0){at=U;au=J;break}ao();return 0}}while(0);c[au>>2]=_;c[at+12>>2]=_;c[ab+(W+8)>>2]=at;c[ab+(W+12)>>2]=X;break}V=ac;m=as>>>8;do{if((m|0)==0){av=0}else{if(as>>>0>16777215){av=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;av=as>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=4800+(av<<2)|0;c[ab+(W+28)>>2]=av;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[1125]|0;Q=1<<av;if((X&Q|0)==0){c[1125]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((av|0)==31){aw=0}else{aw=25-(av>>>1)|0}Q=as<<aw;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(as|0)){break}ax=X+16+(Q>>>31<<2)|0;m=c[ax>>2]|0;if((m|0)==0){T=724;break}else{Q=Q<<1;X=m}}if((T|0)==724){if(ax>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[ax>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[1128]|0;if(X>>>0<$>>>0){ao();return 0}if(m>>>0<$>>>0){ao();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=4944;while(1){ay=c[W>>2]|0;if(ay>>>0<=Y>>>0){az=c[W+4>>2]|0;aA=ay+az|0;if(aA>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ay+(az-39)|0;if((W&7|0)==0){aB=0}else{aB=-W&7}W=ay+(az-47+aB)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aC=0}else{aC=-_&7}_=aa-40-aC|0;c[1130]=ab+aC;c[1127]=_;c[ab+(aC+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[1131]=c[1120];c[ac+4>>2]=27;c[W>>2]=c[1236];c[W+4>>2]=c[4948>>2];c[W+8>>2]=c[4952>>2];c[W+12>>2]=c[4956>>2];c[1236]=ab;c[1237]=aa;c[1239]=0;c[1238]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<aA>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<aA>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=4536+(K<<2)|0;S=c[1124]|0;m=1<<W;do{if((S&m|0)==0){c[1124]=S|m;aD=Z;aE=4536+(K+2<<2)|0}else{W=4536+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[1128]|0)>>>0){aD=Q;aE=W;break}ao();return 0}}while(0);c[aE>>2]=ad;c[aD+12>>2]=ad;c[ad+8>>2]=aD;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aF=0}else{if(_>>>0>16777215){aF=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aF=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=4800+(aF<<2)|0;c[ad+28>>2]=aF;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[1125]|0;Q=1<<aF;if((Z&Q|0)==0){c[1125]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aF|0)==31){aG=0}else{aG=25-(aF>>>1)|0}Q=_<<aG;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aH=Z+16+(Q>>>31<<2)|0;m=c[aH>>2]|0;if((m|0)==0){T=759;break}else{Q=Q<<1;Z=m}}if((T|0)==759){if(aH>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[aH>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[1128]|0;if(Z>>>0<m>>>0){ao();return 0}if(_>>>0<m>>>0){ao();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[1127]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[1127]=_;ad=c[1130]|0;Q=ad;c[1130]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(a_()|0)>>2]=12;n=0;return n|0}function bD(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[1128]|0;if(b>>>0<e>>>0){ao()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){ao()}h=f&-8;i=a+(h-8)|0;j=i;L1089:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){ao()}if((n|0)==(c[1129]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[1126]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=4536+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){ao()}if((c[k+12>>2]|0)==(n|0)){break}ao()}}while(0);if((s|0)==(k|0)){c[1124]=c[1124]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){ao()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}ao()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){ao()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){ao()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){ao()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{ao()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=4800+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[1125]=c[1125]&~(1<<c[v>>2]);q=n;r=o;break L1089}else{if(p>>>0<(c[1128]|0)>>>0){ao()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1089}}}while(0);if(A>>>0<(c[1128]|0)>>>0){ao()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[1128]|0)>>>0){ao()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[1128]|0)>>>0){ao()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){ao()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){ao()}do{if((e&2|0)==0){if((j|0)==(c[1130]|0)){B=(c[1127]|0)+r|0;c[1127]=B;c[1130]=q;c[q+4>>2]=B|1;if((q|0)==(c[1129]|0)){c[1129]=0;c[1126]=0}if(B>>>0<=(c[1131]|0)>>>0){return}bH(0)|0;return}if((j|0)==(c[1129]|0)){B=(c[1126]|0)+r|0;c[1126]=B;c[1129]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1195:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=4536+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[1128]|0)>>>0){ao()}if((c[u+12>>2]|0)==(j|0)){break}ao()}}while(0);if((g|0)==(u|0)){c[1124]=c[1124]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[1128]|0)>>>0){ao()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}ao()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[1128]|0)>>>0){ao()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[1128]|0)>>>0){ao()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){ao()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{ao()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=4800+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[1125]=c[1125]&~(1<<c[t>>2]);break L1195}else{if(f>>>0<(c[1128]|0)>>>0){ao()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1195}}}while(0);if(E>>>0<(c[1128]|0)>>>0){ao()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[1128]|0)>>>0){ao()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[1128]|0)>>>0){ao()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[1129]|0)){H=B;break}c[1126]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=4536+(d<<2)|0;A=c[1124]|0;E=1<<r;do{if((A&E|0)==0){c[1124]=A|E;I=e;J=4536+(d+2<<2)|0}else{r=4536+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[1128]|0)>>>0){I=h;J=r;break}ao()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=4800+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[1125]|0;d=1<<K;do{if((r&d|0)==0){c[1125]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=938;break}else{A=A<<1;J=E}}if((N|0)==938){if(M>>>0<(c[1128]|0)>>>0){ao()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[1128]|0;if(J>>>0<E>>>0){ao()}if(B>>>0<E>>>0){ao()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[1132]|0)-1|0;c[1132]=q;if((q|0)==0){O=4952}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[1132]=-1;return}function bE(a,b){a=a|0;b=b|0;var d=0,e=0;do{if((a|0)==0){d=0}else{e=_(b,a)|0;if((b|a)>>>0<=65535){d=e;break}d=((e>>>0)/(a>>>0)|0|0)==(b|0)?e:-1}}while(0);b=bC(d)|0;if((b|0)==0){return b|0}if((c[b-4>>2]&3|0)==0){return b|0}bJ(b|0,0,d|0);return b|0}function bF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((a$(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==45){i=f;j=1}else if((g<<24>>24|0)==43){i=f;j=0}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10|0)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=1004}else{if((e|0)>0){v=0.0;w=e;x=l;y=1004}else{z=0.0;A=0.0}}if((y|0)==1004){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10|0)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(I*10|0)-48+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(a_()|0)>>2]=34;N=1.0;O=8;P=511;y=1021}else{if((m|0)==0){Q=1.0}else{N=1.0;O=8;P=m;y=1021}}if((y|0)==1021){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=1021}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function bG(a){a=a|0;return+(+bF(a,0))}function bH(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[1116]|0)==0){b=aM(8)|0;if((b-1&b|0)==0){c[1118]=b;c[1117]=b;c[1119]=-1;c[1120]=2097152;c[1121]=0;c[1235]=0;c[1116]=(a2(0)|0)&-16^1431655768;break}else{ao();return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[1130]|0;if((b|0)==0){d=0;return d|0}e=c[1127]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[1118]|0;g=_((((-40-a-1+e+f|0)>>>0)/(f>>>0)|0)-1|0,f)|0;h=b;i=4944;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=a0(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=a0(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=a0(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[1232]=(c[1232]|0)-j;h=c[1130]|0;m=(c[1127]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[1130]=j+o;c[1127]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[1131]=c[1120];d=(i|0)!=(l|0)|0;return d|0}}while(0);if((c[1127]|0)>>>0<=(c[1131]|0)>>>0){d=0;return d|0}c[1131]=-1;d=0;return d|0}function bI(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function bJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function bK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function bL(a,b){a=a|0;b=b|0;return a3[a&1](b|0)|0}function bM(a){a=a|0;a4[a&1]()}function bN(a,b,c){a=a|0;b=b|0;c=c|0;return a5[a&1](b|0,c|0)|0}function bO(a,b){a=a|0;b=b|0;a6[a&1](b|0)}function bP(a){a=a|0;$(0);return 0}function bQ(){$(1)}function bR(a,b){a=a|0;b=b|0;$(2);return 0}function bS(a){a=a|0;$(3)}
// EMSCRIPTEN_END_FUNCS
var a3=[bP,bP];var a4=[bQ,bQ];var a5=[bR,bR];var a6=[bS,bS];return{_strlen:bI,_free:bD,_main:bA,_memset:bJ,_malloc:bC,_memcpy:bK,_calloc:bE,runPostSets:bn,stackAlloc:a7,stackSave:a8,stackRestore:a9,setThrew:ba,setTempRet0:bd,setTempRet1:be,setTempRet2:bf,setTempRet3:bg,setTempRet4:bh,setTempRet5:bi,setTempRet6:bj,setTempRet7:bk,setTempRet8:bl,setTempRet9:bm,dynCall_ii:bL,dynCall_v:bM,dynCall_iii:bN,dynCall_vi:bO}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_vi": invoke_vi, "_open": _open, "_fabsf": _fabsf, "_snprintf": _snprintf, "_lseek": _lseek, "_fclose": _fclose, "_strtok_r": _strtok_r, "_abort": _abort, "_fprintf": _fprintf, "_sqrt": _sqrt, "_printf": _printf, "_close": _close, "_pread": _pread, "_fflush": _fflush, "_fopen": _fopen, "__reallyNegative": __reallyNegative, "_strtol": _strtol, "_asin": _asin, "_atanf": _atanf, "_fabs": _fabs, "_strtok": _strtok, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_fseek": _fseek, "_send": _send, "_write": _write, "_ftell": _ftell, "_sprintf": _sprintf, "_rewind": _rewind, "_strdup": _strdup, "_sin": _sin, "_sysconf": _sysconf, "_fread": _fread, "__parseInt": __parseInt, "_fputc": _fputc, "_read": _read, "__formatString": __formatString, "_atoi": _atoi, "___assert_func": ___assert_func, "_cos": _cos, "_pwrite": _pwrite, "_recv": _recv, "_llvm_pow_f64": _llvm_pow_f64, "_fsync": _fsync, "_floor": _floor, "___errno_location": ___errno_location, "_isspace": _isspace, "_sbrk": _sbrk, "_exp": _exp, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
var initialStackTop;
var inMain;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  inMain = true;
  var ret;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e && typeof e == 'object' && e.type == 'ExitStatus') {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      Module.print('Exit Status: ' + e.value);
      return e.value;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    inMain = false;
  }
  // if we're not running an evented main loop, it's time to exit
  if (!Module['noExitRuntime']) {
    exit(ret);
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  STACKTOP = initialStackTop;
  // TODO call externally added 'exit' callbacks with the status code.
  // It'd be nice to provide the same interface for all Module events (e.g.
  // prerun, premain, postmain). Perhaps an EventEmitter so we can do:
  // Module.on('exit', function (status) {});
  // exit the runtime
  exitRuntime();
  if (inMain) {
    // if we're still inside the callMain's try/catch, we need to throw an
    // exception in order to immediately terminate execution.
    throw { type: 'ExitStatus', value: status };
  }
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
  }
  ABORT = true;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = false;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}


//ARGUMENTS
Module['arguments'] = [];

if((data.input) && (data.input.argv)){	
	var argv = data.input.argv;
	argv.forEach(function(arg){
		Module['arguments'][arg.pos] = arg.arg;
	});
}


	Module['arguments'][0] = '100'; 
	Module['arguments'][4] = 'malcataSlope_100.grass'; 
	Module['arguments'][5] = 'malcataAspect_100.grass'; 
	

Module.callMain(Module['arguments']);



if((data.output) && (data.output.files)){
        var files = data.output.files;
	files.forEach(function(file) {
   
		var dirname = Module['dirname'](file.name);
	
		var basename = Module['basename'](file.name);
		var content = intArrayToString(FS.root.contents[basename].contents);
		content = ((file.compress) || (file.decompress)) ? Module['compress'](content) : content;

		Module['return']['output']['files'][dirname + basename] =  content;
    


	}); 

}



var dirname = Module['dirname']('/ign.Map');
var basename = Module['basename']('/ign.Map');

Module['return']['output']['files'][dirname + basename ] = intArrayToString(FS.root.contents[basename].contents);


return Module['return'];
}
