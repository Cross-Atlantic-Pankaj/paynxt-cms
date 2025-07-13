import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
	imageurl: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now
	},
	url: {
		type: String,
		required: false, // or false if optional
	}
});

const ResearchInsightSchema = new mongoose.Schema({
	sectionType: {
		type: String,
		enum: ['Featured Research', 'Insights'],
		required: true,
	},
	content: ContentSchema,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

const ResearchInsight =
	mongoose.models.ResearchInsight ||
	mongoose.model('ResearchInsight', ResearchInsightSchema);

export default ResearchInsight;
