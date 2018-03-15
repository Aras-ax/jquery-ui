var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-minify-css'),
    cleanCSS = require('gulp-clean-css'),
    connect = require('gulp-connect');

gulp.task('uglifyJS', function() {
    gulp.src(['./src/demo/jquery-1.12.4.min.js','./src/demo/prettify.min.js', './src/lib/reasy-ui.js', './src/lib/BaseComponent.js', './src/lib/FormInput.js', './src/lib/FormCheckbox.js', './src/lib/FormCheckList.js', './src/lib/FormRadioList.js', './src/lib/FormDropDownList.js', './src/lib/FormSelect.js', './src/lib/FormCalendar.js', './src/lib/FormList.js', './src/lib/FormTab.js', './src/lib/FormTable.js', './src/lib/FormMultiInput.js', './src/lib/FormPercent.js', './src/lib/FormUpload.js', './src/lib/ComponentManage.js','./src/lib/ModalDialog.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('componment.js'))
    // .pipe(uglify())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));

    gulp.src(['./src/demo/main.js', './src/demo/js/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('uglifyJS1', function() {
    gulp.src(['./src/demo/jquery-1.12.4.min.js','./src/demo/prettify.min.js', './src/lib/reasy-ui.js', './src/lib/BaseComponent.js', './src/lib/FormInput.js', './src/lib/FormCheckbox.js', './src/lib/FormCheckList.js', './src/lib/FormRadioList.js', './src/lib/FormDropDownList.js', './src/lib/FormSelect.js', './src/lib/FormCalendar.js', './src/lib/FormList.js', './src/lib/FormTab.js', './src/lib/FormTable.js', './src/lib/FormMultiInput.js', './src/lib/FormPercent.js', './src/lib/FormUpload.js', './src/lib/ComponentManage.js','./src/lib/ModalDialog.js'])
    .pipe(concat('componment.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('dist/js'));

    gulp.src(['./src/demo/main.js', './src/demo/js/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('minifyCss', function() {
    gulp.src(['./src/demo/*.scss','./src/demo/*.css','./src/lib/css/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(concat('min.css'))     
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minifyCss1', function() {
    gulp.src(['./src/demo/*.scss','./src/demo/*.css','./src/lib/css/*.scss'])
        .pipe(concat('min.css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('other', function(){
    gulp.src(['./src/demo/*.html']).pipe(gulp.dest('dist'));
    gulp.src(['./src/demo/main.js']).pipe(gulp.dest('dist/js'));
    gulp.src(['./src/demo/js/*.js']).pipe(gulp.dest('dist/js'));
    gulp.src(['./src/lib/css/icon-font/*']).pipe(gulp.dest('dist/css/icon-font'));
    gulp.src(['./src/lib/css/icon-font/fonts/*']).pipe(gulp.dest('dist/css/icon-font/fonts'));
    gulp.src(['./src/demo/data/*']).pipe(gulp.dest('dist/data'));
});

// 监视文件改动并重新载入
gulp.task('connect',function(){
    connect.server({
        root:'./dist',  
        ip:'127.0.0.1',
        port: '8088',
        livereload:true
    })
});

gulp.task('watch',function(){
    gulp.watch(['src/**', './gulpfile.js'], ['default']);
});

gulp.task('server',['connect', 'watch']);

gulp.task('default',['minifyCss', 'uglifyJS', 'other']);

gulp.task('product',['minifyCss1', 'uglifyJS1', 'other']);