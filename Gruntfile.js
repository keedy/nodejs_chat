module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: {
      app_source: ['*.js', '!Gruntfile.js'],
      assets: 'assets/',
      assets_dest: 'public/<%= pkg.name %>',
      tests: 'tests/',
      views: 'views/*.twig',
      banner: '/*!\n* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + 
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.author.homepage ? "* " + pkg.author.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= pkg.license %> \n*/\n',
    },
    uglify: {
      options: {
        banner: '<%= config.banner %>', 
        preserveComments: 'some'
      },
      dist: {
        files: {
          '<%= config.assets_dest %>.min.js': ['<%= config.assets %>*.js']
        }
      }
    },
    cssmin: {
      add_banner: {
        options: {
          banner: '<%= config.banner %>'
        },
        files: {
          '<%= config.assets_dest %>.min.css': ['<%= config.assets %>*.css']
        }
      }
    },
    jshint: {
      files: ['<%= config.app_source %>'],
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
    qunit: {
      files: ['<%= config.tests %>qunit/*_test.html']
    },
    nodeunit: {
      files: ['<%= config.tests %>nodeunit/*_test.js']
    },
    watch: {
      files: ['<%= config.assets %>/*.{js,css,png,jpg,jpeg}', '<%= config.app_source %>', '<%= config.views %>'],
      tasks: ['minify', 'valid'],
      options: {
        livereload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['workon']);
  grunt.registerTask('minify', 'Minify all assets', ['uglify', 'cssmin']);
  grunt.registerTask('valid', 'Validate for correct JS', ['jshint']);
  grunt.registerTask('test', 'Run all tests', ['qunit', 'nodeunit']);
  grunt.registerTask('workon', 'Prepare app and starts servers', ['minify', 'run-servers', 'watch']);
  grunt.registerTask('run-servers', 'Run all required server and watch', function() {
    grunt.util.spawn({
      cmd: 'redis-server'
    });
    grunt.util.spawn({
      cmd: 'node',
      args: ['server.js']
    });
  });

  // TODO
  grunt.registerTask('restart-servers', 'Restart all servers', function() { // WINDOWS WAY...
    grunt.util.spawn({
      cmd: 'cmd /C restart-servers.bat' // Windows
      // cmd: 'sh restart-servers.sh' // *NIX
    });
  });
};
