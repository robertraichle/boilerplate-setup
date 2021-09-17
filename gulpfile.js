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

// Function for reload the Browser
const reload = (done) => {
    browserSync.reload();
    done();
};

// Function for serve the dev server in Brwoser
const serve = (done) => {
    browserSync.init({
        server: {
            baseDir: dest
        } // for local dev using proxy spec
    });
    done();
};

//Compile SASS to cssnano
const css = () => {
    return gulp.src(`${src}/sass/**/*.{sass,scss}`)
        // Init Plumber
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
        // Write everything to destination folder
        .pipe(gulp.dest(`${dest}/css`))
        // Update Browser refresh
        .pipe(browserSync.stream());
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

// Compile .js to minify .js
const js = () => {
    return gulp.src(`${src}/js/**/*.js`)
        .pipe(plumber(((error) => {
            gutil.log(error.message);
        })))
        // Start using Source Maps
        .pipe(sourcemaps.init())
        // Add multiple JS Sources
        .pipe(concat('concat.js'))
        // Use Babel to make script readable
        .pipe(babel())
        // Javascript Lint
        .pipe(jshint())
        // Report of jsLint
        .pipe(jshint.reporter('jshint-stylish'))
        // Add Browser Support
        .pipe(browserify({
            insertGlobals: true
        }))
        // Minify JS
        .pipe(uglify())
        // Add Suffix
        .pipe(rename({ basename: 'app', suffix: ".min" }))
        // Write Sourcemaps
        .pipe(sourcemaps.write(''))
        // Write everything to destination folder
        .pipe(gulp.dest(`${dest}/js`))
        // Update Browser refresh
        .pipe(browserSync.stream());
};


// Function to watch our changes and refresh page
const watch = () => gulp.watch([`${src}/sass/**/*.{sass,scss}`, `${src}/js/**/*.js`, `${src}/*.html`], gulp.series(html, css, js, reload));

// All tasks for this project
const dev = gulp.series(html, css, js, serve, watch);

// Just build the Project
const build = gulp.series(html, css, js);

// Default function
exports.dev = dev;
exports.build = build;
exports.default = build;