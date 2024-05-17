import gulp from 'gulp';
import gulpWebpack from 'webpack-stream';
import importCss from 'gulp-import-css';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import changed from 'gulp-changed-in-place';
import eslint from 'gulp-eslint';
import watch from 'gulp-watch';
import webpack from 'webpack';
import path from 'path';
import del from 'del';
import _browsersync from 'browser-sync';


let joinPath = (...paths) => path.normalize(path.join.apply(this, paths));

let srcFolder = 'src';
let destFolder = 'dest';
let gulpFolder = 'gulp';
let demoFolder = 'demos';
let demoFiles = '**/*.{html,css,js}';
let mainFile = 'angular-material-sidemenu';
let mainScript = mainFile + '.js';
let mainStylesheet = mainFile + '.css';

let config = {
  joinPath,
  srcFolder,
  destFolder,
  demoFolder,
  demoFiles,
  gulpScripts: [
    joinPath(gulpFolder, '**/*.js'),
    'gulpfile.babel.js'
  ],
  srcScripts: [
    joinPath(srcFolder, '**/*.js'),
    'index.js'
  ],
  srcStylesheets: joinPath(srcFolder, '**/*.scss'),
  mainFile,
  mainScript,
  mainStylesheet
};


let watchConfig = {
    verbose: true
  };
  
let browserSync = _browsersync.create();

gulp.task('browserSync', () => {
    return browserSync.init({
      notify: false,
      logLevel: 'silent',
      port: 9000,
      ghostMode: {
        clicks: true,
        scroll: true,
        links: true,
        forms: true
      },
      server: {
        baseDir: [
          'node_modules',
          config.demoFolder,
          config.destFolder
        ]
      },
      ui: {
        port: 9001,
        weinre: {
          port: 9002
        }
      },
      watchTask: true
    });
});

gulp.task('clean', () => {
    return del([config.destFolder]);
});
  
gulp.task('eslint', () => {
    return gulp
      .src(config.gulpScripts.concat(config.srcScripts))
      .pipe(eslint())
      .pipe(eslint.format());
});
  
gulp.task('eslint-all', () => {
    return gulp
      .src(config.gulpScripts.concat(config.srcScripts))
      .pipe(changed())
      .pipe(eslint())
      .pipe(eslint.format());
});

gulp.task('sass', () => {
    return gulp
      .src(config.joinPath(config.srcFolder, 'stylesheets', 'main.scss'))
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          outputStyle: 'expanded',
          indentWidth: 2
        })
        .on('error', sass.logError)
      )
      .pipe(importCss())
      .pipe(sourcemaps.write())
      .pipe(rename(config.mainStylesheet))
      .pipe(gulp.dest(config.destFolder))
      .pipe(browserSync.stream());
});

gulp.task('webpack', () => {
    return gulp.src('./src/main.js')
      .pipe(gulpWebpack({
        output: {
          filename: config.mainScript
        },
        devtool: 'inline-source-map',
        plugins: [
          new webpack.optimize.AggressiveMergingPlugin(),
          new webpack.optimize.DedupePlugin()
        ],
        module: {
          loaders: [
            {
              loaders: ['ng-annotate', 'babel-loader']
            }
          ]
        }
      }, webpack, () => 'done'))
      .pipe(gulp.dest(config.destFolder));
});
  
// gulp.task('watch', gulp.series('browserSync'), () => {
//     watch(config.srcScripts, watchConfig, () => {
//       runSequence('webpack', browserSync.reload);
//     });
  
//     watch(config.gulpScripts.concat(config.srcScripts), watchConfig, () => {
//       runSequence('eslint');
//     });
  
//     watch(config.srcStylesheets, watchConfig, () => {
//       runSequence('sass');
//     });
  
//     watch(config.joinPath(config.demoFolder, config.demoFiles), watchConfig, () => {
//       browserSync.reload();
//     });
// });
  
gulp.task('default', gulp.series('clean', 'webpack', 'eslint-all', 'sass')); //, 'watch');
// });
