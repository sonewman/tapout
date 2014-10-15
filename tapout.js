module.exports = TapOut

var inherits = require('util').inherits
var Transform = require('stream').Transform

function TapOut(options) {
  Transform.call(this, { objectMode: true })
  options = options || {}

  this._hasHeader = false
  this._hasFooter = false
  this._hasEnded = false
  this._count = 0
  this._total = 0
  this._ok = true
}

inherits(TapOut, Transform)

TapOut.prototype._transform = transform_
function transform_(test, enc, next) {
  if (test.pending) {
    next()
    return
  }

  var results = test.results || []
  var result
  var rs
  var error = null

  if (!this._hasHeader) {
    this.push('TAP version 13\n')
    this._hasHeader = true
  }

  // start output with test name
  var output = ['# ' + test.name]

  for (var i = 0; i < results.length; i++) {
    this._total++
    result = results[i]
    rs = ''

    if (result.ok) {
      rs += 'ok '
      this._count++
    } else {
      rs += 'not ok '
      this._ok = false
      error = formatError(result)
    }
    rs += this._total + ' ' + result.name

    output.push(rs)

    if (error) {
      output.push(error)
      error = null
    }
  }

  output.push('')
  next(null, output.join('\n'))
}

TapOut.prototype._flush = flush_
function flush_() {
  var endOutput = ['\n']

  // add the span of the tests
  // e.g. 1..10
  endOutput.push(span(this._total))

  // add the total tests
  // e.g. # tests 10
  endOutput.push(totalTests(this._total))

  // add the total passes
  // e.g. # pass 9
  endOutput.push(totalPasses(this._count))

  // add the total failures
  // e.g. # fail 1
  endOutput.push(totalFails(this._count, this._total))

  // give end result
  // e.g. # ok
  endOutput.push(result(this._count, this._total))

  this.push(endOutput.join(''))
  this.push(null)
}

function span(total) {
  return total > 0
    ? '1..' + total + '\n'
    : '0\n'
}

function totalTests(total) {
  return '# tests ' + total + '\n'
}

function totalPasses(count) {
  return count > 0
    ? '# pass  ' + count + '\n'
    : ''
}

function totalFails(count, total) {
  var fails = total - count
  return fails > 0
    ? '# fail  ' + fails + '\n'
    : ''
}

function result(count, total) {
  return '\n' + (count === total ? '# ok' : '# not ok') + '\n\n'
}

function formatError(result) {
  var errorOutput = ['  ---']

  if ('string' === typeof result.file)
    errorOutput.push(formatFile(result.file))

  if ('number' === typeof result.line)
    errorOutput.push(formatLine(result.line))

  if ('number' === typeof result.column)
    errorOutput.push(formatColumn(result.column))

  if (result.error && result.error.stack)
    errorOutput.push(formatStack(result.error.stack))

  // we have no errors to output
  if (errorOutput.length === 1)
    errorOutput.push('    error:   unknown')

  errorOutput.push('  ...\n')
  return errorOutput.join('\n')
}

function formatFile(file) {
  if (!file) return file
  return '    file:   ' + (file || '').replace(/\:[0-9]+\:[0-9]+$/, '')
}

function formatLine(line) {
  return '    line:   ' + line
}

function formatColumn(column) {
  return '    column: ' + column
}

function formatStack(stack) {
  var st = stack.split('\n').slice(1)
  var output = ['    stack:']

  for (var i = 0; i < st.length; i++)
    output.push(st[i].replace(/at/, '-'))

  return output.join('\n  ')
}

