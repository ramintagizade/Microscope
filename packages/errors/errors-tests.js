// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by errors.js.
import { name as packageName } from "meteor/tmeasday:errors";

// Write your tests here!
// Here is an example.
Tinytest.add('errors - example', function (test) {
  test.equal(packageName, "errors");
});
