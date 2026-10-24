require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectMongoDB, getMongoStatus, mongoose } = require('./connection');
const { syncSheetToMongo } = require('./adapter');
const {
  Member,
  Meeting,
  Task,
  Outbox,
  AutomationConfig,
  SheetStore
} = require('./models');

async function runMigration() {
  console.log('==============================================');
  console.log('  🔄 Starting Migration: Sheets -> MongoDB    ');
  console.log('==============================================');

  const conn = await connectMongoDB();
  if (!conn) {
    console.error('❌ Migration failed: Could not connect to MongoDB. Check MONGODB_URI in your .env file.');
    process.exit(1);
  }

  const sheetsDir = path.resolve(__dirname, '../../data/sheets');
  if (!fs.existsSync(sheetsDir)) {
    console.log('No local data/sheets directory found.');
    process.exit(0);
  }

  const files = fs.readdirSync(sheetsDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} spreadsheet files to migrate.\n`);

  for (const file of files) {
    const spreadsheetId = path.basename(file, '.json');
    console.log(`Migrating spreadsheet: ${spreadsheetId}...`);

    const filePath = path.join(sheetsDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    for (const [sheetName, grid] of Object.entries(data.sheets || {})) {
      process.stdout.write(`  - Syncing "${sheetName}" (${grid.length} rows)... `);
      await syncSheetToMongo(spreadsheetId, sheetName, grid);
      console.log('✅');
    }
  }

  console.log('\n----------------------------------------------');
  console.log('  📊 MIGRATION SUMMARY:');
  console.log('----------------------------------------------');
  const memberCount = await Member.countDocuments();
  const meetingCount = await Meeting.countDocuments();
  const taskCount = await Task.countDocuments();
  const outboxCount = await Outbox.countDocuments();
  const configCount = await AutomationConfig.countDocuments();
  const rawSheetCount = await SheetStore.countDocuments();

  console.log(`  Members in MongoDB          : ${memberCount}`);
  console.log(`  Meetings in MongoDB         : ${meetingCount}`);
  console.log(`  Tasks in MongoDB            : ${taskCount}`);
  console.log(`  Outbox records in MongoDB   : ${outboxCount}`);
  console.log(`  Config keys in MongoDB      : ${configCount}`);
  console.log(`  Raw Sheet Stores in MongoDB : ${rawSheetCount}`);
  console.log('----------------------------------------------\n');
  console.log('🎉 Migration completed successfully!');

  await mongoose.disconnect();
  process.exit(0);
}

if (require.main === module) {
  runMigration().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });
}

module.exports = { runMigration };
