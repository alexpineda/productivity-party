/*
<ai_context>
Script to format the database schema in a more readable way.
</ai_context>
<recent_changes>
Fixed the issue with composite primary keys in the documentation.
</recent_changes>
*/

// This script formats the database schema in a more readable way
// Run this after you've captured the output from simple-schema.js

const fs = require("fs");

// Main tables and their relationships
const mainTables = [
  {
    name: "video_chunks",
    description: "Stores information about video recording chunks",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      { name: "file_path", type: "TEXT", notNull: true },
      { name: "device_name", type: "TEXT", notNull: true, defaultValue: "''" },
    ],
  },
  {
    name: "frames",
    description: "Stores individual frames from video recordings",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      {
        name: "video_chunk_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "video_chunks(id)",
      },
      { name: "offset_index", type: "INTEGER", notNull: true },
      { name: "timestamp", type: "TIMESTAMP", notNull: true },
      { name: "name", type: "TEXT" },
      { name: "browser_url", type: "TEXT", defaultValue: "NULL" },
      { name: "app_name", type: "TEXT", defaultValue: "NULL" },
      { name: "window_name", type: "TEXT", defaultValue: "NULL" },
      { name: "focused", type: "BOOLEAN", defaultValue: "NULL" },
    ],
  },
  {
    name: "audio_chunks",
    description: "Stores information about audio recording chunks",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      { name: "file_path", type: "TEXT", notNull: true },
      { name: "timestamp", type: "TIMESTAMP" },
    ],
  },
  {
    name: "chunked_text_index",
    description: "Stores unique text chunks for efficient indexing",
    columns: [
      {
        name: "text_id",
        type: "INTEGER",
        primaryKey: true,
        autoIncrement: true,
      },
      { name: "text", type: "TEXT", notNull: true, unique: true },
    ],
  },
  {
    name: "chunked_text_entries",
    description: "Maps text chunks to frames or audio chunks",
    columns: [
      {
        name: "text_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "chunked_text_index(text_id)",
      },
      { name: "frame_id", type: "INTEGER", foreignKey: "frames(id)" },
      {
        name: "audio_chunk_id",
        type: "INTEGER",
        foreignKey: "audio_chunks(id)",
      },
      { name: "timestamp", type: "DATETIME", notNull: true },
      { name: "engine", type: "TEXT", notNull: true },
      { name: "chunking_engine", type: "TEXT", notNull: true },
      { name: "source", type: "TEXT", notNull: true },
    ],
  },
  {
    name: "ocr_text",
    description: "Stores OCR-extracted text from frames",
    columns: [
      { name: "frame_id", type: "INTEGER", notNull: true },
      { name: "text", type: "TEXT", notNull: true },
      { name: "text_json", type: "TEXT" },
      { name: "app_name", type: "TEXT", notNull: true, defaultValue: "''" },
      {
        name: "ocr_engine",
        type: "TEXT",
        notNull: true,
        defaultValue: "'unknown'",
      },
      { name: "window_name", type: "TEXT" },
      { name: "focused", type: "BOOLEAN", defaultValue: "FALSE" },
      { name: "text_length", type: "INTEGER" },
    ],
  },
  {
    name: "tags",
    description: "Stores tags for categorizing content",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      { name: "name", type: "TEXT", notNull: true, unique: true },
      {
        name: "created_at",
        type: "DATETIME",
        defaultValue: "CURRENT_TIMESTAMP",
      },
    ],
  },
  {
    name: "vision_tags",
    description: "Maps tags to frames (vision data)",
    columns: [
      {
        name: "vision_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "frames(id)",
      },
      {
        name: "tag_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "tags(id)",
      },
    ],
    compositePrimaryKey: ["vision_id", "tag_id"],
  },
  {
    name: "audio_tags",
    description: "Maps tags to audio chunks",
    columns: [
      {
        name: "audio_chunk_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "audio_chunks(id)",
      },
      {
        name: "tag_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "tags(id)",
      },
    ],
    compositePrimaryKey: ["audio_chunk_id", "tag_id"],
  },
  {
    name: "ui_monitoring",
    description: "Stores UI monitoring data",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      { name: "text_output", type: "TEXT", notNull: true },
      {
        name: "timestamp",
        type: "DATETIME",
        notNull: true,
        defaultValue: "CURRENT_TIMESTAMP",
      },
      { name: "app", type: "TEXT", notNull: true },
      { name: "window", type: "TEXT", notNull: true },
      { name: "initial_traversal_at", type: "DATETIME" },
      { name: "text_length", type: "INTEGER" },
    ],
  },
  {
    name: "ui_monitoring_tags",
    description: "Maps tags to UI monitoring entries",
    columns: [
      {
        name: "ui_monitoring_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "ui_monitoring(id)",
      },
      {
        name: "tag_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "tags(id)",
      },
    ],
    compositePrimaryKey: ["ui_monitoring_id", "tag_id"],
  },
  {
    name: "speakers",
    description: "Stores information about speakers in audio",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      { name: "name", type: "TEXT" },
      { name: "metadata", type: "JSON" },
      { name: "hallucination", type: "BOOLEAN", defaultValue: "FALSE" },
    ],
  },
  {
    name: "speaker_embeddings",
    description: "Stores speaker voice embeddings for identification",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      {
        name: "embedding",
        type: "FLOAT[512]",
        notNull: true,
        check: "typeof(embedding) == 'blob' and vec_length(embedding) == 512",
      },
      { name: "speaker_id", type: "INTEGER", foreignKey: "speakers(id)" },
    ],
  },
  {
    name: "audio_transcriptions",
    description: "Stores transcriptions of audio chunks",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      {
        name: "audio_chunk_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "audio_chunks(id)",
      },
      { name: "offset_index", type: "INTEGER", notNull: true },
      { name: "timestamp", type: "TIMESTAMP", notNull: true },
      { name: "transcription", type: "TEXT", notNull: true },
      { name: "device", type: "TEXT", notNull: true, defaultValue: "''" },
      {
        name: "is_input_device",
        type: "BOOLEAN",
        notNull: true,
        defaultValue: "TRUE",
      },
      { name: "speaker_id", type: "INTEGER" },
      {
        name: "transcription_engine",
        type: "TEXT",
        notNull: true,
        defaultValue: "'Whisper'",
      },
      { name: "start_time", type: "REAL" },
      { name: "end_time", type: "REAL" },
      { name: "text_length", type: "INTEGER" },
    ],
  },
  {
    name: "ocr_text_embeddings",
    description: "Stores embeddings for OCR text",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      {
        name: "frame_id",
        type: "INTEGER",
        notNull: true,
        foreignKey: "frames(id)",
      },
      { name: "embedding", type: "BLOB", notNull: true },
      {
        name: "created_at",
        type: "DATETIME",
        defaultValue: "CURRENT_TIMESTAMP",
      },
    ],
  },
  {
    name: "friend_wearable_requests",
    description: "Stores requests for friend wearable data",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
      { name: "request_id", type: "TEXT", notNull: true },
      { name: "memory_source", type: "TEXT", notNull: true },
      { name: "chunk_id_range", type: "TEXT", notNull: true },
      { name: "timestamp_range", type: "TEXT", notNull: true },
      { name: "friend_user_id", type: "TEXT", notNull: true },
      {
        name: "created_at",
        type: "DATETIME",
        defaultValue: "CURRENT_TIMESTAMP",
      },
      { name: "filtered_text", type: "TEXT" },
      { name: "structured_response", type: "TEXT" },
      { name: "response_id", type: "TEXT" },
      { name: "response_created_at", type: "DATETIME" },
      {
        name: "is_successful",
        type: "BOOLEAN",
        notNull: true,
        defaultValue: "TRUE",
      },
    ],
  },
];

