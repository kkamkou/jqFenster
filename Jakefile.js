// required:
//  npm install jake
//  npm install uglify-js@1
//  npm install csso

// nodejs env check
if (!process.env.NODE_PATH) {
  console.log('$NODE_PATH is undefined!');
  console.log('Run: export NODE_PATH="__NODEJS_MODULES__"');
  console.log('Example: export NODE_PATH="/usr/lib/node_modules" or "/usr/local/lib/node_modules"');
  console.log('Or: export NODE_PATH="npm root"');
  process.exit(1);
}

// namespaces
var fs   = require('fs'),
  ugp  = require('uglify-js').parser,
  ugu  = require('uglify-js').uglify,
  csso = require('csso');

// defaults
var files = {
  'jquery.fenster.full.js': [
    'src/jquery.fenster.js',
    'src/jquery.fenster-helper.js',
    'src/jquery.fenster-helper-template-table.js',
    'jqEbony/jquery.ebony.js'
  ],
  'jquery.fenster.full.css': [
    'src/jquery.fenster.css',
    'jqEbony/fix-ie.css',
    'jqEbony/fix-ipad.css'
  ]
};

function getComment () {
  var version = '1.2.7',
    date = new Date(),
    buildDate = date.getFullYear() + '-' +
      (date.getMonth() >= 9 ? '' : '0') + (date.getMonth() + 1) + '-' +
      (date.getDate() >= 10 ? '' : '0') + date.getDate();

  return '/**\n' +
    ' * jqFenster - Lightweight Modal Framework\n' +
    ' * Version: ' + version + ' (' + buildDate + ')\n' +
    ' * https://github.com/kkamkou/jqFenster\n' +
    ' */\n';
}

// tasks
desc('Help')
task('default', function () { console.log("Run `jake --tasks`\n"); });

desc('build jqFenster')
task({
  'build': ['production/jquery.fenster.css', 'production/jquery.fenster.js']},
  function(){
    console.log('jqFenster build complete');
  }
);

desc('build jquery.fenster.full.css')
file(
  {'production/jquery.fenster.full.css': files['jquery.fenster.full.css']},
  function(){
    console.log('creating ' + this.name);

    var data = '';
    for (f in this.prereqs) {
      file = this.prereqs[f];
      console.log('\t' + file);
      data += '\n/* File: ' + file + ' */\n';
      data += fs.readFileSync(file);
    }

    fs.writeFileSync(this.name, getComment() + data);
  }
);

// Css
desc('optimize jquery.fenster.full.css');
file(
  {'production/jquery.fenster.css': ['production/jquery.fenster.full.css']},
  function () {
    console.log('optimizing jquery.fenster.css');

    var css_optimized = csso.justDoIt(fs.readFileSync('production/jquery.fenster.full.css').toString())
    fs.writeFileSync(this.name, getComment() + css_optimized);
  }
);

desc('build jquery.fenster.full.js')
file(
  {'production/jquery.fenster.full.js': files['jquery.fenster.full.js']},
  function () {
    console.log('building jquery.fenster.full.js');

    var strict = new RegExp('"use strict"\;?\n?'),
      jqFensterSet = files['jquery.fenster.full.js'];

    var data = '';
    for (f in jqFensterSet) {
      file = jqFensterSet[f];
      console.log('\t' + file);
      data += '\n\n/*\n * File: ' + file + '\n */\n\n';
      data += fs.readFileSync(file);
      data = data.replace(strict, '');
    }
    data = '(function($) {\n' + data + '\n})(jQuery);'; // add closure
    fs.writeFileSync(this.name, getComment() + data);
  }
);

// Js
desc('uglify jquery.fenster.js');
file(
  {'production/jquery.fenster.js': ['production/jquery.fenster.full.js']},
  function () {
    console.log('uglify jquery.fenster.js');

    var ast = ugp.parse(fs.readFileSync('production/jquery.fenster.full.js').toString());
    ast = ugu.ast_mangle(ast);
    ast = ugu.ast_squeeze(ast);

    var result = ugu.split_lines(ugu.gen_code(ast), 1024 * 8);
    fs.writeFileSync(this.name, getComment() + result);
  }
);
