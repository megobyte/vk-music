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
            './bower_components/jquery/dist/jquery.js',
        ])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./build/'))
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
    gulp.src(['./src/*']).pipe(gulp.dest('./build'));
    return;
});

gulp.task('less', function () {
    return  gulp.src(['./src/vk_style.less'])
                .pipe(less())
				.on('error', handleError)
                .pipe(gulp.dest('./build'));
});

gulp.task('watch', function () {
    gulp.watch('./src/*.less', ['less', 'build']);
    gulp.watch('./src/*.js', ['libJS', 'build']);
    gulp.watch('./src/manifest.json', ['build']);
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
