
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
    var marked = require('marked');
    var template = grunt.file.read(__dirname + '/layout/tutorial.jade');

    function getBaseName(path) {
      var parts = path.split('/');
      parts = parts[parts.length - 1].split('.');
      return parts[0];
    }

    this.files.forEach(function(file) {
      var data = grunt.file.read(file.src[0]).split('}\n\n');
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

      grunt.file.write(file.dest, template.replace('{{tutorial}}', marked(data[1]).replace(/\n/g, '')));
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

