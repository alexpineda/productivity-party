
# 

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

intro

# welcome to screenpipe

context is the dark matter of intelligence.

screenpipe empowers developers to build context-aware AI tools by:

- capturing screen & audio 24/7
- processing everything locally for privacy
- providing clean APIs for AI integration
- supporting all major platforms

built in rust for reliability, it's the bridge between human context and AI understanding.

## key features [Permalink for this section](https://docs.screenpi.pe/\#key-features)

- **24/7 media capture**: captures screen and audio data continuously, storing it locally.
- **personalized ai**: enables ai models to be powered by your captured data.
- **open source & secure**: your data stays private, 100% local, with complete control over storage and processing.
- **cross-platform**: works on windows, macos, and linux.
- **multi-device support**: supports multiple monitors & audio devices for comprehensive data capture.
- **plugins (pipes)**: allows the creation and use of plugins (pipes) in NextJS, running within a sandboxed runtime to extend functionality.

## target audience [Permalink for this section](https://docs.screenpi.pe/\#target-audience)

screenpipe is suitable for developers, AI businesses, and anyone interested in automating data capture and creating desktop context-aware ai agents.

## what's next? [Permalink for this section](https://docs.screenpi.pe/\#whats-next)

- [getting started](https://docs.screenpi.pe/docs/getting-started)
- [plugins](https://docs.screenpi.pe/docs/plugins)
- [examples](https://docs.screenpi.pe/docs/examples)

Last updated on February 18, 2025

[getting started](https://docs.screenpi.pe/docs/getting-started "getting started")
---


# api reference

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

api reference

# api reference for screenpipe

below is the detailed api reference for screenpipe's core functionality.

### search api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#search-api)

- **endpoint**: `/search`
- **method**: `get`
- **description**: searches captured data (ocr, audio transcriptions, etc.) stored in screenpipe's local database.

#### query parameters: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#query-parameters)

- `q` (string, optional): search term (a SINGLE word)
- `content_type` (enum): type of content to search:

  - `ocr`: optical character recognition text
  - `audio`: audio transcriptions
  - `ui`: user interface elements
- `limit` (int): max results per page (default: 20)
- `offset` (int): pagination offset
- `start_time` (timestamp, optional): filter by start timestamp
- `end_time` (timestamp, optional): filter by end timestamp
- `app_name` (string, optional): filter by application name
- `window_name` (string, optional): filter by window name
- `include_frames` (bool, optional): include base64 encoded frames
- `min_length` (int, optional): minimum content length
- `max_length` (int, optional): maximum content length
- `speaker_ids` (int\[\], optional): filter by specific speaker ids

#### sample requests: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-requests)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# Basic search
curl "http://localhost:3030/search?q=meeting&content_type=ocr&limit=10"

# Audio search with speaker filter
curl "http://localhost:3030/search?content_type=audio&speaker_ids=1,2"

# UI elements search
curl "http://localhost:3030/search?content_type=ui&app_name=chrome"
```

#### sample response: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-response)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "data": [\
    {\
      "type": "OCR",\
      "content": {\
        "frame_id": 123,\
        "text": "meeting notes",\
        "timestamp": "2024-03-10T12:00:00Z",\
        "file_path": "/frames/frame123.png",\
        "offset_index": 0,\
        "app_name": "chrome",\
        "window_name": "meeting",\
        "tags": ["meeting"],\
        "frame": "base64_encoded_frame_data"\
      }\
    }\
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 100
  }
}
```

### audio devices api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#audio-devices-api)

- **endpoint**: `/audio/list`
- **method**: `get`
- **description**: lists available audio input/output devices

#### sample response: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-response-1)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
[\
  {\
    "name": "built-in microphone",\
    "is_default": true\
  }\
]
```

### monitors api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#monitors-api)

- **endpoint**: `/vision/list`
- **method**: `post`
- **description**: lists available monitors/displays

#### sample response: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-response-2)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
[\
  {\
    "id": 1,\
    "name": "built-in display",\
    "width": 2560,\
    "height": 1600,\
    "is_default": true\
  }\
]
```

### tags api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#tags-api)

- **endpoint**: `/tags/:content_type/:id`
- **methods**: `post` (add), `delete` (remove)
- **description**: manage tags for content items
- **content\_type**: `vision` or `audio`

#### add tags request: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#add-tags-request)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "tags": ["important", "meeting"]
}
```

#### sample response: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-response-3)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "success": true
}
```

### pipes api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#pipes-api)

#### list pipes [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#list-pipes)

- **endpoint**: `/pipes/list`
- **method**: `get`

#### download pipe [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#download-pipe)

- **endpoint**: `/pipes/download`
- **method**: `post`

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "url": "https://github.com/user/repo/pipe-example"
}
```

#### enable pipe [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#enable-pipe)

- **endpoint**: `/pipes/enable`
- **method**: `post`

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "pipe_id": "pipe-example"
}
```

#### disable pipe [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#disable-pipe)

- **endpoint**: `/pipes/disable`
- **method**: `post`

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "pipe_id": "pipe-example"
}
```

#### update pipe config [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#update-pipe-config)

- **endpoint**: `/pipes/update`
- **method**: `post`

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "pipe_id": "pipe-example",
  "config": {
    "key": "value"
  }
}
```

### speakers api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#speakers-api)

#### list unnamed speakers [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#list-unnamed-speakers)

- **endpoint**: `/speakers/unnamed`
- **method**: `get`
- **description**: get list of speakers without names assigned

##### query parameters: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#query-parameters-1)

- `limit` (int): max results
- `offset` (int): pagination offset
- `speaker_ids` (int\[\], optional): filter specific speaker ids

##### sample request: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-request)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
curl "http://localhost:3030/speakers/unnamed?limit=10&offset=0"
```

#### search speakers [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#search-speakers)

- **endpoint**: `/speakers/search`
- **method**: `get`
- **description**: search speakers by name

##### query parameters: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#query-parameters-2)

- `name` (string, optional): name prefix to search for

##### sample request: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-request-1)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
curl "http://localhost:3030/speakers/search?name=john"
```

#### update speaker [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#update-speaker)

- **endpoint**: `/speakers/update`
- **method**: `post`
- **description**: update speaker name or metadata

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "id": 123,
  "name": "john doe",
  "metadata": "{\"role\": \"engineer\"}"
}
```

#### delete speaker [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#delete-speaker)

- **endpoint**: `/speakers/delete`
- **method**: `post`
- **description**: delete a speaker and associated audio chunks

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body-1)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "id": 123
}
```

