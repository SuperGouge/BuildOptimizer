var del = require("del");
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var autoprefixer = require("gulp-autoprefixer");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache");
var minifycss = require("gulp-minify-css");
var less = require("gulp-less");
var browserSync = require("browser-sync").create();
var bower = require("gulp-bower");
var nodemon = require("gulp-nodemon");
var sourcemaps = require("gulp-sourcemaps");
var order = require("gulp-order");
var concat = require("gulp-concat");
var inject = require("gulp-inject");
var flatten = require("gulp-flatten");
var merge = require("merge-stream");

var config = require("./config/config");

var src = {
    less: "content/less/**/*.less",
    js: "app/**/*.js",
    jade: "views/**/*.jade",
    html: "app/**/*.html",
    img: "content/img/**/*",
    fonts: "content/fonts/**/*",
    bower: "bower_components"
}

var publicDir = "public";
var dist = {
    all: publicDir + "/**/*",
    css: publicDir,
    js: publicDir + "/app/",
    html: publicDir + "/app/",
    img: publicDir + "/img/",
    fonts: publicDir + "/fonts/",
    vendors: publicDir + "/vendors/"
}

gulp.task("bower", function() {
    return bower();
});

gulp.task("bower-move", ["bower"], function() {
    var base = {
        bootstrap: src.bower + "/bootstrap/dist/",
        fontawesome: src.bower + "/font-awesome/"
    };
    
    var angular = gulp.src([src.bower + "/angular/*.{css,min.js?(.map)}", src.bower + "/angular-*/angular-*.min.js?(.map)"])
        .pipe(flatten())
        .pipe(gulp.dest(dist.vendors + "/angular/"));
    
    var angularUi = gulp.src([src.bower + "/angular-bootstrap/ui-bootstrap-csp.css", src.bower + "/angular-bootstrap/ui-bootstrap-tpls.min.js"])
        .pipe(gulp.dest(dist.vendors + "/angular-ui/"));

    var bootstrap = gulp.src([base.bootstrap + "/css/*.{min.css,css.map}", base.bootstrap + "/fonts/*.*"], { base: base.bootstrap })
        .pipe(gulp.dest(dist.vendors + "/bootstrap/"));

    var fontawesome = gulp.src([base.fontawesome + "/css/*.{min.css,css.map}", base.fontawesome + "/fonts/*.*"], { base: base.fontawesome })
        .pipe(gulp.dest(dist.vendors + "/font-awesome/"));

    return merge(angular, angularUi, bootstrap, fontawesome);
});

gulp.task("nodemon", ["build"], function(cb) {
    var called = false;
    return nodemon({
        script: "bin/www",
        watch: ["bin/www", "app.js", "routes/**/*.js", "controllers/**/*.js", "config/**/*.js", "lib/**/*"],
        ignore: ["public/", "app/**"]
    })
    .on("start", function() {
        if (!called) {
            cb();
            called = true;
        }
    })
    .on("restart", function() {
        setTimeout(function() {
            browserSync.reload({ stream: false });
        }, 500);
    });
});

gulp.task("browser-sync", ["nodemon", "build"], function() {
    return browserSync.init({
        proxy: "localhost:" + config.port
    });
});

gulp.task("html", function() {
    return gulp.src(src.html)
        .pipe(gulp.dest(dist.html));
});

gulp.task("img", function() {
    return gulp.src(src.img)
      .pipe(gulp.dest(dist.img));
});

gulp.task("fonts", function() {
    return gulp.src(src.fonts)
        .pipe(gulp.dest(dist.fonts));
});

gulp.task("less", function() {
    return gulp.src(src.less)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error);
                this.emit("end");
            }
        }))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(less())
        .pipe(rename({ suffix: ".min" }))
        .pipe(autoprefixer())
        .pipe(minifycss())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(dist.css))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task("js", function() {
    return gulp.src(src.js)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error);
                this.emit("end");
            }
        }))
        .pipe(order(["app.js", "/**/*.js"]))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(dist.js))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task("inject", ["bower-move", "js", "less"], function() {
    return gulp.src("./views/layout.jade")
        .pipe(inject(gulp.src([dist.vendors + "/**/*.js", dist.vendors + "/**/*.css"], { read: false })
            .pipe(order(["angular/angular.min.js", "angular/angular-*.min.js"])), { name: "vendors", ignorePath: "/public" }))
        .pipe(inject(gulp.src([dist.js + "/app.min.js", dist.css + "/style.min.css"], { read: false }), { ignorePath: "/public" }))
        .pipe(gulp.dest("./views"));
});

gulp.task("clean", function(cb) {
    del(dist.all, cb);
});

gulp.task("build", ["inject", "html", "img", "fonts"]);

gulp.task("default", ["build", "browser-sync"], function() {
    gulp.watch(src.less, ["less"]);
    gulp.watch(src.js, ["js"]);
    gulp.watch(src.jade).on("change", browserSync.reload);
    gulp.watch(src.html, ["html"]).on("change", browserSync.reload);
});