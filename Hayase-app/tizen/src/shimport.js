/**
 * Tizen Shimport Engine
 * 
 * Provides ES module dynamic loading over file:/// protocol for Tizen Chromium 76.
 * Based on Rich Harris's shimport with custom extensions for:
 * - import.meta.url and import.meta.resolve resolution
 * - Synchronous global eval execution (bypasses CSP & blob restrictions on Tizen)
 * - Safe URL normalization
 */

var __shimport__ = (function () {
    'use strict';

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    function get_alias(specifiers, name) {
        var i = specifiers.length;
        while (i--) {
            if (specifiers[i].name === name)
                return specifiers[i].as;
        }
    }

    function importDecl(str, start, end, specifiers, source) {
        var name = get_alias(specifiers, '*') || get_alias(specifiers, 'default');
        return {
            start: start,
            end: end,
            source: source,
            name: name,
            specifiers: specifiers,
            toString: function () {
                return "/*" + str.slice(start, end) + "*/";
            }
        };
    }

    function exportDefaultDeclaration(str, start, end) {
        var match = /^\s*(?:(class)(\s+extends|\s*{)|(function)\s*\()/.exec(str.slice(end));
        if (match) {
            end += match[0].length;
            var name_1 = '__default_export';
            return {
                start: start,
                end: end,
                name: name_1,
                as: 'default',
                toString: function () {
                    return match[1]
                        ? "class " + name_1 + match[2]
                        : "function " + name_1 + "(";
                }
            };
        }
        return {
            start: start,
            end: end,
            toString: function () {
                return "__exports.default =";
            }
        };
    }

    function exportSpecifiersDeclaration(str, start, specifiersStart, specifiersEnd, end, source) {
        var specifiers = processSpecifiers(str.slice(specifiersStart + 1, specifiersEnd - 1).trim());
        return {
            start: start,
            end: end,
            source: source,
            toString: function (nameBySource) {
                var name = source && nameBySource.get(source);
                return specifiers
                    .map(function (s) {
                    return "__exports." + s.as + " = " + (name ? name + "." + s.name : s.name) + "; ";
                })
                    .join('') + ("/*" + str.slice(start, end) + "*/");
            }
        };
    }

    function exportDecl(str, start, c) {
        var end = c;
        while (str[c] && /\S/.test(str[c]))
            c += 1;
        while (str[c] && !/\S/.test(str[c]))
            c += 1;
        var nameStart = c;
        while (str[c] && !punctuatorChars.test(str[c]) && !isWhitespace(str[c]))
            c += 1;
        var nameEnd = c;
        var name = str.slice(nameStart, nameEnd);
        return {
            start: start,
            end: end,
            name: name,
            toString: function () {
                return '';
            }
        };
    }

    function exportStarDeclaration(str, start, end, source) {
        return {
            start: start,
            end: end,
            source: source,
            toString: function (nameBySource) {
                return "Object.assign(__exports, " + nameBySource.get(source) + "); /*" + str.slice(start, end) + "*/";
            }
        };
    }

    var keywords = /\b(case|default|delete|do|else|in|instanceof|new|return|throw|typeof|void)\s*$/;
    var punctuators = /(^|\{|\(|\[\.|;|,|<|>|<=|>=|==|!=|===|!==|\+|-|\*\%|<<|>>|>>>|&|\||\^|!|~|&&|\|\||\?|:|=|\+=|-=|\*=|%=|<<=|>>=|>>>=|&=|\|=|\^=|\/=|\/)\s*$/;
    var ambiguous = /(\}|\)|\+\+|--)\s*$/;
    var punctuatorChars = /[{}()[.;,<>=+\-*%&|\^!~?:/]/;
    var keywordChars = /[a-zA-Z_$0-9]/;
    var whitespace_obj = { ' ': 1, '\t': 1, '\n': 1, '\r': 1, '\f': 1, '\v': 1, '\u00A0': 1, '\u2028': 1, '\u2029': 1 };

    function isWhitespace(char) {
        return char in whitespace_obj;
    }

    function isQuote(char) {
        return char === "'" || char === '"';
    }

    var namespaceImport = /^\*\s+as\s+(\w+)$/;
    var defaultAndStarImport = /(\w+)\s*,\s*\*\s*as\s*(\w+)$/;
    var defaultAndNamedImport = /(\w+)\s*,\s*{(.+)}$/;

    function processImportSpecifiers(str) {
        var match = namespaceImport.exec(str);
        if (match) {
            return [{ name: '*', as: match[1] }];
        }
        match = defaultAndStarImport.exec(str);
        if (match) {
            return [{ name: 'default', as: match[1] }, { name: '*', as: match[2] }];
        }
        match = defaultAndNamedImport.exec(str);
        if (match) {
            return [{ name: 'default', as: match[1] }].concat(processSpecifiers(match[2].trim()));
        }
        if (str[0] === '{')
            return processSpecifiers(str.slice(1, -1).trim());
        if (str)
            return [{ name: 'default', as: str }];
        return [];
    }

    function processSpecifiers(str) {
        return str
            ? str.split(',').map(function (part) {
                var _a = part.trim().split(/[^\S]+/), name = _a[0], as = _a[2];
                return { name: name, as: as || name };
            })
            : [];
    }

    function getImportDeclaration(str, i) {
        var start = i;
        var specifierStart = i += 6;
        while (str[i] && isWhitespace(str[i]))
            i += 1;
        while (str[i] && !isQuote(str[i]))
            i += 1;
        var specifierEnd = i;
        var sourceStart = i += 1;
        while (str[i] && !isQuote(str[i]))
            i += 1;
        var sourceEnd = i++;
        return importDecl(str, start, i, processImportSpecifiers(str.slice(specifierStart, specifierEnd).replace(/from\s*$/, '').trim()), str.slice(sourceStart, sourceEnd));
    }

    function getImportStatement(i) {
        return {
            start: i,
            end: i + 6,
            toString: function () {
                return '__import';
            }
        };
    }

    var importMetaPattern = /^import\s*\.\s*meta(?:\.([a-zA-Z0-9_$]+))?/;
    function getImportMetaUrl(str, start, id) {
        var match = importMetaPattern.exec(str.slice(start));
        if (match) {
            var prop = match[1];
            return {
                start: start,
                end: start + match[0].length,
                toString: function () {
                    if (prop === 'url') {
                        return JSON.stringify('' + id);
                    } else if (prop === 'resolve') {
                        return '(function(e){ return new URL(e, ' + JSON.stringify('' + id) + ').href; })';
                    } else {
                        return '({ url: ' + JSON.stringify('' + id) + ' })';
                    }
                }
            };
        }
    }

    function getExportDeclaration(str, i) {
        var start = i;
        i += 6;
        while (str[i] && isWhitespace(str[i]))
            i += 1;
        var declarationStart = i;
        if (str[i] === '{') {
            while (str[i] !== '}')
                i += 1;
            i += 1;
            var specifiersEnd = i;
            var source = null;
            while (isWhitespace(str[i]))
                i += 1;
            if (/^from[\s\n'"]/.test(str.slice(i, i + 5))) {
                i += 4;
                while (isWhitespace(str[i]))
                    i += 1;
                while (!isQuote(str[i]))
                    i += 1;
                var sourceStart = i += 1;
                while (!isQuote(str[i]))
                    i += 1;
                source = str.slice(sourceStart, i);
                i += 1;
            }
            return exportSpecifiersDeclaration(str, start, declarationStart, specifiersEnd, i, source);
        }
        if (str[i] === '*') {
            i += 1;
            while (isWhitespace(str[i]))
                i += 1;
            i += 4;
            while (isWhitespace(str[i]))
                i += 1;
            while (!isQuote(str[i]))
                i += 1;
            var sourceStart = i += 1;
            while (!isQuote(str[i]))
                i += 1;
            var sourceEnd = i++;
            return exportStarDeclaration(str, start, i, str.slice(sourceStart, sourceEnd));
        }
        if (/^default\b/.test(str.slice(i, i + 8))) {
            return exportDefaultDeclaration(str, start, declarationStart + 7);
        }
        return exportDecl(str, start, declarationStart);
    }

    function find(source, id) {
        var prevWord = null;
        var canBeRegexp = true;
        var isPlusPlus = false;
        var stack = [];
        var importDeclarations = [];
        var importStatements = [];
        var importMetaUrls = [];
        var exportDeclarations = [];
        var blockDepth = 0;
        var blockStart = -1;
        var parenDepth = 0;
        var openParens = {};
        var openBlocks = {};

        function isBlock() {
            if (source[blockStart] === ')') {
                var parenStart = openParens[blockStart];
                var i = parenStart;
                while (isWhitespace(source[i - 1]))
                    i -= 1;
                var segment = source.slice(i - 5, i);
                return !/(if|while)$/.test(segment);
            }
            return true;
        }

        var base = {
            pattern: /(?:(\()|(\))|({)|(})|(")|(')|(\/\/)|(\/\*)|(\/)|(`)|(import)|(export)|(\+\+|--))/g,
            handlers: [
                function (i) {
                    blockStart = i;
                    openParens[parenDepth++] = i;
                },
                function (i) {
                    blockStart = i;
                    openParens[i] = openParens[--parenDepth];
                },
                function (i) {
                    blockStart = i;
                    stack.push(base);
                },
                function (i) {
                    blockStart = i;
                    return stack.pop();
                },
                function (i) {
                    return stack.push(base), d_quote;
                },
                function (i) {
                    return stack.push(base), s_quote;
                },
                function (i) {
                    return line_comment;
                },
                function (i) {
                    return block_comment;
                },
                function (i) {
                    var c = i;
                    while (c > 0 && isWhitespace(source[c - 1]))
                        c -= 1;
                    if (c > 0) {
                        var start = c;
                        if (punctuatorChars.test(source[start - 1])) {
                            while (start > 0 && punctuatorChars.test(source[start - 1]))
                                start -= 1;
                        }
                        else {
                            while (start > 0 && keywordChars.test(source[start - 1]))
                                start -= 1;
                        }
                        var word = source.slice(start, c);
                        canBeRegexp = Boolean(word && (keywords.test(word) || punctuators.test(word) || (ambiguous.test(word) && !isBlock())));
                    }
                    else {
                        canBeRegexp = true;
                    }
                    return slash;
                },
                function (i) {
                    return template_string;
                },
                function (i) {
                    if (i === 0 || isWhitespace(source[i - 1]) || punctuatorChars.test(source[i - 1])) {
                        var c = i + 6;
                        var char = void 0;
                        do {
                            char = source[c++];
                        } while (isWhitespace(char));
                        var isDeclaration = c > i + 7;
                        if (/^['"{*]$/.test(char) || (isDeclaration && /^[a-zA-Z_$]$/.test(char))) {
                            var d = getImportDeclaration(source, i);
                            importDeclarations.push(d);
                            end = d.end;
                        }
                        else if (char === '(') {
                            var s = getImportStatement(i);
                            importStatements.push(s);
                            end = s.end;
                        }
                        else if (char === '.') {
                            var u = getImportMetaUrl(source, i, id);
                            if (u) {
                                importMetaUrls.push(u);
                                end = u.end;
                            }
                        }
                    }
                },
                function (i) {
                    if (i === 0 || isWhitespace(source[i - 1]) || punctuatorChars.test(source[i - 1])) {
                        if (/export[\s\n{]/.test(source.slice(i, i + 7))) {
                            var d = getExportDeclaration(source, i);
                            exportDeclarations.push(d);
                            end = d.end;
                        }
                    }
                },
                function (i) {
                    isPlusPlus = !isPlusPlus && source[i - 1] === '+';
                }
            ]
        };

        var slash = {
            pattern: /(?:(\[)|(\\)|(.))/g,
            handlers: [
                function (i) {
                    return canBeRegexp ? regexp_class : base;
                },
                function (i) {
                    return prevWord = regexp, regexp_escaped;
                },
                function (i) {
                    return canBeRegexp && !isPlusPlus ? regexp : base;
                }
            ]
        };

        var regexp = {
            pattern: /(?:(\[)|(\\)|(\/))/g,
            handlers: [
                function (i) {
                    return regexp_class;
                },
                function (i) {
                    return prevWord = regexp, regexp_escaped;
                },
                function (i) {
                    return base;
                }
            ]
        };

        var regexp_class = {
            pattern: /(?:(\])|(\\))/g,
            handlers: [
                function (i) {
                    return regexp;
                },
                function (i) {
                    return prevWord = regexp_class, regexp_class_escaped;
                }
            ]
        };

        var d_quote = {
            pattern: /(?:(\\)|("))/g,
            handlers: [
                function (i) {
                    return prevWord = d_quote, d_quote_escaped;
                },
                function (i) {
                    return stack.pop();
                }
            ]
        };

        var s_quote = {
            pattern: /(?:(\\)|('))/g,
            handlers: [
                function (i) {
                    return prevWord = s_quote, s_quote_escaped;
                },
                function (i) {
                    return stack.pop();
                }
            ]
        };

        var slash_escaped = { pattern: /(.)/g, handlers: [function (i) { return prevWord; }] };
        var regexp_escaped = { pattern: /(.)/g, handlers: [function (i) { return prevWord; }] };
        var regexp_class_escaped = { pattern: /(.)/g, handlers: [function (i) { return prevWord; }] };
        var d_quote_escaped = { pattern: /(.)/g, handlers: [function (i) { return prevWord; }] };
        var s_quote_escaped = { pattern: /(.)/g, handlers: [function (i) { return prevWord; }] };

        var template_string = {
            pattern: /(?:(\${)|(\\)|(`))/g,
            handlers: [
                function (i) {
                    return stack.push(template_string), base;
                },
                function (i) {
                    return prevWord = template_string, template_string_escaped;
                },
                function (i) {
                    return base;
                }
            ]
        };

        var template_string_escaped = { pattern: /(.)/g, handlers: [function (i) { return prevWord; }] };
        var line_comment = { pattern: /((?:\n|$))/g, handlers: [function (i) { return base; }] };
        var block_comment = { pattern: /(\*\/)/g, handlers: [function (i) { return base; }] };

        var current = base;
        var end = 0;
        while (end < source.length) {
            current.pattern.lastIndex = end;
            var match = current.pattern.exec(source);
            if (!match) {
                if (stack.length > 0 || current !== base) {
                    throw new Error("Unexpected end of file while parsing " + id);
                }
                break;
            }
            end = match.index + match[0].length;
            for (var i = 1; i < match.length; i += 1) {
                if (match[i]) {
                    current = current.handlers[i - 1](match.index) || current;
                    break;
                }
            }
        }
        return [importDeclarations, importStatements, importMetaUrls, exportDeclarations];
    }

    function transform(source, id) {
        var _a = find(source, id),
            importDeclarations = _a[0],
            importStatements = _a[1],
            importMetaUrls = _a[2],
            exportDeclarations = _a[3];

        var nameBySource = new Map();
        importDeclarations.forEach(function (d) {
            if (nameBySource.has(d.source))
                return;
            nameBySource.set(d.source, d.name || "__dep_" + nameBySource.size);
        });
        exportDeclarations.forEach(function (d) {
            if (!d.source)
                return;
            if (nameBySource.has(d.source))
                return;
            nameBySource.set(d.source, d.name || "__dep_" + nameBySource.size);
        });

        var deps = Array.from(nameBySource.keys())
            .map(function (s) { return "'" + s + "'"; })
            .join(', ');
        var names = ['__import', '__exports'].concat(Array.from(nameBySource.values()))
            .join(', ');
        var hoisted = [];
        importDeclarations.forEach(function (decl) {
            var name = nameBySource.get(decl.source);
            decl.specifiers
                .sort(function (a, b) {
                    if (a.name === 'default') return 1;
                    if (b.name === 'default') return -1;
                })
                .forEach(function (s) {
                    if (s.name !== '*') {
                        var assignment = (s.name === 'default' && s.as === name)
                            ? s.as + " = " + name + ".default; "
                            : "var " + s.as + " = " + name + "." + s.name + "; ";
                        hoisted.push(assignment);
                    }
                });
        });

        var transformed = "__shimport__.define('" + id + "', [" + deps + "], function(" + names + "){ " + hoisted.join('');
        var ranges = __spreadArrays(importDeclarations, importStatements, importMetaUrls, exportDeclarations).sort(function (a, b) { return a.start - b.start; });
        var c = 0;
        for (var i = 0; i < ranges.length; i += 1) {
            var range = ranges[i];
            transformed += (source.slice(c, range.start) + range.toString(nameBySource));
            c = range.end;
        }
        transformed += source.slice(c);
        exportDeclarations.forEach(function (d) {
            if (d.name) {
                var prop = d.as || d.name;
                transformed += "\ntry { Object.defineProperty(__exports, '" + prop + "', { get: function() { return " + d.name + "; }, enumerable: true, configurable: true }); } catch (e) { __exports." + prop + " = " + d.name + "; }";
            }
        });
        transformed += "\n});\n//# sourceURL=" + id;
        return transformed;
    }

    var promises = {};

    function define(id, deps, factory) {
        var __import = function (dep) { return load(new URL(dep, id)); };
        return Promise.all(deps.map(__import)).then(function (__deps) {
            var __exports = {};
            factory.apply(void 0, __spreadArrays([__import, __exports], __deps));
            return __exports;
        });
    }

    function evaluate(code) {
        try {
            return Promise.resolve((0, eval)(code));
        } catch (err) {
            console.error('[Shimport] Evaluate error:', err);
            return Promise.reject(err);
        }
    }

    function load(url) {
        var u = (typeof url === 'string') ? url : (url.href || url.toString());
        return promises[u] || (promises[u] = fetch(u)
            .then(function (r) {
                if (!r.ok && r.status !== 0 && r.status !== 200) {
                    throw new Error('Failed to fetch ' + u + ' (status ' + r.status + ')');
                }
                return r.text();
            })
            .then(function (text) {
                var code = text.startsWith('__shimport__.define(') ? text : transform(text, u);
                return evaluate(code);
            })
            .catch(function (err) {
                console.error('[Shimport] Load error for ' + u + ':', err);
                throw err;
            }));
    }

    var VERSION = "2.0.5-tizen";

    var api = {
        VERSION: VERSION,
        define: define,
        load: load,
        transform: transform
    };

    if (typeof window !== 'undefined') {
        window.__shimport__ = api;
    }

    return api;
}());