#### get similar speakers [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#get-similar-speakers)

- **endpoint**: `/speakers/similar`
- **method**: `get`
- **description**: find speakers with similar voice patterns

##### query parameters: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#query-parameters-3)

- `speaker_id` (int): reference speaker id
- `limit` (int): max results

##### sample request: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-request-2)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
curl "http://localhost:3030/speakers/similar?speaker_id=123&limit=5"
```

#### merge speakers [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#merge-speakers)

- **endpoint**: `/speakers/merge`
- **method**: `post`
- **description**: merge two speakers into one

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body-2)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "speaker_to_keep_id": 123,
  "speaker_to_merge_id": 456
}
```

#### mark as hallucination [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#mark-as-hallucination)

- **endpoint**: `/speakers/hallucination`
- **method**: `post`
- **description**: mark a speaker as incorrectly identified

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body-3)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "speaker_id": 123
}
```

### health api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#health-api)

- **endpoint**: `/health`
- **method**: `get`
- **description**: system health status

#### sample response: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-response-4)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "status": "healthy",
  "last_frame_timestamp": "2024-03-10T12:00:00Z",
  "last_audio_timestamp": "2024-03-10T12:00:00Z",
  "last_ui_timestamp": "2024-03-10T12:00:00Z",
  "frame_status": "ok",
  "audio_status": "ok",
  "ui_status": "ok",
  "message": "all systems functioning normally"
}
```

### stream frames api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#stream-frames-api)

- **endpoint**: `/stream/frames`
- **method**: `get`
- **description**: stream frames as server-sent events (sse)

#### query parameters: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#query-parameters-4)

- `start_time` (timestamp): start time for frame stream
- `end_time` (timestamp): end time for frame stream

#### sample request: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-request-3)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
curl "http://localhost:3030/stream/frames?start_time=2024-03-10T12:00:00Z&end_time=2024-03-10T13:00:00Z"
```

#### sample event data: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-event-data)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "timestamp": "2024-03-10T12:00:00Z",
  "devices": [\
    {\
      "device_id": "screen-1",\
      "frame": "base64_encoded_frame_data"\
    }\
  ]
}
```

### experimental api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#experimental-api)

#### merge frames [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#merge-frames)

- **endpoint**: `/experimental/frames/merge`
- **method**: `post`
- **description**: merges multiple video frames into a single video

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body-4)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "video_paths": ["path/to/video1.mp4", "path/to/video2.mp4"]
}
```

##### sample response: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-response-5)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "video_path": "/path/to/merged/video.mp4"
}
```

#### validate media [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#validate-media)

- **endpoint**: `/experimental/validate/media`
- **method**: `get`
- **description**: validates media file format and integrity

##### query parameters: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#query-parameters-5)

- `file_path` (string): path to media file to validate

##### sample response: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#sample-response-6)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "status": "valid media file"
}
```

#### input control (experimental feature) [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#input-control-experimental-feature)

- **endpoint**: `/experimental/input_control`
- **method**: `post`
- **description**: control keyboard and mouse input programmatically

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body-5)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "action": {
    "type": "KeyPress",
    "data": "enter"
  }
}
```

or

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "action": {
    "type": "MouseMove",
    "data": {
      "x": 100,
      "y": 200
    }
  }
}
```

or

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "action": {
    "type": "MouseClick",
    "data": "left"
  }
}
```

or

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "action": {
    "type": "WriteText",
    "data": "hello world"
  }
}
```

### database api [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#database-api)

#### execute raw sql [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#execute-raw-sql)

- **endpoint**: `/raw_sql`
- **method**: `post`
- **description**: execute raw SQL queries against the database (use with caution)

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body-6)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "query": "SELECT * FROM frames LIMIT 5"
}
```

#### add content [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#add-content)

- **endpoint**: `/add`
- **method**: `post`
- **description**: add new content (frames or transcriptions) to the database

##### request body: [Permalink for this section](https://docs.screenpi.pe/docs/api-reference\#request-body-7)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "device_name": "device1",
  "content": {
    "content_type": "frames",
    "data": {
      "frames": [\
        {\
          "file_path": "/path/to/frame.png",\
          "timestamp": "2024-03-10T12:00:00Z",\
          "app_name": "chrome",\
          "window_name": "meeting",\
          "ocr_results": [\
            {\
              "text": "detected text",\
              "text_json": "{\"additional\": \"metadata\"}",\
              "ocr_engine": "tesseract",\
              "focused": true\
            }\
          ],\
          "tags": ["meeting", "important"]\
        }\
      ]
    }
  }
}
```

or

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
{
  "device_name": "microphone1",
  "content": {
    "content_type": "transcription",
    "data": {
      "transcription": "transcribed text",
      "transcription_engine": "whisper"
    }
  }
}
```

