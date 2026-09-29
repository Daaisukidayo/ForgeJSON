<div align="center">

# ForgeJSON

Better and new `$json` and `$array` functions for ForgeScript. Discord IDs never lose digits, and leaderboards, pages and lists take a single function.

<a href="https://github.com/Daaisukidayo/ForgeJSON/"><img src="https://img.shields.io/github/package-json/v/Daaisukidayo/ForgeJSON/main?label=forge.json&color=5c16d4" alt="forge.json"></a>
<a href="https://github.com/tryforge/ForgeScript/"><img src="https://img.shields.io/github/package-json/v/tryforge/ForgeScript/main?label=@tryforge/forgescript&color=5c16d4" alt="@tryforge/forgescript"></a>
<a href="https://discord.gg/yFW5Ju6JP8"><img src="https://img.shields.io/discord/997899472610795580?logo=discord" alt="Discord"></a>

</div>

---

## Contents

1. [Installation](#installation)
2. [Functions](#functions)
3. [What it fixes in ForgeScript](#what-it-fixes-in-forgescript)

<h3 align="center">Installation</h3><hr>

1. Install the package.

   **From npm** - the stable release:
   ```bash
   npm i forge.json
   ```

   **From GitHub:**
   ```bash
   npm i github:Daaisukidayo/ForgeJSON#main
   ```

   It needs **ForgeScript 2.7.0** and **Node.js 22** or newer.

2. Here's an example of how your main file should look:

   ```js
   const { ForgeClient } = require("@tryforge/forgescript")
   const { ForgeJSON } = require("forge.json")

   const client = new ForgeClient({
       ...options, // Change that to the options you currently have
       extensions: [
           new ForgeJSON(),
           // Add other extensions you installed here
       ]
   })

   client.login("YourToken")
   ```

ForgeJSON replaces 29 of ForgeScript's functions. Existing calls keep working, and the differences are under **Changed** in [functions.md](functions.md).

> ⚠️ **Warning**\
> Lists saved **before** ForgeJSON hold their numbers as text. Search them with `$arrayIndexOf[list;"10"]`, not `$arrayIndexOf[list;10]`.

<h3 align="center">Functions</h3><hr>

Every function is in [functions.md](functions.md), along with the [Basics](functions.md#basics) they share and [Examples](functions.md#examples) of whole commands.

| Group | Functions | What for |
|---|---|---|
| **[JSON functions](functions.md#json-functions)** | 13 | Reading, writing and checking any value. |
| **[Object functions](functions.md#object-functions)** | 5 | Building objects and working with their keys. |
| **[Array functions](functions.md#array-functions)** | 44 | Adding and removing, pages, random picks, sorting, sums, formatting and loops. |

<h3 align="center">What it fixes in ForgeScript</h3><hr>

Checked on `@tryforge/forgescript` 2.7.1:

| In ForgeScript | With ForgeJSON |
|---|---|
| `$jsonLoad`, `$jsonSet` and `$arrayMap` round long numbers, so the ID `123456789012345678` is stored as `123456789012345680`. | IDs stay exact. |
| `$arrayIncludes` misses a long ID or a code like `007` that the list holds. | Both are found. |
| `$jsonLoad` stores JSON that doesn't parse as plain text. When a `]` cuts it short, the rest of it ends up in the message. | An object or array that doesn't parse is an error naming the likely cause. |
| `$arrayPush`, `$arrayUnshift` and `$arrayLoad` store numbers and booleans as text, so `$arrayIncludes[list;5]` misses the `5` they added. | Numbers and booleans are stored as such. |
| `$arrayIndexOf[list;5]` gives `-1` for the same list where `$arrayIncludes[list;5]` gives `true`. | Both compare by type. |
| `$arrayPush` and `$arrayUnshift` silently do nothing when the variable holds something other than an array, or nothing yet. | A missing array is created, anything else is an error. |
| `$arrayJoin` writes objects as `[object Object]`. | Objects are written as JSON. |
| `$jsonHas` answers nothing, rather than `false`, for a missing variable. | It answers `false`. |
| `$jsonDelete` on an array answers with the removed element, rather than `true` or `false`. | It answers `true` or `false`. |
| The array loops leave their variables set once they end, overwriting any variable of the same name. | They are restored. |
| `$arrayEvery` doesn't read its code as a condition, so `$arrayEvery[list;x;$env[x]>0]` always gives `false`. | The condition is read as in `$if`. |
| `$arrayReduce` without a default value starts from `null`, not the 0 it promises, so adding up `[1,2,3]` with `$math` gives `5`. | It starts from 0. |
| `$arrayShuffle` makes some orders likelier than others. | Every order is equally likely. |
| `$arrayReverse[a;b]` reverses `a` as well, and makes `b` the very same array. | `b` gets its own copy, and `a` stays as it is. |
