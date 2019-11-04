const {series, watch, src, dest, parallel} = require('gulp');
const gulp = require('gulp')
const pump = require('pump');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const zip = require('gulp-zip');
const uglify = require('gulp-uglify');
const beeper = require('beeper');
const fs = require('fs');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const prefix = require('gulp-autoprefixer');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    pump([
        gulp.src('assets/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(prefix({ cascade: false }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/built/')),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        gulp.src([
            'node_modules/jquery/dist/jquery.min.js', 
            'assets/js/libraries/*.js',
            'node_modules/popper.js/dist/umd/popper.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'node_modules/imagesloaded/imagesloaded.pkgd.min.js', 
            'node_modules/ghost-search/dist/ghost-search.min.js', 
            'node_modules/highlight.js/lib/highlight.js', 
            'node_modules/imagesloaded/imagesloaded.pkgd.min.js',
            'node_modules/share-selected-text/dist/shareSelectedText.min.js',
            'node_modules/js-cookie/src/js.cookie.js',
            'node_modules/simplebar/dist/simplebar.min.js',
            'node_modules/swiper/js/swiper.min.js',
            'node_modules/clipboard/dist/clipboard.min.js',
            // 'node_modules/moment/locale/[COUNTRY-CODE].js', // Replace [COUNTRY-CODE] with value from Ghost Dashboard -> General -> Publication Language if different than 'en'. Example: fr.js
            'node_modules/moment/min/moment.min.js',
            // 'node_modules/jquery-validation/dist/localization/messages_[COUNTRY-CODE].min.js', // Replace [COUNTRY-CODE] with value from Ghost Dashboard -> General -> Publication Language if different than 'en'. Example: messages_fr.min.js
            'node_modules/jquery-validation/dist/jquery.validate.min.js',
            'node_modules/@tryghost/content-api/umd/content-api.min.js',
            'assets/js/*.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write()),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    const targetDir = 'dist/';
    const themeName = require('./package.json').name;
    const filename = themeName + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**'
        ]),
        zip(filename),
        dest(targetDir)
    ], handleError(done));
}

const cssWatcher = () => watch('assets/scss/**', css);
const jsWatcher = () => watch('assets/js/**', js);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, jsWatcher, hbsWatcher);
const build = series(css, js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;