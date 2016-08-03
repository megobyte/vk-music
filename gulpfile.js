var gulp = require('gulp'),
watch = require('gulp-watch'),
less = require('gulp-less'),
pug = require('gulp-pug'),
connect = require('gulp-connect'),
concat = require('gulp-concat');

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

gulp.task('libJS', function () {
    return gulp.src([
            './_default.js',
            './my.js',
            './bower_components/gsap/src/minified/TweenLite.min.js',
            './bower_components/gsap/src/minified/TweenMax.min.js',
            './bower_components/gsap/src/minified/jquery.gsap.min.js',
            './bower_components/gsap/src/minified/easing/EasePack.min.js',
            './bower_components/gsap/src/minified/plugins/ColorPropsPlugin.min.js',
            './bower_components/gsap/src/minified/plugins/CSSRulePlugin.min.js',
            './bower_components/gsap/src/minified/plugins/EaselPlugin.min.js',
            './bower_components/gsap-pixi-plugin/PixiPlugin.js',

            './assets/js/models.js',
            './assets/js/stage.js',
            './assets/js/stages/*.js',
            './assets/js/stages/mobile/*.js'
        ])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./build/assets/js/'))
});

gulp.task('index', function () {
    return gulp.src([
            './header.html',
            './content.html',
            './spy.html',
            './footer.html'
        ])
        .pipe(concat('index.html'))
        .pipe(gulp.dest('./build/'))
});

gulp.task('pug', function () {
    return gulp.src(['*.pug'])
               .pipe(
                   pug({
                       pretty:true,
                       indent: 4
                   }).on('error', function(err) {
                       console.log(err);
                   })
                )
               .pipe(gulp.dest('build'));

});

gulp.task('index_test', function () {
    return gulp.src([
            './header.html',
            './content.html',
            './footer.html'
        ])
        .pipe(concat('index.html'))
        .pipe(gulp.dest('./build/'))
});

gulp.task('build', function() {
    gulp.src(['./assets/**/*']).pipe(gulp.dest('./build/assets'));
    gulp.src(['./bower_components/**/*']).pipe(gulp.dest('./build/bower_components'));
    gulp.src(['./partials/**/*']).pipe(gulp.dest('./build/partials'));
    gulp.src(['./robots.txt']).pipe(gulp.dest('./build'));
    gulp.src(['./favicon.ico']).pipe(gulp.dest('./build'));
    return;
});

gulp.task('less', function () {
    return  gulp.src(['./assets/less/style.less'])
                .pipe(less())
				.on('error', handleError)
                .pipe(gulp.dest('./assets/css/'));
});

gulp.task('watch', function () {
    gulp.watch('./assets/less/*.less', ['less', 'build']);
    gulp.watch('./assets/**/*', ['libJS', 'build']);
    gulp.watch('./partials/**/*', ['build']);
    gulp.watch('./*.html', ['build', 'index_test']);
    gulp.watch('./*.pug', ['pug']);
});

gulp.task('connect', function(){
  connect.server({
    root: './build/',
    fallback: './build/index.html',
    // livereload: true
    // fallback: 'build/index.html'
    /*middleware: function(connect, opt) {
      return [ history() ];
    }*/
  });
});

gulp.task('default', ['libJS', 'less', 'build', 'pug']);
gulp.task('test', ['libJS', 'less', 'build', 'pug']);
gulp.task('dev', ['test', 'connect', 'watch']);
