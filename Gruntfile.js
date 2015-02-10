
var tutorialsList = {};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jade: {
      tutorials: {
        options: {
          data: function(dest, src) {
            return tutorialsList[src[0]];
          }
        },
        files: [
          { cwd: '.tmp', src: ['*.jade'], dest: 'build/tutorials', expand: true, ext: '.html' }
        ]
      },
      pages: {
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
        tasks: ['jade:pages']
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

    this.files.forEach(function(file) {
      var data = grunt.file.read(file.src[0]).split('}\n\n');
      var header;

      try {
        header = JSON.parse(data[0] + '}');
      } catch (e) {
        return grunt.log.error('Failed to parse header of `' + file.src[0] +
                               '`, skipping (' + e.message + ')');
      }

      tutorialsList[file.dest] = header;

      grunt.file.write(file.dest, template.replace('{{tutorial}}', marked(data[1])));
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

