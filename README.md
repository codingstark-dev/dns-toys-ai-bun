# DNS Toys (Bun.js Version)

A fun DNS server implementation in Bun.js that provides various utility functions through DNS queries. This project is inspired by [dns.toys](https://github.com/knadh/dns.toys) created by [Kailash Nadh](https://github.com/knadh), CTO of Zerodha. While maintaining all the original functionality, this version adds AI-powered DNS responses using GPT models.

## Demo

<video src="demo/dnsbun.mp4" controls title="DNS Toys Demo"></video>

## Features

- AI-powered DNS responses using GPT models
- Time queries for different cities
- Weather information
- Currency conversion
- Unit conversion
- IP address lookup
- Word to number conversion
- Mathematical constants (Pi)
- CIDR range calculator
- Dice rolling
- Coin flipping
- Random number generation
- Epoch time conversion
- Aerial distance calculator
- UUID generation
- Sudoku solver
- Developer excuses
- Dictionary lookups
- Base conversion

## Tech Stack

- Bun.js - JavaScript/TypeScript runtime & package manager
- TypeScript - Type safety and developer experience
- dns2 - DNS server implementation for custom DNS responses
- OpenAI SDK (@ai-sdk/openai) - For AI-powered responses using GPT models
- Luxon - DateTime handling and timezone conversions
- Cheerio - HTML parsing for web scraping
- AI SDK - AI/ML model integration utilities

## Prerequisites

- [Bun](https://bun.sh) installed on your system
- OpenAI API key (for AI features)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/codingstark-dev/dns-toys-ai-bun
cd dns-toys-bun
```

2. Install dependencies:
```bash
bun install
```

## Environment Variables

Required environment variables (.env):
```
OPENAI_API_KEY=your-api-key
EXCHANGE_RATE_API_KEY=your-api-key
```

## Running the Server

There are two ways to run the server:

### Production Mode
```bash
# On Linux (requires root for port 53)
sudo bun run start

# On macOS or for development (using port 5353)
bun run start
```

### Development Mode
```bash
# On Linux (requires root for port 53)
sudo bun run dev

# On macOS or for development (using port 5353)
bun run dev
```

Development mode features:
- Auto-reloads when TypeScript files change
- Watches the entire project directory
- Provides detailed logging
- Gracefully handles server restarts

Note: On Linux, DNS servers typically need root privileges to bind to port 53. You can run the server on a different port (e.g., 5353) if you don't want to use sudo.

## Usage Examples

Query the DNS server using dig:

```bash
# AI queries
dig what-is-the-capital-of-india.ai @localhost

# Time queries
dig mumbai.time @localhost

# Weather queries
dig ahmedabad.weather @localhost

# Unit conversion
dig 42km-cm.unit @localhost

# Currency conversion
dig 99USD-INR.fx @localhost

# Get your IP
dig ip @localhost

# Word to number conversion
dig 1133.words @localhost

# Mathematical constant Pi
dig pi @localhost

# CIDR range calculator
dig 10.100.0.0/24.cidr @localhost

# Dice rolling
dig 1d6.dice @localhost

# Coin flipping
dig 2.coin @localhost

# Random number generation
dig 1-100.rand @localhost

# Epoch time conversion
dig 784783800.epoch @localhost

# Aerial distance calculation
dig A12.9352,77.6245/12.9698,77.7500.aerial @localhost

# UUID generation
dig 2.uuid @localhost

# Sudoku solving
dig 002840003.076000000.100006050.030080000.007503200.000020010.080100004.000000730.700064500.sudoku @localhost

# Developer excuse
dig excuse @localhost

# Dictionary lookup
dig fun.dict @localhost

# Base conversion
dig 100dec-hex.base @localhost

# Help - list all commands
dig help @localhost
```

## Acknowledgments

This project is a Bun.js implementation inspired by [dns.toys](https://github.com/knadh/dns.toys) created by [Kailash Nadh](https://github.com/knadh). The original project showcases the creative use of DNS for utility functions, and this version adds AI capabilities while utilizing the performance benefits of Bun.js.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
