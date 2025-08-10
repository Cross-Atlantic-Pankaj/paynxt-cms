import mongoose from 'mongoose';

const repcontentSchema = new mongoose.Schema({
  report_id: { type: String, unique: true, required: true },
  report_title: String,
  report_summary: String,
  report_scope: String,
  reasons_to_buy: String,
  Table_of_Contents: String,
  list_of_tables: String,
  List_of_figures: String,
  Report_Geography_Region: String,
  Report_Geography_Country: String,
  Product_category: String,
  Product_sub_Category: String,
  report_type: String,
  report_format: String,
  report_publisher: String,
  report_pages: Number,
  Companies_mentioned: String,
  single_user_dollar_price: Number,
  Small_Team_dollar_price: Number,
  Enterprise_dollar_price: Number,
  Featured_Report_Status: { type: Number, enum: [0, 1] },
  report_visible: { type: Number, enum: [0, 1, 2, 3] },
  Home_Page: { type: Number, enum: [0, 1] },
  report_file_name: String,
  report_publish_date: Date,
  Sample_Page_report_name: String,
  Meta_Description: String,
  Meta_Title: String,
  Meta_Keyword: String,
  seo_url: String,

  // ✅ New fields
  key_stats_a1: String,
  key_stats_a2: String,
  key_stats_b1: String,
  key_stats_b2: String,
  key_stats_c1: String,
  key_stats_c2: String,
  key_stats_d1: String,
  key_stats_d2: String,
  RD_Section1: String,
  RD_Section2: String,
  RD_Section3: String,
  RD_Text_Section1: String,
  RD_Text_Section2: String,
  RD_Text_Section3: String,
  FAQs: String,
  fileUrl: { type: String, default: '' },
  tileTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'TileTemplate' }
}, { timestamps: true });

// Force recompilation to ensure schema changes take effect
if (mongoose.models.Repcontent) {
  delete mongoose.models.Repcontent;
}

export default mongoose.model('Repcontent', repcontentSchema, 'repcontent');
