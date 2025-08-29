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
  'site_dollar_price': 'Small_Team_dollar_price',
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

// Valid DB field names from the schema, excluding tileTemplateId
const validFields = new Set([
  'report_id',
  'report_title',
  'report_summary',
  'Meta_Keyword',
  'reasons_to_buy',
  'report_scope',
  'Table_of_Contents',
  'list_of_tables',
  'List_of_figures',
  'Report_Geography_Region',
  'Report_Geography_Country',
  'Product_category',
  'Product_sub_Category',
  'report_type',
  'report_format',
  'report_publisher',
  'report_pages',
  'Companies_mentioned',
  'single_user_dollar_price',
  'Small_Team_dollar_price',
  'Enterprise_dollar_price',
  'Featured_Report_Status',
  'report_visible',
  'Home_Page',
  'report_file_name',
  'report_publish_date',
  'Sample_Page_report_name',
  'Meta_Description',
  'Meta_Title',
  'seo_url',
  'key_stats_a1',
  'key_stats_a2',
  'key_stats_b1',
  'key_stats_b2',
  'key_stats_c1',
  'key_stats_c2',
  'key_stats_d1',
  'key_stats_d2',
  'RD_Section1',
  'RD_Section2',
  'RD_Section3',
  'RD_Text_Section1',
  'RD_Text_Section2',
  'RD_Text_Section3',
  'FAQs',
  'fileUrl',
]);

export async function POST(req) {
  try {
    await connectDB();

    const data = await req.formData();
    const file = data.get('file');
    if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || '';
    let rawRows = [];

    // File parsing with error handling
    try {
      if (filename.endsWith('.csv')) {
        const stream = Readable.from(buffer);
        rawRows = await new Promise((resolve, reject) => {
          const rows = [];
          stream
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', (err) => reject(new Error(`CSV parsing error: ${err.message}`)));
        });
      } else if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error('No sheets found in Excel file');
        rawRows = xlsx.utils.sheet_to_json(firstSheet);
      } else {
        return Response.json({ error: 'Unsupported file type' }, { status: 400 });
      }
    } catch (parseErr) {
      console.error('File parsing error:', parseErr);
      return Response.json({ error: `File parsing failed: ${parseErr.message}` }, { status: 400 });
    }

    let processedCount = 0;
    const errors = [];

    for (let rowIndex = 0; rowIndex < rawRows.length; rowIndex++) {
      const originalRow = rawRows[rowIndex];
      const rowNumber = rowIndex + 2; // +2: Excel header row + 1

      const mappedRow = {};
      for (const col in originalRow) {
        const normalizedCol = col.trim();
        const mappedKey = headerMap[normalizedCol] || normalizedCol;
        if (validFields.has(mappedKey)) {
          mappedRow[mappedKey] = originalRow[col];
        } else {
          errors.push(`Row ${rowNumber} → Unknown column: '${normalizedCol}'`);
        }
      }

      // Skip rows with missing report_id
      if (!mappedRow.report_id) {
        errors.push(`Row ${rowNumber} → Missing 'report_id'`);
        continue;
      }

      // Type checks and conversions
      [
        'report_pages',
        'single_user_dollar_price',
        'Small_Team_dollar_price',
        'Enterprise_dollar_price',
      ].forEach((field) => {
        if (mappedRow[field] !== undefined && mappedRow[field] !== '') {
          const num = Number(mappedRow[field]);
          if (isNaN(num)) {
            errors.push(`Row ${rowNumber} → Field '${field}' must be a number, got '${mappedRow[field]}'`);
            delete mappedRow[field];
          } else {
            mappedRow[field] = num;
          }
        }
      });

      // Validate enum fields
      const enumFields = {
        Featured_Report_Status: [0, 1],
        report_visible: [0, 1, 2, 3],
        Home_Page: [0, 1],
      };
      Object.keys(enumFields).forEach((field) => {
        if (mappedRow[field] !== undefined && mappedRow[field] !== '') {
          const num = Number(mappedRow[field]);
          if (isNaN(num) || !enumFields[field].includes(num)) {
            errors.push(
              `Row ${rowNumber} → Field '${field}' must be one of ${enumFields[field].join(', ')}, got '${mappedRow[field]}'`
            );
            delete mappedRow[field];
          } else {
            mappedRow[field] = num;
          }
        }
      });

      // Validate date
      if (mappedRow.report_publish_date) {
        const parts = mappedRow.report_publish_date.split("-");
        if (parts.length === 3) {
          const [day, month, year] = parts.map(Number);
          const parsed = new Date(year, month - 1, day); // JS months are 0-based
          if (
            parsed.getFullYear() === year &&
            parsed.getMonth() === month - 1 &&
            parsed.getDate() === day
          ) {
            mappedRow.report_publish_date = parsed;
          } else {
            errors.push(`Row ${rowNumber} → Invalid date in 'report_publish_date': '${mappedRow.report_publish_date}'`);
            delete mappedRow.report_publish_date;
          }
        } else {
          errors.push(`Row ${rowNumber} → Invalid date format in 'report_publish_date': '${mappedRow.report_publish_date}'`);
          delete mappedRow.report_publish_date;
        }
      }


      // Explicitly set tileTemplateId to null since it’s updated post-upload
      mappedRow.tileTemplateId = null;

      // Upsert with individual error handling
      try {
        await Repcontent.updateOne(
          { report_id: mappedRow.report_id },
          { $set: mappedRow },
          { upsert: true }
        );
        processedCount++;
      } catch (dbErr) {
        errors.push(`Row ${rowNumber} → Database error: ${dbErr.message}`);
        console.error(`Row ${rowNumber} → Database error:`, dbErr);
      }
    }

    return Response.json(
      {
        message: 'Upload complete',
        processedCount,
        totalRows: rawRows.length,
        errors,
        success: processedCount > 0,
      },
      { status: processedCount > 0 ? 200 : 400 }
    );
  } catch (err) {
    console.error('API error:', err);
    return Response.json({ error: `Internal server error: ${err.message}` }, { status: 500 });
  }
}