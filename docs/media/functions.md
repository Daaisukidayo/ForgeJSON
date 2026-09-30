<div align="center">

# ForgeJSON functions

Every function ForgeJSON adds or replaces. Installation is in the [README](README.md).

</div>

---

## Contents

1. [Reading this page](#reading-this-page)
2. [Basics](#basics)
3. [JSON functions](#json-functions)
4. [Object functions](#object-functions)
5. [Array functions](#array-functions)
6. [Examples](#examples)

<h3 align="center">Reading this page</h3><hr>

↺ marks a function that replaces ForgeScript's own. Old calls keep working, and **Changed** lists the differences.

`// →` shows what a line outputs: nothing, a value, `error`, or `e.g.` before a random result.

The examples are written as ForgeScript reads them, which is how you'd type them with `$eval` in Discord. See [JSON in code](#json-in-code).

<h3 align="center">Basics</h3><hr>

<h4 align="center">A variable or JSON</h4>

Functions that read data take a variable name or JSON. Anything starting with `{` or `[` is JSON, so one function's result can go straight into another:

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150}\]]
$jsonGet[$arraySortBy[users;desc;xp];0;name]    // → Bob
```

<h4 align="center">Keys</h4>

Keys go one per argument, as in `$env`. A number indexes an array, and a negative one counts from the end:

```js
$jsonLoad[data;{"users":[{"name":"Ann"},{"name":"Bob"}\]}]
$jsonGet[data;users;0;name]     // → Ann
$jsonGet[data;users;-1;name]    // → Bob
```

Writing creates the missing levels as objects. Nothing is ever written past the end of an array.

`__proto__`, `prototype` and `constructor` are refused as keys and variable names. A variable named like a built-in property, such as `toString`, reads as missing, and [`$objectMerge`](#objectmerge) and [`$objectDefaults`](#objectdefaults) skip such keys.

<h4 align="center">Values</h4>

`$jsonSet`, `$arrayPush`, `$arrayPushAt`, `$arraySplice`, `$arrayOf`, `$objectOf` and lookups like `$arrayIncludes` read values like this:

| You write | You get |
|---|---|
| `42`, `-5`, `0.1` | a number |
| `123456789012345678` | text, too long for a number |
| `007`, `1.50`, `1e3` | text, to keep them as typed |
| `true`, `false`, `null` | a boolean, or null |
| `{"a":1}`, `[1,2]` | an object or array, if valid |
| `"123"` | text, without the quotes |
| anything else | text |

[`$arrayLoad`](#arrayload) reads the same way but keeps `null` and JSON as text. [`$jsonLoad`](#jsonload), [`$arrayPushJSON`](#arraypushjson), [`$arrayUnshiftJSON`](#arrayunshiftjson) and [`$arrayFill`](#arrayfill) refuse an object or array that doesn't parse. Lookups go by type: `$arrayIncludes[list;5]` looks for the number, `$arrayIncludes[list;"5"]` for the text.

<h4 align="center">Output</h4>

Objects and arrays come out as compact JSON, and `$jsonStringify[variable;2]` indents them.

Functions that only change data output nothing, except `$jsonSet`, which answers `true`, and `$jsonDelete`, which answers whether there was anything to remove.

<h4 align="center">JSON in code</h4>

ForgeScript ends an argument at `]` or `;`, so inside JSON they need a backslash:

| Where the code is | Write |
|---|---|
| Typed into Discord, as with `$eval` | `\]` and `\;` |
| In a command file, inside ``code: `...` `` | `\\]` and `\\;` |

> ⚠️ **Warning**\
> In a command file JavaScript removes a single backslash, so the `]` still ends the argument.

The same JSON, typed into Discord:

```js
$jsonLoad[config;{"roles":["1","2"\]}]
$jsonGet[config;roles;1]    // → 2
```

And in a command file:

```js
module.exports = {
    name: "roles",
    type: "messageCreate",
    code: `
      $jsonLoad[config;{"roles":["1","2"\\]}]
      $jsonGet[config;roles;1] $c[→ 2]
    `
}
```

`$objectOf` and `$arrayOf` build the same values with nothing to escape:

```js
$jsonLoad[a;{"roles":["1","2"\]}]
$jsonLoad[b;$objectOf[roles;$arrayOf["1";"2"]]]
$jsonEquals[a;b]    // → true
```

Only [`$jsonStringify`](#jsonstringify) takes JSON written the JavaScript way, with unquoted keys and single quotes. Elsewhere it's an error, or text for `$jsonSet` and the like, so convert it first:

```js
$jsonLoad[config;$jsonStringify[{ prefix: '!', roles: ['1', '2'\] }]]
$jsonGet[config;prefix]    // → !
```

<h3 align="center">JSON functions</h3><hr>

| Function | Returns | What it does |
|---|---|---|
| **[`$jsonLoad`](#jsonload)** ↺ | — | Loads JSON to a variable. |
| **[`$jsonGet`](#jsonget)** | value | Reads a value. |
| **[`$jsonSet`](#jsonset)** ↺ | boolean | Sets a value. |
| **[`$jsonHas`](#jsonhas)** ↺ | boolean | Whether a value is there. |
| **[`$jsonDelete`](#jsondelete)** ↺ | boolean | Removes a value. |
| **[`$jsonType`](#jsontype)** | text | What kind of value it is. |
| **[`$jsonSize`](#jsonsize)** | number | How big it is. |
| **[`$jsonKeys`](#jsonkeys)** ↺ | JSON array | The keys of an object, or indices of an array. |
| **[`$jsonValues`](#jsonvalues)** ↺ | text | The values of an object, or elements of an array, joined. |
| **[`$jsonEntries`](#jsonentries)** ↺ | JSON array | Key and value pairs. |
| **[`$jsonEquals`](#jsonequals)** | boolean | Whether two values hold the same data. |
| **[`$jsonMath`](#jsonmath)** | — | Adds to, multiplies or divides a number. |
| **[`$jsonToggle`](#jsontoggle)** | — | Flips a boolean. |
| **[`$jsonStringify`](#jsonstringify)** ↺ | JSON | Writes JSON, compact or laid out, from JSON written the JavaScript way too. |

<h4 align="center">$jsonLoad</h4>

**`$jsonLoad[variable;json]`** ↺ - returns nothing

Loads JSON or a single value to a variable. Text starting with `{` or `[` must be valid JSON, and the error says when a `]` cut it short. Anything else is read as under [Values](#values).

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable to load to. |
| **`json`** | required | The JSON or value. Long integers such as IDs keep their digits. |

```js
$jsonLoad[user;{"id":123456789012345678,"name":"Ann"}]
$jsonGet[user;id]               // → 123456789012345678
$jsonLoad[copy;$env[user]]
$jsonGet[copy;name]             // → Ann
$jsonLoad[level;5]
$jsonType[level]                // → number
$jsonLoad[broken;{name:Ann}]    // → error
```

**Changed:** an object or array that doesn't parse is refused instead of being stored as text. Long integers keep their digits instead of being rounded.

<h4 align="center">$jsonGet</h4>

**`$jsonGet[source;keys...]`** - returns the value, JSON for objects and arrays

Reads a value like `$env`. Null and missing values give nothing, so `$default` covers both, and reading past them is not an error.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonLoad[user;{"name":"Ann","nick":null,"stats":{"xp":120},"tags":["a","b"\]}]
$jsonGet[user;stats;xp]              // → 120
$jsonGet[user;stats]                 // → {"xp":120}
$jsonGet[user;tags;-1]               // → b
$default[$jsonGet[user;nick];none]   // → none
$jsonGet[{"a":{"b":1}};a;b]          // → 1
```

<h4 align="center">$jsonSet</h4>

**`$jsonSet[variable;keys...;value]`** ↺ - returns `true`

Sets a value under the keys, creating missing levels.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable to set it in. |
| **`keys`** | any number | The keys to follow. |
| **`value`** | required, last | The value. |

```js
$jsonSet[stats;123456789012345678;xp;50]    // → true
$jsonGet[stats]                             // → {"123456789012345678":{"xp":50}}
$jsonSet[inventory;Sword v1.2;count;3]      // → true
$jsonGet[inventory]                         // → {"Sword v1.2":{"count":3}}
$!jsonSet[user;tags;["a","b"\]]
$jsonGet[user;tags;1]                       // → b
$!jsonSet[user;code;007]
$jsonGet[user;code]                         // → 007
```

**Changed:** missing levels are created instead of the call returning `false`. Long numbers and codes like `007` stay exact. An index past the end of an array is refused.

<h4 align="center">$jsonHas</h4>

**`$jsonHas[source;keys...]`** ↺ - returns a boolean

Whether anything is at the keys, null included.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonLoad[user;{"name":"Ann","nick":null,"stats":{"xp":1}}]
$jsonHas[user;name]        // → true
$jsonHas[user;nick]        // → true
$jsonHas[user;stats;xp]    // → true
$jsonHas[user;age]         // → false
```

**Changed:** it follows any number of keys and reads JSON. A missing variable gives `false` instead of nothing.

<h4 align="center">$jsonDelete</h4>

**`$jsonDelete[variable;keys...]`** ↺ - returns a boolean

Removes a key, an element or, with no keys, the variable.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable to remove from. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonLoad[user;{"name":"Ann","tags":["a","b","c"\]}]
$jsonDelete[user;tags;0]    // → true
$jsonGet[user;tags]         // → ["b","c"]
$jsonDelete[user;age]       // → false
$jsonDelete[user]           // → true
$jsonHas[user]              // → false
```

**Changed:** removing from an array answers `true` or `false` instead of the removed element.

<h4 align="center">$jsonType</h4>

**`$jsonType[source;keys...]`** - returns `object`, `array`, `string`, `number`, `boolean`, `null` or `undefined`

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonLoad[user;{"name":"Ann","tags":[\],"nick":null}]
$jsonType[user]          // → object
$jsonType[user;tags]     // → array
$jsonType[user;name]     // → string
$jsonType[user;nick]     // → null
$jsonType[user;age]      // → undefined
```

<h4 align="center">$jsonSize</h4>

**`$jsonSize[source;keys...]`** - returns a number

Elements of an array, keys of an object or characters of text.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonLoad[user;{"name":"Ann","tags":["a","b"\]}]
$jsonSize[user]          // → 2
$jsonSize[user;tags]     // → 2
$jsonSize[user;name]     // → 3
$jsonSize[user;age]      // → 0
```

<h4 align="center">$jsonKeys</h4>

**`$jsonKeys[source;keys...]`** ↺ - returns a JSON array

The keys of an object, or the indices of an array.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonLoad[user;{"name":"Ann","stats":{"xp":1,"level":2}}]
$jsonKeys[user]                         // → ["name","stats"]
$jsonKeys[user;stats]                   // → ["xp","level"]
$arrayJoin[$jsonKeys[user;stats];, ]    // → xp, level
```

**Changed:** it follows keys and reads JSON. The JSON is compact, and a missing variable gives `[]` instead of nothing.

<h4 align="center">$jsonValues</h4>

**`$jsonValues[source;separator?]`** ↺ - returns text

The values of an object or elements of an array, joined.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`separator`** | optional | What goes between the values, `, ` by default. |

```js
$jsonLoad[user;{"name":"Ann","xp":120,"stats":{"level":2}}]
$jsonValues[user]          // → Ann, 120, {"level":2}
$jsonValues[user; | ]      // → Ann | 120 | {"level":2}
```

**Changed:** it reads JSON as well as a variable.

<h4 align="center">$jsonEntries</h4>

**`$jsonEntries[source;keys...]`** ↺ - returns a JSON array

Key and value pairs of an object, or index and element pairs of an array. In [`$arrayFormat`](#arrayformat), `{0}` stands for the key and `{1}` for the value.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonLoad[profile;{"inventory":{"Sword":{"count":2},"Bow":{"count":1}}}]
$jsonEntries[profile;inventory]                                // → [["Sword",{"count":2}],["Bow",{"count":1}]]
$arrayFormat[$jsonEntries[profile;inventory];{0} x{1.count};;;, ]    // → Sword x2, Bow x1
```

**Changed:** it follows keys and reads JSON. The JSON is compact, and a missing variable gives `[]` instead of nothing.

<h4 align="center">$jsonEquals</h4>

**`$jsonEquals[first;second]`** - returns a boolean

Whether two values hold the same data, whatever the key order.

| Argument | Needed | What it is |
|---|---|---|
| **`first`** | required | A variable, or JSON. |
| **`second`** | required | A variable, or JSON. |

```js
$jsonLoad[a;{"x":1,"y":[1,2\]}]
$jsonEquals[a;{"y":[1,2\],"x":1}]    // → true
$jsonEquals[a;{"x":1}]               // → false
```

<h4 align="center">$jsonMath</h4>

**`$jsonMath[variable;keys...;amount]`** - returns nothing

Changes the number under the keys, starting from 0. A plain amount is added, and `*`, `/` or `%` before it multiplies, divides or takes the remainder. Numbers stored as text count, and floating-point noise like `0.30000000000000004` is rounded away.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the number. |
| **`keys`** | any number | The keys to follow. |
| **`amount`** | required, last | A number to add, or `*`, `/` or `%` and a number. |

```js
$jsonMath[stats;123456789012345678;messages;1]
$jsonMath[stats;123456789012345678;messages;1]
$jsonGet[stats;123456789012345678;messages]    // → 2
$jsonLoad[wallet;{"coins":100,"balance":0.1}]
$jsonMath[wallet;coins;-30]
$jsonMath[wallet;balance;0.2]
$jsonGet[wallet]                               // → {"coins":70,"balance":0.3}
$jsonMath[wallet;coins;*1.5]
$jsonMath[wallet;balance;/3]
$jsonGet[wallet]                               // → {"coins":105,"balance":0.1}
$jsonMath[wallet;coins;%10]
$jsonGet[wallet;coins]                         // → 5
$jsonMath[wallet;coins;/0]                     // → error
```

<h4 align="center">$jsonToggle</h4>

**`$jsonToggle[variable;keys...]`** - returns nothing

Flips the boolean under the keys, to `true` when nothing is there. `"true"` and `"false"` stored as text flip too.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the boolean. |
| **`keys`** | any number | The keys to follow. |

```js
$jsonToggle[settings;notify]
$jsonGet[settings;notify]    // → true
$jsonToggle[settings;notify]
$jsonGet[settings;notify]    // → false
```

<h4 align="center">$jsonStringify</h4>

**`$jsonStringify[source;space?]`** ↺ - returns JSON

Writes a value as JSON, compact or indented by up to 10 spaces. It also takes JSON written the JavaScript way: unquoted keys, single quotes and trailing commas. Nothing is run as code.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | A variable, or JSON. |
| **`space`** | optional | Spaces per level. |

```js
$jsonLoad[user;{"name":"Ann","tags":["a"\]}]
$jsonStringify[user]                                  // → {"name":"Ann","tags":["a"]}
$jsonStringify[{ age: 18 }]                           // → {"age":18}
$jsonStringify[{ name: 'Ann', tags: ['a', 'b',\], }]  // → {"name":"Ann","tags":["a","b"]}
$jsonLoad[copy;$jsonStringify[{ id: 123456789012345678, quote: 'say "hi"' }]]
$jsonGet[copy;id]                                     // → 123456789012345678
$jsonGet[copy;quote]                                  // → say "hi"
$jsonStringify[{ a: yes }]                            // → error
```

**Changed:** it reads JSON as well as a variable, JSON written the JavaScript way included.

<h3 align="center">Object functions</h3><hr>

| Function | Returns | What it does |
|---|---|---|
| **[`$objectOf`](#objectof)** | JSON object | Builds an object. |
| **[`$objectPick`](#objectpick)** | JSON object | Keeps only some keys. |
| **[`$objectOmit`](#objectomit)** | JSON object | Leaves some keys out. |
| **[`$objectMerge`](#objectmerge)** | — | Merges objects in. |
| **[`$objectDefaults`](#objectdefaults)** | — | Fills in missing keys. |

<h4 align="center">$objectOf</h4>

**`$objectOf[key;value;...]`** - returns a JSON object

Builds an object from keys and values in turn, with nothing to escape.

| Argument | Needed | What it is |
|---|---|---|
| **`pairs`** | any number | A key, then its value, then the next key. |

```js
$objectOf[name;Ann;xp;120;id;123456789012345678;vip;true]    // → {"name":"Ann","xp":120,"id":"123456789012345678","vip":true}
$objectOf[roles;$arrayOf[1;2];meta;$objectOf[a;b]]         // → {"roles":[1,2],"meta":{"a":"b"}}
$objectOf                                                    // → {}
```

<h4 align="center">$objectPick</h4>

**`$objectPick[source;keys...]`** - returns a JSON object

The object with only the given keys.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The object, as a variable or JSON. |
| **`keys`** | at least one | The keys to keep. |

```js
$jsonLoad[user;{"id":"1","name":"Ann","token":"secret"}]
$objectPick[user;id;name]    // → {"id":"1","name":"Ann"}
```

<h4 align="center">$objectOmit</h4>

**`$objectOmit[source;keys...]`** - returns a JSON object

The object without the given keys.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The object, as a variable or JSON. |
| **`keys`** | at least one | The keys to leave out. |

```js
$jsonLoad[user;{"id":"1","name":"Ann","token":"secret"}]
$objectOmit[user;token]    // → {"id":"1","name":"Ann"}
```

<h4 align="center">$objectMerge</h4>

**`$objectMerge[variable;keys...;sources...]`** - returns nothing

Merges objects into the one under the keys, level by level and in order, creating it when missing. Arrays and other values are replaced, not joined.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the object. |
| **`keys`** | any number | The keys to follow. |
| **`sources`** | at least one, last | The objects to merge in. The last one can be a variable or JSON, and the ones before it are JSON, starting with `{`, so a variable goes there as `$env[name]`. |

```js
$jsonLoad[config;{"colors":{"main":"red","text":"white"},"tags":[1,2\]}]
$objectMerge[config;{"colors":{"main":"blue"},"tags":[9\]}]
$jsonGet[config]                            // → {"colors":{"main":"blue","text":"white"},"tags":[9]}
$objectMerge[config;colors;{"link":"green"}]
$jsonGet[config;colors]                     // → {"main":"blue","text":"white","link":"green"}
$objectMerge[copy;$env[config];{"tags":[\]}]
$jsonGet[copy]                              // → {"colors":{"main":"blue","text":"white","link":"green"},"tags":[]}
```

<h4 align="center">$objectDefaults</h4>

**`$objectDefaults[variable;keys...;defaults]`** - returns nothing

Fills in the keys the object lacks or holds null in, level by level.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the object. |
| **`keys`** | any number | The keys to follow. |
| **`defaults`** | required, last | The defaults, as a variable or JSON. |

```js
$jsonLoad[profile;{"coins":50,"xp":null}]
$objectDefaults[profile;{"coins":0,"xp":0,"inventory":{}}]
$jsonGet[profile]    // → {"coins":50,"xp":0,"inventory":{}}
```

<h3 align="center">Array functions</h3><hr>

| Function | Returns | What it does |
|---|---|---|
| **[`$arrayOf`](#arrayof)** | JSON array | Builds an array. |
| **[`$arrayLoad`](#arrayload)** ↺ | — | Splits text into an array. |
| **[`$arrayPush`](#arraypush)** ↺ | — | Adds to the end. |
| **[`$arrayPushJSON`](#arraypushjson)** ↺ | — | Adds JSON to the end. |
| **[`$arrayPushAt`](#arraypushat)** | — | Adds to the end of an array inside a variable. |
| **[`$arrayUnshift`](#arrayunshift)** ↺ | — | Adds to the start. |
| **[`$arrayUnshiftJSON`](#arrayunshiftjson)** ↺ | — | Adds JSON to the start. |
| **[`$arrayPop`](#arraypop)** ↺ | value | Takes the last element off. |
| **[`$arrayShift`](#arrayshift)** ↺ | value | Takes the first element off. |
| **[`$arrayRemove`](#arrayremove)** | — | Removes elements by value. |
| **[`$arraySplice`](#arraysplice)** ↺ | JSON array | Removes and inserts at an index. |
| **[`$arraySlice`](#arrayslice)** ↺ | JSON array | Part of an array. |
| **[`$arrayReverse`](#arrayreverse)** ↺ | JSON array | The array backwards. |
| **[`$arrayJoin`](#arrayjoin)** ↺ | text | The elements joined. |
| **[`$arrayIncludes`](#arrayincludes)** ↺ | boolean | Whether it holds a value. |
| **[`$arrayIndexOf`](#arrayindexof)** ↺ | number | Where a value is. |
| **[`$arrayLastIndexOf`](#arraylastindexof)** ↺ | number | Where a value last is. |
| **[`$arrayRange`](#arrayrange)** | JSON array | A run of numbers. |
| **[`$arrayFill`](#arrayfill)** ↺ | — | Sets every element to a value. |
| **[`$arrayChunk`](#arraychunk)** | JSON array | The array cut into pieces. |
| **[`$arrayPage`](#arraypage)** | JSON array | One page of it. |
| **[`$arrayPageCount`](#arraypagecount)** | number | How many pages. |
| **[`$arraySample`](#arraysample)** | value, or JSON array | Random elements. |
| **[`$arrayRandomIndex`](#arrayrandomindex)** ↺ | number | A random index. |
| **[`$arrayShuffle`](#arrayshuffle)** ↺ | —, or JSON array | The array in random order. |
| **[`$arrayWeightedRandom`](#arrayweightedrandom)** | value | A random element by weight. |
| **[`$arrayFlat`](#arrayflat)** | JSON array | Arrays inside opened up. |
| **[`$arrayUnique`](#arrayunique)** ↺ | JSON array | Without repeats. |
| **[`$arrayUnion`](#arrayunion)** | JSON array | Elements of any of the arrays. |
| **[`$arrayIntersect`](#arrayintersect)** | JSON array | Elements of both. |
| **[`$arrayDiff`](#arraydiff)** | JSON array | Elements of the first only. |
| **[`$arraySort`](#arraysort)** ↺ | JSON array | The array sorted. |
| **[`$arraySortBy`](#arraysortby)** | JSON array | Sorted by a key. |
| **[`$arrayPluck`](#arraypluck)** | JSON array | One key of every element. |
| **[`$arrayGroupBy`](#arraygroupby)** | JSON object | Elements grouped by a key. |
| **[`$arraySum`](#arraysum)** | number | Sum of a key. |
| **[`$arrayAverage`](#arrayaverage)** | number | Average of a key. |
| **[`$arrayMin`](#arraymin)** | number | Smallest of a key. |
| **[`$arrayMax`](#arraymax)** | number | Largest of a key. |
| **[`$arrayFormat`](#arrayformat)** | text | A line for every element. |
| **[`$arrayFilter`](#arrayfilter)** ↺ | JSON array | Elements a condition holds for. |
| **[`$arrayFind`](#arrayfind)** ↺ | value | The first of them. |
| **[`$arrayFindIndex`](#arrayfindindex)** ↺ | number | Where the first of them is. |
| **[`$arrayFindLast`](#arrayfindlast)** ↺ | value | The last of them. |
| **[`$arrayFindLastIndex`](#arrayfindlastindex)** ↺ | number | Where the last of them is. |
| **[`$arrayCount`](#arraycount)** | number | How many of them there are. |
| **[`$arraySome`](#arraysome)** ↺ | boolean | Whether any element passes. |
| **[`$arrayEvery`](#arrayevery)** ↺ | boolean | Whether every element passes. |
| **[`$arrayMap`](#arraymap)** ↺ | JSON array | What code gives for every element. |
| **[`$arrayReduce`](#arrayreduce)** ↺ | value | A value carried through every element. |
| **[`$arrayForEach`](#arrayforeach)** ↺ | — | Runs code for every element. |

Functions that read an array leave it as it is, except [`$arrayShuffle`](#arrayshuffle), and [`$arrayReverse`](#arrayreverse) and [`$arraySort`](#arraysort) without an other variable.

<h4 align="center">$arrayOf</h4>

**`$arrayOf[values...]`** - returns a JSON array

Builds an array with nothing to escape.

| Argument | Needed | What it is |
|---|---|---|
| **`values`** | any number | The elements. |

```js
$arrayOf[1;two;true;null;007;123456789012345678]    // → [1,"two",true,null,"007","123456789012345678"]
$arrayOf                                            // → []
```

<h4 align="center">$arrayLoad</h4>

**`$arrayLoad[variable;separator?;values...]`** ↺ - returns nothing

Splits text into an array. Pieces are read as under [Values](#values), except that `null` and JSON stay text, so the array joins back into the same text.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable to load the array to. |
| **`separator`** | optional | What the text is split on. Without one the array is empty, and an empty one splits every character. |
| **`values`** | any number | The text to split, `;` included. |

```js
$arrayLoad[scores;,;5,10,007,1.50,true,null]
$jsonGet[scores]                         // → [5,10,"007","1.50",true,"null"]
$arrayLoad[words; ;I paid 1.50 for 3 items]
$arrayJoin[words; ]                      // → I paid 1.50 for 3 items
$arrayIncludes[scores;10]                // → true
```

**Changed:** numbers and booleans are stored as such instead of as text, so `$arrayIncludes[scores;10]` finds them. A piece in quotes loses its quotes.

<h4 align="center">$arrayPush</h4>

**`$arrayPush[variable;values...]`** ↺ - returns nothing

Adds values to the end of an array, creating it when missing.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`values`** | at least one | The values to add. |

```js
$arrayPush[items;sword;shield]
$arrayPush[items;5;true]
$jsonGet[items]    // → ["sword","shield",5,true]
```

For an array deeper inside a variable, use [`$arrayPushAt`](#arraypushat).

**Changed:** the array is created when missing, where the old one did nothing. Numbers and booleans are no longer stored as text. A variable holding something other than an array is an error.

<h4 align="center">$arrayPushJSON</h4>

**`$arrayPushJSON[variable;values...]`** ↺ - returns nothing

Adds values to the end of an array, as [`$arrayPush`](#arraypush) does, except that an object or array that doesn't parse is an error, and then nothing is added.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`values`** | at least one | The JSON values to add. |

```js
$arrayPushJSON[users;{"id":123456789012345678,"xp":0}]
$jsonGet[users;0;id]            // → 123456789012345678
$arrayPushJSON[users;{id:1}]    // → error
```

**Changed:** long IDs keep their digits. The array is created when missing, and anything other than an array is an error. An object or array that doesn't parse is an error instead of being stored as text.

<h4 align="center">$arrayPushAt</h4>

**`$arrayPushAt[variable;keys...;value]`** - returns nothing

Adds a value to the end of the array under the keys, creating it when missing.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`keys`** | any number | The keys to follow. |
| **`value`** | required, last | The value to add. |

```js
$arrayPushAt[inventory;items;sword]
$arrayPushAt[inventory;items;{"name":"shield"}]
$jsonGet[inventory]    // → {"items":["sword",{"name":"shield"}]}
```

<h4 align="center">$arrayUnshift</h4>

**`$arrayUnshift[variable;values...]`** ↺ - returns nothing

Adds values to the start of an array, in order, creating it when missing.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`values`** | at least one | The values to add. |

```js
$arrayPush[queue;c;d]
$arrayUnshift[queue;a;b]
$jsonGet[queue]    // → ["a","b","c","d"]
```

**Changed:** as for [`$arrayPush`](#arraypush).

<h4 align="center">$arrayUnshiftJSON</h4>

**`$arrayUnshiftJSON[variable;values...]`** ↺ - returns nothing

Adds values to the start of an array, in order, the way [`$arrayPushJSON`](#arraypushjson) adds them to the end.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`values`** | at least one | The JSON values to add. |

```js
$arrayPushJSON[queue;{"id":3}]
$arrayUnshiftJSON[queue;{"id":1};{"id":2}]
$arrayPluck[queue;id]    // → [1,2,3]
```

**Changed:** as for [`$arrayPushJSON`](#arraypushjson).

<h4 align="center">$arrayPop</h4>

**`$arrayPop[variable]`** ↺ - returns the element

Removes the last element and returns it.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |

```js
$jsonLoad[queue;[1,2,{"id":3}\]]
$arrayPop[queue]    // → {"id":3}
$jsonGet[queue]     // → [1,2]
```

**Changed:** an object comes back as compact JSON. A variable holding something other than an array is an error.

<h4 align="center">$arrayShift</h4>

**`$arrayShift[variable]`** ↺ - returns the element

Removes the first element and returns it.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |

```js
$jsonLoad[queue;[{"id":1},2,3\]]
$arrayShift[queue]    // → {"id":1}
$jsonGet[queue]       // → [2,3]
```

**Changed:** as for [`$arrayPop`](#arraypop).

<h4 align="center">$arrayRemove</h4>

**`$arrayRemove[variable;values...]`** - returns nothing

Removes every element equal to one of the values, compared by type and content.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`values`** | at least one | The values to remove. |

```js
$jsonLoad[list;["5",5,6,{"id":1}\]]
$arrayRemove[list;5;{"id":1}]
$jsonGet[list]    // → ["5",6]
$arrayRemove[list;"5"]
$jsonGet[list]    // → [6]
```

<h4 align="center">$arraySplice</h4>

**`$arraySplice[variable;index;delete count;elements...]`** ↺ - returns the removed elements as a JSON array

Removes `delete count` elements from `index` on and inserts the elements in their place. A negative index counts from the end.

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`index`** | required | The index to start at. |
| **`delete count`** | required | How many elements to remove, 0 to only insert. |
| **`elements`** | any number | The elements to insert. |

```js
$jsonLoad[list;["a","b","c"\]]
$arraySplice[list;1;1;5;true]    // → ["b"]
$jsonGet[list]                   // → ["a",5,true,"c"]
$arraySplice[list;-1;1]          // → ["c"]
```

**Changed:** numbers and booleans are inserted as such instead of as text. The array is created when missing, and anything other than an array is an error. The JSON is compact.

<h4 align="center">$arraySlice</h4>

**`$arraySlice[source;other variable?;start;end?]`** ↺ - returns a JSON array

Part of an array from `start` up to, not including, `end`. Negative indices count from the end, and an `end` of 0 or none means to the end.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`other variable`** | optional | A variable to load the result to instead of returning it. |
| **`start`** | required | The index to start at. |
| **`end`** | optional | The index to stop before. |

```js
$jsonLoad[list;[1,2,3,4,5\]]
$arraySlice[list;;1;3]    // → [2,3]
$arraySlice[list;;-2]     // → [4,5]
$arraySlice[list;top;0;3]
$jsonGet[top]             // → [1,2,3]
```

**Changed:** it reads JSON as well as a variable. The JSON is compact.

<h4 align="center">$arrayReverse</h4>

**`$arrayReverse[source;other variable?]`** ↺ - returns a JSON array

Reverses an array. Without an other variable, a variable is reversed in place and returned. With one, the reversed copy goes there and the source stays as it is.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`other variable`** | optional | A variable to load the result to instead of returning it. |

```js
$jsonLoad[list;[1,2,3\]]
$arrayReverse[list]          // → [3,2,1]
$jsonGet[list]               // → [3,2,1]
$arrayReverse[list;back]
$jsonGet[back]               // → [1,2,3]
$jsonGet[list]               // → [3,2,1]
$arrayReverse[["a","b"\]]    // → ["b","a"]
```

**Changed:** with an other variable, the source is no longer reversed too, and the copy is separate. It reads JSON as well as a variable.

<h4 align="center">$arrayJoin</h4>

**`$arrayJoin[source;separator?]`** ↺ - returns text

Joins the elements into text. Objects are written as JSON and null as nothing.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`separator`** | optional | What goes between elements, `, ` by default. |

```js
$jsonLoad[list;["a",{"b":1},null,3\]]
$arrayJoin[list]      // → a, {"b":1}, , 3
$arrayJoin[list;-]    // → a-{"b":1}--3
```

**Changed:** objects are written as JSON instead of `[object Object]`. It reads JSON as well as a variable.

<h4 align="center">$arrayIncludes</h4>

**`$arrayIncludes[source;value]`** ↺ - returns a boolean

Whether the array holds the value, compared by type and content.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`value`** | required | The value to look for. |

```js
$jsonLoad[list;[5,"10",{"a":1}\]]
$arrayIncludes[list;5]          // → true
$arrayIncludes[list;"5"]        // → false
$arrayIncludes[list;"10"]       // → true
$arrayIncludes[list;{"a":1}]    // → true
```

**Changed:** the value is read with its type, where 2.7.0 always looked for text and 2.7.1 read long IDs and codes like `007` as numbers and missed them. Objects compare by content.

<h4 align="center">$arrayIndexOf</h4>

**`$arrayIndexOf[source;value]`** ↺ - returns a number

Where the value first is, compared as in [`$arrayIncludes`](#arrayincludes), or `-1`.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`value`** | required | The value to look for. |

```js
$jsonLoad[list;[5,"10"\]]
$arrayIndexOf[list;5]       // → 0
$arrayIndexOf[list;"10"]    // → 1
$arrayIndexOf[list;10]      // → -1
```

**Changed:** it compares by type, as `$arrayIncludes` does, where the old one always looked for text. Data saved as text earlier needs quotes: `$arrayIndexOf[old;"10"]`.

<h4 align="center">$arrayLastIndexOf</h4>

**`$arrayLastIndexOf[source;value]`** ↺ - returns a number

Where the value last is, compared as in [`$arrayIncludes`](#arrayincludes), or `-1`.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`value`** | required | The value to look for. |

```js
$jsonLoad[list;[5,"5",5\]]
$arrayLastIndexOf[list;5]      // → 2
$arrayLastIndexOf[list;"5"]    // → 1
```

**Changed:** as for [`$arrayIndexOf`](#arrayindexof).

<h4 align="center">$arrayRange</h4>

**`$arrayRange[start;end;step?]`** - returns a JSON array

Numbers from `start` to `end`, both included. The step is 1 or -1 by default.

| Argument | Needed | What it is |
|---|---|---|
| **`start`** | required | The first number. |
| **`end`** | required | The last number. |
| **`step`** | optional | How far apart the numbers are. |

```js
$arrayRange[1;5]       // → [1,2,3,4,5]
$arrayRange[5;1]       // → [5,4,3,2,1]
$arrayRange[0;10;5]    // → [0,5,10]
```

<h4 align="center">$arrayFill</h4>

**`$arrayFill[variable;value]`** ↺ - returns nothing

Sets every element of an array to the value, each element getting its own copy. The value is read as by [`$arrayPushJSON`](#arraypushjson).

| Argument | Needed | What it is |
|---|---|---|
| **`variable`** | required | The variable holding the array. |
| **`value`** | required | The value to fill it with. |

```js
$arrayCreate[slots;3]
$arrayFill[slots;{"item":null}]
$!jsonSet[slots;0;item;sword]
$jsonGet[slots]    // → [{"item":"sword"},{"item":null},{"item":null}]
```

**Changed:** every element gets its own copy, where the old one put one and the same object in all of them. Long IDs keep their digits, and anything other than an array is an error.

<h4 align="center">$arrayChunk</h4>

**`$arrayChunk[source;size]`** - returns a JSON array

Cuts an array into arrays of that size.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`size`** | required | How many elements a piece holds. |

```js
$arrayChunk[[1,2,3,4,5\];2]    // → [[1,2],[3,4],[5]]
```

<h4 align="center">$arrayPage</h4>

**`$arrayPage[source;page;size]`** - returns a JSON array

One page of an array, pages counted from 1.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`page`** | required | The page, from 1. |
| **`size`** | required | How many elements a page holds. |

```js
$jsonLoad[list;[1,2,3,4,5\]]
$arrayPage[list;2;2]    // → [3,4]
$arrayPage[list;9;2]    // → []
```

<h4 align="center">$arrayPageCount</h4>

**`$arrayPageCount[source;size]`** - returns a number

How many pages an array fills, at least 1.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`size`** | required | How many elements a page holds. |

```js
$arrayPageCount[[1,2,3,4,5\];2]    // → 3
$arrayPageCount[[\];10]            // → 1
```

<h4 align="center">$arraySample</h4>

**`$arraySample[source;count?]`** - returns an element, or a JSON array

A random element or, with a count, that many different ones as a JSON array.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`count`** | optional | How many different elements to pick. |

```js
$jsonLoad[list;[1,2,3,4,5\]]
$arraySample[list]      // → e.g. 4
$arraySample[list;2]    // → e.g. [5,1]
```

<h4 align="center">$arrayRandomIndex</h4>

**`$arrayRandomIndex[source]`** ↺ - returns a number

A random index of the array. An empty array gives nothing.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |

```js
$jsonLoad[list;["a","b","c"\]]
$arrayRandomIndex[list]    // → e.g. 2
$arrayRandomIndex[[\]]     // →
```

**Changed:** an empty array gives nothing instead of 0. It reads JSON as well as a variable.

<h4 align="center">$arrayShuffle</h4>

**`$arrayShuffle[source]`** ↺ - returns nothing for a variable, the shuffled array for JSON

Shuffles an array. A variable is shuffled in place, and JSON is returned shuffled.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |

```js
$jsonLoad[deck;["A","K","Q"\]]
$arrayShuffle[deck]
$jsonGet[deck]              // → e.g. ["Q","A","K"]
$arrayShuffle[[1,2,3\]]     // → e.g. [2,3,1]
```

**Changed:** every order is equally likely, where the old one favoured some. It reads JSON as well as a variable.

<h4 align="center">$arrayWeightedRandom</h4>

**`$arrayWeightedRandom[source;key...]`** - returns an element

A random element, weighted by the key.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`key`** | at least one | The key holding the weight. |

```js
$jsonLoad[loot;[{"item":"Coin","chance":70},{"item":"Gem","chance":25},{"item":"Crown","chance":5}\]]
$jsonGet[$arrayWeightedRandom[loot;chance];item]    // → e.g. Coin
```

<h4 align="center">$arrayFlat</h4>

**`$arrayFlat[source;depth?]`** - returns a JSON array

Flattens nested arrays, one level by default. `Infinity` flattens all of them.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`depth`** | optional | How many levels to flatten. |

```js
$arrayFlat[[1,[2,[3\]\]\]]             // → [1,2,[3]]
$arrayFlat[[1,[2,[3\]\]\];Infinity]    // → [1,2,3]
```

<h4 align="center">$arrayUnique</h4>

**`$arrayUnique[source;other variable?;key...]`** ↺ - returns a JSON array

The array without repeats, keeping the first of each. With a key, elements are compared by it.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`other variable`** | optional | A variable to load the result to instead of returning it. |
| **`key`** | any number | The key to compare by. |

```js
$jsonLoad[users;[{"id":1,"n":"a"},{"id":1,"n":"b"},{"id":2}\]]
$arrayUnique[users;;id]      // → [{"id":1,"n":"a"},{"id":2}]
$arrayUnique[[1,1,2\]]       // → [1,2]
```

**Changed:** it can compare by a key, and reads JSON as well as a variable. The JSON is compact.

<h4 align="center">$arrayUnion</h4>

**`$arrayUnion[sources...]`** - returns a JSON array

Every element found in any of the arrays.

| Argument | Needed | What it is |
|---|---|---|
| **`sources`** | at least one | The arrays, each a variable or JSON. |

```js
$arrayUnion[[1,2,3\];[2,3,4\]]    // → [1,2,3,4]
```

<h4 align="center">$arrayIntersect</h4>

**`$arrayIntersect[first;second]`** - returns a JSON array

The elements of the first array that the second holds too.

| Argument | Needed | What it is |
|---|---|---|
| **`first`** | required | The array to keep elements from, as a variable or JSON. |
| **`second`** | required | The array they have to be in, as a variable or JSON. |

```js
$arrayIntersect[[1,2,3\];[2,3,4\]]    // → [2,3]
```

<h4 align="center">$arrayDiff</h4>

**`$arrayDiff[first;second]`** - returns a JSON array

The elements of the first array that the second doesn't hold.

| Argument | Needed | What it is |
|---|---|---|
| **`first`** | required | The array to keep elements from, as a variable or JSON. |
| **`second`** | required | The array of elements to leave out, as a variable or JSON. |

```js
$arrayDiff[[1,2,3\];[2,3,4\]]    // → [1]
```

<h4 align="center">$arraySort</h4>

**`$arraySort[source;other variable?;sort type?]`** ↺ - returns a JSON array

Sorts an array the way [`$arraySortBy`](#arraysortby) does without a key. Without an other variable, a variable is sorted in place and returned. With one, the sorted copy goes there and the source stays as it is.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`other variable`** | optional | A variable to load the result to instead of returning it. |
| **`sort type`** | optional | `asc`, the default, or `desc`. |

```js
$jsonLoad[list;[10,9,1\]]
$arraySort[list]              // → [1,9,10]
$arraySort[list;top;desc]
$jsonGet[top]                 // → [10,9,1]
$arraySort[["b","A","c"\]]    // → ["A","b","c"]
```

**Changed:** `asc` sorts from the smallest and `desc` from the largest, where the old one had them the other way round. Numbers sort as numbers instead of as text, so `10` comes after `9`. With an other variable, the source is no longer sorted as well, and the copy is separate. It reads JSON as well as a variable.

<h4 align="center">$arraySortBy</h4>

**`$arraySortBy[source;sort type?;key...]`** - returns a JSON array

The array sorted by a key, or by the elements without one. Elements without the key go last, and equal ones keep their order. Numbers stored as text sort as numbers, and text sorts naturally, `item2` before `item10`, ignoring case.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`sort type`** | optional | `asc`, the default, or `desc`. |
| **`key`** | any number | The key to sort by. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50,"stats":{"level":7}},{"name":"Bob","xp":"500","stats":{"level":2}},{"name":"Cid"}\]]
$arrayPluck[$arraySortBy[users;desc;xp];name]            // → ["Bob","Ann","Cid"]
$arrayPluck[$arraySortBy[users;asc;stats;level];name]    // → ["Bob","Ann","Cid"]
$arraySortBy[["item10","Item2","item1"\]]                // → ["item1","Item2","item10"]
```

<h4 align="center">$arrayPluck</h4>

**`$arrayPluck[source;key...]`** - returns a JSON array

The value under the key of every element, `null` where it's missing.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`key`** | at least one | The key to read. |

```js
$jsonLoad[users;[{"name":"Ann","stats":{"xp":5}},{"name":"Bob"}\]]
$arrayPluck[users;name]        // → ["Ann","Bob"]
$arrayPluck[users;stats;xp]    // → [5,null]
```

<h4 align="center">$arrayGroupBy</h4>

**`$arrayGroupBy[source;key...]`** - returns a JSON object

The elements grouped by the value of the key.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`key`** | at least one | The key to group by. |

```js
$jsonLoad[items;[{"n":"sword","r":"rare"},{"n":"bow","r":"common"},{"n":"axe","r":"rare"}\]]
$arrayGroupBy[items;r]    // → {"rare":[{"n":"sword","r":"rare"},{"n":"axe","r":"rare"}],"common":[{"n":"bow","r":"common"}]}
```

<h4 align="center">$arraySum</h4>

**`$arraySum[source;key...]`** - returns a number

The sum of the numbers under the key, or of the elements without one. Numbers stored as text count, and anything else is skipped.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`key`** | any number | The key to add up. |

```js
$jsonLoad[users;[{"coins":50},{"coins":"30"},{"coins":20},{"name":"none"}\]]
$arraySum[users;coins]    // → 100
$arraySum[[0.1,0.2\]]     // → 0.3
```

<h4 align="center">$arrayAverage</h4>

**`$arrayAverage[source;key...]`** - returns a number

The average of the numbers under the key, read the way [`$arraySum`](#arraysum) reads them. None at all gives nothing.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`key`** | any number | The key to average. |

```js
$jsonLoad[users;[{"coins":50},{"coins":"30"},{"coins":20}\]]
$arrayAverage[users;coins]    // → 33.3333333333333
$arrayAverage[[\]]            // →
```

<h4 align="center">$arrayMin</h4>

**`$arrayMin[source;key...]`** - returns a number

The smallest number under the key, read the way [`$arraySum`](#arraysum) reads them. None at all gives nothing.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`key`** | any number | The key to read. |

```js
$jsonLoad[items;[{"price":50},{"price":"30"},{"price":20}\]]
$arrayMin[items;price]    // → 20
```

<h4 align="center">$arrayMax</h4>

**`$arrayMax[source;key...]`** - returns a number

The largest number under the key, read the way [`$arraySum`](#arraysum) reads them. None at all gives nothing.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`key`** | any number | The key to read. |

```js
$jsonLoad[items;[{"price":50},{"price":"30"},{"price":20}\]]
$arrayMax[items;price]    // → 50
```

<h4 align="center">$arrayFormat</h4>

**`$arrayFormat[source;template;page?;size?;separator?]`** - returns text

Writes a line for every element from a template. With a page and a size, only that page is written, numbered on from the pages before.

In the template:

| Placeholder | Stands for |
|---|---|
| `{key}` | The value under that key of the element |
| `{stats.xp}` | A key inside a key, dots between them |
| `{#}` | The element's place, counted from 1 |
| `{.}` | The element itself |
| `{{` and `}}` | Literal braces |

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`template`** | required | The line to write for every element. |
| **`page`** | optional | The page to write, from 1. |
| **`size`** | optional | Lines per page, all by default. |
| **`separator`** | optional | What goes between lines, a new line by default. |

```js
$jsonLoad[users;[{"id":"111","xp":120},{"id":"222","xp":90},{"id":"333","xp":300}\]]
$arrayFormat[$arraySortBy[users;desc;xp];{#}. <@{id}> - {xp} XP;1;2;, ]    // → 1. <@333> - 300 XP, 2. <@111> - 120 XP
$arrayFormat[$arraySortBy[users;desc;xp];{#}. <@{id}>;2;2]                 // → 3. <@222>
$arrayFormat[["a","b"\];({#}) {.};;; ]                                     // → (1) a (2) b
```

<h4 align="center">Conditions and loops</h4>

A condition is written as in `$if`: a comparison like `$jsonGet[u;xp]>=100`, or anything that gives `true` or `false`.

The variables are restored after the loop. An optional index variable, named last, holds the index from 0. `$stop`, errors and `$return` in `$arrayForEach` pass through, and the others take `$return` as the element's result.

`$break` and `$continue` pass through to the `$loop` around, as in ForgeScript's own array functions, and fail the command outside one.

**Changed:** for the ones replacing ForgeScript's own, the loop variables no longer stay set afterwards. They read JSON as well as a variable, and the index variable is new.

<h4 align="center">$arrayFilter</h4>

**`$arrayFilter[source;variable;condition;other variable?;index variable?]`** ↺ - returns a JSON array

The elements the condition holds for.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`other variable`** | optional | A variable to load the result to instead of returning it. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$arrayPluck[$arrayFilter[users;u;$jsonGet[u;xp]>=100];name]               // → ["Bob","Cid"]
$arrayPluck[$arrayFilter[users;u;$startsWith[$jsonGet[u;name];A]];name]   // → ["Ann"]
$arrayFilter[users;u;$jsonGet[u;xp]<100;low]
$jsonGet[low;0;name]                                                      // → Ann
```

<h4 align="center">$arrayFind</h4>

**`$arrayFind[source;variable;condition;index variable?]`** ↺ - returns the element

The first element the condition holds for.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$jsonGet[$arrayFind[users;u;$jsonGet[u;xp]>100];name]    // → Bob
$arrayFind[users;u;$jsonGet[u;name]==Dee]                // →
```

<h4 align="center">$arrayFindIndex</h4>

**`$arrayFindIndex[source;variable;condition;index variable?]`** ↺ - returns a number

The index of the first element the condition holds for, `-1` when none does.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$arrayFindIndex[users;u;$jsonGet[u;name]==Cid]                                  // → 2
$arrayFindIndex[users;u;$jsonGet[u;name]==Dee]                                  // → -1
$sum[$arrayFindIndex[$arraySortBy[users;desc;xp];u;$jsonGet[u;name]==Bob];1]    // → 2
```

<h4 align="center">$arrayFindLast</h4>

**`$arrayFindLast[source;variable;condition;index variable?]`** ↺ - returns the element

The last element the condition holds for.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$jsonGet[$arrayFindLast[users;u;$jsonGet[u;xp]<200];name]    // → Bob
$arrayFindLast[users;u;$jsonGet[u;name]==Dee]                 // →
```

<h4 align="center">$arrayFindLastIndex</h4>

**`$arrayFindLastIndex[source;variable;condition;index variable?]`** ↺ - returns a number

The index of the last element the condition holds for, `-1` when none does.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$arrayFindLastIndex[users;u;$jsonGet[u;xp]<200]      // → 1
$arrayFindLastIndex[users;u;$jsonGet[u;name]==Dee]   // → -1
```

<h4 align="center">$arrayCount</h4>

**`$arrayCount[source;variable;condition;index variable?]`** - returns a number

How many elements the condition holds for.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$arrayCount[users;u;$jsonGet[u;xp]>=100]    // → 2
```

<h4 align="center">$arraySome</h4>

**`$arraySome[source;variable;condition;index variable?]`** ↺ - returns a boolean

Whether the condition holds for any element.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$arraySome[users;u;$jsonGet[u;xp]>=300]     // → true
$arraySome[users;u;$jsonGet[u;xp]>1000]     // → false
```

<h4 align="center">$arrayEvery</h4>

**`$arrayEvery[source;variable;condition;index variable?]`** ↺ - returns a boolean

Whether the condition holds for every element.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`condition`** | required | The condition. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$arrayEvery[users;u;$jsonGet[u;xp]>=50]     // → true
$arrayEvery[users;u;$jsonGet[u;xp]>100]     // → false
```

**Changed:** the condition is read as in `$if`. The old one didn't, so `$arrayEvery[list;x;$env[x]>0]` gave `false` for any list that isn't empty.

<h4 align="center">$arrayMap</h4>

**`$arrayMap[source;variable;code;other variable?;index variable?]`** ↺ - returns a JSON array

Collects what `$return` gives, or else what the code outputs, for every element. Empty output adds nothing, so it can filter too. Results are read as under [Values](#values), while [`$arrayPluck`](#arraypluck) copies values as they are.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`code`** | required | The code to run for every element. |
| **`other variable`** | optional | A variable to load the result to instead of returning it. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150}\]]
$arrayMap[users;u;$jsonGet[u;xp]]                                                       // → [50,150]
$arrayMap[users;u;$return[$jsonGet[u;name]]]                                            // → ["Ann","Bob"]
$arrayMap[users;u;$if[$jsonGet[u;xp]>100;$return[$jsonGet[u;name]]]]                   // → ["Bob"]
$arrayMap[users;u;$objectOf[place;$sum[$jsonGet[i];1];name;$jsonGet[u;name]];;i]    // → [{"place":1,"name":"Ann"},{"place":2,"name":"Bob"}]
```

**Changed:** without `$return`, it collects what the code outputs, where the old one collected nothing.

<h4 align="center">$arrayReduce</h4>

**`$arrayReduce[source;variable;other variable;code;default value?;index variable?]`** ↺ - returns the carried value

Carries a value through every element and returns it. The value is in `variable`, the element in `other variable`. What `$return` gives, or else what the code outputs, becomes the new value, and empty output keeps it.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable the carried value is loaded to. |
| **`other variable`** | required | The variable every element is loaded to. |
| **`code`** | required | The code to run for every element. |
| **`default value`** | optional | The value to start from, 0 by default. `""` starts from empty text. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150},{"name":"Cid","xp":300}\]]
$arrayReduce[users;sum;u;$math[$env[sum]+$jsonGet[u;xp]]]                           // → 500
$arrayReduce[users;best;u;$if[$jsonGet[u;xp]>$env[best];$return[$jsonGet[u;xp]]]]   // → 300
$arrayReduce[users;names;u;$arrayPush[names;$jsonGet[u;name]];[\]]                  // → ["Ann","Bob","Cid"]
```

**Changed:** without a default value it starts from 0 instead of `null`. The code's output counts, not only `$return`, and numbers and JSON are no longer turned into text.

<h4 align="center">$arrayForEach</h4>

**`$arrayForEach[source;variable;code;index variable?]`** ↺ - returns nothing

Runs code for every element. Changes to an object or array element through the variable reach the array, while a number or text is a copy.

| Argument | Needed | What it is |
|---|---|---|
| **`source`** | required | The array, as a variable or JSON. |
| **`variable`** | required | The variable every element is loaded to. |
| **`code`** | required | The code to run for every element. |
| **`index variable`** | optional | The variable the element's index is loaded to. |

```js
$jsonLoad[users;[{"name":"Ann","xp":50},{"name":"Bob","xp":150}\]]
$arrayForEach[users;u;$jsonMath[u;xp;10]]
$arrayPluck[users;xp]    // → [60,160]
$arrayForEach[users;u;$arrayPush[names;$jsonGet[i]. $jsonGet[u;name]];i]
$jsonGet[names]          // → ["0. Ann","1. Bob"]
```

<h3 align="center">Examples</h3><hr>

Whole commands. They store data with [ForgeDB](https://github.com/tryforge/ForgeDB), so it must be loaded too.

<h4 align="center">A leaderboard with pages</h4>

```js
$jsonLoad[users;$getGuildVar[levels;$guildID;$arrayOf]]
$jsonLoad[users;$arraySortBy[users;desc;xp]]
$let[page;$default[$message[0];1]]

$title[Leaderboard, page $get[page]/$arrayPageCount[users;10]]
$description[$arrayFormat[users;**{#}.** <@{id}> - {xp} XP;$get[page];10]]
$footer[You are #$sum[$arrayFindIndex[users;u;$jsonGet[u;id]==$authorID];1]]
```

<h4 align="center">A profile with defaults</h4>

[`$objectDefaults`](#objectdefaults) fills in keys added after the data was saved:

```js
$jsonLoad[profile;$getUserVar[profile;$authorID;{}]]
$objectDefaults[profile;{"coins":0,"daily":0,"inventory":{}}]

$jsonMath[profile;coins;250]
$jsonMath[profile;inventory;$message;count;1]
$!jsonSet[profile;daily;$getTimestamp]

$setUserVar[profile;$jsonGet[profile];$authorID]
```
