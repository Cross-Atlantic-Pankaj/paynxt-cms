import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as xlsx from 'xlsx';

const headerMap = {
    'report_id': 'report_id',
    'report_name': 'report_title',
    'report_summary': 'report_summary',
    'report_keywords': 'Meta_Keyword',
    'reasons_to_buy': 'reasons_to_buy',
    'report_synopsis': 'report_scope',
    'Table of Contents': 'Table_of_Contents',
    'list_of_tables': 'list_of_tables',
    'fig': 'List_of_figures',
    // 'report_key_highlights': 'Meta_Description',
    'report_scope': 'report_scope',
    'Solution_Category': 'Product_category',
    'Solution_Sub-Category': 'Product_sub_Category',
    'Report_Geography_Region': 'Report_Geography_Region',
    'Report_Geography_Country': 'Report_Geography_Country',
    'report_type': 'report_type',
    'report_format': 'report_format',
    'report_publisher': 'report_publisher',
    'report_pages': 'report_pages',
    'single_user_dollar_price': 'single_user_dollar_price',
    'site_dollar_price': 'Small_Team_dollar_price',          // <-- map Excel col to your DB field
    'enterprize_dollar_price': 'Enterprise_dollar_price',
    'Featured_Report_Status (1=Featured;0=Not Featured)': 'Featured_Report_Status',
    'report_visible (0=for all user, 1=only paid user, 2= Not visible to any user, 3= Visible to free user but not to paid user)': 'report_visible',
    'Home_Page (1=Home Page)': 'Home_Page',
    'report_docs_name': 'report_file_name',
    'report_publish_date': 'report_publish_date',
    'Sample Page report name': 'Sample_Page_report_name',
    'Meta-Description': 'Meta_Description',
    'Meta-Title': 'Meta_Title',
    'Meta-Keyword': 'Meta_Keyword',
    'seo-url': 'seo_url',
    'key_stats_a1': 'key_stats_a1',
    'key_stats_a2': 'key_stats_a2',
    'key_stats_b1': 'key_stats_b1',
    'key_stats_b2': 'key_stats_b2',
    'key_stats_c1': 'key_stats_c1',
    'key_stats_c2': 'key_stats_c2',
    'key_stats_d1': 'key_stats_d1',
    'key_stats_d2': 'key_stats_d2',
    'RD_Section1': 'RD_Section1',
    'RD_Section2': 'RD_Section2',
    'RD_Section3': 'RD_Section3',
    'RD_Text_Section1': 'RD_Text_Section1',
    'RD_Text_Section2': 'RD_Text_Section2',
    'RD_Text_Section3': 'RD_Text_Section3',
    'FAQs': 'FAQs',
};


export async function POST(req) {
    try {
        await connectDB();

        const data = await req.formData();
        const file = data.get('file');

        if (!file) {
            return Response.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name || ''; // get filename to detect extension

        let results = [];

        if (filename.endsWith('.csv')) {
            // parse CSV as before
            const stream = Readable.from(buffer);
            results = await new Promise((resolve, reject) => {
                const rows = [];
                stream
                    .pipe(csv())
                    .on('data', (row) => rows.push(row))
                    .on('end', () => resolve(rows))
                    .on('error', reject);
            });
        } else if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
            // parse Excel
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            results = xlsx.utils.sheet_to_json(firstSheet);
        } else {
            return Response.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        // process each row as before
        for (const row of results) {
            const mappedRow = {};
            for (const col in row) {
                const normalizedCol = col.trim(); // remove spaces
                const key = headerMap[normalizedCol] || normalizedCol;
                mappedRow[key] = row[col];
            }

            // console.log('Mapped row:', mappedRow); // debug

            if (!mappedRow.report_id) continue;

            const update = {};
            for (const key in mappedRow) {
                if (mappedRow[key] !== '') update[key] = mappedRow[key];
            }

            // Convert numbers properly
            [
                'report_pages',
                'single_user_dollar_price',
                'Small_Team_dollar_price',
                'Enterprise_dollar_price',
                'Featured_Report_Status',
                'report_visible',
                'Home_Page'
            ].forEach(f => {
                if (update[f] !== undefined && update[f] !== null && update[f] !== '') {
                    const num = Number(update[f]);
                    if (!isNaN(num)) {
                        update[f] = num;
                    } else {
                        delete update[f]; // remove invalid value so mongoose doesn't throw
                    }
                }
            });

            // 'key_stats_a1', 'key_stats_b1', 'key_stats_c1', 'key_stats_d1'`

            if (update.report_publish_date) update.report_publish_date = new Date(update.report_publish_date);

            await Repcontent.updateOne(
                { report_id: mappedRow.report_id },
                { $set: update },
                { upsert: true }
            );
        }


        return Response.json({ message: 'Uploaded successfully', count: results.length });
    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
