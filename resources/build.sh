rm dist/*
lein do clean, cljsbuild once
sed -e '/CLOSURE_OUTPUT/ {
  r dist/core.js
  d
}' resources/universal-module.js > dist/core.js.tmp
mv dist/core.js.tmp dist/core.js
cp src/arbitrator.js dist/
cp type-definitions/arbitrator.d.ts dist/
