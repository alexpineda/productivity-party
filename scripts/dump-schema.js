/*
<ai_context>
Script to dump the complete database schema in a readable format.
</ai_context>
<recent_changes>
Fixed error handling and response parsing to handle different API response formats.
</recent_changes>
*/

const { execSync } = require("child_process");

async function dumpSchema() {
  try {
    console.log("📊 Database Schema:\n");

    // Get all table names
    const tablesCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "SELECT name FROM sqlite_master WHERE type=\\"table\\" AND name NOT LIKE \\"sqlite_%\\";"}' http://localhost:3030/raw_sql`;
    const tablesOutput = execSync(tablesCmd).toString();

    // Log the raw response for debugging
    console.log("Raw tables response:", tablesOutput);

    let tables = [];
    try {
      const parsedOutput = JSON.parse(tablesOutput);

      // Handle different response formats
      if (parsedOutput.rows) {
        tables = parsedOutput.rows.map((row) => row.name);
      } else if (Array.isArray(parsedOutput)) {
        tables = parsedOutput.map((row) => row.name);
      } else {
        console.log(
          "Unexpected response format for tables. Using empty array."
        );
      }
    } catch (parseError) {
      console.error("Error parsing tables response:", parseError.message);
      console.log("Will attempt to continue with empty tables array");
    }

    console.log(`Found ${tables.length} tables: ${tables.join(", ")}`);

    // If no tables found, try a different query format
    if (tables.length === 0) {
      console.log("Trying alternative query format...");
      const altTablesCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "SELECT name FROM sqlite_schema WHERE type=\\"table\\" AND name NOT LIKE \\"sqlite_%\\";"}' http://localhost:3030/raw_sql`;
      const altTablesOutput = execSync(altTablesCmd).toString();

      try {
        const parsedOutput = JSON.parse(altTablesOutput);
        if (parsedOutput.rows) {
          tables = parsedOutput.rows.map((row) => row.name);
        } else if (Array.isArray(parsedOutput)) {
          tables = parsedOutput.map((row) => row.name);
        }
        console.log(
          `Found ${tables.length} tables with alternative query: ${tables.join(
            ", "
          )}`
        );
      } catch (parseError) {
        console.error(
          "Error parsing alternative tables response:",
          parseError.message
        );
      }
    }

    // For each table, get its schema
    for (const table of tables) {
      console.log(`\n📋 Table: ${table}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Get table info
      const tableInfoCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "PRAGMA table_info(${table});"}' http://localhost:3030/raw_sql`;
      const tableInfoOutput = execSync(tableInfoCmd).toString();

      let columns = [];
      try {
        const parsedOutput = JSON.parse(tableInfoOutput);
        if (parsedOutput.rows) {
          columns = parsedOutput.rows;
        } else if (Array.isArray(parsedOutput)) {
          columns = parsedOutput;
        }
      } catch (parseError) {
        console.error(
          `Error parsing table info for ${table}:`,
          parseError.message
        );
        continue;
      }

      // Print column details in a formatted way
      console.log("| cid | name | type | notnull | dflt_value | pk |");
      console.log("|-----|------|------|---------|------------|-----|");
      columns.forEach((col) => {
        console.log(
          `| ${col.cid} | ${col.name} | ${col.type} | ${col.notnull} | ${
            col.dflt_value || "NULL"
          } | ${col.pk} |`
        );
      });

      try {
        // Get foreign keys
        const fkCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "PRAGMA foreign_key_list(${table});"}' http://localhost:3030/raw_sql`;
        const fkOutput = execSync(fkCmd).toString();

        let foreignKeys = [];
        try {
          const parsedOutput = JSON.parse(fkOutput);
          if (parsedOutput.rows) {
            foreignKeys = parsedOutput.rows;
          } else if (Array.isArray(parsedOutput)) {
            foreignKeys = parsedOutput;
          }
        } catch (parseError) {
          console.error(
            `Error parsing foreign keys for ${table}:`,
            parseError.message
          );
        }

        if (foreignKeys && foreignKeys.length > 0) {
          console.log("\n🔗 Foreign Keys:");
          console.log(
            "| id | seq | table | from | to | on_update | on_delete | match |"
          );
          console.log(
            "|----|-----|-------|------|-----|-----------|-----------|-------|"
          );
          foreignKeys.forEach((fk) => {
            console.log(
              `| ${fk.id} | ${fk.seq} | ${fk.table} | ${fk.from} | ${fk.to} | ${fk.on_update} | ${fk.on_delete} | ${fk.match} |`
            );
          });
        }
      } catch (fkError) {
        console.error(
          `Error getting foreign keys for ${table}:`,
          fkError.message
        );
      }

      try {
        // Get indexes
        const indexCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "SELECT name FROM sqlite_master WHERE type=\\"index\\" AND tbl_name=\\"${table}\\";"}' http://localhost:3030/raw_sql`;
        const indexOutput = execSync(indexCmd).toString();

        let indexes = [];
        try {
          const parsedOutput = JSON.parse(indexOutput);
          if (parsedOutput.rows) {
            indexes = parsedOutput.rows;
          } else if (Array.isArray(parsedOutput)) {
            indexes = parsedOutput;
          }
        } catch (parseError) {
          console.error(
            `Error parsing indexes for ${table}:`,
            parseError.message
          );
        }

        if (indexes && indexes.length > 0) {
          console.log("\n🔍 Indexes:");
          for (const idx of indexes) {
            try {
              const indexInfoCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "PRAGMA index_info(${idx.name});"}' http://localhost:3030/raw_sql`;
              const indexInfoOutput = execSync(indexInfoCmd).toString();

              let indexInfo = [];
              try {
                const parsedOutput = JSON.parse(indexInfoOutput);
                if (parsedOutput.rows) {
                  indexInfo = parsedOutput.rows;
                } else if (Array.isArray(parsedOutput)) {
                  indexInfo = parsedOutput;
                }
              } catch (parseError) {
                console.error(
                  `Error parsing index info for ${idx.name}:`,
                  parseError.message
                );
                continue;
              }

              console.log(
                `- ${idx.name}: ${indexInfo.map((i) => i.name).join(", ")}`
              );
            } catch (indexInfoError) {
              console.error(
                `Error getting index info for ${idx.name}:`,
                indexInfoError.message
              );
            }
          }
        }
      } catch (indexError) {
        console.error(
          `Error getting indexes for ${table}:`,
          indexError.message
        );
      }
    }

    // If no tables were found, try a direct query for a known table
    if (tables.length === 0) {
      console.log(
        "\n⚠️ No tables found. Trying direct query for 'frames' table..."
      );
      const directCmd = `curl -s -X POST -H "Content-Type: application/json" -d '{"query": "PRAGMA table_info(frames);"}' http://localhost:3030/raw_sql`;
      const directOutput = execSync(directCmd).toString();
      console.log("Direct query response:", directOutput);
    }
  } catch (error) {
    console.error("Error dumping schema:", error.message);
    process.exit(1);
  }
}

dumpSchema();
