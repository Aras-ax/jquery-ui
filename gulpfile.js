let gulp = require('gulp'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-minify-css'),
    cleanCSS = require('gulp-clean-css'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

gulp.task('uglifyJS', function() {
    gulp.src(['./src/demo/jquery-1.12.4.min.js','./src/demo/prettify.min.js', './src/lib/reasy-ui.js', './src/lib/BaseComponent.js', './src/lib/FormInput.js', './src/lib/FormCheckbox.js', './src/lib/FormCheckList.js', './src/lib/FormRadioList.js', './src/lib/FormDropDownList.js', './src/lib/FormSelect.js', './src/lib/FormCalendar.js', './src/lib/FormList.js', './src/lib/FormTab.js', './src/lib/FormTable.js', './src/lib/ComponentManage.js','./src/lib/ModalDialog.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('componment.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('uglifyJS1', function() {
    gulp.src(['./src/demo/jquery-1.12.4.min.js','./src/demo/prettify.min.js', './src/lib/reasy-ui.js', './src/lib/BaseComponent.js', './src/lib/FormInput.js', './src/lib/FormCheckbox.js', './src/lib/FormCheckList.js', './src/lib/FormRadioList.js', './src/lib/FormDropDownList.js', './src/lib/FormSelect.js', './src/lib/FormCalendar.js', './src/lib/FormList.js', './src/lib/FormTab.js', './src/lib/FormTable.js', './src/lib/ComponentManage.js','./src/lib/ModalDialog.js'])
    .pipe(concat('componment.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('minifyCss', function() {
    gulp.src(['./src/demo/*.scss','./src/demo/*.css','./src/css/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(concat('min.css'))     
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minifyCss1', function() {
    gulp.src(['./src/demo/*.scss','./src/demo/*.css','./src/css/*.scss'])
        .pipe(concat('min.css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('other', function(){
    gulp.src(['./src/demo/index.html']).pipe(gulp.dest('dist'));
    gulp.src(['./src/demo/main.js']).pipe(gulp.dest('dist/js'));
    gulp.src(['./src/css/icon-font/*']).pipe(gulp.dest('dist/css/icon-font'));
    gulp.src(['./src/css/icon-font/fonts/*']).pipe(gulp.dest('dist/css/icon-font/fonts'));
    gulp.src(['./src/data/*']).pipe(gulp.dest('dist/data'));
});

// 监视文件改动并重新载入
gulp.task('serve', function() {
    browserSync({
      server: {
        baseDir: './dist'
      }
    });
  
    gulp.watch(['src/*/*.html', 'src/*/*.css', 'src/*/*.sass', 'src/*/*.js', 'src/*/*.json'], ['default'], function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
    
  });

gulp.task('default',['minifyCss', 'uglifyJS', 'other']);

gulp.task('product',['minifyCss1', 'uglifyJS1', 'other']);