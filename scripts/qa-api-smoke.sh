#!/usr/bin/env bash
# API smoke checks for QA plan (Phase 3). Usage: ./scripts/qa-api-smoke.sh [BASE_URL]
set -euo pipefail

BASE_URL="${1:-http://localhost}"
API="${BASE_URL}/api/v1"
RUN_ID="$(cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "$RANDOM-$RANDOM")"
EMAIL="qa_smoke_${RUN_ID}@sozlution.com"
PASS="Password123!"

echo "== ping =="
curl -sf "${BASE_URL}/ping" | head -c 200
echo

echo "== register session =="
SESSION=$(curl -sS -X POST "${API}/session" \
  -H 'Content-Type: application/json' \
  -d "{\"mode\":\"register\",\"name\":\"QA Smoke ${RUN_ID}\",\"email\":\"${EMAIL}\",\"password\":\"${PASS}\",\"lang\":\"ru\",\"device_id\":\"qa-${RUN_ID}\"}")
TOKEN=$(echo "$SESSION" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['session_token'])" 2>/dev/null) || {
  echo "register failed: $SESSION"
  exit 1
}
AUTH="Authorization: Bearer ${TOKEN}"
echo "token ok"

auth_get() {
  curl -sS -H "$AUTH" "${API}$1"
}

auth_post() {
  curl -sS -X POST -H "$AUTH" -H 'Content-Type: application/json' "$@"
}

echo "== GET /user =="
auth_get /user | python3 -c "import sys,json; d=json.load(sys.stdin); u=d.get('user', d); assert u.get('email')"

echo "== GET /plan =="
PLAN_CODE=$(curl -sS -o /tmp/sozlution_plan.json -w '%{http_code}' -H "$AUTH" "${API}/plan")
if [ "$PLAN_CODE" = "404" ]; then
  auth_post -d '{"level":"A1"}' "${API}/plan/generate" >/dev/null
  auth_get /plan | head -c 120
else
  head -c 120 /tmp/sozlution_plan.json
fi
echo

echo "== GET /day/current =="
auth_get /day/current | head -c 120
echo

echo "== GET /stats =="
auth_get /stats | head -c 120
echo

echo "== GET /test/questions =="
auth_get /test/questions | head -c 120
echo

echo "== POST /ai/chat =="
curl -sf -X POST "${API}/ai/chat" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"message":"Hello"}' | head -c 120
echo

echo "== GET /ielts-mode/stats =="
auth_get /ielts-mode/stats | head -c 120
echo

echo "== GET /ielts-mode/vocabulary =="
auth_get /ielts-mode/vocabulary | head -c 120
echo

echo "== 401 without token =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' "${API}/user")
test "$CODE" = "401" && echo "401 ok" || (echo "expected 401 got $CODE" && exit 1)

echo "All API smoke checks passed."
