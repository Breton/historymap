
module.exports = function (grunt) {

    function to_entries (object,prefix){
        // convert object to array of key/value objects, emulating jq.
        // for working around mustache limitation
        // for heirarchical objects, flatten 
        // into key.subkey/value form, until a string, number or boolean is encountered
        // this is super convenient for rendering json to shtml variables
        var a=[];
        prefix=prefix||"";
        Object.keys(object).forEach(function to_entry(i){
            if(typeof object[i] === "object") {
                a.push.apply(a, (to_entries.call(null,object[i],i+".")));

            } else {
                a.push({key: prefix+i,value: object[i]});
            }
        });
        return a;
    }

    // 1. Load base configuration file
    var config = grunt.file.readJSON('build-config.json') ;

    // 2. recursively replace strings of the form <json:filename.json>
    // and <json:entries:filename.json> with their cooresponding 
    // json object and transformed json object respectively.

    Object.keys(config).forEach(function subclude (i) {
        var rx=/<json:(.+?)>/;
        var rxe=/entries:(.+)/;
        var r,e;
        var config = this;
        if(typeof config[i] === "string") {
            if(r=rx.exec(config[i])){
                if(r[1]){
                    console.log("loading",i,r[1])
                    if(e=rxe.exec(r[1])) {
                        config[i] = to_entries(grunt.file.readJSON(e[1]));
                        Object.keys(config[i]).forEach(subclude.bind(config[i]));
                    } else {
                        config[i] = grunt.file.readJSON(r[1]);
                        Object.keys(config[i]).forEach(subclude.bind(config[i]));
                    }
                }
            }
        } else if(config[i] instanceof Array) {
            Object.keys(config[i]).forEach(subclude.bind(config[i]));

        } else if(typeof config[i] === "object") {
            Object.keys(config[i]).forEach(subclude.bind(config[i]));
        }
    }.bind(config));



    grunt.initConfig(config);

    // 3. Where we tell Grunt we plan to use the grunt plugins listed in package.json
    // so long as the package starts with "grunt-"
    Object.keys(config.pkg.devDependencies).forEach(function (i) {
        if (/^grunt-/.test(i)) {
            grunt.loadNpmTasks(i);
        }
    });
    
    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    // and all the variious subcommands as defined in the "tasks" property of the build config
    Object.keys(config.tasks).forEach(function (i) {
        grunt.registerTask(i, config.tasks[i]);
    });

    

};