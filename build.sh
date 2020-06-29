#!/bin/bash

# Compile Typescript files
tsc

# Minify JS Output
rm dist/min/*.min.js
for file in dist/no-min/*.js
do
echo $file
short=${file%.js}
newShort=${short//"no-"/}
uglifyjs $file > $newShort.min.js
done

# Remove original non-minified output
rm dist/no-min/*.js

read -n1 -r -p "Press any key to continue..." key