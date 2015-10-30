var config = require("grunt-settings");

module.exports = function (grunt) {
  config.init(grunt);

  config.set("pkg", grunt.file.readJSON("package.json"));

  config.set("mocha", {
    all: {
      src: ["spec/index.html"]
    },

    options: {
      run: true
    }
  });

  config.set("meta.banner",
    '/*! <%= pkg.name %> v<%= pkg.version %> | ' +
    '(c) 2014, <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> |' +
    ' <%= pkg.author.url %> */'
  );

  config.set("browserify.dist", {
    files: {
      "dist/fluxo.js": ["src/fluxo.js"]
    },
    options: {
      banner: "<%= meta.banner %>",
      browserifyOptions: {
        standalone: "Fluxo"
      }
    }
  });

  config.set("clean.dist.src", ["dist"]);

  config.set("uglify.dist", {
    options: {
      banner: "<%= meta.banner %>",
      sourceMap: true,
      sourceMapName: "dist/fluxo.map"
    },
    files: {
      "dist/fluxo.min.js": "dist/fluxo.js"
    }
  });

  config.set("watch.scripts", {
    files: ["src/*.js"],
    tasks: ["build"]
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-mocha");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-browserify");

  config.registerTask("build", [
    "clean:dist",
    "browserify:dist",
    "uglify:dist"
  ]);

  grunt.registerTask("test", ["build", "mocha"]);
};
