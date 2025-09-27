const {
  query
} = require("./DB");

(async () => {
  try {
    const rows = await query("SELECT 1 AS ok");
    if (rows?. [0]?.ok === 1) {
      console.log("✅ DB connected. SELECT 1 =>", rows);
      process.exit(0);
    } else {
      console.error("❌ Unexpected result:", rows);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ DB connection failed:", err.code || err.name, err.message);
    process.exit(1);
  }
})();
