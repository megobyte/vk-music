var gulp = require('gulp'),
watch = require('gulp-watch'),
clean = require('gulp-clean'),
less = require('gulp-less'),
connect = require('gulp-connect'),
fs = require('fs'),
crx = require('gulp-crx-pack'),
concat = require('gulp-concat');

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

gulp.task('clean', function() {
    return gulp.src(['./build/*', './dist/*'], {read: false})
    	.pipe(clean());
});

gulp.task('libJS', function () {
    return gulp.src([
            './bower_components/jquery/dist/jquery.js',
        ])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./build/'))
});

gulp.task('less', function () {
    return  gulp.src(['./src/vk_style.less'])
                .pipe(less())
				.on('error', handleError)
                .pipe(gulp.dest('./build'));
});

gulp.task('build', function() {
    return gulp.src([
        './src/*.js',
        './src/*.css',
        './src/*.json'
    ]).pipe(gulp.dest('./build'));
});

gulp.task('crx', ['libJS', 'less', 'build'], function() {
    var manifest = require('./build/manifest');

    return gulp.src('./build')
    .pipe(crx({
      privateKey: fs.readFileSync('./key/build.pem', 'utf8'),
      filename: manifest.name + '.crx'
    }))
    .pipe(gulp.dest('./dist'));
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
  });
});

gulp.task('default', ['libJS', 'less', 'build']);
gulp.task('dev', ['default', 'connect', 'watch']);
gulp.task('dist', ['clean'], function() {
    gulp.start('crx');
});
