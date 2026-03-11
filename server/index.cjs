const express = require("express");
const cors = require("cors");
const { query } = require("./db.cjs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.API_PORT || 3001;

// ── Helpers ────────────────────────────────────────────────────────

function mapRow(row) {
  const amount = parseFloat(row.Total_In_Dollar) || 0;

  return {
    id: row["Invoice#"] || row.Potentialnumber,
    invoiceNumber: row["Invoice#"] || "",
    amount: Math.round(amount * 100) / 100,
    invoiceDate: row.invoicedate,
    dueDate: row.DueDate,
    daysOverdue: row.days_overdue ?? 0,
    paymentStatus: row.payment_status || "",
    companyName: row.Companyname || "Unknown",
    contactName: row.ContactName || "",
    contactEmail: row.ContactEmail || "",
    contactPhone: row.Phone || "",
    potentialNumber: row.Potentialnumber || "",
    contractNumber: row.Contractnumber || "",
    service: row.service || "",
    projectName: row.Projectname || "",
    paymentMode: row.Paymentmode || "",
    billingEntity: row.Billing_Entity || "",
  };
}

const INVOICE_COLUMNS = `
  Potentialnumber, Contractnumber, Companyname, service, Projectname,
  Projectid, payment_status, Salutation, ContactName, ContactEmail, Phone,
  PrimaryContact, [Invoice#], invoicedate, DueDate, AccountingMonth,
  Total_In_Dollar, Paymentmode, Billing_Entity
`;

// ── Routes ─────────────────────────────────────────────────────────

// GET /api/invoices — all overdue invoices (DueDate < today, unpaid)
app.get("/api/invoices", async (req, res) => {
  try {
    const result = await query(`
      SELECT ${INVOICE_COLUMNS},
        DATEDIFF(day, DueDate, GETDATE()) AS days_overdue
      FROM VW_Finance_UI
      WHERE DueDate < GETDATE()
        AND (payment_status IS NULL OR payment_status NOT LIKE '%Paid%')
        AND (payment_status IS NULL OR payment_status NOT LIKE '%Cancelled%')
      ORDER BY DueDate ASC
    `);

    const invoices = result.recordset.map(mapRow);
    res.json({ invoices, total: invoices.length });
  } catch (err) {
    console.error("GET /api/invoices error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/all — all invoices (including not yet overdue)
app.get("/api/invoices/all", async (req, res) => {
  try {
    const result = await query(`
      SELECT ${INVOICE_COLUMNS},
        CASE
          WHEN DueDate < GETDATE() THEN DATEDIFF(day, DueDate, GETDATE())
          ELSE 0
        END AS days_overdue
      FROM VW_Finance_UI
      ORDER BY DueDate ASC
    `);

    const invoices = result.recordset.map(mapRow);
    res.json({ invoices, total: invoices.length });
  } catch (err) {
    console.error("GET /api/invoices/all error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:companyName/history — paid invoices for a company
app.get("/api/clients/:companyName/history", async (req, res) => {
  try {
    const result = await query(`
      SELECT [Invoice#], Total_In_Dollar, invoicedate, DueDate, payment_status,
        DATEDIFF(day, DueDate, GETDATE()) AS days_since_due
      FROM VW_Finance_UI
      WHERE Companyname = @companyName
        AND payment_status LIKE '%Paid%'
      ORDER BY DueDate DESC
    `, { companyName: req.params.companyName });

    const history = result.recordset.map(row => ({
      invoiceNumber: row["Invoice#"] || "",
      amount: Math.round((parseFloat(row.Total_In_Dollar) || 0) * 100) / 100,
      invoiceDate: row.invoicedate,
      dueDate: row.DueDate,
      paidDate: "",
      daysToPayAfterDue: 0,
    }));

    res.json({ history });
  } catch (err) {
    console.error("GET /api/clients/:companyName/history error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats — summary stats
app.get("/api/stats", async (req, res) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*) AS total_invoices,
        SUM(CAST(ISNULL(NULLIF(Total_In_Dollar,''), '0') AS FLOAT)) AS total_ar,
        SUM(CASE WHEN DueDate < GETDATE() THEN 1 ELSE 0 END) AS overdue_count,
        SUM(CASE WHEN DueDate < GETDATE() THEN CAST(ISNULL(NULLIF(Total_In_Dollar,''), '0') AS FLOAT) ELSE 0 END) AS overdue_total,
        SUM(CASE WHEN DATEDIFF(day, DueDate, GETDATE()) > 30 THEN 1 ELSE 0 END) AS critical_count,
        SUM(CASE WHEN DATEDIFF(day, DueDate, GETDATE()) > 30 THEN CAST(ISNULL(NULLIF(Total_In_Dollar,''), '0') AS FLOAT) ELSE 0 END) AS critical_total
      FROM VW_Finance_UI
      WHERE (payment_status IS NULL OR payment_status NOT LIKE '%Paid%')
        AND (payment_status IS NULL OR payment_status NOT LIKE '%Cancelled%')
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("GET /api/stats error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AR API server running on http://localhost:${PORT}`);
});
