/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
      src: 'src/',
      dest: 'public/<%= pkg.name %>',
      tests: 'tests/'
    },
    banner: '/*!\n* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + 
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.author.homepage ? "* " + pkg.author.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> \n*/\n',
    uglify: {
      options: {
        banner: '<%= banner %>',
        preserveComments: 'some'
      },
      dist: {
        files: {
          '<%= dirs.dest %>.min.js': ['<%= dirs.src %>*.js']
        }
      }
    },
    cssmin: {
      add_banner: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          '<%= dirs.dest %>.min.css': ['<%= dirs.src %>*.css']
        }
      }
    },
    qunit: {
      files: ['<%= dirs.tests %>*.html']
    },
    jshint: {
      files: ['Gruntgile.js', '<%= dirs.src %>*.js', '<%= dirs.tests %>*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        expr: true,
        immed: true,
        freeze: true,
        latedef: true,
        node: true,
        newcap: true,
        noarg: true,
        nonew: true,
        maxparams: 4,
        maxdepth: 4,
        sub: true,
        strict: true,
        undef: true,
        unused: true,
        boss: true
      },
      globals: {
        console: true,
        socket: true,
        logged: true
      }
    },
    nodeunit: {
      files: ['<%= dirs.tests %>*_test.js']
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'qunit', 'jshint', 'nodeunit', 'watch']);
  grunt.registerTask('minify', ['uglify', 'cssmin']);
  grunt.registerTask('test', ['nodeunit']);
};
