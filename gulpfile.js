var gulp = require('gulp');
var browserify = require('gulp-browserify');
var exec = require('child_process').exec;
var babel = require('gulp-babel');

// Compile Typescript: src/ --> build/es6/
//      Typescript compiler
//      Destination folder specified in tsconfig.json
//      Hinges on: typings/tsd.d.ts and src/main.ts
gulp.task('build', function(callback){
    exec('tsc -p .', function(error, stdout, stderr) {
        if(stdout){ console.log(stdout) }
        if(stderr){ console.log(stderr) }

        if(error){
            console.log('Typescript build error');
        }else{
            callback();
        }
   });
});

// Compile to ES5: build/es6/ --> build/es5/
//      Babel compiler - includes browser compatability
gulp.task('es5', ['build'], function() {
	return gulp.src('build/es6/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('build/es5'));
});

// Bundle code into one JS: build/es5/ --> build/es5/main.js
//      Browersify for Desktop/Browser compatability
gulp.task('browserify', ['es5'], function(){
	return gulp.src('build/es5/main.js')
		.pipe(browserify())
		.pipe(gulp.dest('build/merged/'))
});

// Default task: runs TS --> ES6 --> ES5
gulp.task('default', ['browserify']);
