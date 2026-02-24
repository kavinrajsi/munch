const gulp = require('gulp');
const { execSync } = require('child_process');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const minify = require('gulp-minify');
const { ESLint } = require('eslint');
const stylelint = require('stylelint');

gulp.task('style', function() {
  return gulp.src('dev/style/**/*.scss')
    .pipe(plumber())
    .pipe(sass({ api: 'modern-compiler', sassOptions: { style: 'compressed' } }))
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

gulp.task('lint:js', async function() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['dev/scripts/**/*.js']);
  const formatter = await eslint.loadFormatter('stylish');
  const output = formatter.format(results);
  if (output) console.log(output);
});

gulp.task('lint:css', async function() {
  const result = await stylelint.lint({
    files: 'dev/style/**/*.scss',
    formatter: 'string'
  });
  if (result.output) console.log(result.output);
});

gulp.task('lint', gulp.parallel('lint:js', 'lint:css'));

gulp.task('test', function(done) {
  var jest = require('jest');
  jest.run(['--config', JSON.stringify(require('./package.json').jest)]).then(function() {
    done();
  });
});

gulp.task('watch', function() {
  gulp.watch('dev/style/**/*.*', gulp.series('lint:css', 'style'));
  gulp.watch('dev/scripts/**/*.js', gulp.series('lint:js', 'scripts', 'product-scripts'));
});

gulp.task('test:structure', function(done) {
  execSync('npx jest tests/theme-structure.test.js tests/theme-sections.test.js tests/theme-locale.test.js tests/theme-assets.test.js', { stdio: 'inherit' });
  done();
});

gulp.task('test:shopify', function(done) {
  execSync('shopify theme check --fail-level error', { stdio: 'inherit' });
  done();
});

gulp.task('test:theme', gulp.series('test:structure', 'test:shopify'));

gulp.task('default', gulp.series('style', 'scripts', 'product-scripts', 'watch'));
