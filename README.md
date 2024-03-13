# edgar-parser

`edgar-parser` is a high-performance Rust-based library for parsing XBRL and XML filings from EDGAR.

## Performance

Based on testing on M2 Macbook, `edgar-parser` can parse a large XBRL filing in under 100ms from local disk. This is about 4-5x faster than the same code running in Python using PyO3.

## Features

- Fast parsing of EDGAR XBRL and XML filings.
- Cross-platform support with pre-built binaries for multiple architectures.
- Easy integration with Node.js projects.

## Installation

You can install `edgar-parser` using your favorite package manager.

## Usage

```javascript
const { parseXbrl, parseOwnershipForm, parseForm13F, parseForm13FTable } = require('edgar-parser')

// Example: Parsing an XBRL document
const xbrlData = '<xbrl>...</xbrl>' // Your XBRL data here
const parsedXbrl = parseXbrl(xbrlData)
console.log(parsedXbrl)

// Example: Parsing an Ownership Form (Form 3, 4 ect.)
const ownershipFormData = '<xml>...</xml>' // Your Ownership Form data here
const parsedOwnershipForm = parseOwnershipForm(ownershipFormData)
console.log(parsedOwnershipForm)

// Example: Parsing a Form 13F
const form13FData = '<xml>...</xml>' // Your Form 13F data here
const parsedForm13F = parseForm13F(form13FData)
console.log(parsedForm13F)

// Example: Parsing a Form 13F Table
const form13FTableData = '<xml>...</xml>' // Your Form 13F Table data here
const parsedForm13FTable = parseForm13FTable(form13FTableData)
console.log(parsedForm13FTable)
```

## Supported Platforms

`edgar-parser` provides pre-built binaries for the following platforms:

- Linux (x64, arm64, musl)
- macOS (x64, arm64)
- Windows (x64-msvc)
- Android (arm64)

Feel free to open an issue if you need support for a different platform.
