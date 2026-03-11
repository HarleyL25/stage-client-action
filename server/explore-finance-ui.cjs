const { query } = require("./db.cjs");

async function main() {
  try {
    // Count total rows
    const count = await query(`SELECT COUNT(*) AS cnt FROM VW_Finance_UI`);
    console.log(`Total rows in VW_Finance_UI: ${count.recordset[0].cnt}\n`);

    // Sample 10 rows
    console.log("=== Sample rows ===");
    const sample = await query(`SELECT TOP 10 * FROM VW_Finance_UI ORDER BY DueDate DESC`);
    for (const row of sample.recordset) {
      console.log(JSON.stringify(row, null, 2));
      console.log("---");
    }

    // Payment status distribution
    console.log("\n=== Payment Status Distribution ===");
    const statuses = await query(`
      SELECT payment_status, COUNT(*) AS cnt,
             SUM(CAST(ISNULL(NULLIF(Total_In_Dollar,''), '0') AS FLOAT)) AS total_usd
      FROM VW_Finance_UI
      GROUP BY payment_status
      ORDER BY cnt DESC
    `);
    for (const row of statuses.recordset) {
      console.log(`  ${(row.payment_status || "NULL").padEnd(30)} ${String(row.cnt).padEnd(8)} $${Math.round(row.total_usd).toLocaleString()}`);
    }

    // Overdue invoices (DueDate < today AND payment_status != paid)
    console.log("\n=== Overdue invoices (DueDate < GETDATE(), unpaid) ===");
    const overdue = await query(`
      SELECT TOP 20
        Companyname, [Invoice#], Total_In_Dollar, DueDate, payment_status,
        ContactName, ContactEmail, Phone,
        DATEDIFF(day, DueDate, GETDATE()) AS days_overdue
      FROM VW_Finance_UI
      WHERE DueDate < GETDATE()
        AND (payment_status IS NULL OR payment_status NOT LIKE '%Paid%')
      ORDER BY DueDate ASC
    `);
    console.log(`Found ${overdue.recordset.length} overdue rows (showing top 20)`);
    for (const row of overdue.recordset) {
      console.log(`  ${(row.Companyname || "").substring(0,30).padEnd(32)} ${(row["Invoice#"] || "").padEnd(20)} $${row.Total_In_Dollar?.padEnd(12) || "?"} Day ${row.days_overdue} overdue  [${row.payment_status || "?"}]`);
    }

    // Check distinct Billing_Entity values
    console.log("\n=== Billing Entities ===");
    const entities = await query(`SELECT DISTINCT Billing_Entity FROM VW_Finance_UI WHERE Billing_Entity IS NOT NULL`);
    for (const row of entities.recordset) {
      console.log(`  ${row.Billing_Entity}`);
    }

    // Check distinct PaymentMode values
    console.log("\n=== Payment Modes ===");
    const modes = await query(`SELECT DISTINCT Paymentmode FROM VW_Finance_UI WHERE Paymentmode IS NOT NULL`);
    for (const row of modes.recordset) {
      console.log(`  ${row.Paymentmode}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
