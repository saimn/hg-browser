var browserify = require('gulp-browserify');
var clean = require('gulp-clean');
var gulp = require('gulp');
var react = require('gulp-react');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

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

gulp.task('watch', ['clean'], function() {
  var watching = false;
  gulp.start('react', function() {
    if (!watching) {
      watching = true;
      // gulp.watch('static/**/*.js', ['javascript']);
    }
  });
});

gulp.task('javascript', function() {
  return gulp.src('static/**/*.js')
    .pipe(react())
    .pipe(gulp.dest('static/build/js/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('static/build/js/'));
});

gulp.task('browserify', function() {
  return gulp.src('static/build/app.js')
    .pipe(browserify({transform: ['reactify']}))
    .pipe(rename('compiled.js'))
    .pipe(gulp.dest('static/build/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('static/build/'));
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
