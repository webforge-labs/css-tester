/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      libs: {
        src: ['Gruntfile.js', 'index.js']
      }
    },

    release: {
       options: {
         bump: true,
         add: true, 
         commit: true,
         tag: true, 
         push: true, 
         pushTags: true, 
         npm: true, 
         commitMessage: 'release <%= version %>',
         tagMessage: 'Version <%= version %>'
       }
     }
  });

  grunt.registerTask('test', ['jshint']);
};
