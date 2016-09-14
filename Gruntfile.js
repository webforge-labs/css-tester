/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      libs: {
        src: ['Gruntfile.js', 'index.js']
      }
    },

    simplemocha: {
      options: {
        timeout: 2000,
        ignoreLeaks: true,  // globals hack for jquery in node
        ui: 'bdd',
        reporter: 'spec'
      },

      all: { src: ['test/**/*Test.js'] }
    },

    connect: {
      example: {
        port: 8000,
        base: 'test/files'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('server', ['connect']);
  grunt.registerTask('test', ['jshint', 'simplemocha']);
};
