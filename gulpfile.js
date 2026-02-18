const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const minify = require('gulp-minify');

gulp.task('style', function() {
  return gulp.src('dev/style/**/*.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer())
    .pipe(concat('base.css'))
    .pipe(gulp.dest('assets'));
});

gulp.task('scripts', function() {
  return gulp.src(['dev/scripts/init.js'])
    .pipe(plumber())
    .pipe(concat('global.js'))
    .pipe(minify({ ext: { min: '.js' }, noSource: true }))
    .pipe(gulp.dest('assets'));
});

gulp.task('product-scripts', function() {
  return gulp.src('dev/scripts/product-page.js')
    .pipe(plumber())
    .pipe(concat('product-page.js'))
    .pipe(minify({ ext: { min: '.js' }, noSource: true }))
    .pipe(gulp.dest('assets'));
});

gulp.task('watch', function() {
  gulp.watch('dev/style/**/*.*', gulp.series('style'));
  gulp.watch('dev/scripts/**/*.js', gulp.series('scripts', 'product-scripts'));
});

gulp.task('default', gulp.series('style', 'scripts', 'product-scripts', 'watch'));
