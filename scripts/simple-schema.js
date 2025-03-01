/*
<ai_context>
A simpler script to dump database schema using direct SQL queries.
</ai_context>
<recent_changes>
Created a new simplified script for dumping database schema.
</recent_changes>
*/

const { execSync } = require("child_process");

async function dumpSchema() {
  try {
    console.log("📊 Database Schema Dump\n");

    // Try to get a direct dump of the schema
    console.log("Attempting to get schema directly...\n");

    try {
      // This works for SQLite databases
      const schemaCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "SELECT sql FROM sqlite_master WHERE type=\\"table\\" AND name NOT LIKE \\"sqlite_%\\";"}' http://localhost:3030/raw_sql`;
      const schemaOutput = execSync(schemaCmd).toString();

      console.log("Schema SQL Statements:");
      console.log("======================\n");
      console.log(schemaOutput);

      // Try to get a list of all tables
      const tablesCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "SELECT name FROM sqlite_master WHERE type=\\"table\\" AND name NOT LIKE \\"sqlite_%\\";"}' http://localhost:3030/raw_sql`;
      const tablesOutput = execSync(tablesCmd).toString();

      console.log("\nRaw Tables Output:");
      console.log("==================\n");
      console.log(tablesOutput);

      // Try a direct query for a known table (frames)
      console.log("\nAttempting direct query for 'frames' table...\n");
      const framesCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "PRAGMA table_info(frames);"}' http://localhost:3030/raw_sql`;
      const framesOutput = execSync(framesCmd).toString();
      console.log(framesOutput);
    } catch (directError) {
      console.error("Error with direct schema query:", directError.message);
    }

    // Try an alternative approach using .schema
    console.log("\nAttempting .schema command...\n");
    try {
      const dotSchemaCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": ".schema"}' http://localhost:3030/raw_sql`;
      const dotSchemaOutput = execSync(dotSchemaCmd).toString();
      console.log(dotSchemaOutput);
    } catch (schemaError) {
      console.error("Error with .schema command:", schemaError.message);
    }

    // Try listing all tables using sqlite_schema (SQLite 3.33+)
    console.log("\nAttempting to list tables using sqlite_schema...\n");
    try {
      const sqliteSchemaCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "SELECT name FROM sqlite_schema WHERE type=\\"table\\" AND name NOT LIKE \\"sqlite_%\\";"}' http://localhost:3030/raw_sql`;
      const sqliteSchemaOutput = execSync(sqliteSchemaCmd).toString();
      console.log(sqliteSchemaOutput);
    } catch (sqliteSchemaError) {
      console.error(
        "Error with sqlite_schema query:",
        sqliteSchemaError.message
      );
    }

    // Try a direct query for a specific table that might exist
    const possibleTables = [
      "frames",
      "users",
      "settings",
      "data",
      "messages",
      "logs",
    ];

    console.log("\nAttempting queries for common table names...\n");
    for (const table of possibleTables) {
      try {
        console.log(`\nChecking table: ${table}`);
        const tableInfoCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "PRAGMA table_info(${table});"}' http://localhost:3030/raw_sql`;
        const tableInfoOutput = execSync(tableInfoCmd).toString();
        console.log(tableInfoOutput);
      } catch (tableError) {
        console.error(`Error querying table ${table}:`, tableError.message);
      }
    }
  } catch (error) {
    console.error("Error in schema dump:", error.message);
    process.exit(1);
  }
}

dumpSchema();
