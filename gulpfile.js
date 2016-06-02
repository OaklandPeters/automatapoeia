var gulp = require('gulp');
var browserify = require('gulp-browserify');
var exec = require('child_process').exec;
var babel = require('gulp-babel');

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

gulp.task('es5', ['build'], function() {
	return gulp.src('build/es6/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('build/es5'));
});

gulp.task('browserify', ['es5'], function(){
	return gulp.src('build/es5/main.js')
		.pipe(browserify())
		.pipe(gulp.dest('build/merged/'))
});

gulp.task('default', ['browserify']);