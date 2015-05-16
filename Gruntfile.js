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

  config.set("clean.dist.src", ["dist"]);

  config.set("concat.dist", {
    src: ["dist/fluxo.js"],
    dest: "dist/fluxo.js",
    options: {
      banner: "<%= meta.banner %>\n",
    }
  });

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

  config.set("includereplace.dist", {
    src: "src/fluxo.js",
    dest: "dist/fluxo.js"
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-mocha");
  grunt.loadNpmTasks("grunt-include-replace");
  grunt.loadNpmTasks("grunt-contrib-watch");

  config.registerTask("build", [
    "clean:dist",
    "includereplace:dist",
    "concat:dist",
    "uglify:dist"
  ]);

  grunt.registerTask("test", ["build", "mocha"]);
};
