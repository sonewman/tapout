var test = require('tape')
var TapOut = require('../')
var stream = require('stream')

var testResults = [
  {
    name: 'my first test'
    , results: [
      { name: 'assert was correct', ok: true }
      , { name: 'assert was true', ok: true }
    ]
  }
  , {
    name: 'my pending test'
    , pending: true
  }
  , {
    name: 'my second test'
    , results: [
      { name: 'assert as right', ok: true }
    ]
  }
  , {
    name: 'my third test'
    , results: [
      { name: 'assert another correct value', ok: true }
    ]
  }
]

test('Parse fully successful test', function (t) {
  var count = 0
  var testCount = 0

  var output = new stream.Writable({ objectMode: true })
  output._write = function (data, enc, next) {
    var d = data.toString()

    switch (count++) {
      case 0:
        t.equals(d, 'TAP version 13\n')
        break

      case 1:
        t.equals(d, '# my first test\nok 1 assert was correct\nok 2 assert was true\n')
        break

      case 2:
        t.equals(d, '# my second test\nok 3 assert as right\n')
        break

      case 3:
        t.equals(d, '# my third test\nok 4 assert another correct value\n')
        break

      case 4:
        t.equals(d, '\n1..4\n# tests 4\n# pass  4\n\n# ok\n\n')
        t.end()
    }

    next()
  }

  var tap = new TapOut()
  tap.pipe(output)

  testResults.forEach(function (result) {
    tap.write(result)
  })

  tap.end()

})
