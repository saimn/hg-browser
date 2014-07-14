var browserify = require('browserify');
var clean = require('gulp-clean');
var gulp = require('gulp');
var react = require('gulp-react');
// var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

gulp.task('default', ['clean'], function() {
  return gulp.start('browserify');
});

gulp.task('clean', function() {
  return gulp.src(['static/build/*'], {read: false})
    .pipe(clean());
});

gulp.task('react', function(){
  return gulp.src('static/app.js')
    .pipe(react())
    .pipe(gulp.dest('static/build/'));
});

gulp.task('browserify', function() {
  return browserify('./static/app.js')
  .bundle({debug: true})
  .on('error', function (err) {
    console.log(err.toString());
    this.emit("end");
  })
  .pipe(source('app.js'))
  .pipe(gulp.dest('./static/build'));
});

gulp.task('watch', function() {
  var bundler = watchify('./static/app.js');
  bundler.transform('reactify');
  bundler.on('update', rebundle);

  function rebundle () {
    return bundler.bundle()
      .on('error', function(e) {
        console.log('Browserify Error', e);
      })
      .pipe(source('app.js'))
      .pipe(gulp.dest('./static/build'));
  }

  return rebundle();
});

// var less = require('gulp-less');
// var minifycss = require('gulp-minify-css');

// gulp.task('styles', function() {
//   return gulp.src('frontend/**/*.less')
//     .pipe(less())
//     .pipe(gulp.dest('build/'))
//     .pipe(minifycss())
//     .pipe(rename({suffix: '.min'}))
//     .pipe(gulp.dest('build/'));
// });
