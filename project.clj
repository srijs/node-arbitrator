(defproject arbitrator "0.0.0"
  :description "Property Tests for JavaScript"

  :source-paths ["src"]

  :dependencies [
    [org.clojure/clojure "1.8.0"]
    [org.clojure/clojurescript "1.9.89"]
    [org.clojure/test.check "0.9.0"]]

  :plugins [
    [lein-cljsbuild "1.1.3"]]

  :cljsbuild {
    :builds [{
      :source-paths ["src"],
      :id "release",
      :compiler {
        :output-to "dist/core.js",
        :libs [""]
        :optimizations :advanced
        :output-wrapper false
        :pretty-print false }}]})
