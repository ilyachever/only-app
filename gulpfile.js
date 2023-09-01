// Gulp
import gulp from 'gulp';
// Paths
const srcFolder = './src';
const buildFolder = './dist'
const paths = {
  //Styles
  srcStyles: `${srcFolder}/scss/**/*.scss`,
  buildStyles: `${buildFolder}/css/`,
  // Scripts
  srcAllJsFiles: `${srcFolder}/scripts/**/*.js`,
  srcIndexJs: `${srcFolder}/scripts/index.js`,
  buildALlJs: `${buildFolder}/scripts`,
  // Images
  srcAllImages: `${srcFolder}/images`,
  buildAllImages: `${buildFolder}/images`,
  // Vendors
  srcVendors: `${srcFolder}/scss/vendor/*.css`,
  buildVendors: `${buildFolder}/css`,
}

let isBuildVersion = false; // Development Version by Default

const onProduction = (done) => {
  isBuildVersion = true;
  done();
}

// Error messages
// Gulp If
import gulpIf from 'gulp-if';
// Clean
import { deleteAsync } from 'del';

const clean = () => {
  return deleteAsync([buildFolder]);
}

// Styles
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';

const styles = () => {
  return gulp.src(paths.srcStyles, { sourcemaps: !isBuildVersion })
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
      overrideBrowserslist: ["last 5 versions"]
    }))
    .pipe(gulpIf(isBuildVersion, cleanCSS({
      level: 2,
    })))
    .pipe(gulp.dest(paths.buildStyles, { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
import htmlmin from 'gulp-htmlmin';
import typograf from 'gulp-typograf';

const htmlInclude = () => {
  return gulp.src([`${srcFolder}/*.html`])
    .pipe(typograf({
      locale: ['ru', 'en-US']
    }))
    .pipe(gulp.dest(buildFolder))
    .pipe(browser.stream());
}

const htmlMinify = () => {
  return gulp.src(`${buildFolder}/**/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(buildFolder));
}

// Scripts
import webpackStream from 'webpack-stream';
import terser from 'gulp-terser';

const scripts = () => {
  return gulp.src(paths.srcIndexJs)
    .pipe(webpackStream({
      mode: isBuildVersion ? 'production' : 'development',
      output: {
        filename: 'index.js'
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: "defaults" }]
                ]
              }
            }
          }
        ]
      },
      devtool: !isBuildVersion ? 'source-map' : false
    }))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end');
    })
    .pipe(gulpIf(isBuildVersion, terser()))
    .pipe(gulp.dest(paths.buildALlJs))
    .pipe(browser.stream())
}

// Images
import imagemin from 'gulp-imagemin';
import gifsicle from 'imagemin-gifsicle'
import mozjpeg from 'imagemin-mozjpeg'
import optipng from 'imagemin-optipng'
import webp from 'gulp-webp'
import replace from 'gulp-replace';

const images = () => {
  return gulp.src([`${paths.srcAllImages}/**/*.{img,jpg,jpeg,png}`])
    .pipe(gulpIf(isBuildVersion, imagemin(
      [
        gifsicle({ interlaced: true, optimizationLevel: 2 }),
        mozjpeg({ quality: 75, progressive: true }),
        optipng({ optimizationLevel: 5 }),
      ],
      {
        verbose: true,
      }
    )))
    .pipe(gulp.dest(paths.buildAllImages))
};

const createWebp = () => {
  return gulp.src([`${paths.srcAllImages}/**/*.{img,jpg,jpeg,png}`, `!${paths.srcAllImages}favicons/*.png`])
    .pipe(webp())
    .pipe(gulp.dest(paths.buildAllImages))
};

// Copy Files
const copyVendors = () => {
  return gulp.src(paths.srcVendors)
    .pipe(gulp.dest(paths.buildVendors))
}

const copyIcons = () => {
  return gulp.src([`${srcFolder}/*.ico`, `${srcFolder}/*.webmanifest`])
    .pipe(gulp.dest(buildFolder))
}

const copy = (done) => {
  copyVendors();
  copyIcons();
  done();
}

// Watch for files
import browser from 'browser-sync';

const watchFiles = () => {
  browser.init({
    server: {
      baseDir: "./dist"
    }
  });

  gulp.watch(paths.srcStyles, styles);
  gulp.watch(`${srcFolder}/*.html`, htmlInclude);
  gulp.watch(paths.srcAllJsFiles, scripts);
  gulp.watch(paths.srcAllImages, images);
  gulp.watch(paths.srcAllImages, createWebp);
  gulp.watch(paths.srcVendors, copyVendors);
  gulp.watch([`${srcFolder}/*.ico`, `${srcFolder}/*.webmanifest`], copyIcons);
}

// Actions
export default gulp.series(
  clean,
  htmlInclude,
  styles,
  scripts,
  copy,
  images,
  createWebp,
  watchFiles
)

export const build = gulp.series(
  onProduction,
  clean,
  htmlInclude,
  styles,
  scripts,
  copy,
  images,
  createWebp,
  htmlMinify,
  watchFiles
)
