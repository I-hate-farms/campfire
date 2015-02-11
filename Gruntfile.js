var highlight = require('highlight.js');
var marked = require('marked');

marked.setOptions({
  highlight: function (code, lang) {
    if (lang)
      return highlight.highlight(lang, code, true).value;

    return highlight.highlightAuto(code).value;
  }
});

var tutorialsData = {};
var tutorialsList = {};
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jade: {
      tutorials: {
        options: {
          data: function(dest, src) {
            return tutorialsData[src[0]];
          },
          pretty: true
        },
        files: [
          { cwd: '.tmp', src: ['*.jade'], dest: 'build/tutorials', expand: true, ext: '.html' }
        ]
      },
      pages: {
        options: {
          pretty: true,
          filters: {
            highlight: function(str) {
              var hl = highlight.highlightAuto(str).value;
              return '<pre><code>' + hl + '</code></pre>';
            },
            vala: function(str) {
              var hl = highlight.highlight('vala', str, true).value;
              return '<pre><code>' + hl + '</code></pre>';
            }
          },
          data: function(dest, src) {
            if (dest.match(/tutorials\.html$/))
              return {
                topics: tutorialsList
              };
          }
        },
        files: [
          { cwd: 'pages', src: ['**/*.jade'], dest: 'build', expand: true, ext: '.html' }
        ]
      }
    },

    assembleTutorials: {
      compile: {
        files: [
          // { src: 'tutorials/*.md', dest: 'build/.tmp/tutorials/*.jade' }
          {
            expand: true,
            cwd: 'tutorials/',
            src: ['*.md'],
            dest: '.tmp',
            ext: '.jade'
          }
        ]
      }
    },

    less: {
      compile: {
        files: [
          { src: 'assets/style/*.less', dest: 'build/style/style.css' }
        ]
      }
    },

    copy: {
      images: {
        files: [
          { expand: true, 
            cwd: 'assets/images', 
            src: ['**'], 
            dest: 'build/images/'},
        ],
      },
    },
    
    bower: {
      install: {
        options: {
          targetDir: './build/vendor'
        }
      }
    },

    watch: {
      less: {
        files: ['assets/style/*.less'],
        tasks: ['less']
      },
      copy: {
        files: ['assets/images/*.*'],
        tasks: ['copy']
      },
      tutorials: {
        files: ['tutorials/*.md'],
        tasks: ['assembleTutorials', 'jade:tutorials']
      },
      pages: {
        files: ['pages/**/*.jade'],
        // we need the tutorial list to generate pages, so
        // we have to run that task as well
        tasks: ['assembleTutorials', 'jade:pages']
      },
      layout: {
        files: ['layout/*.jade'],
        tasks: ['jade']
      }
    },

    connect: {
      server: {
        options: {
          base: 'build',
          keepalive: true
        }
      },
      dev: {
        options: {
          base: 'build'
        }
      }
    }

  });

  grunt.registerMultiTask('assembleTutorials', 'Creates jade files for each tutorial', function() {

    function getIndentAt(text, needle) {
      var index = text.indexOf(needle);
      var c, end = index;

      while ((c = text.charAt(index)) && c != '\n')
        index--;

      return text.substring(index + 1, end);
    }

    function getBaseName(path) {
      var parts = path.split('/');
      parts = parts[parts.length - 1].split('.');
      return parts[0];
    }

    var template = grunt.file.read(__dirname + '/layout/tutorial.jade');
    var templateIndent = getIndentAt(template, '{{tutorial}}');

    this.files.forEach(function(file) {
      var data = grunt.file.read(file.src[0]).split('}\n\n');
      var content = data.slice(1).join('}\n\n');
      var header;

      try {
        header = JSON.parse(data[0] + '}');
      } catch (e) {
        return grunt.log.error('Failed to parse header of `' + file.src[0] +
                               '`, skipping (' + e.message + ')');
      }

      var section = header.section || 'Other';
      header.url = '/tutorials/' + getBaseName(file.dest) + '.html';

      tutorialsData[file.dest] = header;
      if (!tutorialsList[section])
        tutorialsList[section] = [];

      tutorialsList[section].push(header);

      var out = template.replace('{{tutorial}}', marked(content).replace(/\n/g, '\n' + templateIndent));
      grunt.file.write(file.dest, out);
    });
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('build', ['bower:install', 'assembleTutorials', 'jade', 'less', 'copy']);
  grunt.registerTask('dev', ['build', 'connect:dev', 'watch']);
  grunt.registerTask('default', ['build', 'connect:server']);

};

