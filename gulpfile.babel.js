import gulp from "gulp";
import uglify from "gulp-uglify";
import babel from "gulp-babel";
import { deleteAsync } from "del";
import concat from "gulp-concat";
import minifyCSS from "gulp-minify-css";
import minifyHtml from "gulp-minify-html";
import gulpSass from "gulp-sass";
import gulpNode from "node-sass";
import browserSync from "browser-sync";
import autoPrefixer from "gulp-autoprefixer";

const sass = gulpSass(gulpNode);
const browser = browserSync.create();

const path = {
  src: {
    js: "src/js/**/*.js",
    scss: "src/scss/**/*.scss",
    html: "src/html/**/*.html",
  },
};

//

gulp.task("minify:html", () =>
  gulp
    .src(path.src.html)
    .pipe(minifyHtml())
    .pipe(gulp.dest("./dist/html"))
    .pipe(browser.reload({ stream: true }))
);

gulp.task("uglify:js", () =>
  gulp
    .src(path.src.js)
    .pipe(concat("main.js"))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(
      uglify({
        mangle: {
          toplevel: true,
        },
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(browser.reload({ stream: true }))
);

gulp.task("uglify:scss", () =>
  gulp
    .src(path.src.scss)
    .pipe(concat("style.css"))
    .pipe(sass().on("error", sass.logError))
    .pipe(autoPrefixer())
    .pipe(minifyCSS())
    .pipe(gulp.dest("dist"))
    .pipe(browser.reload({ stream: true }))
);

//

gulp.task("del", () => deleteAsync(["dist"]));
gulp.task("compile", gulp.series(["minify:html", "uglify:js", "uglify:scss"]));
gulp.task("server", () => {
  browser.init({
    server: {
      baseDir: ["./dist", "./dist/html"],
    },
  });
  gulp.watch(path.src.js, gulp.series("uglify:js"));
  gulp.watch(path.src.scss, gulp.series("uglify:scss"));
  gulp.watch(
    path.src.html,
    gulp.series(() => deleteAsync(["./dist/html"]), ["minify:html"])
  );
});

//

gulp.task("default", gulp.series(["del", "compile", "server"]));
