<?php
/**
 * Orpulus — Subscriber API
 * Accepts: POST JSON { name, email, source }
 * Stores to: SQLite database in ../db/subscribers.db
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Rate limiting (basic) ──────────────────────
$ip    = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$limit = 5; // max submissions per minute per IP

// ── Parse body ────────────────────────────────
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data) {
    // Try form-encoded fallback
    $data = $_POST;
}

$name  = trim($data['name']  ?? '');
$email = trim($data['email'] ?? '');
$source = trim($data['source'] ?? 'website');

// ── Validate ───────────────────────────────────
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}
if (strlen($name) > 120) {
    $errors[] = 'Name is too long.';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if (strlen($email) > 255) {
    $errors[] = 'Email is too long.';
}

// Sanitize
$name   = htmlspecialchars($name,   ENT_QUOTES, 'UTF-8');
$source = htmlspecialchars(substr($source, 0, 50), ENT_QUOTES, 'UTF-8');

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ── Database ───────────────────────────────────
$dbDir  = __DIR__ . '/../db';
$dbFile = $dbDir . '/subscribers.db';

// Create db directory if missing
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0750, true);
}

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS subscribers (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL,
            email      TEXT    NOT NULL,
            source     TEXT    DEFAULT 'website',
            ip         TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Create unique index on email
    $pdo->exec("
        CREATE UNIQUE INDEX IF NOT EXISTS idx_email ON subscribers (email)
    ");

    // Rate limit check
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM subscribers
        WHERE ip = :ip AND created_at > datetime('now', '-1 minute')
    ");
    $stmt->execute([':ip' => $ip]);
    if ((int)$stmt->fetchColumn() >= $limit) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again shortly.']);
        exit;
    }

    // Insert
    $stmt = $pdo->prepare("
        INSERT INTO subscribers (name, email, source, ip)
        VALUES (:name, :email, :source, :ip)
    ");
    $stmt->execute([
        ':name'   => $name,
        ':email'  => strtolower($email),
        ':source' => $source,
        ':ip'     => $ip,
    ]);

    echo json_encode([
        'success' => true,
        'message' => "Thanks {$name}! We will be in touch.",
    ]);

} catch (PDOException $e) {
    // Duplicate email (UNIQUE constraint)
    if (strpos($e->getMessage(), 'UNIQUE') !== false) {
        echo json_encode([
            'success'   => false,
            'duplicate' => true,
            'message'   => "You're already on the list. We will be in touch!",
        ]);
    } else {
        error_log('Orpulus subscribe error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
    }
}
