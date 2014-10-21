'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']});

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        app: {
            path: 'app'
        },
        dist: {
            path: 'dist'
        },
        src: {
            path: 'src',
            testPath: 'spec'
        },

        pkg: grunt.file.readJSON('package.json'),

        // Empties folders to start fresh
        clean: [
            '<%= dist.path %>/*',
            '!<%= dist.path %>/.git*'
        ],

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: [
                    '<%= src.path %>/suit.js',
                    '<%= src.path %>/templates.js',
                    '<%= src.path %>/helpers.js',
                    '<%= src.path %>/restful_urls.js',
                    '<%= src.path %>/sync.js',
                    '<%= src.path %>/local_storage.js',
                    '<%= src.path %>/validations.js',
                    '<%= src.path %>/model.js',
                    '<%= src.path %>/collection.js',
                    '<%= src.path %>/view.js',
                    '<%= src.path %>/controller.js',
                    '<%= src.path %>/cache.js',
                    '<%= src.path %>/router.js',
                    '<%= src.path %>/can.js',
                    '<%= src.path %>/component.js',
                    '<%= src.path %>/components/*.js',
                    '<%= src.testPath %>/**/*.js',
                ],
                tasks: ['jshint']
            },
            jst: {
                files: ['<%= src.path %>/components/*.jst.ejs'],
                tasks: ['jst']
            },
            jstest: {
                files: ['spec/**/*_spec.js'],
                tasks: ['test:watch']
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                browser: true,
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= watch.js.files %>',
                '<%= watch.jstest.files %>',
                '!<%= src.path %>/templates.js',
                '!<%= src.testPath %>/helpers.js'
            ]
        },

        // Compile JST Templates.
        jst: {
            options: {
                processName: function (filename) {
                    return filename.replace('.jst.ejs', '').replace('src/components/', 'suit/components/');
                }
            },
            compile: {
                files: [{
                    '<%= src.path %>/templates.js': ['<%= watch.jst.files %>']
                }]
            }
        },

        // Test Server
        connect: {
            options: {
                hostname: '*'
            },
            test: {
                options: {
                    port: 9001
                }
            }
        },

        // Jasmine testing framework configuration options
        jasmine: {
            all: {
                src: ['<%= watch.js.files %>'],
                options: {
                    specs: '<%= watch.jstest.files %>',
                    vendor: [
                        'bower_components/jquery/dist/jquery.js',
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/backbone-relational/backbone-relational.js',
                        'bower_components/rivets/dist/rivets.min.js',
                        'bower_components/momentjs/moment.js',
                        'bower_components/moment-timezone/moment-timezone.js',
                        'bower_components/underscore.string/dist/underscore.string.min.js',
                        'bower_components/underscore.inflection/lib/underscore.inflection.js',
                        'bower_components/pikaday/pikaday.js',
                        'bower_components/jquery-timepicker-jt/jquery.timepicker.js',
                        'bower_components/skidding--dragdealer/src/dragdealer.js',
                        'bower_components/videojs/dist/video-js/video.js',
                        'bower_components/d3/d3.js',
                        'bower_components/nvd3/nv.d3.js',
                        'bower_components/typeahead.js/dist/bloodhound.js',
                        'bower_components/typeahead.js/dist/typeahead.bundle.js',
                    ],
                    helpers: [
                        'bower_components/sinon/lib/sinon.js',
                        'bower_components/sinon/lib/sinon/spy.js',
                        'bower_components/sinon/lib/sinon/stub.js',
                        'bower_components/sinon/lib/sinon/call.js',
                        'bower_components/sinon/lib/sinon/mock.js',
                        'bower_components/sinon/lib/sinon/collection.js',
                        'bower_components/sinon/lib/sinon/assert.js',
                        'bower_components/sinon/lib/sinon/sandbox.js',
                        'bower_components/sinon/lib/sinon/test.js',
                        'bower_components/sinon/lib/sinon/test_case.js',
                        'bower_components/sinon/lib/sinon/assert.js',
                        'bower_components/sinon/lib/sinon/match.js',
                        'bower_components/sinon/lib/sinon/util/*.js',
                        'bower_components/jasmine-sinon/lib/jasmine-sinon.js',
                        'spec/helpers.js'
                    ],
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'coverage/coverage.json',
                        report: [
                            {
                                type: 'html',
                                options: {
                                    dir: 'coverage/html'
                                }
                            },
                            {
                                type: 'text-summary'
                            }
                        ]
                    }
                }
            }
        },

        // Concatenate all of the js files from source into
        concat: {
            '<%= dist.path %>/suit.js': '<%= src.path %>/**/*.js'
        },

        uglify: {
            '<%= dist.path %>/suit.min.js': '<%= dist.path %>/suit.js'
        },

        jsdoc: {
            dist: {
                src: ['<%= src.path %>/**/*.js', 'README.md'],
                options: {
                    destination: 'dist/docs',
                    template: 'node_modules/ink-docstrap/template'
                }
            }
        }

    });

    grunt.registerTask('test', function (target) {
        var tasks = [
            'jst',
            'jshint'
        ];

        if (target === 'watch') {
            tasks.push('jasmine');
        } else if (target === 'browser') {
            tasks.push('jasmine:all:build', 'connect:test:keepalive');
        } else {
            tasks.push('jasmine', 'watch');
        }

        console.log(tasks);
        grunt.task.run(tasks);
    });

    grunt.registerTask('build', [
        'clean',
        'jst',
        'jshint',
        'jasmine',
        'concat',
        'uglify',
        'jsdoc'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};