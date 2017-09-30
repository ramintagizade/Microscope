// Write your package code here!
Errors = {
	collection: new Mongo.Collection(null),
	throw: function(message){
		Errors.collection.insert({message:message,seen:false})
	}
};
// Variables exported by this module can be imported by other packages and
// applications. See errors-tests.js for an example of importing.
export const name = 'errors';
