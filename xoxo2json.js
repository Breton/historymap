#!/usr/bin/env node
(function () {
  'use strict';

  var env = require('jsdom').env, html = '';
  
  // print process.argv
  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      html += chunk;
    }
  });

  process.stdin.on('end', function() {
    // first argument can be html string, filename, or url
    env(html, function (errors, window) {
      var $ = require('jquery')(window);

      if(errors!==null) {
        console.error(errors);
      }

      var dicts = $("dl").toArray().map(function(o){
        var items = $(o).find("dt, dd");
        var dict = {},dt;
        dict.name = $(o).prev().html();
        if(!dict.name) {
          delete dict.name;
        }
        if(dict.name) {


          items.toArray().forEach(function(o){
            if(o.tagName==='DT'){
              dt = $(o).html();
            }

            if(o.tagName==="DD"){
              if( $(o).find('ul li').length ){
                dict[dt]=$(o).find('ul li').toArray().map(function(o){
                  return $(o).html();
                });
              } else if( $(o).find('a').length ){
                //date or geo
                let a = $(o).find('a');
                let href = a.attr("href");
                let daterx = /^date:([^\/]*)\/?(.*?)$/;
                let georx = /^geo:([^,]*),?(.*?)$/;
                if(daterx.test(href)){
                  let date=daterx.exec(href);
                  dict[dt]= {title:a.html(), date: date[2]?{start:date[1],end:date[2]}:date[1] }
                }
                if(georx.test(href)){
                  let geo = georx.exec(href);
                  dict[dt] = {title:a.html(), geo: geo[2]?{lat:geo[1],lon:geo[2]}:geo[1] }
                }
              } else {
                dict[dt]=$(o).html().trim();
              }

            }
          });
          return dict;

        }
      }).filter((o) => ( o !== undefined ));

      console.log(JSON.stringify(dicts,null,2));
      // console.log(dicts);


    });

  });



}());