// FTS (Full-Text Search) tables
const ftsTablesInfo = [
  { name: "chunked_text_index_fts", searchableColumns: ["text"] },
  {
    name: "ocr_text_fts",
    searchableColumns: ["text", "app_name", "window_name"],
  },
  {
    name: "ui_monitoring_fts",
    searchableColumns: ["text_output", "app", "window"],
  },
  {
    name: "audio_transcriptions_fts",
    searchableColumns: ["transcription", "device", "speaker_id"],
  },
  {
    name: "frames_fts",
    searchableColumns: [
      "name",
      "browser_url",
      "app_name",
      "window_name",
      "focused",
    ],
  },
];

// Generate markdown output
function generateMarkdown() {
  let markdown = "# Database Schema\n\n";

  // Add main tables
  markdown += "## Main Tables\n\n";

  mainTables.forEach((table) => {
    markdown += `### ${table.name}\n\n`;
    markdown += `${table.description}\n\n`;

    markdown += "| Column | Type | Constraints |\n";
    markdown += "|--------|------|-------------|\n";

    table.columns.forEach((column) => {
      let constraints = [];

      if (column.primaryKey) {
        if (Array.isArray(column.primaryKey)) {
          constraints.push(`PRIMARY KEY (${column.primaryKey.join(", ")})`);
        } else {
          constraints.push("PRIMARY KEY");
        }
      }

      if (column.autoIncrement) constraints.push("AUTOINCREMENT");
      if (column.notNull) constraints.push("NOT NULL");
      if (column.unique) constraints.push("UNIQUE");
      if (column.defaultValue)
        constraints.push(`DEFAULT ${column.defaultValue}`);
      if (column.foreignKey)
        constraints.push(`REFERENCES ${column.foreignKey}`);
      if (column.check) constraints.push(`CHECK(${column.check})`);

      markdown += `| ${column.name} | ${column.type} | ${constraints.join(
        ", "
      )} |\n`;
    });

    // Add composite primary key if it exists
    if (table.compositePrimaryKey) {
      markdown += `\n**Composite Primary Key**: (${table.compositePrimaryKey.join(
        ", "
      )})\n`;
    }

    markdown += "\n";
  });

  // Add FTS tables
  markdown += "## Full-Text Search Tables\n\n";

  ftsTablesInfo.forEach((fts) => {
    markdown += `### ${fts.name}\n\n`;
    markdown += `Full-text search table for searching: ${fts.searchableColumns.join(
      ", "
    )}\n\n`;
  });

  return markdown;
}

// Write to file
const markdown = generateMarkdown();
fs.writeFileSync("database-schema.md", markdown);
console.log("Schema documentation written to database-schema.md");
