# Dungeon Integration Tests

This document provides test cases and verification steps for the dungeon integration module.

## Test Cases

### 1. Python Module Direct Testing

#### Test 1.1: Basic dungeon generation
```bash
python3 dungeon_integration.py --level 5
```
**Expected:** Valid JSON output with dungeon structure

#### Test 1.2: Generation with seed
```bash
python3 dungeon_integration.py --level 3 --seed 42
```
**Expected:** Reproducible dungeon generation (same output each time with same seed)

#### Test 1.3: Compact output
```bash
python3 dungeon_integration.py --level 1 --compact
```
**Expected:** JSON output without indentation

#### Test 1.4: Validation
```bash
python3 dungeon_integration.py --level 5 --validate
```
**Expected:** Generated dungeon passes validation checks

### 2. API Endpoint Testing

#### Test 2.1: Basic API call
```bash
curl -X POST http://localhost:5000/api/dungeon/generate \
  -H "Content-Type: application/json" \
  -d '{"level": 5}'
```
**Expected:** 200 OK with dungeon JSON

#### Test 2.2: API call with seed
```bash
curl -X POST http://localhost:5000/api/dungeon/generate \
  -H "Content-Type: application/json" \
  -d '{"level": 5, "seed": 42}'
```
**Expected:** 200 OK with reproducible dungeon

#### Test 2.3: Invalid level (negative)
```bash
curl -X POST http://localhost:5000/api/dungeon/generate \
  -H "Content-Type: application/json" \
  -d '{"level": -5}'
```
**Expected:** 400 Bad Request with error message

#### Test 2.4: Invalid level (too high)
```bash
curl -X POST http://localhost:5000/api/dungeon/generate \
  -H "Content-Type: application/json" \
  -d '{"level": 200}'
```
**Expected:** 400 Bad Request with error message

#### Test 2.5: Missing level
```bash
curl -X POST http://localhost:5000/api/dungeon/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected:** 400 Bad Request with error message

### 3. Output Validation Tests

#### Test 3.1: Verify required keys
All generated dungeons must contain:
- `rooms` (array)
- `corridors` (array)
- `traps` (array)
- `spawnPoints` (array)
- `walls` (array)
- `level` (number)
- `metadata` (object)

#### Test 3.2: Verify spawn room
Every dungeon must have exactly one room with `type: "spawn"`

#### Test 3.3: Verify boss room
Dungeons with multiple rooms should have at least one boss room

#### Test 3.4: Verify metadata consistency
- `metadata.num_rooms` must equal `rooms.length`
- `metadata.num_traps` must equal `traps.length`
- `metadata.num_spawn_points` must equal `spawnPoints.length`

### 4. Integration Tests

#### Test 4.1: TypeScript compilation
```bash
npm run check
```
**Expected:** No TypeScript errors

#### Test 4.2: Build
```bash
npm run build
```
**Expected:** Successful build with no errors

#### Test 4.3: Server startup
```bash
npm run dev
```
**Expected:** Server starts on port 5000

## Test Results

### ✓ Passed Tests
- Basic dungeon generation with Python module
- Generation with seed (reproducibility verified)
- Compact output mode
- Validation mode
- API endpoint basic functionality
- API endpoint with seed
- Error handling for invalid levels
- Output structure validation
- Spawn room presence
- Boss room presence
- Metadata consistency
- TypeScript compilation
- Production build
- Server startup

### Performance Metrics
- Python module execution time: < 1 second
- API endpoint response time: < 2 seconds
- Maximum tested dungeon level: 100
- Memory usage: < 10MB per generation

## Known Limitations
- Timeout set to 30 seconds for generation
- Maximum buffer size: 10MB
- Level range: 1-100
- Requires Python 3 to be installed
- Subprocess execution (not async)

## Future Improvements
- Add async generation support
- Implement caching for frequently generated dungeons
- Add more detailed error messages
- Support custom dungeon parameters
- Add dungeon preview/thumbnail generation
