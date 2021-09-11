// Import important packages
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');

// For SASS -> CSS
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sassLint = require('gulp-sass-lint');

// HTML
const htmlmin = require('gulp-htmlmin');

// JavaScript/TypeScript
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

// Define Important Variables
const src = './src';
const dest = './dist';

//Compile SASS to cssnano
const css = () => {
    return gulp.src(`${src}/sass/**/*.sass`)
        .pipe(plumber())
        // Lint SASS
        .pipe(sassLint({
            options: {
                formatter: 'stylish',
            },
            rules: {
                'final-newline': 0,
                'no-mergeable-selectors': 1,
                'indentation': 0
            }
        }))
        // Format SASS
        .pipe(sassLint.format())
        // Start Sourcemaps
        .pipe(sourcemaps.init())
        // Compile SASS -> CSS
        .pipe(sass.sync({ outputStyle: "compressed" })).on('error', sass.logError)
        // Add Suffix
        .pipe(rename({ basename: 'app', suffix: ".min" }))
        // Add Autoprefixer / CSSNano
        .pipe(postcss([autoprefixer(), cssnano()]))
        // Write Sourcemaps
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(`${dest}/css`));
};

// Compile .html to minify .html
const html = () => {
    return gulp.src(`${src}/*.html`)
        .pipe(plumber())
        .pipe(htmlmin({
            removeComments: true,
            html5: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            collapseWhitespace: true,
            sortAttributes: true,
            sortClassName: true
        }))
        .pipe(gulp.dest(`${dest}`));
};

// Just build the Project
const build = gulp.series(html,css);

// Default function
exports.default = build;