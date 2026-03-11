/**
 * Quick script to test the DB connection and explore available tables.
 * Run: node server/test-connection.js
 */
const { getPool, query } = require("./db.cjs");

async function main() {
  try {
    console.log("Connecting to database...");
    await getPool();
    console.log("Connection successful!\n");

    // List all user tables
    console.log("=== Tables in database ===");
    const tables = await query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);
    for (const row of tables.recordset) {
      console.log(`  ${row.TABLE_SCHEMA}.${row.TABLE_NAME}`);
    }

    // List views too
    console.log("\n=== Views in database ===");
    const views = await query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.VIEWS
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);
    for (const row of views.recordset) {
      console.log(`  ${row.TABLE_SCHEMA}.${row.TABLE_NAME}`);
    }

    console.log("\nDone.");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    if (err.code) console.error("Error code:", err.code);
    process.exit(1);
  }
}

main();
