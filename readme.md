# Tapout

Streaming Tap (Test Anywhere Protocol) output

Install:
```bash
$ npm i tapout
```

Give write spec objects to tapout and get streaming tap output.

A successful test object with two assertions:
```javascript
var TapOut = require('tapout')
var tap = new TapOut()

tap.pipe(process.stdout)

tap.write({
  name: 'my first test'
  , results: [
    { name: 'assert was correct', ok: true }
    , { name: 'assert was true', ok: true }
  ]
})

tap.end()
```
output:
```bash
$ node my-test.js
TAP version 13
# my first test
ok 1 assert was correct
ok 2 assert was true

1..2
# tests 2
# pass  2

# ok
```

```javascript
var TapOut = require('tapout')
var tap = new TapOut()
tap.pipe(process.stdout)

tap.end({
  name: 'my only failing test'
  , results: [
    {
      name: 'assert was correct'
      , ok: false
      , error: new Error()
      , file: 'my-file.js'
      , line: 20
      , column: 10
    }
  ]
})
```
output:
```bash
$ node my-failing-test.js
TAP version 13
# my only failing test
not ok 1 assert was correct
  ---
    file:   my-file.js
    line:   20
    column: 10
    stack:
      - repl:7:10
      - REPLServer.defaultEval (repl.js:130:27)
      - bound (domain.js:257:14)
      - REPLServer.runBound [as eval] (domain.js:270:12)
      - REPLServer.<anonymous> (repl.js:277:12)
      - REPLServer.EventEmitter.emit (events.js:107:17)
      - REPLServer.Interface._onLine (readline.js:202:10)
      - REPLServer.Interface._line (readline.js:531:8)
      - REPLServer.Interface._ttyWrite (readline.js:812:14)
      - ReadStream.onkeypress (readline.js:101:10)
  ...


1..1
# tests 1
# fail  1

# not ok
```


