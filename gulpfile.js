const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const minify = require('gulp-minify');

// Compile and process SCSS
gulp.task('style', function() {
  return gulp.src('dev/style/**/*.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer())
    .pipe(concat('base.css'))
    .pipe(gulp.dest('assets'));
});

// Bundle JavaScript (order matters: shop-core first, init last)
gulp.task('scripts', function() {
  return gulp.src([
      // 'dev/scripts/shop-core.js',
      // 'dev/scripts/cart-utils.js',
      // 'dev/scripts/cart-drawer.js',
      // 'dev/scripts/menu-toggle.js',
      // 'dev/scripts/search-toggle.js',
      // 'dev/scripts/product-gallery.js',
      // 'dev/scripts/slider.js',
      'dev/scripts/init.js'
    ])
    .pipe(plumber())
    .pipe(concat('global.js'))
    .pipe(minify({ ext: { min: '.js' }, noSource: true }))
    .pipe(gulp.dest('assets'));
});

// Product page JS (loaded after PhotoSwipe, separate from global)
gulp.task('product-scripts', function() {
  return gulp.src('dev/scripts/product-page.js')
    .pipe(plumber())
    .pipe(concat('product-page.js'))
    .pipe(minify({ ext: { min: '.js' }, noSource: true }))
    .pipe(gulp.dest('assets'));
});

// Watch task
gulp.task('watch', function() {
  gulp.watch('dev/style/**/*.*', gulp.series('style'));
  gulp.watch('dev/scripts/**/*.js', gulp.series('scripts', 'product-scripts'));
});

// Default task
gulp.task('default', gulp.series('style', 'scripts', 'product-scripts', 'watch'));
