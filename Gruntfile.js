
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
          }
        },
        files: [
          { cwd: '.tmp', src: ['*.jade'], dest: 'build/tutorials', expand: true, ext: '.html' }
        ]
      },
      pages: {
        options: {
          data: function(dest, src) {
            if (dest.match(/tutorials\.html$/))
              return {
                topics: tutorialsList
              };
          }
        },
        files: [
          { cwd: 'pages', src: ['*.jade'], dest: 'build', expand: true, ext: '.html' }
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
          { src: 'assets/css/*.less', dest: 'build/css/style.css' }
        ]
      }
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
        files: ['assets/css/*.less'],
        tasks: ['less']
      },
      tutorials: {
        files: ['tutorials/*.md'],
        tasks: ['assembleTutorials', 'jade:tutorials']
      },
      pages: {
        files: ['pages/*.jade'],
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

    var marked = require('marked');
    marked.setOptions({
      highlight: function (code, lang, cb) {
        console.log(code, lang, cb);
        return require('highlight.js').highlightAuto(code).value;
      }
    });

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

  grunt.registerTask('build', ['bower:install', 'assembleTutorials', 'jade', 'less']);
  grunt.registerTask('dev', ['build', 'connect:dev', 'watch']);
  grunt.registerTask('default', ['build', 'connect:server']);

};

