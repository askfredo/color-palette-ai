#!/bin/bash

# Script de prueba rápida para el API de Color Palette AI
# Asegúrate de que el servidor esté corriendo antes de ejecutar este script

BASE_URL="http://localhost:3001/api/colors"

echo "=================================="
echo "🎨 Color Palette AI - Test Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Testing Health Check...${NC}"
curl -s -X GET "$BASE_URL/health" | jq '.'
echo ""
echo ""

# 2. Generate Color from Description
echo -e "${BLUE}2. Testing Color Generation from Description...${NC}"
echo -e "${YELLOW}Description: 'Un verde menta más suave pero con tono pastel'${NC}"
curl -s -X POST "$BASE_URL/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Un verde menta más suave pero con tono pastel"
  }' | jq '.'
echo ""
echo ""

# 3. Another Color Generation
echo -e "${BLUE}3. Testing Another Color Generation...${NC}"
echo -e "${YELLOW}Description: 'Un rojo Ferrari pero un poco más oscuro'${NC}"
curl -s -X POST "$BASE_URL/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Un rojo Ferrari pero un poco más oscuro"
  }' | jq '.'
echo ""
echo ""

# 4. Style Recommendations - Professional
echo -e "${BLUE}4. Testing Style Recommendations (Professional)...${NC}"
curl -s -X POST "$BASE_URL/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "style": "professional",
    "count": 2
  }' | jq '.'
echo ""
echo ""

# 5. Style Recommendations - Kawaii
echo -e "${BLUE}5. Testing Style Recommendations (Kawaii)...${NC}"
curl -s -X POST "$BASE_URL/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "style": "kawaii",
    "count": 2
  }' | jq '.'
echo ""
echo ""

# 6. Style Recommendations - Luxury with Base Color
echo -e "${BLUE}6. Testing Style Recommendations (Luxury with base color)...${NC}"
echo -e "${YELLOW}Base Color: #000000${NC}"
curl -s -X POST "$BASE_URL/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "style": "luxury",
    "baseColor": "#000000",
    "count": 2
  }' | jq '.'
echo ""
echo ""

# 7. Complementary Colors
echo -e "${BLUE}7. Testing Complementary Color Scheme...${NC}"
echo -e "${YELLOW}Base Color: #FF5733${NC}"
curl -s -X POST "$BASE_URL/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "style": "complementary",
    "baseColor": "#FF5733",
    "count": 3
  }' | jq '.'
echo ""
echo ""

# 8. Test error handling - Invalid description
echo -e "${BLUE}8. Testing Error Handling (Empty description)...${NC}"
curl -s -X POST "$BASE_URL/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "description": ""
  }' | jq '.'
echo ""
echo ""

# 9. Test error handling - Invalid style
echo -e "${BLUE}9. Testing Error Handling (Invalid style)...${NC}"
curl -s -X POST "$BASE_URL/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "style": "invalid_style",
    "count": 2
  }' | jq '.'
echo ""
echo ""

echo -e "${GREEN}=================================="
echo "✅ Test Suite Completed!"
echo "==================================${NC}"
