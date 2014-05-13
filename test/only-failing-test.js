var test = require('tape')
var TapOut = require('../')
var stream = require('stream')

var testError = new Error();
var stack = testError.stack.split('\n').slice(1)
var errorStackOutput = ['    stack:']

for (var i = 0; i < stack.length; i++)
  errorStackOutput.push(stack[i].replace(/at/, '-'))

errorStackOutput = errorStackOutput.join('\n  ')


var testResults = [
  {
    name: 'my only failing test'
    , results: [
      { 
        name: 'assert was correct'
        , ok: false
        , error: testError
        , file: 'my-file.js'
        , line: 20
        , column: 10
      }
    ]
  }
]

test('Parse erroneous test', function (t) {
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
        t.equals(d, 
          '# my only failing test\n'
          + 'not ok 1 assert was correct\n  ---\n'
          + '    file:   my-file.js\n'
          + '    line:   20\n'
          + '    column: 10\n'
          + errorStackOutput + '\n  ...\n\n'
        )
        break

      case 2:
        t.equals(d, '\n1..1\n# tests 1\n# fail  1\n\n# not ok\n\n')
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
