Posts = new Mongo.Collection('posts');
Posts.allow({
	//insert: function(userId,doc){
	//	return !!userId;
	//}
	update: function(userId,post){
		return ownsDocument(userId,post);
	},
	remove: function(userId,post){
		return ownsDocument(userId,post);
	}
}); 
Posts.deny({
	update: function(userId,post,fieldNames,modifier){
		var errors = validatePost(modifier.$set);
		return errors.title || errors.url;
	}
});
Posts.deny({
	update: function(userId,post,fieldNames){
		//may edit only two fields url and title 
		return (_.without(fieldNames,'url','title').length>0);
	}
})
Meteor.methods({
	postInsert: function(postAttributes){
		check(Meteor.userId(),String);
		check(postAttributes,{
			title:String,
			url:String
		});
		var errors = validatePost(postAttributes);
		if(errors.title || errors.url)
			throw new Meteor.Error('invalid-post','You must set a title and URL for your post');
		var postsWithSameLink = Posts.findOne({url:postAttributes.url});
		if(postsWithSameLink){
			return {
				postExists: true,
				_id:postsWithSameLink._id
			}
		}
		var user = Meteor.user();
		var post = _.extend(postAttributes,{
			userId: user._id,
			author: user.username,
			submitted: new Date(),
			commentsCount:0,
			upvoters: [],
			votes : 0
		});
		var postId = Posts.insert(post);
		return {
			_id: postId
		}
	},
	upvote: function(postId){
		check(this.userId,String);
		check(postId,String);
		var affected = Posts.update({
			_id: postId,
			upvoters: {$ne: this.userId}
		},
		{
			$addToSet:{upvoters:this.userId},
			$inc: {votes:1}
		});
		if(!affected)
			throw new Meteor.Error('invalid',"You weren't allowed to upvote that post");
		/*var post = Posts.findOne(postId);
		if(!post)
			throw new Meteor.Error('invalid','Post not found');
		if(_.include(post.upvoters,this.userId))
			throw new Meteor.Error('invalid','Already upvoted this post');
		Posts.update(post._id,{
			$addToSet: {upvoters: this.userId},
			$inc: {votes:1}
		}); */
	}
});
validatePost = function(post){
	var errors = {};
	if(!post.title)
		errors.title = "Please fill in a headline";
	if(!post.url)
		errors.url = "Please file a URL";
	return errors;
}