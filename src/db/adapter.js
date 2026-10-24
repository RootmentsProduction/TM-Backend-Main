const { getMongoStatus } = require('./connection');
const {
  Member,
  Meeting,
  Task,
  Outbox,
  Submission,
  AutomationConfig,
  SheetStore
} = require('./models');

function safeDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Syncs a single sheet grid and its structured Mongoose entities into MongoDB.
 */
async function syncSheetToMongo(spreadsheetId, sheetName, grid) {
  if (!getMongoStatus().connected) return;

  try {
    // 1. Raw Sheet Grid Store
    await SheetStore.findOneAndUpdate(
      { spreadsheetId, sheetName },
      {
        spreadsheetId,
        sheetName,
        grid,
        rowCount: grid.length,
        columnCount: grid[0] ? grid[0].length : 0
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 2. Structured Model Synchronizers using bulkWrite for maximum performance
    if (sheetName === 'Member Master') {
      const ops = [];
      for (let r = 1; r < grid.length; r++) {
        const row = grid[r];
        if (!row || !row[0]) continue;
        const memberId = String(row[0]).trim();
        if (!memberId) continue;

        ops.push({
          updateOne: {
            filter: { memberId },
            update: {
              $set: {
                memberId,
                name: String(row[1] || ''),
                whatsapp: String(row[2] || ''),
                status: String(row[3] || 'Active'),
                spreadsheetId,
                rowNumber: r + 1
              }
            },
            upsert: true
          }
        });
      }
      if (ops.length > 0) await Member.bulkWrite(ops);
    } else if (sheetName === 'VPE Weekly Planner') {
      const ops = [];
      for (let r = 2; r < grid.length; r++) {
        const row = grid[r];
        if (!row || row[0] === '' || row[0] === null || row[0] === undefined) continue;
        const meetingNo = parseInt(row[0], 10);
        if (isNaN(meetingNo)) continue;

        const speakers = [
          { slot: 1, name: String(row[9] || '') },
          { slot: 2, name: String(row[10] || '') },
          { slot: 3, name: String(row[11] || '') },
          { slot: 4, name: String(row[12] || '') }
        ].filter(s => s.name);

        const evaluators = [
          { slot: 1, name: String(row[13] || '') },
          { slot: 2, name: String(row[14] || '') },
          { slot: 3, name: String(row[15] || '') },
          { slot: 4, name: String(row[16] || '') }
        ].filter(e => e.name);

        ops.push({
          updateOne: {
            filter: { meetingNo },
            update: {
              $set: {
                meetingNo,
                date: safeDate(row[1]) || new Date(),
                theme: String(row[2] || ''),
                tmod: String(row[3] || ''),
                generalEvaluator: String(row[4] || ''),
                timer: String(row[5] || ''),
                ahCounter: String(row[6] || ''),
                grammarian: String(row[7] || ''),
                tableTopicsMaster: String(row[8] || ''),
                speakers,
                evaluators,
                status: String(row[17] || 'DRAFT'),
                notes: String(row[18] || ''),
                vpeHold: String(row[19] || ''),
                lock: String(row[20] || ''),
                spreadsheetId,
                rowNumber: r + 1
              }
            },
            upsert: true
          }
        });
      }
      if (ops.length > 0) await Meeting.bulkWrite(ops);
    } else if (sheetName === 'Automation Tasks') {
      const ops = [];
      for (let r = 1; r < grid.length; r++) {
        const row = grid[r];
        if (!row || !row[0]) continue;
        const taskId = String(row[0]).trim();
        if (!taskId) continue;

        ops.push({
          updateOne: {
            filter: { taskId },
            update: {
              $set: {
                taskId,
                type: String(row[1] || ''),
                targetDate: safeDate(row[2]),
                status: String(row[3] || 'PENDING'),
                payload: String(row[4] || ''),
                scheduledFor: safeDate(row[7]),
                attempt: Number(row[8] || 0),
                lastError: String(row[9] || ''),
                spreadsheetId,
                rowNumber: r + 1
              }
            },
            upsert: true
          }
        });
      }
      if (ops.length > 0) await Task.bulkWrite(ops);
    } else if (sheetName === 'WA Outbox') {
      const ops = [];
      for (let r = 1; r < grid.length; r++) {
        const row = grid[r];
        if (!row || !row[0]) continue;
        const outboxId = String(row[0]).trim();
        if (!outboxId) continue;

        ops.push({
          updateOne: {
            filter: { outboxId },
            update: {
              $set: {
                outboxId,
                member: String(row[1] || ''),
                phone: String(row[2] || ''),
                kind: String(row[3] || ''),
                status: String(row[4] || 'QUEUED'),
                text: String(row[5] || ''),
                state: String(row[6] || ''),
                result: String(row[7] || ''),
                meetingNo: row[8] ? Number(row[8]) : null,
                key: String(row[9] || ''),
                timestamp: safeDate(row[10]) || new Date(),
                spreadsheetId,
                rowNumber: r + 1
              }
            },
            upsert: true
          }
        });
      }
      if (ops.length > 0) await Outbox.bulkWrite(ops);
    } else if (sheetName === 'Automation Config') {
      const ops = [];
      for (let r = 1; r < grid.length; r++) {
        const row = grid[r];
        if (!row || !row[0]) continue;
        const key = String(row[0]).trim();
        if (!key) continue;

        ops.push({
          updateOne: {
            filter: { spreadsheetId, key },
            update: {
              $set: {
                spreadsheetId,
                key,
                value: String(row[1] !== undefined ? row[1] : '')
              }
            },
            upsert: true
          }
        });
      }
      if (ops.length > 0) await AutomationConfig.bulkWrite(ops);
    }
  } catch (err) {
    console.error(`[MongoDB] Error syncing sheet "${sheetName}":`, err.message);
  }
}

/**
 * Loads all sheets for a spreadsheetId from MongoDB if available.
 */
async function loadSheetsFromMongo(spreadsheetId) {
  if (!getMongoStatus().connected) return null;

  try {
    const records = await SheetStore.find({ spreadsheetId }).lean();
    if (!records || records.length === 0) return null;

    const sheets = {};
    for (const rec of records) {
      sheets[rec.sheetName] = (rec.grid || []).map(row =>
        (row || []).map(cell => {
          if (typeof cell === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cell)) {
            const d = new Date(cell);
            return isNaN(d.getTime()) ? cell : d;
          }
          return cell;
        })
      );
    }
    return sheets;
  } catch (err) {
    console.error(`[MongoDB] Error loading sheets for "${spreadsheetId}":`, err.message);
    return null;
  }
}

module.exports = {
  syncSheetToMongo,
  loadSheetsFromMongo
};