Last updated on February 18, 2025

[sdk reference](https://docs.screenpi.pe/docs/sdk-reference "sdk reference") [cli reference](https://docs.screenpi.pe/docs/cli-reference "cli reference")
---


# architecture

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

architecture overview

# architecture overview

screenpipe's architecture handles continuous screen and audio capture, local data storage, and real-time processing. here's a breakdown of the key components:

## diagram overview [Permalink for this section](https://docs.screenpi.pe/docs/architecture\#diagram-overview)

![screenpipe diagram](https://raw.githubusercontent.com/mediar-ai/screenpipe/main/content/diagram2.png)

1. **input**: screen and audio data
2. **processing**: ocr, stt, transcription, multimodal integration
3. **storage**: sqlite database
4. **plugins**: custom pipes
5. **integrations**: ollama, deepgram, notion, whatsapp, etc.

this modular architecture makes screenpipe adaptable to various use cases, from personal productivity tracking to advanced business intelligence.

### data abstraction layers [Permalink for this section](https://docs.screenpi.pe/docs/architecture\#data-abstraction-layers)

![screenpipe data abstractions](https://raw.githubusercontent.com/user-attachments/assets/93136194-0945-4eec-a9f1-f58eb9e440a4)

screenpipe organizes data in concentric layers of abstraction, from raw data to high-level intelligence:

1. **core (mp4 files)**: the innermost layer contains the raw screen recordings and audio captures in mp4 format
2. **processing layer**: contains the direct processing outputs

   - OCR embeddings: vectorized text extracted from screen
   - human id: anonymized user identification
   - accessibility: metadata for improved data access
   - transcripts: processed audio-to-text
3. **AI memories**: the outermost layer represents the highest level of abstraction where AI processes and synthesizes all lower-level data into meaningful insights
4. **pipes enrich**: custom processing modules that can interact with and enhance data at any layer

this layered approach enables both granular access to raw data and sophisticated AI-powered insights while maintaining data privacy and efficiency.

## status [Permalink for this section](https://docs.screenpi.pe/docs/architecture\#status)

Alpha: runs on my computer `Macbook pro m3 32 GB ram` and a $400 Windows laptop, 24/7.

Uses 600 MB, 10% CPU.

- [ ] Integrations

  - [x]  ollama
  - [x]  openai
  - [x]  Friend wearable
  - [x] [Fileorganizer2000 (opens in a new tab)](https://github.com/different-ai/file-organizer-2000)
  - [x]  mem0
  - [x]  Brilliant Frames
  - [x]  Vercel AI SDK
  - [ ]  supermemory
  - [x]  deepgram
  - [x]  unstructured
  - [x]  excalidraw
  - [x]  Obsidian
  - [x]  Apple shortcut
  - [x]  multion
  - [x]  iPhone
  - [ ]  Android
  - [ ]  Camera
  - [ ]  Keyboard
  - [x]  Browser
  - [x]  Pipe Store (a list of "pipes" you can build, share & easily install to get more value out of your screen & mic data without effort). It runs in Bun Typescript engine within screenpipe on your computer
- [x] screenshots + OCR with different engines to optimise privacy, quality, or energy consumption

  - [x]  tesseract
  - [x]  Windows native OCR
  - [x]  Apple native OCR
  - [x]  unstructured.io
  - [ ]  screenpipe screen/audio specialised LLM
- [x] audio + STT (works with multi input devices, like your iPhone + mac mic, many STT engines)

  - [x]  Linux, MacOS, Windows input & output devices
  - [x]  iPhone microphone
- [x] [remote capture (opens in a new tab)](https://github.com/mediar-ai/screenpipe/discussions/68) (run screenpipe on your cloud and it capture your local machine, only tested on Linux) for example when you have low compute laptop
- [x]  optimised screen & audio recording (mp4 encoding, estimating 30 gb/m with default settings)
- [x]  sqlite local db
- [x]  local api
- [x]  Cross platform CLI, [desktop app (opens in a new tab)](https://screenpi.pe/) (MacOS, Windows, Linux)
- [x]  Metal, CUDA
- [ ]  TS SDK
- [ ]  multimodal embeddings
- [ ]  cloud storage options (s3, pgsql, etc.)
- [x]  cloud computing options (deepgram for audio, unstructured for OCR)
- [x]  custom storage settings: customizable capture settings (fps, resolution)
- [ ] security

  - [x]  window specific capture (e.g. can decide to only capture specific tab of cursor, chrome, obsidian, or only specific app)
  - [ ]  encryption
  - [x]  PII removal
- [ ]  fast, optimised, energy-efficient modes
- [ ]  webhooks/events (for automations)
- [ ]  abstractions for multiplayer usage (e.g. aggregate sales team data, company team data, partner, etc.)

Last updated on February 18, 2025

[plugins (pipes)](https://docs.screenpi.pe/docs/plugins "plugins (pipes)") [sdk reference](https://docs.screenpi.pe/docs/sdk-reference "sdk reference")
---


# cli reference

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

cli reference

# cli reference for screenpipe

below is the detailed cli reference for screenpipe's core functionality.

### core options [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#core-options)

- **fps** ( `-f, --fps <FLOAT>`): frames per second for continuous recording
  - default: `1.0` (non-macos), `0.5` (macos)
  - storage impact: `1 FPS ≈ 30 GB/month`, `5 FPS ≈ 150 GB/month`
- **port** ( `-p, --port <INT>`): port to run the server on
  - default: `3030`
- **data-dir** ( `--data-dir <PATH>`): data directory
  - default: `$HOME/.screenpipe`
- **debug** ( `--debug`): enable debug logging
  - default: `false`

### audio options [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#audio-options)

- **audio-chunk-duration** ( `-d, --audio-chunk-duration <INT>`): audio chunk duration in seconds
  - default: `30`
- **disable-audio** ( `--disable-audio`): disable audio recording
  - default: `false`
- **audio-device** ( `-i, --audio-device <STRING>`): audio devices to use (can specify multiple)

- **realtime-audio-device** ( `-r, --realtime-audio-device <STRING>`): devices for realtime transcription

- **list-audio-devices** ( `--list-audio-devices`): list available audio devices

- **audio-transcription-engine** ( `-a, --audio-transcription-engine <ENGINE>`): transcription engine
  - options:
    - `deepgram`: cloud-based, high quality (free tier available)
    - `whisper-tiny`: local, lightweight, privacy-focused
    - `whisper-large`: local, higher quality than tiny
    - `whisper-large-v3-turbo`: local, highest quality
  - default: `whisper-large-v3-turbo`
- **enable-realtime-audio-transcription** ( `--enable-realtime-audio-transcription`): enable realtime transcription
  - default: `false`

### vision options [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#vision-options)

- **disable-vision** ( `--disable-vision`): disable vision recording
  - default: `false`
- **list-monitors** ( `--list-monitors`): list available monitors

- **monitor-id** ( `-m, --monitor-id <INT>`): monitor IDs to record (can specify multiple)

- **ignored-windows** ( `--ignored-windows <STRING>`): windows to ignore by title
  - example: `--ignored-windows "Spotify" --ignored-windows "Chrome"`
- **included-windows** ( `--included-windows <STRING>`): windows to include by title
  - example: `--included-windows "Code" --included-windows "Terminal"`
- **video-chunk-duration** ( `--video-chunk-duration <INT>`): video chunk duration in seconds
  - default: `60`
- **ocr-engine** ( `-o, --ocr-engine <ENGINE>`): OCR engine selection
  - options:
    - `apple-native`: default for macos
    - `windows-native`: default for windows
    - `tesseract`: default for linux
    - `unstructured`: cloud-based (free tier available)
    - `custom`: configurable via `SCREENPIPE_CUSTOM_OCR_CONFIG`

#### custom ocr engine example [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#custom-ocr-engine-example)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# 1. setup python environment & ocr server
python -m venv venv
source venv/bin/activate

pip install fastapi uvicorn easyocr pillow numpy

# create ocr server file
cat > app.py << EOF
from fastapi import FastAPI, HTTPException
import base64
import io
from PIL import Image
import numpy as np
import time
import easyocr

app = FastAPI()
reader = easyocr.Reader(['en', 'ch_sim'])

@app.post("/ocr")
async def read_ocr(payload: dict):
    image_b64 = payload.get("image")
    if not image_b64:
        raise HTTPException(status_code=400, detail="no image data provided")
    try:
        start = time.time()
        image_data = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_data))
        image_np = np.array(image)
        result = reader.readtext(image_np)
        text = "\n".join([item[1] for item in result])
        confidence = sum([item[2] for item in result]) / len(result) if result else 0.0
        print(f"ocr took {time.time() - start:.2f} seconds")
        return {
            "text": text,
            "structured_data": {},
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ocr error: {str(e)}")
EOF

# start the ocr server
uvicorn app:app --host 0.0.0.0 --port 8000

# 2. configure screenpipe
export SCREENPIPE_CUSTOM_OCR_CONFIG='{
  "api_url": "http://localhost:8000/ocr",
  "api_key": "",
  "timeout_ms": 5000
}'

# 3. run screenpipe with custom ocr
screenpipe add \
  path/to/videos \
  --ocr-engine custom \
  --data-dir /tmp/sp

# 4. cleanup
# stop server with ctrl+c
deactivate
rm -rf venv app.py
```

### language & privacy [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#language--privacy)

- **language** ( `-l, --language <LANG>`): languages to support (can specify multiple)

- **use-pii-removal** ( `--use-pii-removal`): enable PII removal from OCR text
  - default: `false`

### voice activity detection [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#voice-activity-detection)

- **vad-engine** ( `--vad-engine <ENGINE>`): voice activity detection engine
  - options: `silero`, `webrtc`
  - default: `silero`
- **vad-sensitivity** ( `--vad-sensitivity <LEVEL>`): VAD sensitivity level
  - options: `low`, `medium`, `high`
  - default: `high`

### experimental features [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#experimental-features)

- **enable-llm** ( `--enable-llm`): enable local LLM API
  - default: `false`
- **enable-ui-monitoring** ( `--enable-ui-monitoring`): enable UI monitoring (macos only)
  - default: `false`
- **enable-frame-cache** ( `--enable-frame-cache`): enable experimental video frame cache
  - default: `false`
- **capture-unfocused-windows** ( `--capture-unfocused-windows`): capture unfocused windows
  - default: `false`
- **enable-realtime-audio-transcription** ( `--enable-realtime-audio-transcription`): enable realtime transcription
  - default: `false`
  - requires: at least one `--realtime-audio-device`
  - note: experimental feature, may impact system performance

### subcommands [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#subcommands)

#### pipe management [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#pipe-management)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# list all pipes
screenpipe pipe list [--output <FORMAT>] [--port <PORT>]

# install a new pipe
screenpipe pipe install <URL> [--output <FORMAT>] [--port <PORT>]

# get pipe info
screenpipe pipe info <ID> [--output <FORMAT>] [--port <PORT>]

# enable/disable pipe
screenpipe pipe enable <ID> [--port <PORT>]
screenpipe pipe disable <ID> [--port <PORT>]

# delete pipe
screenpipe pipe delete <ID> [-y] [--port <PORT>]

# purge all pipes
screenpipe pipe purge [-y] [--port <PORT>]
```

#### add external data to screenpipe (OCR only) [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#add-external-data-to-screenpipe-ocr-only)

allows you to add external screen recordings to screenpipe, for example it could be your iphone screen recordings, your physical journal photos, etc.

companies use this to index their product's screen recordings, for example.

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# add video files
screenpipe add <PATH> [--data-dir <DIR>] [--output <FORMAT>] [--pattern <REGEX>] [--ocr-engine <ENGINE>] [--metadata-override <PATH>]
```

by default, screenpipe extracts metadata (fps, duration, creation time) directly from video files. however, you can override these with a metadata file:

#### metadata override example [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#metadata-override-example)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# 1. setup test videos
mkdir -p $HOME/Downloads/tmpvideos

# copy 3 videos with random names
find $HOME/.screenpipe/data -type f -name "*monitor*.mp4" | head -n 3 | while read -r file; do
    case $RANDOM in
        [0-9][0-9][0-9][0-9])
            cp "$file" "$HOME/Downloads/tmpvideos/video1.mp4"
            ;;
        [0-9][0-9][0-9][0-9][0-9])
            cp "$file" "$HOME/Downloads/tmpvideos/video2.mp4"
            ;;
        *)
            cp "$file" "$HOME/Downloads/tmpvideos/video3.mp4"
            ;;
    esac
done

# 2. create metadata override file
cat > metadata.json << EOF
{
  "overrides": [\
    {\
      "file_path": "$HOME/Downloads/tmpvideos/video1.mp4",\
      "metadata": {\
        "creation_time": "2024-03-20T10:00:00Z",\
        "fps": 30.0,\
        "duration": 300.0,\
        "device_name": "MacBook Pro"\
      }\
    },\
    {\
      "file_path": "$HOME/Downloads/tmpvideos/video2.mp4",\
      "metadata": {\
        "creation_time": "2024-03-21T15:30:00Z",\
        "fps": 24.0,\
        "duration": 400.0,\
        "device_name": "External Monitor"\
      }\
    },\
    {\
      "file_path": "$HOME/Downloads/tmpvideos/video3.mp4",\
      "metadata": {\
        "creation_time": "2024-03-22T09:15:00Z",\
        "fps": 60.0,\
        "duration": 200.0,\
        "device_name": "iPad Screen"\
      }\
    }\
  ]
}
EOF

# 3. run screenpipe with metadata override
screenpipe add \
  $HOME/Downloads/tmpvideos \
  --metadata-override metadata.json \
  --data-dir /tmp/sp

# 4. cleanup
rm -rf $HOME/Downloads/tmpvideos
rm metadata.json
```

note: if you don't provide a metadata override file, screenpipe will automatically extract metadata from the video files. use overrides when you need to specify custom metadata or when the automatic extraction fails.

#### database [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#database)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# run migrations
screenpipe migrate
```

### Shell Completions [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#shell-completions)

The `screenpipe` CLI supports generating shell completions for popular shells. Follow the steps below to enable autocompletion for your shell:

#### Bash [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#bash)

1. Add the following to your `.bashrc` profile:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
eval "$(screenpipe completions bash)"
```

2. Reload your profile:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
source ~/.bashrc
```


#### Zsh [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#zsh)

1. Add the following to your `.zshrc` profile:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
eval "$(screenpipe completions zsh)"
```

2. Reload your profile:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
source ~/.zshrc
```


\`

#### Fish [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#fish)

1. Create `~/.config/fish/conf.d/screenpipe.fish` and add this line to it:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
screenpipe completions fish | source
```


#### PowerShell [Permalink for this section](https://docs.screenpi.pe/docs/cli-reference\#powershell)

1. Add the following to the end of your profile file:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
screenpipe completions powershell | Out-String | Invoke-Expression
```


- For macOS/Linux, the profile is located at `~/.config/powershell/Microsoft.PowerShell_profile.ps1`
- For Windows location is either:
  - `%userprofile%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1` Powershell 5
  - `%userprofile%\Documents\PowerShell\Microsoft.PowerShell_profile.ps1` Powershell 6+
- To create the profile file you can run this in PowerShell:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
if (-not (Test-Path $profile)) { New-Item $profile -Force }
```

- To edit your profile run this in PowerShell:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
Invoke-Item $profile
```


2. Reload your profile:



```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
. $PROFILE
```


Last updated on February 18, 2025

[api reference](https://docs.screenpi.pe/docs/api-reference "api reference") [contributing](https://docs.screenpi.pe/docs/contributing "contributing")
---


# contributing

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

contributing

# contributing

for detailed contribution guidelines, build instructions, and development setup, please see our [contributing guide on github (opens in a new tab)](https://github.com/mediar-ai/screenpipe/blob/main/CONTRIBUTING.md).

### quick links [Permalink for this section](https://docs.screenpi.pe/docs/contributing\#quick-links)

- [report a bug (opens in a new tab)](https://github.com/mediar-ai/screenpipe/issues/new?labels=bug)
- [request a feature (opens in a new tab)](https://github.com/mediar-ai/screenpipe/issues/new?labels=enhancement)
- [join our discord (opens in a new tab)](https://discord.gg/du9ebuw7uq)
- [schedule a call (opens in a new tab)](https://cal.com/louis030195/screenpipe)

Last updated on February 18, 2025

[cli reference](https://docs.screenpi.pe/docs/cli-reference "cli reference") [faq](https://docs.screenpi.pe/docs/faq "faq")
---


# examples

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

# 404

## This page could not be found.
---


# faq

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

faq

What's the difference with rewind.ai?

screenpipe is for developers to build apps like rewind.ai.

Where is the data stored?

- 100% of the data stay local in a SQLite database and mp4/mp3 files. You own your data

Do you encrypt the data?

- Not yet but we're working on it. We want to provide you the highest level of security.

How can I customize capture settings to reduce storage and energy usage?

- You can adjust frame rates and resolution in the configuration. Lower values will reduce storage and energy consumption. We're working on making this more user-friendly in future updates.

What are some practical use cases for screenpipe?

- RAG & question answering
- Automation (write code somewhere else while watching you coding, write docs, fill your CRM, sync company's knowledge, etc.)
- Analytics (track human performance, education, become aware of how you can improve, etc.)
- etc.
- We're constantly exploring new use cases and welcome community input!

Can I run screenpipe on remote/virtual machines?

- yes! screenpipe works seamlessly with remote desktop solutions
- microsoft remote desktop: works out of the box, capturing both screen and audio
- other remote solutions: generally compatible as long as they support audio/video forwarding
- check our [server setup guide](https://docs.screenpi.pe/docs/server) for detailed instructions

How resource-intensive is screenpipe?

- designed to be lightweight and efficient
- typical cpu usage: 1-2% on modern machines
- memory footprint: ~100-200mb baseline
- storage usage varies based on your capture settings and activity
- optimized for 24/7 operation

Can I build custom plugins/pipes?

- yes! screenpipe is designed to be extensible
- write plugins in typescript + bun
- full access to captured screen/audio data
- integrate with any ai model or external service
- check our [plugin development guide](https://docs.screenpi.pe/docs/plugins) for details

Is screenpipe open source?

- yes! core functionality is open source under MIT license
- built with rust + tauri for the core
- plugins system in typescript + bun
- community contributions welcome
- find us on [github (opens in a new tab)](https://github.com/mediar-ai/screenpipe)

Last updated on February 18, 2025

[contributing](https://docs.screenpi.pe/docs/contributing "contributing")
---


# getting started

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

getting started

# getting started

### install now [Permalink for this section](https://docs.screenpi.pe/docs/getting-started\#install-now)

screenpipe offers multiple installation methods. for most users, we recommend:

1. downloading the [desktop app (opens in a new tab)](https://screenpi.pe/)
2. or using our quick install CLI:

macos & linuxwindows

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
curl -fsSL get.screenpi.pe/cli | sh
screenpipe
```

then query the data using our JavaScript SDK:

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
import { pipe } from "@screenpipe/js";

async function queryScreenpipe() {
  // get content from last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const results = await pipe.queryScreenpipe({
    startTime: fiveMinutesAgo,
    limit: 10,
    contentType: "all", // can be "ocr", "audio", or "all"
  });

  if (!results) {
    console.log("no results found or error occurred");
    return;
  }

  console.log(`found ${results.pagination.total} items`);

  // process each result
  for (const item of results.data) {
    if (item.type === "OCR") {
      console.log(`OCR: ${JSON.stringify(item.content)}`);
    } else if (item.type === "Audio") {
      console.log(`transcript: ${JSON.stringify(item.content)}`);
    }
  }
}

queryScreenpipe().catch(console.error);
```

now download the [desktop app (opens in a new tab)](https://screenpi.pe/) and use pipes (plugins) to add more features!

### connect to AI providers [Permalink for this section](https://docs.screenpi.pe/docs/getting-started\#connect-to-ai-providers)

screenpipe can connect to various AI providers to process your data. here's how to set up popular local AI providers:

ollamalmstudio

1. install ollama from [ollama.ai (opens in a new tab)](https://ollama.ai/) and run your preferred model

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# start ollama with your preferred model
ollama run phi4:14b-q4_K_M
```

2. then configure screenpipe to use ollama in your settings with model phi4:14b-q4\_K\_M

that's it! screenpipe will now use ollama for AI like search, rewind, and more. you can change the model in settings.

verify your ai provider using any pipe in the store!

### for developers [Permalink for this section](https://docs.screenpi.pe/docs/getting-started\#for-developers)

if you're interested in building from source or contributing to screenpipe, please check our [contributing guide (opens in a new tab)](https://github.com/mediar-ai/screenpipe/blob/main/CONTRIBUTING.md).

### for businesses [Permalink for this section](https://docs.screenpi.pe/docs/getting-started\#for-businesses)

some of our customers use screenpipe in the following ways:

- have existing screen recording software and want enterprise screen search engine
- want to integrate team's scale meeting transcriptions
- want to extract knowledge from enterprise-scale screens
- running the CLI on their customer's computer
- running the app on their customer's computer
- embedding the library or CLI in their own software
- running the CLI in the cloud and forward the video/audio through SSH
- using our Microsoft Remote Desktop / SSH integration

[book a call to discuss your business needs (opens in a new tab)](https://cal.com/louis030195/screenpipe-for-businesses)

Last updated on February 18, 2025

[intro](https://docs.screenpi.pe/ "intro") [plugins (pipes)](https://docs.screenpi.pe/docs/plugins "plugins (pipes)")
---


# plugins

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

plugins (pipes)

# plugins (pipes)

screenpipe is built for extensibility through plugins that interact with captured screen and audio data. whether you need to tag activities, generate summaries, or send data to third-party services, plugins let you build powerful workflows.

plugins run within screenpipe's sandboxed environment. written in typescript/javascript and nextjs.

### why build pipes? 🚀 [Permalink for this section](https://docs.screenpi.pe/docs/plugins\#why-build-pipes-)

regardless of progress in AI architecture, it's as good as the given context. screenpipe is the bridge between dull hallunicating AI and super intelligent agents.

#### for developers [Permalink for this section](https://docs.screenpi.pe/docs/plugins\#for-developers)

- **zero infrastructure**: 100% local by default, no servers or complex setups, access to your auth tokens (unlike cloud agents)
- **typescript + rust + bun**: blazing fast environment, highly optimized pipeline, 4 AI models, running on $200 laptops
- **full context**: rich OCR, desktop scrapping, keyboard/mouse, and audio transcription APIs
- **open source**: no BS, no tricks, MIT license
- **monetization ready**: Stripe integration to monetize your pipes
- **no lock-in**: use our store for distribution, then drive traffic into your exported standalone app

  - [screenpipe-tauri-template (opens in a new tab)](https://github.com/LorenzoBloedow/screenpipe-tauri-template-dev)
  - [screenpipe-electron-template (opens in a new tab)](https://github.com/neo773/screenpipe-electron)

#### killer features [Permalink for this section](https://docs.screenpi.pe/docs/plugins\#killer-features)

- **ai flexibility**: OpenAI, local LLMs (ollama), Anthropic, Gemini, etc.
- **rich APIs**:

  - `pipe.input` for keyboard/mouse control
  - `pipe.queryScreenpipe` for context
  - `pipe.settings` for app settings
  - experimental `pipe.streamTranscriptions` for audio transcription streaming (atm uses a lot of RAM, make sure to enable it in settings/CLI)
  - experimental `pipe.streamVision` for OCR/Accessibility streaming (atm uses a lot of RAM)
- **sandboxed & cross-platform**: safe execution on all OS
- **real-time**: process screen & audio as it happens
- **cron jobs**: schedule your pipes to run at specific times, same API as Vercel
- **nextjs**: build desktop native apps with NextJS - no native hell

### quick start [Permalink for this section](https://docs.screenpi.pe/docs/plugins\#quick-start)

The fastest way to create a new pipe is using our CLI:

bunnpmyarnpnpm

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
bunx --bun @screenpipe/dev@latest pipe create
```

follow installation instructions & test your pipe locally

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
bun dev
```

### developer CLI [Permalink for this section](https://docs.screenpi.pe/docs/plugins\#developer-cli)

for developers wanting to publish pipes to the store, we provide a dedicated CLI tool:

![developer account](https://raw.githubusercontent.com/mediar-ai/screenpipe/main/content/developer-account.png)

prerequisite: connect your Stripe account in settings/account to obtain your developer API key.

available commands:

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
# authenticate with your API key
bunx --bun @screenpipe/dev@latest login --apiKey <your-key>

# create a new pipe
bunx --bun @screenpipe/dev@latest pipe register --name my-pipe [--paid --price 9.99] # MAKE SURE TO SET THE PRICE IF YOU WANT TO SELL IT - IRREVERSIBLE
# you'll receive payouts to your stripe account on a daily basis

# add predefined components to your pipe
bunx --bun @screenpipe/dev@latest components add
# select components from the interactive menu:
# - use-health: health monitoring hooks
# - use-settings: settings management
# - route-settings: settings page routing
# - use-sql-autocomplete: SQL query assistance
# - sql-autocomplete-input: SQL input component
# - use-search-history: search history management
# - use-ai-provider: AI integration hooks

# publish your pipe to the store
bunx --bun @screenpipe/dev@latest pipe publish --name my-pipe
# our team will review your pipe and publish it to the store
# if approved, your pipe will be available in the store to everyone

# list all versions of your pipe
bunx --bun @screenpipe/dev@latest pipe list-versions --name my-pipe

# end current session
bunx --bun @screenpipe/dev@latest logout
```

you can deploy your pipe to your screenpipe app through the UI or using `screenpipe pipe install <path>` and `screenpipe pipe enable <id/folder of your pipe>`.

when you're ready to deploy, send a PR to the [screenpipe repo (opens in a new tab)](https://github.com/mediar-ai/screenpipe) to add your pipe to the store.

### available pipes [Permalink for this section](https://docs.screenpi.pe/docs/plugins\#available-pipes)

| **pipe** | **description** | **link** |
| --- | --- | --- |
| **memories gallery** | google-photo like gallery of your screen recordings with AI insights | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/memories) |
| **data table** | explore your data in a powerful table view with filtering and sorting | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/data-table) |
| **search** | search through your screen recordings and audio transcripts with AI | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/search) |
| **timeline** | visualize your day with AI-powered timeline of activities | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/timeline) |
| **speaker identification** | automatically identify and label different speakers using AI | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/identify-speakers) |
| **obsidian logs** | automate your second brain by logging activities to obsidian | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/obsidian) |
| **meeting assistant** | organize and summarize meetings with AI - get transcripts and insights | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/meeting) |
| **linkedin ai agent** | automate business development on linkedin | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/linkedin_ai_assistant) |
| **loom** | generate looms from your screenpipe data | [link (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes/pipe-for-loom) |

to install a pipe from the store, just add the url of the folder in the UI and click install.

Last updated on February 18, 2025

[getting started](https://docs.screenpi.pe/docs/getting-started "getting started") [architecture overview](https://docs.screenpi.pe/docs/architecture "architecture overview")
---


# sdk reference

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

docs

sdk reference

# javascript sdk reference

screenpipe provides two sdk packages:

- `@screenpipe/js` \- for node.js environments (nextjs api routes, etc)
- `@screenpipe/browser` \- for browser environments

both sdks provide type-safe interfaces to interact with screenpipe's core functionality.

### installation [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#installation)

#### node.js sdk [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#nodejs-sdk)

npmpnpmbunyarn

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
npm install @screenpipe/js
```

#### browser sdk [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#browser-sdk)

npmpnpmbunyarn

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
npm install @screenpipe/browser
```

### basic usage [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#basic-usage)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
// node.js
import { pipe } from '@screenpipe/js'

// browser
import { pipe } from '@screenpipe/browser'
```

### search api [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#search-api)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const results = await pipe.queryScreenpipe({
  q: "meeting notes",
  contentType: "ocr", // "ocr" | "audio" | "ui" | "all" | "audio+ui" | "ocr+ui" | "audio+ocr"
  limit: 10,
  offset: 0,
  startTime: "2024-03-10T12:00:00Z",
  endTime: "2024-03-10T13:00:00Z",
  appName: "chrome",
  windowName: "meeting",
  includeFrames: true,
  minLength: 10,
  maxLength: 1000,
  speakerIds: [1, 2],
  frameName: "screenshot.png"
})
```

### input control api [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#input-control-api)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
// type text
await pipe.input.type("hello world")

// press key
await pipe.input.press("enter")

// move mouse
await pipe.input.moveMouse(100, 200)

// click
await pipe.input.click("left") // "left" | "right" | "middle"
```

### realtime streams [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#realtime-streams)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
// stream transcriptions
for await (const chunk of pipe.streamTranscriptions()) {
  console.log(chunk.choices[0].text)
  console.log(chunk.metadata) // { timestamp, device, isInput }
}

// stream vision events
for await (const event of pipe.streamVision(true)) { // true to include images
  console.log(event.data.text)
  console.log(event.data.app_name)
  console.log(event.data.image) // base64 if includeImages=true
}
```

### notifications (desktop) [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#notifications-desktop)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
await pipe.sendDesktopNotification({
  title: "meeting starting",
  body: "your standup begins in 5 minutes",
  actions: [\
    {\
      id: "join",\
      label: "join meeting"\
    }\
  ],
  timeout: 5000,
  persistent: false
})
```

### node.js specific features [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#nodejs-specific-features)

the node sdk includes additional features not available in the browser:

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
// settings management
const settings = await pipe.settings.getAll()
await pipe.settings.update({ aiModel: "gpt-4" })

// inbox management (node only)
const messages = await pipe.inbox.getMessages()
await pipe.inbox.clearMessages()
```

### typescript types [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#typescript-types)

both sdks export comprehensive typescript types:

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
import type {
  ContentType,
  ScreenpipeQueryParams,
  ScreenpipeResponse,
  OCRContent,
  AudioContent,
  UiContent,
  Speaker,
  NotificationOptions,
  Settings,
  // ... and more
} from '@screenpipe/js' // or @screenpipe/browser
```

key types include:

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
type ContentType = "all" | "ocr" | "audio" | "ui" | "audio+ui" | "ocr+ui" | "audio+ocr"

interface ScreenpipeQueryParams {
  q?: string
  contentType?: ContentType
  limit?: number
  offset?: number
  startTime?: string
  endTime?: string
  appName?: string
  windowName?: string
  includeFrames?: boolean
  minLength?: number
  maxLength?: number
  speakerIds?: number[]
  frameName?: string
}

interface ScreenpipeResponse {
  data: ContentItem[] // OCR | Audio | UI content
  pagination: {
    limit: number
    offset: number
    total: number
  }
}
```

### error handling [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#error-handling)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
try {
  const results = await pipe.queryScreenpipe({
    q: "meeting",
    contentType: "ocr"
  })
} catch (error) {
  console.error("screenpipe api error:", error)
}
```

### examples [Permalink for this section](https://docs.screenpi.pe/docs/sdk-reference\#examples)

check out our [production pipe examples (opens in a new tab)](https://github.com/mediar-ai/screenpipe/tree/main/pipes) to see real-world usage of the sdk:

- data visualization pipe
- linkedin ai assistant
- meeting summarizer
- memories gallery
- obsidian integration
- search interface

these examples demonstrate best practices and common patterns when building with screenpipe's sdk.

Last updated on February 18, 2025

[architecture overview](https://docs.screenpi.pe/docs/architecture "architecture overview") [api reference](https://docs.screenpi.pe/docs/api-reference "api reference")
---


# server

![](https://static.scarf.sh/a.png?x-pxid=6124adb3-618c-466d-a12b-a046ba1443b9)

# 404

## This page could not be found.
---

