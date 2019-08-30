var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var uglifycss = require('gulp-uglifycss');
var autoprefixer = require('gulp-autoprefixer');
var minifyHtml = require("gulp-minify-html");
var imagemin = require('gulp-imagemin');
var domSrc = require('gulp-dom-src');
var cheerio = require('gulp-cheerio');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var clean = require('gulp-clean');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// js语法检查
gulp.task('jshint', function()
{
    return gulp.src(['app/static/Main/js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 合并、压缩、重命名js文件
gulp.task('js.minify', function()
{
    gulp.src('app/static/Main/js/*.js')
        // .pipe(concat('all.js'))
        .pipe(uglify())
        // .pipe(rename('all.min.js'))
        .pipe(gulp.dest('dist/static/js'));

    gulp.src(['app/static/Main/js/lib/*.*', 'app/static/Main/js/lib/**/*.*'])
        .pipe(gulp.dest('dist/static/js/lib'));

    // csv
    gulp.src('app/static/Main/js/*.csv')
        .pipe(gulp.dest('dist/static/js'));
    // json
    gulp.src('app/static/Main/js/*.json')
        .pipe(gulp.dest('dist/static/js'));
});

// 合并、压缩、重命名css
gulp.task('css.minify', function()
{
    return gulp.src(['app/static/Main/css/*.css'])
        .pipe(autoprefixer(
        {
            browsers: ['last 2 versions'],
            cascade: false
        }))
        // .pipe(concat('all.css'))
        .pipe(uglifycss(
        {
            "maxLineLen": 3000,
            "uglyComments": true
        }))
        // .pipe(rename({
        //  suffix: '.min'
        // }))
        .pipe(gulp.dest('dist/static/css'));
});

// 压缩图片
gulp.task('img.minify', function()
{
    return gulp.src('app/static/Main/css/images/*')
        // .pipe(imagemin())
        .pipe(gulp.dest('dist/static/css/images'))
});
// 字体
gulp.task('font.minify', function()
{
    gulp.src('app/static/Main/font/*.+(eot|svg|ttf|woff)')
        .pipe(gulp.dest('dist/static/font'));
});

//html文件重新引用
gulp.task('html.minify', function()
{
    return gulp.src('app/*.html')
        // .pipe(cheerio(function($) {
        //  // $('script[name=buildRemove]').remove();
        //  $('link[name=buildRemove]').remove();
        //  $('head').append('<link rel="stylesheet" href="css/all.min.css" />');
        //  // $('head').append('<script src=js/all.min.js></script>');
        //  // $('head').append('<script src=js/app.min.js></script>');
        // }))
        // .pipe(minifyHtml()) //压缩
        .pipe(gulp.dest('dist/'));
});

// scss编译后的css将注入到浏览器里实现更新
gulp.task('sass', function()
{
    return gulp.src('app/static/Main/css/sass/*.scss')
        .pipe(sass())
        .on('error', function(err)
        {
            gutil.log('Error!', err.message);
            this.emit('end');
        })
        .pipe(autoprefixer(
        {
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true,
            remove: true
        }))
        .pipe(gulp.dest("app/static/Main/css"))
        .pipe(reload(
        {
            stream: true
        }))
        //压缩css
        // .pipe(rename(
        // {
        //     suffix: '.min'
        // }))
        .pipe(uglifycss(
        {
            "maxLineLen": 3000,
            "uglyComments": true
        }))
        .pipe(gulp.dest('app/static/Main/css'));
});

gulp.task('otherSass', function()
{
    return gulp.src('app/static/Main/css/sass/other/*.scss')
        .pipe(sass())
        .on('error', function(err)
        {
            gutil.log('Error!', err.message);
            this.emit('end');
        })
        .pipe(autoprefixer(
        {
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true,
            remove: true
        }))
        .pipe(gulp.dest("app/static/Css"))
        .pipe(reload(
        {
            stream: true
        }))
        //压缩css
        // .pipe(rename(
        // {
        //     suffix: '.min'
        // }))
        .pipe(uglifycss(
        {
            "maxLineLen": 3000,
            "uglyComments": true
        }))
        .pipe(gulp.dest('app/static/Css'));
});

// 静态服务器 + 监听 scss/html 文件
gulp.task('serve',["sass","otherSass"], function()
{
    browserSync.init(
    {
        server:
        {
            baseDir: './app/'
        }
    });

    gulp.watch("app/static/Main/css/sass/*.scss", ["sass"]);
    gulp.watch("app/static/Main/css/sass/other/*.scss", ["otherSass"]);
    gulp.watch("app/*.html").on('change', reload);
    gulp.watch("app/static/Main/js/*.js").on('change', reload);
    gulp.watch("app/static/Main/js/lib/*.js").on('change', reload);
});

// 清空
gulp.task('clean', function()
{
    gulp.src('./dist',
        {
            read: false
        })
        .pipe(clean());
});

//开发模式
gulp.task('default', ['jshint', 'serve']);

//生产模式
gulp.task('build', ['jshint', 'js.minify', 'html.minify', 'css.minify', 'img.minify', 'font.minify']);
