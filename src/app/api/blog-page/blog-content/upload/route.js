import connectDB from '@/lib/db';
import Blog from '@/models/blog-page/blogcontent';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as xlsx from 'xlsx';
import mongoose from 'mongoose';

const headerMap = {
  'title': 'title',
  'summary': 'summary',
  'slug': 'slug',
  'articlePart1': 'articlePart1',
  'articlePart2': 'articlePart2',
  'category': 'category',
  'subcategory': 'subcategory',
  'topic': 'topic',
  'subtopic': 'subtopic',
  'date': 'date',
  'is_featured': 'is_featured',
  'tile_template_id': 'tileTemplateId',
  'advertisement_title': 'advertisement.title',
  'advertisement_description': 'advertisement.description',
  'advertisement_url': 'advertisement.url',
  'imageIconurl': 'imageIconurl'
};

// Valid DB field names from the schema
const validFields = new Set([
  'title',
  'summary',
  'slug',
  'articlePart1',
  'articlePart2',
  'category',
  'subcategory',
  'topic',
  'subtopic',
  'date',
  'is_featured',
  'tileTemplateId',
  'advertisement',
  'imageIconurl'
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

      // Skip rows with missing required fields
      if (!mappedRow.title) {
        errors.push(`Row ${rowNumber} → Missing required field 'title'`);
        continue;
      }
      if (!mappedRow.slug) {
        errors.push(`Row ${rowNumber} → Missing required field 'slug'`);
        continue;
      }
      if (!mappedRow.tileTemplateId) {
        errors.push(`Row ${rowNumber} → Missing required field 'tileTemplateId'`);
        continue;
      }

      // Handle array fields (category, subcategory, topic, subtopic)
      ['category', 'subcategory', 'topic', 'subtopic'].forEach(field => {
        if (mappedRow[field]) {
          // Split by comma and trim whitespace
          mappedRow[field] = mappedRow[field].split(',').map(item => item.trim()).filter(item => item);
        } else {
          mappedRow[field] = [];
        }
      });

      // Handle advertisement object
      if (mappedRow['advertisement.title'] || mappedRow['advertisement.description'] || mappedRow['advertisement.url']) {
        mappedRow.advertisement = {
          title: mappedRow['advertisement.title'] || '',
          description: mappedRow['advertisement.description'] || '',
          url: mappedRow['advertisement.url'] || ''
        };
        // Remove individual advertisement fields
        delete mappedRow['advertisement.title'];
        delete mappedRow['advertisement.description'];
        delete mappedRow['advertisement.url'];
      } else {
        mappedRow.advertisement = {
          title: '',
          description: '',
          url: ''
        };
      }

      // Handle boolean field
      if (mappedRow.is_featured !== undefined && mappedRow.is_featured !== '') {
        mappedRow.is_featured = mappedRow.is_featured.toLowerCase() === 'true' || mappedRow.is_featured === '1';
      } else {
        mappedRow.is_featured = false;
      }

      // Handle date field
      if (mappedRow.date) {
        const date = new Date(mappedRow.date);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${rowNumber} → Invalid date format in 'date' field: '${mappedRow.date}' (expected: YYYY-MM-DD or valid date)`);
          delete mappedRow.date;
        } else {
          mappedRow.date = date;
        }
      } else {
        mappedRow.date = new Date();
      }

      // Handle tileTemplateId - convert string ID to ObjectId
      if (mappedRow.tileTemplateId) {
        try {
          if (mongoose.Types.ObjectId.isValid(mappedRow.tileTemplateId)) {
            mappedRow.tileTemplateId = new mongoose.Types.ObjectId(mappedRow.tileTemplateId);
          } else {
            errors.push(`Row ${rowNumber} → Invalid tileTemplateId format: '${mappedRow.tileTemplateId}' (expected: 24-character hexadecimal string)`);
            delete mappedRow.tileTemplateId;
            continue;
          }
        } catch (err) {
          errors.push(`Row ${rowNumber} → Invalid tileTemplateId: '${mappedRow.tileTemplateId}' (database error: ${err.message})`);
          delete mappedRow.tileTemplateId;
          continue;
        }
      }

      // Upsert with individual error handling
      try {
        await Blog.updateOne(
          { slug: mappedRow.slug },
          { $set: mappedRow },
          { upsert: true }
        );
        processedCount++;
      } catch (dbErr) {
        errors.push(`Row ${rowNumber} → Database error: ${dbErr.message}`);
        console.error(`Row ${rowNumber} → Database error:`, dbErr);
      }
    }

    const summaryMessage = errors.length > 0 
      ? `Upload completed with ${processedCount} successful and ${errors.length} failed rows.`
      : `Upload completed successfully! All ${processedCount} rows processed.`;

    return Response.json(
      {
        message: summaryMessage,
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
