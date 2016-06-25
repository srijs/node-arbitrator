rm dist/*
lein do clean, cljsbuild once
sed -e '/CLOSURE_OUTPUT/ {
  r dist/arbitator.js
  d
}' resources/universal-module.js > dist/arbitator.js.tmp
mv dist/arbitator.js.tmp dist/arbitator.js
cp type-definitions/arbitator.d.ts dist/
