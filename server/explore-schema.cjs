const { query } = require("./db.cjs");

async function main() {
  try {
    // Explore AR-related views and key tables
    const targets = [
      "VW_AR_Invoice_details",
      "VW_AR_Billing_data_dashboard",
      "VW_Finance_UI",
      "VW_AR_Billing_Comparison_Report",
      "Newinvoice",
      "RecordPayment",
      "CreditNote",
      "Writeoff",
      "Accounts",
      "Clientmaster",
    ];

    for (const table of targets) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`  ${table}`);
      console.log("=".repeat(60));

      // Get columns
      const cols = await query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @table
        ORDER BY ORDINAL_POSITION
      `, { table });

      if (cols.recordset.length === 0) {
        console.log("  (not found)");
        continue;
      }

      for (const col of cols.recordset) {
        const type = col.CHARACTER_MAXIMUM_LENGTH
          ? `${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH})`
          : col.DATA_TYPE;
        console.log(`  ${col.COLUMN_NAME.padEnd(40)} ${type.padEnd(20)} ${col.IS_NULLABLE}`);
      }

      // Sample 3 rows
      try {
        const sample = await query(`SELECT TOP 3 * FROM [dbo].[${table}]`);
        if (sample.recordset.length > 0) {
          console.log(`\n  --- Sample row ---`);
          const row = sample.recordset[0];
          for (const [key, value] of Object.entries(row)) {
            const display = value === null ? "NULL" : String(value).substring(0, 100);
            console.log(`  ${key.padEnd(40)} ${display}`);
          }
        }
      } catch (e) {
        console.log(`  (could not sample: ${e.message})`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
