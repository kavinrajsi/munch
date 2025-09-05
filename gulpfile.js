const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const minify = require('gulp-minify');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');

// Compile and process SCSS
gulp.task('style', function() {
  return gulp.src('dev/style/**/*.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer())
    .pipe(concat('base.css'))
    .pipe(gulp.dest('assets'));
});

// Minify JavaScript
gulp.task('scripts', function() {
  return gulp.src('scripts/global.js') // adjust path as needed
    .pipe(plumber())
    .pipe(concat('scripts.js'))
    .pipe(minify({
      ext: {
        min: '.min.js'
      },
      noSource: true
    }))
    .pipe(gulp.dest('assets'));
});

// Watch task
gulp.task('watch', function() {
  gulp.watch('dev/style/**/*.*', gulp.series('style'));
  gulp.watch('scripts/**/*.js', gulp.series('scripts'));
});

// Default task
gulp.task('default', gulp.series('style', 'scripts', 'watch'));
